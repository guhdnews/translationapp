"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FileUploader } from "@/components/FileUploader";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TranslationResult } from "@/components/TranslationResult";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface TranslationResponse {
  dialect: string;
  transcription: string;
  transliteration: string;
  translation: string;
  targetLanguage: string;
}

interface ErrorState {
  title: string;
  message: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    // Create object URL for audio playback
    if (selectedFile) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(selectedFile));
    } else {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const handleTranslate = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("targetLanguage", targetLanguage);

      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError({
        title: "Translation Failed",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="container">
      <header className="header">
        <h1 className="header__title">Translate Voice Notes</h1>
        <ThemeToggle />
      </header>

      {!result ? (
        <>
          <FileUploader
            file={file}
            onFileSelect={handleFileSelect}
            disabled={isLoading}
          />

          <LanguageSelector
            value={targetLanguage}
            onChange={setTargetLanguage}
          />

          {error && (
            <div className="error">
              <div className="error__title">{error.title}</div>
              <div className="error__message">{error.message}</div>
            </div>
          )}

          {isLoading ? (
            <div className="loading">
              <LoadingSpinner size="large" />
              <p className="loading__text">Translating your voice note...</p>
              <p className="loading__subtext">This may take a few moments</p>
            </div>
          ) : (
            <button
              className="btn btn--primary"
              onClick={handleTranslate}
              disabled={!file}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 8l6 6M4 14l6-6 2 3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="14" y="4" width="6" height="16" rx="2" />
                <path d="M17 8v8" />
              </svg>
              Translate
            </button>
          )}

          <div className="install-hint">
            <svg className="install-hint__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v10m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" strokeLinecap="round" />
            </svg>
            <span>Install this app to share voice notes directly from your phone</span>
          </div>
        </>
      ) : (
        <>
          <TranslationResult
            dialect={result.dialect}
            transcription={result.transcription}
            transliteration={result.transliteration}
            translation={result.translation}
            targetLanguage={result.targetLanguage}
            audioUrl={audioUrl || undefined}
          />

          <button
            className="btn btn--secondary"
            onClick={handleReset}
            style={{ marginTop: "1rem" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Translate Another
          </button>
        </>
      )}
    </main>
  );
}
