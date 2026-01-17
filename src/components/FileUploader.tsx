"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { SUPPORTED_AUDIO_TYPES } from "@/lib/gemini";

interface FileUploaderProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
    disabled?: boolean;
}

export function FileUploader({ file, onFileSelect, disabled }: FileUploaderProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isPasting, setIsPasting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropzoneRef = useRef<HTMLDivElement>(null);

    // Global paste event listener (for desktop keyboard shortcuts)
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            if (disabled) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of Array.from(items)) {
                if (item.kind === "file") {
                    const pastedFile = item.getAsFile();
                    if (pastedFile && isValidAudioFile(pastedFile)) {
                        e.preventDefault();
                        onFileSelect(pastedFile);
                        return;
                    }
                }
            }

            const files = e.clipboardData?.files;
            if (files && files.length > 0) {
                const pastedFile = files[0];
                if (isValidAudioFile(pastedFile)) {
                    e.preventDefault();
                    onFileSelect(pastedFile);
                    return;
                }
            }
        };

        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, [disabled, onFileSelect]);

    // Handle paste button click (for mobile)
    const handlePasteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || isPasting) return;

        setIsPasting(true);

        try {
            // Use the Clipboard API to read
            const clipboardItems = await navigator.clipboard.read();

            for (const item of clipboardItems) {
                // Look for audio types
                for (const type of item.types) {
                    if (type.startsWith("audio/") || type === "application/octet-stream") {
                        const blob = await item.getType(type);
                        const pastedFile = new File([blob], "pasted-audio" + getExtensionForType(type), { type });
                        if (isValidAudioFile(pastedFile)) {
                            onFileSelect(pastedFile);
                            setIsPasting(false);
                            return;
                        }
                    }
                }
            }

            // If no audio found, try reading as files
            alert("No audio file found in clipboard. Try copying a voice note first.");
        } catch (err) {
            // Clipboard API might not be supported or permission denied
            console.error("Clipboard read error:", err);
            alert("Could not read clipboard. Please use the file picker instead, or share directly from Voice Memos.");
        } finally {
            setIsPasting(false);
        }
    };

    const getExtensionForType = (mimeType: string): string => {
        const extensions: Record<string, string> = {
            "audio/mpeg": ".mp3",
            "audio/mp4": ".m4a",
            "audio/x-m4a": ".m4a",
            "audio/wav": ".wav",
            "audio/webm": ".webm",
            "audio/ogg": ".ogg",
            "audio/aac": ".aac",
            "audio/x-caf": ".caf",
            "application/octet-stream": ".m4a",
        };
        return extensions[mimeType] || ".audio";
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragActive(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);

            if (disabled) return;

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const droppedFile = e.dataTransfer.files[0];
                if (isValidAudioFile(droppedFile)) {
                    onFileSelect(droppedFile);
                } else {
                    alert("Please upload a valid audio file (MP3, M4A, WAV, etc.)");
                }
            }
        },
        [disabled, onFileSelect]
    );

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (isValidAudioFile(selectedFile)) {
                onFileSelect(selectedFile);
            } else {
                alert("Please upload a valid audio file (MP3, M4A, WAV, etc.)");
            }
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const isValidAudioFile = (file: File): boolean => {
        if (SUPPORTED_AUDIO_TYPES.includes(file.type)) {
            return true;
        }
        const ext = file.name.split(".").pop()?.toLowerCase();
        return ["mp3", "m4a", "wav", "webm", "ogg", "aac", "mp4", "caf"].includes(ext || "");
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const dropzoneClasses = [
        "uploader__dropzone",
        isDragActive && "uploader__dropzone--active",
        file && "uploader__dropzone--has-file",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="uploader">
            <div
                ref={dropzoneRef}
                className={dropzoneClasses}
                onClick={handleClick}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleClick()}
                aria-label={file ? `Selected file: ${file.name}. Click to change.` : "Upload audio file"}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="audio/*,.m4a,.mp3,.wav,.webm,.ogg,.aac,.caf"
                    onChange={handleChange}
                    className="visually-hidden"
                    disabled={disabled}
                />

                {!file ? (
                    <>
                        <svg className="uploader__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 18.5V7m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 16.5v2a2 2 0 002 2h14a2 2 0 002-2v-2" strokeLinecap="round" />
                        </svg>
                        <p className="uploader__text">
                            {isDragActive ? "Drop your voice note here" : "Tap to upload voice note"}
                        </p>
                        <p className="uploader__subtext">MP3, M4A, WAV, and other audio formats</p>

                        {/* Paste button for mobile */}
                        <button
                            type="button"
                            className="uploader__paste-btn"
                            onClick={handlePasteClick}
                            disabled={disabled || isPasting}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="2" width="6" height="4" rx="1" />
                                <path d="M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
                            </svg>
                            {isPasting ? "Reading clipboard..." : "Paste from clipboard"}
                        </button>
                    </>
                ) : (
                    <>
                        <svg className="uploader__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--success)" }}>
                            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                        <p className="uploader__text">File ready for translation</p>
                        <div className="uploader__file-info">
                            <svg className="uploader__file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="6" cy="18" r="3" />
                                <circle cx="18" cy="16" r="3" />
                            </svg>
                            <span className="uploader__file-name">{file.name}</span>
                            <button
                                type="button"
                                className="uploader__file-clear"
                                onClick={handleClear}
                                aria-label="Remove file"
                                disabled={disabled}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <p className="uploader__subtext">{formatFileSize(file.size)}</p>
                    </>
                )}
            </div>
        </div>
    );
}
