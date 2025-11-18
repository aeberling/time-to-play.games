/**
 * War in Heaven Game Constants
 */

// Hex grid settings
export const HEX_SIZE = 40; // Pixel size of hex tiles
export const HEX_SPACING = 2; // Spacing between hexes

// Faction colors
export const FACTION_COLORS = {
    FACTION1: '#4A90E2', // Blue
    FACTION2: '#E24A4A', // Red
} as const;

// Turn phases
export const TURN_PHASES = {
    DRAW: 'Draw Phase',
    MOVEMENT: 'Movement Phase',
    COMBAT: 'Combat Phase',
    END: 'End Phase',
} as const;

// Game statuses
export const GAME_STATUSES = {
    WAITING: 'Waiting for Players',
    READY: 'Ready to Start',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    ABANDONED: 'Abandoned',
} as const;

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
    PIECE_MOVE: 300,
    CARD_PLAY: 400,
    COMBAT: 600,
    UI_TRANSITION: 200,
} as const;

// UI constants
export const MAX_HAND_SIZE = 10;
export const CARD_WIDTH = 80;
export const CARD_HEIGHT = 112;

// Sound effect paths
export const SOUNDS = {
    MOVE: '/assets/games/war-in-heaven/sounds/move.mp3',
    COMBAT: '/assets/games/war-in-heaven/sounds/combat.mp3',
    CARD_PLAY: '/assets/games/war-in-heaven/sounds/card_play.mp3',
    CARD_DRAW: '/assets/games/war-in-heaven/sounds/card_draw.mp3',
    VICTORY: '/assets/games/war-in-heaven/sounds/victory.mp3',
    DEFEAT: '/assets/games/war-in-heaven/sounds/defeat.mp3',
} as const;
