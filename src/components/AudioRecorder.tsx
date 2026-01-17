"use client";

import { useState, useRef, useCallback } from "react";

interface AudioRecorderProps {
    onRecordingComplete: (file: File) => void;
    disabled?: boolean;
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Determine the best supported format
            let mimeType = "audio/webm";
            if (MediaRecorder.isTypeSupported("audio/mp4")) {
                mimeType = "audio/mp4";
            } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                mimeType = "audio/webm;codecs=opus";
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const extension = mimeType.includes("mp4") ? ".m4a" : ".webm";
                const file = new File([blob], `recording-${Date.now()}${extension}`, { type: mimeType });
                onRecordingComplete(file);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please allow microphone access and try again.");
        }
    }, [onRecordingComplete]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="recorder">
            {!isRecording ? (
                <button
                    type="button"
                    className="recorder__btn recorder__btn--start"
                    onClick={startRecording}
                    disabled={disabled}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="6" />
                    </svg>
                    Record Voice Note
                </button>
            ) : (
                <div className="recorder__active">
                    <div className="recorder__indicator">
                        <span className="recorder__dot" />
                        <span className="recorder__time">{formatTime(recordingTime)}</span>
                    </div>
                    <p className="recorder__hint">Play the voice note now - I&apos;m listening!</p>
                    <button
                        type="button"
                        className="recorder__btn recorder__btn--stop"
                        onClick={stopRecording}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                        Stop Recording
                    </button>
                </div>
            )}
        </div>
    );
}
