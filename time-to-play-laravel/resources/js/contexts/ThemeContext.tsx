import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameTheme, getTheme, getThemeList } from '@/config/themes';
import { router } from '@inertiajs/react';

interface ThemeContextType {
    theme: GameTheme;
    themeId: string;
    availableThemes: GameTheme[];
    setTheme: (themeId: string) => Promise<void>;
    loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    initialThemeId?: string;
}

export function ThemeProvider({ children, initialThemeId = 'ocean-breeze' }: ThemeProviderProps) {
    const [themeId, setThemeId] = useState<string>(initialThemeId);
    const [loading, setLoading] = useState(false);

    const theme = getTheme(themeId);
    const availableThemes = getThemeList();

    // Apply CSS variables to the document root
    useEffect(() => {
        const root = document.documentElement;
        const colors = theme.colors;

        root.style.setProperty('--game-bg', colors.background);
        root.style.setProperty('--game-bg-secondary', colors.backgroundSecondary);
        root.style.setProperty('--game-card-bg', colors.cardBackground);
        root.style.setProperty('--game-card-border', colors.cardBorder);
        root.style.setProperty('--game-card-back', colors.cardBackFace);
        root.style.setProperty('--game-card-back-border', colors.cardBackBorder);
        root.style.setProperty('--game-suit-red', colors.redSuit);
        root.style.setProperty('--game-suit-black', colors.blackSuit);
        root.style.setProperty('--game-primary', colors.primary);
        root.style.setProperty('--game-primary-hover', colors.primaryHover);
        root.style.setProperty('--game-success', colors.success);
        root.style.setProperty('--game-success-hover', colors.successHover);
        root.style.setProperty('--game-danger', colors.danger);
        root.style.setProperty('--game-danger-hover', colors.dangerHover);
        root.style.setProperty('--game-text-primary', colors.textPrimary);
        root.style.setProperty('--game-text-secondary', colors.textSecondary);
        root.style.setProperty('--game-text-muted', colors.textMuted);
        root.style.setProperty('--game-highlight', colors.highlight);
        root.style.setProperty('--game-winner', colors.winner);
        root.style.setProperty('--game-active', colors.active);
        root.style.setProperty('--game-border', colors.border);
        root.style.setProperty('--game-border-light', colors.borderLight);
    }, [theme]);

    const setThemeHandler = async (newThemeId: string) => {
        setLoading(true);
        try {
            // Update theme in backend
            const response = await fetch('/api/user/theme', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ theme_id: newThemeId }),
            });

            if (!response.ok) {
                throw new Error('Failed to update theme');
            }

            // Update local state
            setThemeId(newThemeId);

            // Reload the page props to update the user object
            router.reload({ only: ['auth'] });
        } catch (error) {
            console.error('Failed to update theme:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themeId,
                availableThemes,
                setTheme: setThemeHandler,
                loading,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
