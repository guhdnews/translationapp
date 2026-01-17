"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TranslationResult } from "@/components/TranslationResult";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface TranslationResponse {
    dialect: string;
    transcription: string;
    translation: string;
    targetLanguage: string;
}

interface ErrorState {
    title: string;
    message: string;
}

function ShareTargetContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [targetLanguage, setTargetLanguage] = useState("en");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(true);
    const [result, setResult] = useState<TranslationResponse | null>(null);
    const [error, setError] = useState<ErrorState | null>(null);

    // Handle shared file from service worker
    useEffect(() => {
        const handleSharedFile = async () => {
            const isShared = searchParams.get("shared") === "true";

            if (!isShared) {
                // No shared file, redirect to home
                router.replace("/");
                return;
            }

            // Listen for message from service worker
            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === "SHARED_FILE" && event.data.file) {
                    setFile(event.data.file);
                    setIsLoadingFile(false);
                }
            };

            navigator.serviceWorker?.addEventListener("message", handleMessage);

            // Also try to get from cache (fallback)
            try {
                const cache = await caches.open("shared-files");
                const cachedResponse = await cache.match("shared-audio");

                if (cachedResponse) {
                    const blob = await cachedResponse.blob();
                    const sharedFile = new File([blob], "shared-audio", { type: blob.type });
                    setFile(sharedFile);
                    // Clean up cache
                    await cache.delete("shared-audio");
                }
            } catch {
                // Cache API might not be available
            }

            setIsLoadingFile(false);

            return () => {
                navigator.serviceWorker?.removeEventListener("message", handleMessage);
            };
        };

        handleSharedFile();
    }, [searchParams, router]);

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

    const goHome = () => {
        router.replace("/");
    };

    if (isLoadingFile) {
        return (
            <main className="container">
                <header className="header">
                    <h1 className="header__title">Translate Voice Notes</h1>
                    <ThemeToggle />
                </header>
                <div className="loading">
                    <LoadingSpinner size="large" />
                    <p className="loading__text">Loading shared file...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="container">
            <header className="header">
                <h1 className="header__title">Translate Voice Notes</h1>
                <ThemeToggle />
            </header>

            {!result ? (
                <>
                    {file ? (
                        <div className="uploader">
                            <div className="uploader__dropzone uploader__dropzone--has-file">
                                <svg className="uploader__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--success)" }}>
                                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                <p className="uploader__text">Shared file ready for translation</p>
                                <div className="uploader__file-info">
                                    <svg className="uploader__file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="6" cy="18" r="3" />
                                        <circle cx="18" cy="16" r="3" />
                                    </svg>
                                    <span className="uploader__file-name">{file.name || "Shared audio"}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="error">
                            <div className="error__title">No file received</div>
                            <div className="error__message">The shared file could not be loaded.</div>
                        </div>
                    )}

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
                </>
            ) : (
                <>
                    <TranslationResult
                        dialect={result.dialect}
                        transcription={result.transcription}
                        translation={result.translation}
                        targetLanguage={result.targetLanguage}
                    />

                    <button
                        className="btn btn--secondary"
                        onClick={goHome}
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

export default function ShareTargetPage() {
    return (
        <Suspense fallback={
            <main className="container">
                <div className="loading">
                    <LoadingSpinner size="large" />
                    <p className="loading__text">Loading...</p>
                </div>
            </main>
        }>
            <ShareTargetContent />
        </Suspense>
    );
}
