import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service - Translate Voice Notes",
    description: "Terms of Service for Translate Voice Notes app",
};

export default function TermsOfService() {
    return (
        <main className="container legal">
            <h1>Terms of Service</h1>
            <p className="legal__updated">Last updated: January 17, 2025</p>

            <section>
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using Translate Voice Notes (&quot;the Service&quot;), you agree to be bound by these
                    Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>
            </section>

            <section>
                <h2>2. Description of Service</h2>
                <p>
                    Translate Voice Notes is a web application that provides voice note transcription and translation
                    services using artificial intelligence. The Service allows users to upload or record audio files
                    and receive translations in various languages.
                </p>
            </section>

            <section>
                <h2>3. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul>
                    <li>Use the Service only for lawful purposes</li>
                    <li>Not upload content that is illegal, harmful, or violates others&apos; rights</li>
                    <li>Not attempt to reverse engineer or exploit the Service</li>
                    <li>Not use the Service to harass, abuse, or harm others</li>
                    <li>Ensure you have the right to share any audio content you upload</li>
                </ul>
            </section>

            <section>
                <h2>4. Intellectual Property</h2>
                <p>
                    The Service, including its design, features, and content, is owned by us and protected by
                    intellectual property laws. You retain ownership of any audio content you upload.
                </p>
            </section>

            <section>
                <h2>5. Disclaimer of Warranties</h2>
                <p>
                    The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:
                </p>
                <ul>
                    <li>100% accuracy of transcriptions or translations</li>
                    <li>Uninterrupted or error-free service</li>
                    <li>That the Service will meet your specific requirements</li>
                </ul>
                <p>
                    AI-powered translations may contain errors. For critical or legal documents, please use
                    professional human translation services.
                </p>
            </section>

            <section>
                <h2>6. Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
                    special, consequential, or punitive damages resulting from your use of the Service.
                </p>
            </section>

            <section>
                <h2>7. Modifications to Service</h2>
                <p>
                    We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
                    We may also update these Terms of Service from time to time.
                </p>
            </section>

            <section>
                <h2>8. Advertising</h2>
                <p>
                    The Service may display advertisements. By using the Service, you agree to the display of
                    advertisements as part of your experience.
                </p>
            </section>

            <section>
                <h2>9. Termination</h2>
                <p>
                    We may terminate or suspend your access to the Service at any time, without prior notice, for
                    conduct that we believe violates these Terms or is harmful to other users or us.
                </p>
            </section>

            <section>
                <h2>10. Governing Law</h2>
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of the United States,
                    without regard to its conflict of law provisions.
                </p>
            </section>

            <section>
                <h2>11. Contact</h2>
                <p>
                    If you have any questions about these Terms, please contact us through our website.
                </p>
            </section>
        </main>
    );
}
