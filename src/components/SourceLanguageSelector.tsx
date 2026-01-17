"use client";

import { SOURCE_LANGUAGES } from "@/lib/gemini";

interface SourceLanguageSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function SourceLanguageSelector({ value, onChange }: SourceLanguageSelectorProps) {
    return (
        <div className="language-selector">
            <label className="language-selector__label" htmlFor="source-language">
                Voice note language (optional)
            </label>
            <select
                id="source-language"
                className="language-selector__select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {SOURCE_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
