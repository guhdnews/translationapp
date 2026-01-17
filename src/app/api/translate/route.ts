import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { TARGET_LANGUAGES, SOURCE_LANGUAGES } from "@/lib/gemini";

// Maximum file size: 25MB (Gemini API limit for inline data)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File | null;
        const targetLanguage = formData.get("targetLanguage") as string | null;
        const sourceLanguage = formData.get("sourceLanguage") as string | null;

        // Validation
        if (!audioFile) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        if (!targetLanguage) {
            return NextResponse.json(
                { error: "No target language specified" },
                { status: 400 }
            );
        }

        if (audioFile.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 25MB." },
                { status: 400 }
            );
        }

        // Find the language names
        const targetLangName =
            TARGET_LANGUAGES.find((l) => l.code === targetLanguage)?.name ||
            targetLanguage;

        const sourceLangName =
            sourceLanguage && sourceLanguage !== "auto"
                ? SOURCE_LANGUAGES.find((l) => l.code === sourceLanguage)?.name
                : null;

        // Convert file to base64
        const bytes = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(bytes).toString("base64");

        // Determine MIME type
        let mimeType = audioFile.type || "audio/mpeg";
        if (!mimeType || mimeType === "application/octet-stream") {
            const ext = audioFile.name.split(".").pop()?.toLowerCase();
            const mimeMap: Record<string, string> = {
                mp3: "audio/mpeg",
                m4a: "audio/mp4",
                wav: "audio/wav",
                webm: "audio/webm",
                ogg: "audio/ogg",
                aac: "audio/aac",
                caf: "audio/x-caf",
            };
            mimeType = mimeMap[ext || ""] || "audio/mpeg";
        }

        // Initialize Gemini client
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenAI({ apiKey });

        // Build the source language hint for the prompt
        const sourceHint = sourceLangName
            ? `\n\n## IMPORTANT: USER-SPECIFIED LANGUAGE\nThe user has indicated this audio is in **${sourceLangName}**. Use this information to guide your transcription and ensure you are listening for this specific dialect/language. However, if the audio clearly sounds like a different dialect, note that in your response.`
            : "";

        // Create the prompt for translation with MAXIMUM accuracy
        const prompt = `You are a world-class linguist, translator, and dialectologist. Your transcriptions and translations are used in professional, legal, and medical contexts where 100% accuracy is CRITICAL.

## YOUR MISSION
Transcribe and translate this audio with PERFECT accuracy. The original speaker should be able to confirm "yes, that is EXACTLY what I said, word for word."
${sourceHint}

## TRANSCRIPTION REQUIREMENTS (CRITICAL)

1. **Listen multiple times mentally** - Do not rush. Consider every word carefully.
2. **Capture EVERY word** - Include filler words, repetitions, self-corrections, partial words.
3. **Preserve the exact meaning** - Do not paraphrase or summarize. Transcribe verbatim.
4. **Handle unclear audio** - If a word is unclear, provide your best interpretation with [unclear] notation only if truly unintelligible.
5. **Punctuation** - Add appropriate punctuation to reflect natural speech patterns.

## DIALECT IDENTIFICATION

Identify the EXACT dialect with specificity:
- For Arabic: Specify region (e.g., "Yemeni Arabic - Sana'ani dialect", "Egyptian Arabic - Cairene", "Gulf Arabic - Kuwaiti")
- Listen for: Pronunciation of ق (qaf), ج (jeem), vowel patterns, vocabulary, intonation
- For other languages: Specify regional variant (Mexican Spanish, Brazilian Portuguese, etc.)

## TRANSLITERATION REQUIREMENTS

Provide a romanized version using standard transliteration that allows English speakers to:
- Pronounce the words correctly
- Understand the phonetic structure
- Read the original text aloud

## TRANSLATION REQUIREMENTS

1. **Accuracy over elegance** - Prioritize exact meaning over smooth phrasing
2. **Preserve nuance** - Capture tone, formality level, and emotional content
3. **Cultural context** - Translate idioms appropriately but note them if relevant
4. **No additions** - Do not add words or meanings not present in the original

## OUTPUT FORMAT

Return ONLY this JSON (no markdown, no extra text):
{
  "dialect": "Exact dialect with region",
  "transcription": "Complete original text in native script",
  "transliteration": "Romanized pronunciation guide",
  "translation": "Accurate ${targetLangName} translation"
}`;

        // Call Gemini API with audio using Gemini 3 Flash
        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Audio,
                            },
                        },
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        });

        // Parse the response
        const responseText = response.text || "";

        // Try to extract JSON from the response
        let result;
        try {
            // First, try direct JSON parse
            result = JSON.parse(responseText);
        } catch {
            // Try to extract JSON from markdown code blocks or other formatting
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Could not parse translation response");
            }
        }

        // Validate the response structure
        if (!result.dialect || !result.transcription || !result.translation) {
            throw new Error("Incomplete translation response");
        }

        return NextResponse.json({
            dialect: result.dialect,
            transcription: result.transcription,
            transliteration: result.transliteration || "",
            translation: result.translation,
            targetLanguage: targetLangName,
        });
    } catch (error) {
        console.error("Translation error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Check for specific error types
        if (errorMessage.includes("Could not process audio")) {
            return NextResponse.json(
                { error: "Could not process the audio file. Please ensure it contains clear speech." },
                { status: 400 }
            );
        }

        // Rate limit / quota errors
        if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
            return NextResponse.json(
                { error: "API rate limit reached. Please try again in a few moments." },
                { status: 429 }
            );
        }

        // API key errors
        if (errorMessage.includes("401") || errorMessage.includes("API_KEY") || errorMessage.includes("authentication")) {
            return NextResponse.json(
                { error: "API configuration error. Please contact support." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: `Translation failed. Please try again.` },
            { status: 500 }
        );
    }
}
