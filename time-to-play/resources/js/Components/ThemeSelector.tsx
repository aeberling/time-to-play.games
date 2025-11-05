import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSelectorProps {
    className?: string;
}

export default function ThemeSelector({ className = '' }: ThemeSelectorProps) {
    const { theme, themeId, availableThemes, setTheme, loading } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleThemeSelect = async (selectedThemeId: string) => {
        await setTheme(selectedThemeId);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                <div
                    className="w-4 h-4 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: theme.colors.primary }}
                />
                <span>{theme.name}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Theme</h3>
                        <div className="space-y-2">
                            {availableThemes.map((availableTheme) => (
                                <button
                                    key={availableTheme.id}
                                    onClick={() => handleThemeSelect(availableTheme.id)}
                                    disabled={loading}
                                    className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                                        themeId === availableTheme.id
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div
                                            className="w-10 h-10 rounded-lg border-2"
                                            style={{
                                                background: `linear-gradient(135deg, ${availableTheme.colors.background} 0%, ${availableTheme.colors.primary} 100%)`,
                                                borderColor: availableTheme.colors.primary,
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">
                                                {availableTheme.name}
                                            </span>
                                            {themeId === availableTheme.id && (
                                                <svg
                                                    className="w-4 h-4 text-indigo-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {availableTheme.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
