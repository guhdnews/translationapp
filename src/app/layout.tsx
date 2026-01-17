import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Translate Voice Notes",
  description: "Instantly translate voice notes with automatic dialect detection",
  keywords: ["voice translation", "audio translator", "dialect detection", "speech to text"],
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Voice Translate" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
