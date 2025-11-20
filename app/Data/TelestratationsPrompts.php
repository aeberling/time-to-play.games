<?php

namespace App\Data;

/**
 * Telestrations Prompts Library
 *
 * Manages a curated collection of drawing prompts organized by category and difficulty.
 * Provides methods for filtering and randomly selecting prompts for gameplay.
 */
class TelestratationsPrompts
{
    /**
     * Get all available prompt categories
     */
    public static function getCategories(): array
    {
        return [
            'animals' => 'Animals',
            'objects' => 'Objects',
            'actions' => 'Actions',
            'places' => 'Places',
            'people' => 'People',
            'food' => 'Food & Drink',
            'abstract' => 'Abstract Concepts',
            'pop_culture' => 'Pop Culture',
        ];
    }

    /**
     * Get all prompts (optionally filtered by category and/or difficulty)
     */
    public static function getPrompts(string $category = 'all', string $difficulty = 'all'): array
    {
        $allPrompts = self::getAllPrompts();

        return array_filter($allPrompts, function($prompt) use ($category, $difficulty) {
            $categoryMatch = $category === 'all' || $prompt['category'] === $category;
            $difficultyMatch = $difficulty === 'all' || $prompt['difficulty'] === $difficulty;
            return $categoryMatch && $difficultyMatch;
        });
    }

    /**
     * Get random prompts (optionally filtered)
     */
    public static function getRandomPrompts(int $count = 10, array $filters = []): array
    {
        $category = $filters['category'] ?? 'all';
        $difficulty = $filters['difficulty'] ?? 'all';

        $prompts = self::getPrompts($category, $difficulty);
        shuffle($prompts);

        return array_slice($prompts, 0, $count);
    }

    /**
     * Complete prompt library
     */
    private static function getAllPrompts(): array
    {
        return [
            // ==================== EASY - ANIMALS ====================
            ['text' => 'A dog', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A cat', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A fish', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A bird', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A snake', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A butterfly', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A spider', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A frog', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A turtle', 'category' => 'animals', 'difficulty' => 'easy'],
            ['text' => 'A rabbit', 'category' => 'animals', 'difficulty' => 'easy'],

            // ==================== EASY - OBJECTS ====================
            ['text' => 'A car', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A house', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A tree', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A flower', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A phone', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A chair', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A book', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A cup', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A ball', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A clock', 'category' => 'objects', 'difficulty' => 'easy'],

            // ==================== EASY - FOOD ====================
            ['text' => 'Pizza', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'Ice cream', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'An apple', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'A banana', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'A hamburger', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'A hot dog', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'A cookie', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'A cake', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'Spaghetti', 'category' => 'food', 'difficulty' => 'easy'],
            ['text' => 'A sandwich', 'category' => 'food', 'difficulty' => 'easy'],

            // ==================== MEDIUM - ANIMALS ====================
            ['text' => 'A cat playing piano', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A dog skateboarding', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A penguin wearing a hat', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'An elephant balancing on a ball', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A monkey eating a banana', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A giraffe wearing sunglasses', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A bear riding a bicycle', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A cow jumping over the moon', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A chicken laying golden eggs', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A hippo in a tutu', 'category' => 'animals', 'difficulty' => 'medium'],

            // ==================== MEDIUM - ACTIONS ====================
            ['text' => 'Someone riding a bicycle', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone playing guitar', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone cooking', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone dancing', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone reading a book', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone painting', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone gardening', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone juggling', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone fishing', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'Someone singing', 'category' => 'actions', 'difficulty' => 'medium'],

            // ==================== MEDIUM - PLACES ====================
            ['text' => 'A beach', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A mountain', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A forest', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A city skyline', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A farm', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A park', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A desert', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A castle', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A library', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A zoo', 'category' => 'places', 'difficulty' => 'medium'],

            // ==================== MEDIUM - PEOPLE ====================
            ['text' => 'A doctor', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A teacher', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A firefighter', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A chef', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A police officer', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'An astronaut', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A pirate', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A superhero', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A wizard', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A ninja', 'category' => 'people', 'difficulty' => 'medium'],

            // ==================== MEDIUM - OBJECTS ====================
            ['text' => 'A rocket ship', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A treehouse', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A snowman', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A rainbow', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A waterfall', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A lighthouse', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A windmill', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A bridge', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A telescope', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A treasure chest', 'category' => 'objects', 'difficulty' => 'medium'],

            // ==================== HARD - ABSTRACT ====================
            ['text' => 'The feeling of happiness', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'The concept of time', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'A dream within a dream', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'The sound of silence', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'Chaos theory', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'Monday morning feeling', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'Déjà vu', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'Existential crisis', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'The passage of time', 'category' => 'abstract', 'difficulty' => 'hard'],
            ['text' => 'Inner peace', 'category' => 'abstract', 'difficulty' => 'hard'],

            // ==================== HARD - POP CULTURE ====================
            ['text' => 'Game of Thrones', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'Star Wars', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'Harry Potter', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'The Matrix', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'Breaking Bad', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'The Simpsons', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'Pokemon', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'Marvel Universe', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'The Beatles', 'category' => 'pop_culture', 'difficulty' => 'hard'],
            ['text' => 'Netflix and chill', 'category' => 'pop_culture', 'difficulty' => 'hard'],

            // ==================== HARD - ACTIONS ====================
            ['text' => 'Procrastinating', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Time traveling', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Mind reading', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Breaking the fourth wall', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Overthinking', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Having an epiphany', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Multitasking badly', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Experiencing vertigo', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Having a eureka moment', 'category' => 'actions', 'difficulty' => 'hard'],
            ['text' => 'Contemplating existence', 'category' => 'actions', 'difficulty' => 'hard'],

            // ==================== ADDITIONAL MEDIUM PROMPTS ====================
            ['text' => 'A robot doing laundry', 'category' => 'actions', 'difficulty' => 'medium'],
            ['text' => 'A vampire at the beach', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A dragon playing cards', 'category' => 'animals', 'difficulty' => 'medium'],
            ['text' => 'A mermaid on a swing', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'A ghost eating breakfast', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'Sushi made of candy', 'category' => 'food', 'difficulty' => 'medium'],
            ['text' => 'A flying car', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'An underwater city', 'category' => 'places', 'difficulty' => 'medium'],
            ['text' => 'A talking tree', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A disco ball in space', 'category' => 'objects', 'difficulty' => 'medium'],

            // ==================== ADDITIONAL EASY PROMPTS ====================
            ['text' => 'The sun', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'The moon', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A star', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A cloud', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'Rain', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'Snow', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A heart', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A smile', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'An eye', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A hand', 'category' => 'objects', 'difficulty' => 'easy'],

            // More variety
            ['text' => 'A hot air balloon', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A campfire', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A tent', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A sleeping bag', 'category' => 'objects', 'difficulty' => 'easy'],
            ['text' => 'A marshmallow on a stick', 'category' => 'food', 'difficulty' => 'medium'],
            ['text' => 'A cactus wearing a sombrero', 'category' => 'objects', 'difficulty' => 'medium'],
            ['text' => 'A snowflake under a microscope', 'category' => 'objects', 'difficulty' => 'hard'],
            ['text' => 'Rush hour traffic', 'category' => 'abstract', 'difficulty' => 'medium'],
            ['text' => 'A family reunion', 'category' => 'people', 'difficulty' => 'medium'],
            ['text' => 'Spring cleaning', 'category' => 'actions', 'difficulty' => 'medium'],
        ];
    }
}
