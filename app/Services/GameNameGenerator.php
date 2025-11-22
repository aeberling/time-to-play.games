<?php

namespace App\Services;

class GameNameGenerator
{
    private static array $suffixes = [
        'Goblin-Giggles', 'Manticrumb', 'Dice Sprite', 'Sneakbeast', 'Gloombug',
        'Pocket Wyrm', 'Trollmoss', 'Sparkbadger', 'Myth Nibble', 'Gremlin Dust',
        'Wobblefang', 'Frostgob', 'Shiny Orc', 'Noodle Imp', 'Weirdling',
        'Snarkwolf', 'Crumblet', 'Gnomekin', 'Puffgriff', 'Hex Beetle',
        'Ember Pup', 'Moss Pixie', 'Sock Dragon', 'Bookwyrm', 'Trinket Fox',
        'Rune Toad', 'Moon Mutt', 'Pebble Troll', 'Sproutling', 'Fumble Imp',
        'Charmpuff', 'Spellmote', 'Blink Bat', 'Whim Wisp', 'Puffling',
        'Wandlet', 'Moon Sip', 'Glintfox', 'Thorn Imp', 'Fizzsprite',
        'Mist Mutt', 'Wicklebug', 'Glowtwing', 'Fog Nibble', 'Wisp Toad',
        'Rune Pup', 'Whirlflet', 'Sparkshrew', 'Chimble', 'Quill Snip',
        'Tatterpix', 'Mirthling', 'Snicklebat', 'Glow Nook', 'Ember Sprig',
        'Flitfang', 'Charm Beetle', 'Blinkling', 'Snort Pixie', 'Nimbleroot',
        'Gobblemite', 'Mystic Moth', 'Bramble Imp', 'Fey Shard', 'Starlit Pup',
        'Whiskermage', 'Cinder Beetle', 'Glitterbog', 'Hobbitish', 'Rune Sprout',
        'Flare Mite', 'Oddling', 'Frost Nib', 'Tanglefox', 'Dew Wisp',
        'Charm Pup', 'Puffshrew', 'Glimmer Toad', 'Nibblebat', 'Twitch Imp',
        'Shimmerbug', 'Mossling', 'Bogglepuff', 'Whistle Wyrm', 'Wink Rat',
        'Gritling', 'Glow Sprout', 'Pebble Imp', 'Chitterfox', 'Drift Mote',
        'Moon Shrew', 'Charm Wisp', 'Frost Pup', 'Riddlebat', 'Fogling',
        'Spell Sprout', 'Twiddle Imp', 'Grumblepix', 'Star Beetle',
    ];

    /**
     * Generate a random game name by combining the game type with a fantasy creature suffix
     */
    public static function generate(string $gameType): string
    {
        // Get the display name for the game type
        $gameTypeName = self::getGameTypeName($gameType);

        // Randomly choose one suffix
        $suffix = self::$suffixes[array_rand(self::$suffixes)];

        // Combine game type name with the random suffix
        return $gameTypeName . ' ' . $suffix;
    }

    /**
     * Get the display name for a game type
     */
    private static function getGameTypeName(string $gameType): string
    {
        return match ($gameType) {
            'SWOOP' => 'Swoop',
            'OH_HELL' => 'Oh Hell!',
            'TELESTRATIONS' => 'Telestrations',
            'WAR_IN_HEAVEN' => 'War in Heaven',
            default => $gameType,
        };
    }
}
