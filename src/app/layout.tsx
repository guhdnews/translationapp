import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Translate Voice Notes",
  description: "Instantly translate voice notes with automatic dialect detection. Free online voice message translator supporting 60+ languages including Arabic dialects.",
  keywords: ["voice translation", "audio translator", "dialect detection", "speech to text", "Arabic translator", "voice message translation", "transcription", "Yemeni Arabic"],
  authors: [{ name: "Translate Voice Notes" }],
  openGraph: {
    title: "Translate Voice Notes",
    description: "Instantly translate voice notes with automatic dialect detection",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Voice Translate" />
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
