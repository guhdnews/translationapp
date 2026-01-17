import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About - Translate Voice Notes",
    description: "About Translate Voice Notes - instant voice note translation app",
};

export default function About() {
    return (
        <main className="container legal">
            <h1>About Translate Voice Notes</h1>

            <section>
                <h2>What We Do</h2>
                <p>
                    Translate Voice Notes is a free web application that instantly translates voice messages and
                    audio recordings. Whether you receive a voice note in Arabic, Spanish, Chinese, or any other
                    language, our AI-powered service can transcribe and translate it for you in seconds.
                </p>
            </section>

            <section>
                <h2>Key Features</h2>
                <ul>
                    <li><strong>Dialect Detection</strong> - Automatically identifies specific regional dialects, including Yemeni, Egyptian, Lebanese Arabic and more</li>
                    <li><strong>Accurate Transcription</strong> - Provides word-for-word transcription in the original language</li>
                    <li><strong>Transliteration</strong> - Shows romanized pronunciation for non-Latin scripts</li>
                    <li><strong>60+ Languages</strong> - Supports translations to and from dozens of languages</li>
                    <li><strong>Audio Playback</strong> - Replay your voice note alongside the translation</li>
                    <li><strong>Mobile Recording</strong> - Record voice notes directly in the app</li>
                </ul>
            </section>

            <section>
                <h2>How It Works</h2>
                <ol>
                    <li>Upload a voice note or record one directly in the app</li>
                    <li>Select the source language (or let us auto-detect it)</li>
                    <li>Choose your target translation language</li>
                    <li>Get instant transcription, transliteration, and translation</li>
                    <li>Copy or download the results</li>
                </ol>
            </section>

            <section>
                <h2>Technology</h2>
                <p>
                    We use Google&apos;s advanced Gemini AI to provide accurate transcriptions and translations.
                    Our service is designed to handle various audio formats and dialects with high precision.
                </p>
            </section>

            <section>
                <h2>Privacy</h2>
                <p>
                    Your privacy matters to us. Audio files are processed in real-time and are not permanently
                    stored. Read our <a href="/privacy">Privacy Policy</a> for more details.
                </p>
            </section>

            <section>
                <h2>Free to Use</h2>
                <p>
                    Translate Voice Notes is completely free. We support our service through non-intrusive
                    advertising. No account or signup required.
                </p>
            </section>
        </main>
    );
}
