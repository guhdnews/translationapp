import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { TARGET_LANGUAGES } from "@/lib/gemini";

// Maximum file size: 25MB (Gemini API limit for inline data)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File | null;
        const targetLanguage = formData.get("targetLanguage") as string | null;

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

        // Find the language name
        const targetLangName =
            TARGET_LANGUAGES.find((l) => l.code === targetLanguage)?.name ||
            targetLanguage;

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

        // Create the prompt for translation
        const prompt = `You are a professional translator and linguist. Analyze this audio recording and provide:

1. **Dialect Detection**: Identify the specific language AND dialect/regional variant being spoken. Be as specific as possible (e.g., "Egyptian Arabic", "Castilian Spanish", "British English", "Brazilian Portuguese", "Mandarin Chinese (Beijing dialect)", etc.). If you can identify the specific region or accent, include that.

2. **Transcription**: Provide a complete, accurate transcription of the audio in the original language. Use the native script (Arabic script for Arabic, Chinese characters for Chinese, etc.).

3. **Translation**: Translate the transcription into ${targetLangName}. Maintain the meaning, tone, and nuance of the original as much as possible.

IMPORTANT: Return your response as valid JSON in exactly this format:
{
  "dialect": "the detected language and dialect/regional variant",
  "transcription": "the original transcription in native script",
  "translation": "the translation in ${targetLangName}"
}

Only return the JSON object, no additional text or markdown.`;

        // Call Gemini API with audio
        const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
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

        return NextResponse.json(
            { error: `Translation failed: ${errorMessage}` },
            { status: 500 }
        );
    }
}
