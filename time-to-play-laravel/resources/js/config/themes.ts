/**
 * Game Theme Configuration
 *
 * Defines color schemes for the gaming area
 */

export interface GameTheme {
    id: string;
    name: string;
    description: string;
    colors: {
        // Background colors
        background: string;
        backgroundSecondary: string;

        // Card colors
        cardBackground: string;
        cardBorder: string;
        cardBackFace: string;
        cardBackBorder: string;

        // Suit colors
        redSuit: string;
        blackSuit: string;

        // Interactive elements
        primary: string;
        primaryHover: string;
        success: string;
        successHover: string;
        danger: string;
        dangerHover: string;

        // Text colors
        textPrimary: string;
        textSecondary: string;
        textMuted: string;

        // State indicators
        highlight: string;
        winner: string;
        active: string;

        // Borders and dividers
        border: string;
        borderLight: string;
    };
}

export const themes: Record<string, GameTheme> = {
    'ocean-breeze': {
        id: 'ocean-breeze',
        name: 'Ocean Breeze',
        description: 'Cool blue tones reminiscent of the ocean',
        colors: {
            background: 'rgb(239, 246, 255)',
            backgroundSecondary: 'rgb(219, 234, 254)',
            cardBackground: 'rgb(255, 255, 255)',
            cardBorder: 'rgb(209, 213, 219)',
            cardBackFace: 'rgb(30, 64, 175)',
            cardBackBorder: 'rgb(29, 78, 216)',
            redSuit: 'rgb(220, 38, 38)',
            blackSuit: 'rgb(17, 24, 39)',
            primary: 'rgb(59, 130, 246)',
            primaryHover: 'rgb(37, 99, 235)',
            success: 'rgb(34, 197, 94)',
            successHover: 'rgb(22, 163, 74)',
            danger: 'rgb(239, 68, 68)',
            dangerHover: 'rgb(220, 38, 38)',
            textPrimary: 'rgb(17, 24, 39)',
            textSecondary: 'rgb(75, 85, 99)',
            textMuted: 'rgb(156, 163, 175)',
            highlight: 'rgb(96, 165, 250)',
            winner: 'rgb(34, 197, 94)',
            active: 'rgb(59, 130, 246)',
            border: 'rgb(209, 213, 219)',
            borderLight: 'rgb(229, 231, 235)',
        },
    },
    'forest-green': {
        id: 'forest-green',
        name: 'Forest Green',
        description: 'Classic casino green with earthy tones',
        colors: {
            background: 'rgb(236, 253, 245)',
            backgroundSecondary: 'rgb(209, 250, 229)',
            cardBackground: 'rgb(255, 255, 255)',
            cardBorder: 'rgb(209, 213, 219)',
            cardBackFace: 'rgb(22, 101, 52)',
            cardBackBorder: 'rgb(21, 128, 61)',
            redSuit: 'rgb(220, 38, 38)',
            blackSuit: 'rgb(17, 24, 39)',
            primary: 'rgb(34, 197, 94)',
            primaryHover: 'rgb(22, 163, 74)',
            success: 'rgb(34, 197, 94)',
            successHover: 'rgb(22, 163, 74)',
            danger: 'rgb(239, 68, 68)',
            dangerHover: 'rgb(220, 38, 38)',
            textPrimary: 'rgb(17, 24, 39)',
            textSecondary: 'rgb(75, 85, 99)',
            textMuted: 'rgb(156, 163, 175)',
            highlight: 'rgb(74, 222, 128)',
            winner: 'rgb(34, 197, 94)',
            active: 'rgb(34, 197, 94)',
            border: 'rgb(209, 213, 219)',
            borderLight: 'rgb(229, 231, 235)',
        },
    },
    'royal-purple': {
        id: 'royal-purple',
        name: 'Royal Purple',
        description: 'Elegant purple and gold theme',
        colors: {
            background: 'rgb(250, 245, 255)',
            backgroundSecondary: 'rgb(243, 232, 255)',
            cardBackground: 'rgb(255, 255, 255)',
            cardBorder: 'rgb(209, 213, 219)',
            cardBackFace: 'rgb(107, 33, 168)',
            cardBackBorder: 'rgb(126, 34, 206)',
            redSuit: 'rgb(220, 38, 38)',
            blackSuit: 'rgb(17, 24, 39)',
            primary: 'rgb(168, 85, 247)',
            primaryHover: 'rgb(147, 51, 234)',
            success: 'rgb(34, 197, 94)',
            successHover: 'rgb(22, 163, 74)',
            danger: 'rgb(239, 68, 68)',
            dangerHover: 'rgb(220, 38, 38)',
            textPrimary: 'rgb(17, 24, 39)',
            textSecondary: 'rgb(75, 85, 99)',
            textMuted: 'rgb(156, 163, 175)',
            highlight: 'rgb(192, 132, 252)',
            winner: 'rgb(34, 197, 94)',
            active: 'rgb(168, 85, 247)',
            border: 'rgb(209, 213, 219)',
            borderLight: 'rgb(229, 231, 235)',
        },
    },
    'sunset-orange': {
        id: 'sunset-orange',
        name: 'Sunset Orange',
        description: 'Warm sunset colors with orange accents',
        colors: {
            background: 'rgb(255, 247, 237)',
            backgroundSecondary: 'rgb(254, 243, 199)',
            cardBackground: 'rgb(255, 255, 255)',
            cardBorder: 'rgb(209, 213, 219)',
            cardBackFace: 'rgb(194, 65, 12)',
            cardBackBorder: 'rgb(234, 88, 12)',
            redSuit: 'rgb(220, 38, 38)',
            blackSuit: 'rgb(17, 24, 39)',
            primary: 'rgb(251, 146, 60)',
            primaryHover: 'rgb(249, 115, 22)',
            success: 'rgb(34, 197, 94)',
            successHover: 'rgb(22, 163, 74)',
            danger: 'rgb(239, 68, 68)',
            dangerHover: 'rgb(220, 38, 38)',
            textPrimary: 'rgb(17, 24, 39)',
            textSecondary: 'rgb(75, 85, 99)',
            textMuted: 'rgb(156, 163, 175)',
            highlight: 'rgb(254, 215, 170)',
            winner: 'rgb(34, 197, 94)',
            active: 'rgb(251, 146, 60)',
            border: 'rgb(209, 213, 219)',
            borderLight: 'rgb(229, 231, 235)',
        },
    },
    'midnight-dark': {
        id: 'midnight-dark',
        name: 'Midnight Dark',
        description: 'Dark mode with midnight blue tones',
        colors: {
            background: 'rgb(17, 24, 39)',
            backgroundSecondary: 'rgb(31, 41, 55)',
            cardBackground: 'rgb(255, 255, 255)',
            cardBorder: 'rgb(75, 85, 99)',
            cardBackFace: 'rgb(30, 58, 138)',
            cardBackBorder: 'rgb(37, 99, 235)',
            redSuit: 'rgb(239, 68, 68)',
            blackSuit: 'rgb(17, 24, 39)',
            primary: 'rgb(59, 130, 246)',
            primaryHover: 'rgb(37, 99, 235)',
            success: 'rgb(34, 197, 94)',
            successHover: 'rgb(22, 163, 74)',
            danger: 'rgb(239, 68, 68)',
            dangerHover: 'rgb(220, 38, 38)',
            textPrimary: 'rgb(243, 244, 246)',
            textSecondary: 'rgb(209, 213, 219)',
            textMuted: 'rgb(156, 163, 175)',
            highlight: 'rgb(96, 165, 250)',
            winner: 'rgb(34, 197, 94)',
            active: 'rgb(59, 130, 246)',
            border: 'rgb(75, 85, 99)',
            borderLight: 'rgb(55, 65, 81)',
        },
    },
    'ruby-red': {
        id: 'ruby-red',
        name: 'Ruby Red',
        description: 'Bold red theme with luxury vibes',
        colors: {
            background: 'rgb(254, 242, 242)',
            backgroundSecondary: 'rgb(254, 226, 226)',
            cardBackground: 'rgb(255, 255, 255)',
            cardBorder: 'rgb(209, 213, 219)',
            cardBackFace: 'rgb(153, 27, 27)',
            cardBackBorder: 'rgb(185, 28, 28)',
            redSuit: 'rgb(220, 38, 38)',
            blackSuit: 'rgb(17, 24, 39)',
            primary: 'rgb(239, 68, 68)',
            primaryHover: 'rgb(220, 38, 38)',
            success: 'rgb(34, 197, 94)',
            successHover: 'rgb(22, 163, 74)',
            danger: 'rgb(239, 68, 68)',
            dangerHover: 'rgb(220, 38, 38)',
            textPrimary: 'rgb(17, 24, 39)',
            textSecondary: 'rgb(75, 85, 99)',
            textMuted: 'rgb(156, 163, 175)',
            highlight: 'rgb(252, 165, 165)',
            winner: 'rgb(34, 197, 94)',
            active: 'rgb(239, 68, 68)',
            border: 'rgb(209, 213, 219)',
            borderLight: 'rgb(229, 231, 235)',
        },
    },
};

export const getTheme = (themeId: string): GameTheme => {
    return themes[themeId] || themes['ocean-breeze'];
};

export const getThemeList = (): GameTheme[] => {
    return Object.values(themes);
};
