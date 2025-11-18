<?php

namespace App\Games\Engines\WarInHeaven\ValueObjects;

/**
 * Faction Enum
 *
 * Represents the two factions in War in Heaven
 */
enum Faction: string
{
    case FACTION1 = 'FACTION1'; // TODO: Replace with actual faction names (e.g., 'ANGELS')
    case FACTION2 = 'FACTION2'; // TODO: Replace with actual faction names (e.g., 'DEMONS')

    /**
     * Get the opposing faction
     */
    public function getOpposite(): self
    {
        return match($this) {
            self::FACTION1 => self::FACTION2,
            self::FACTION2 => self::FACTION1,
        };
    }

    /**
     * Get faction display name
     */
    public function getDisplayName(): string
    {
        return match($this) {
            self::FACTION1 => 'Faction 1', // TODO: Replace with actual name
            self::FACTION2 => 'Faction 2', // TODO: Replace with actual name
        };
    }

    /**
     * Get faction color
     */
    public function getColor(): string
    {
        return match($this) {
            self::FACTION1 => '#4A90E2', // Blue
            self::FACTION2 => '#E24A4A', // Red
        };
    }
}
