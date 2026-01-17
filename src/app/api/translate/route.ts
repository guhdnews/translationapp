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

        // Create the prompt for translation with enhanced dialect detection
        const prompt = `You are an expert linguist and dialectologist specializing in accurate language and dialect identification. Your task is to analyze this audio recording with extreme precision.

## CRITICAL: DIALECT DETECTION

Listen carefully to the audio and identify the EXACT regional dialect. Pay close attention to:

**For Arabic:**
- Phonological markers (pronunciation of ق، ج، ث، ذ، ظ)
- Vocabulary choices unique to specific regions
- Grammatical structures and verb conjugations
- Intonation patterns and prosody
- Common dialectal expressions

Arabic dialect categories to consider:
- Gulf Arabic: Emirati, Kuwaiti, Qatari, Bahraini, Saudi (Najdi, Hijazi, Eastern)
- Yemeni Arabic: Sana'ani, Hadhrami, Ta'izzi-Adeni
- Levantine Arabic: Lebanese, Syrian, Jordanian, Palestinian
- Egyptian Arabic
- Maghrebi Arabic: Moroccan, Algerian, Tunisian, Libyan
- Sudanese Arabic
- Iraqi Arabic

**For other languages**, identify the specific regional variant (e.g., Mexican vs Castilian Spanish, Brazilian vs European Portuguese, etc.)

## YOUR RESPONSE

Provide:
1. **Dialect**: The specific regional dialect with confidence. Be PRECISE - don't just say "Arabic", specify the exact dialect like "Yemeni Arabic (Sana'ani dialect)" or "Gulf Arabic (Kuwaiti)".

2. **Transcription**: Complete transcription in the original language using native script.

3. **Translation**: Accurate translation into ${targetLangName}, preserving meaning and tone.

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "dialect": "Specific dialect name with region (e.g., 'Yemeni Arabic (Sana'ani dialect)')",
  "transcription": "original text in native script",
  "translation": "translation in ${targetLangName}"
}

No additional text or markdown - only the JSON object.`;

        // Call Gemini API with audio using the more capable model
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-pro-preview-05-06",
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
