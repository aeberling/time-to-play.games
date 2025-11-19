<?php

namespace App\Services;

class GameNameGenerator
{
    private static array $goofyWords = [
        'Banana', 'Pickle', 'Waffle', 'Noodle', 'Muffin',
        'Cookie', 'Nugget', 'Sprinkle', 'Jellybean', 'Cupcake',
        'Pancake', 'Taco', 'Burrito', 'Pretzel', 'Donut',
        'Biscuit', 'Pudding', 'Custard', 'Churro', 'Bagel',
        'Unicorn', 'Dragon', 'Phoenix', 'Pegasus', 'Griffin',
        'Narwhal', 'Yeti', 'Sasquatch', 'Kraken', 'Chimera',
        'Wizard', 'Ninja', 'Pirate', 'Robot', 'Zombie',
        'Viking', 'Knight', 'Samurai', 'Astronaut', 'Cyborg',
        'Rainbow', 'Sparkle', 'Glitter', 'Shimmer', 'Twinkle',
        'Bubble', 'Giggle', 'Wiggle', 'Jiggle', 'Dazzle',
        'Thunder', 'Lightning', 'Blizzard', 'Tornado', 'Hurricane',
        'Avalanche', 'Earthquake', 'Meteor', 'Comet', 'Nebula',
        'Disco', 'Funky', 'Groovy', 'Jazzy', 'Boogie',
        'Rad', 'Gnarly', 'Tubular', 'Stellar', 'Epic',
        'Turbo', 'Mega', 'Super', 'Ultra', 'Hyper',
        'Nitro', 'Atomic', 'Cosmic', 'Quantum', 'Nuclear',
        'Fluffy', 'Fuzzy', 'Squishy', 'Bouncy', 'Springy',
        'Wobbly', 'Jiggly', 'Bumpy', 'Lumpy', 'Chunky',
        'Silly', 'Wacky', 'Zany', 'Bonkers', 'Loopy',
        'Quirky', 'Goofy', 'Nutty', 'Dizzy', 'Whimsical',
        'Snazzy', 'Fancy', 'Spiffy', 'Dapper', 'Swanky',
        'Posh', 'Classy', 'Ritzy', 'Swish', 'Plush',
        'Rocket', 'Comet', 'Meteor', 'Satellite', 'Galaxy',
        'Cosmos', 'Stardust', 'Moonbeam', 'Sunburst', 'Aurora',
        'Bear', 'Panda', 'Koala', 'Sloth', 'Otter',
        'Penguin', 'Flamingo', 'Platypus', 'Hedgehog', 'Raccoon',
        'Squirrel', 'Chipmunk', 'Hamster', 'Gerbil', 'Ferret',
        'Llama', 'Alpaca', 'Camel', 'Giraffe', 'Elephant',
        'Hippo', 'Rhino', 'Gorilla', 'Monkey', 'Lemur',
        'Mongoose', 'Meerkat', 'Wombat', 'Wallaby', 'Kangaroo',
        'Dolphin', 'Whale', 'Shark', 'Octopus', 'Squid',
        'Jellyfish', 'Starfish', 'Seahorse', 'Pufferfish', 'Clownfish',
        'Crimson', 'Emerald', 'Sapphire', 'Amber', 'Violet',
        'Indigo', 'Turquoise', 'Magenta', 'Coral', 'Teal',
        'Scarlet', 'Golden', 'Silver', 'Bronze', 'Platinum',
        'Diamond', 'Ruby', 'Pearl', 'Opal', 'Jade',
        'Topaz', 'Garnet', 'Quartz', 'Crystal', 'Amethyst',
        'Champion', 'Legend', 'Hero', 'Titan', 'Warrior',
        'Master', 'Ace', 'Chief', 'Captain', 'Commander',
        'Duke', 'Baron', 'Count', 'Prince', 'King',
        'Emperor', 'Supreme', 'Grand', 'Prime', 'Elite',
        'Mighty', 'Brave', 'Bold', 'Swift', 'Noble',
        'Fierce', 'Wild', 'Savage', 'Brutal', 'Ruthless',
    ];

    /**
     * Generate a random game name by combining the game type with 1-2 goofy words
     */
    public static function generate(string $gameType): string
    {
        // Get the display name for the game type
        $gameTypeName = self::getGameTypeName($gameType);

        // Randomly choose 1 or 2 words
        $wordCount = rand(1, 2);

        $words = [];
        $availableWords = self::$goofyWords;

        for ($i = 0; $i < $wordCount; $i++) {
            $randomIndex = array_rand($availableWords);
            $words[] = $availableWords[$randomIndex];

            // Remove the selected word to avoid duplicates
            unset($availableWords[$randomIndex]);
            $availableWords = array_values($availableWords);
        }

        // Combine game type name with the random words
        return $gameTypeName . ' ' . implode(' ', $words);
    }

    /**
     * Get the display name for a game type
     */
    private static function getGameTypeName(string $gameType): string
    {
        return match ($gameType) {
            'WAR' => 'War',
            'SWOOP' => 'Swoop',
            'OH_HELL' => 'Oh Hell!',
            'WAR_IN_HEAVEN' => 'War in Heaven',
            default => $gameType,
        };
    }
}
