import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Translate Voice Notes",
    description: "Privacy Policy for Translate Voice Notes app",
};

export default function PrivacyPolicy() {
    return (
        <main className="container legal">
            <h1>Privacy Policy</h1>
            <p className="legal__updated">Last updated: January 17, 2025</p>

            <section>
                <h2>Introduction</h2>
                <p>
                    Translate Voice Notes (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                    This Privacy Policy explains how we collect, use, and safeguard your information when you use our
                    voice note translation service.
                </p>
            </section>

            <section>
                <h2>Information We Collect</h2>
                <h3>Audio Files</h3>
                <p>
                    When you upload or record a voice note, we temporarily process the audio to provide translation
                    services. Audio files are sent to Google&apos;s Gemini AI service for transcription and translation.
                    We do not permanently store your audio files on our servers.
                </p>

                <h3>Usage Data</h3>
                <p>
                    We may collect anonymous usage data such as page views, feature usage, and general analytics to
                    improve our service. This data does not personally identify you.
                </p>

                <h3>Cookies</h3>
                <p>
                    We use essential cookies to remember your preferences (such as dark/light mode). We may also use
                    third-party cookies for analytics and advertising purposes.
                </p>
            </section>

            <section>
                <h2>How We Use Your Information</h2>
                <ul>
                    <li>To provide voice note translation services</li>
                    <li>To improve and optimize our service</li>
                    <li>To display relevant advertisements</li>
                    <li>To analyze usage patterns and trends</li>
                </ul>
            </section>

            <section>
                <h2>Third-Party Services</h2>
                <p>We use the following third-party services:</p>
                <ul>
                    <li><strong>Google Gemini AI</strong> - For audio transcription and translation</li>
                    <li><strong>Google AdSense</strong> - For displaying advertisements</li>
                    <li><strong>Vercel</strong> - For hosting and analytics</li>
                </ul>
                <p>
                    These services have their own privacy policies governing the use of your information.
                </p>
            </section>

            <section>
                <h2>Data Security</h2>
                <p>
                    We implement appropriate security measures to protect your information. However, no method of
                    transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
            </section>

            <section>
                <h2>Data Retention</h2>
                <p>
                    Audio files are processed in real-time and are not stored permanently. Translation results may
                    be cached temporarily to improve performance but are not retained long-term.
                </p>
            </section>

            <section>
                <h2>Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>Access information we have about you</li>
                    <li>Request deletion of your data</li>
                    <li>Opt out of analytics tracking</li>
                    <li>Disable cookies in your browser</li>
                </ul>
            </section>

            <section>
                <h2>Children&apos;s Privacy</h2>
                <p>
                    Our service is not intended for children under 13. We do not knowingly collect information from
                    children under 13 years of age.
                </p>
            </section>

            <section>
                <h2>Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                    the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                </p>
            </section>

            <section>
                <h2>Contact Us</h2>
                <p>
                    If you have questions about this Privacy Policy, please contact us through our website.
                </p>
            </section>
        </main>
    );
}
