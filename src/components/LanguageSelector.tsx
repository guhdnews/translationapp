"use client";

import { TARGET_LANGUAGES } from "@/lib/gemini";

interface LanguageSelectorProps {
    value: string;
    onChange: (languageCode: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    return (
        <div className="language-selector">
            <label htmlFor="target-language" className="language-selector__label">
                Translate to
            </label>
            <select
                id="target-language"
                className="language-selector__select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {TARGET_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
