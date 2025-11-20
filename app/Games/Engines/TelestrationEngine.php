<?php

namespace App\Games\Engines;

use App\Games\Contracts\GameEngineInterface;
use App\Games\ValueObjects\ValidationResult;

/**
 * Telestrations (Drawing Telephone) Game Engine
 *
 * A simultaneous party game where players alternate between drawing prompts and guessing drawings.
 * Each player owns a "sketchbook" that rotates around the table, with alternating drawing/guessing turns.
 * The goal is to see how prompts transform as they pass through multiple interpretations.
 */
class TelestrationEngine implements GameEngineInterface
{
    public function getGameType(): string
    {
        return 'TELESTRATIONS';
    }

    public function getName(): string
    {
        return 'Telestrations';
    }

    public function getConfig(): array
    {
        return [
            'minPlayers' => 4,
            'maxPlayers' => 8,
            'description' => 'Draw and guess your way through hilarious sketchbook transformations',
            'difficulty' => 'Easy',
            'estimatedDuration' => '20-40 minutes',
            'requiresStrategy' => false,
        ];
    }

    public function initializeGame(array $players, array $options = []): array
    {
        $playerCount = count($players);

        if ($playerCount < 4 || $playerCount > 8) {
            throw new \InvalidArgumentException('Telestrations requires 4-8 players');
        }

        // Get options with defaults
        $rounds = $options['rounds'] ?? 3;
        $scoringEnabled = $options['scoringEnabled'] ?? true;

        // Calculate max turns (one full rotation = playerCount)
        $maxTurns = $playerCount;

        // Initialize sketchbooks (one per player)
        $sketchbooks = [];
        for ($i = 0; $i < $playerCount; $i++) {
            $sketchbooks[] = [
                'ownerId' => $i,
                'currentHolderId' => $i, // Initially, each player holds their own sketchbook
                'pages' => [],
            ];
        }

        return [
            'players' => $players,
            'playerCount' => $playerCount,

            // Game configuration
            'rounds' => $rounds,
            'currentRound' => 1,
            'currentTurn' => 0,
            'maxTurns' => $maxTurns,
            'scoringEnabled' => $scoringEnabled,

            // Phase management
            'phase' => 'INITIAL_PROMPT',
            'turnDeadline' => null,

            // Sketchbook data
            'sketchbooks' => $sketchbooks,

            // Tracking
            'playersReadyToContinue' => array_fill(0, $playerCount, false),
            'submittedThisTurn' => array_fill(0, $playerCount, false),

            // Scoring
            'scores' => array_fill(0, $playerCount, 0),

            // History
            'lastAction' => null,
            'playHistory' => [],
            'roundResults' => null,
        ];
    }

    public function validateMove(array $state, array $move, int $playerIndex): ValidationResult
    {
        $action = $move['action'] ?? null;

        if ($action === 'SUBMIT_PROMPT') {
            if ($state['phase'] !== 'INITIAL_PROMPT') {
                return ValidationResult::invalid('Not in prompt phase');
            }

            $prompt = $move['prompt'] ?? '';
            if (empty(trim($prompt))) {
                return ValidationResult::invalid('Prompt cannot be empty');
            }

            if (strlen($prompt) > 100) {
                return ValidationResult::invalid('Prompt too long (max 100 characters)');
            }

            if ($state['submittedThisTurn'][$playerIndex]) {
                return ValidationResult::invalid('You have already submitted your prompt');
            }

            return ValidationResult::valid();
        }

        if ($action === 'SUBMIT_DRAWING') {
            if ($state['phase'] !== 'DRAWING') {
                return ValidationResult::invalid('Not in drawing phase');
            }

            $imageData = $move['imageData'] ?? '';
            if (empty($imageData)) {
                return ValidationResult::invalid('No image data provided');
            }

            // Validate base64 image format
            if (!preg_match('/^data:image\/(png|jpeg);base64,/', $imageData)) {
                return ValidationResult::invalid('Invalid image format (must be PNG or JPEG)');
            }

            if ($state['submittedThisTurn'][$playerIndex]) {
                return ValidationResult::invalid('You have already submitted your drawing');
            }

            return ValidationResult::valid();
        }

        if ($action === 'SUBMIT_GUESS') {
            if ($state['phase'] !== 'GUESSING') {
                return ValidationResult::invalid('Not in guessing phase');
            }

            $guess = $move['guess'] ?? '';
            if (empty(trim($guess))) {
                return ValidationResult::invalid('Guess cannot be empty');
            }

            if (strlen($guess) > 100) {
                return ValidationResult::invalid('Guess too long (max 100 characters)');
            }

            if ($state['submittedThisTurn'][$playerIndex]) {
                return ValidationResult::invalid('You have already submitted your guess');
            }

            return ValidationResult::valid();
        }

        if ($action === 'CONTINUE_ROUND') {
            if ($state['phase'] !== 'ROUND_OVER') {
                return ValidationResult::invalid('Round is not over');
            }

            return ValidationResult::valid();
        }

        return ValidationResult::invalid('Unknown action');
    }

    public function applyMove(array $state, array $move, int $playerIndex): array
    {
        $action = $move['action'];
        $timestamp = now()->toIso8601String();

        switch ($action) {
            case 'SUBMIT_PROMPT':
                // Add prompt to player's own sketchbook
                $state['sketchbooks'][$playerIndex]['pages'][] = [
                    'type' => 'prompt',
                    'authorId' => $playerIndex,
                    'text' => trim($move['prompt']),
                    'timestamp' => $timestamp,
                ];
                $state['submittedThisTurn'][$playerIndex] = true;

                // Update history
                $state['playHistory'][] = [
                    'type' => 'PROMPT_SUBMITTED',
                    'playerIndex' => $playerIndex,
                    'playerName' => $state['players'][$playerIndex]['name'],
                    'timestamp' => $timestamp,
                ];
                break;

            case 'SUBMIT_DRAWING':
                // Find which sketchbook this player currently holds
                $sketchbookId = $this->findSketchbookHeldBy($state, $playerIndex);

                $state['sketchbooks'][$sketchbookId]['pages'][] = [
                    'type' => 'drawing',
                    'artistId' => $playerIndex,
                    'imageData' => $move['imageData'],
                    'timestamp' => $timestamp,
                ];
                $state['submittedThisTurn'][$playerIndex] = true;

                // Update history
                $state['playHistory'][] = [
                    'type' => 'DRAWING_SUBMITTED',
                    'playerIndex' => $playerIndex,
                    'playerName' => $state['players'][$playerIndex]['name'],
                    'timestamp' => $timestamp,
                    'sketchbookId' => $sketchbookId,
                ];
                break;

            case 'SUBMIT_GUESS':
                $sketchbookId = $this->findSketchbookHeldBy($state, $playerIndex);

                $state['sketchbooks'][$sketchbookId]['pages'][] = [
                    'type' => 'guess',
                    'guesserId' => $playerIndex,
                    'text' => trim($move['guess']),
                    'timestamp' => $timestamp,
                ];
                $state['submittedThisTurn'][$playerIndex] = true;

                // Update history
                $state['playHistory'][] = [
                    'type' => 'GUESS_SUBMITTED',
                    'playerIndex' => $playerIndex,
                    'playerName' => $state['players'][$playerIndex]['name'],
                    'timestamp' => $timestamp,
                    'sketchbookId' => $sketchbookId,
                ];
                break;

            case 'CONTINUE_ROUND':
                $state['playersReadyToContinue'][$playerIndex] = true;
                break;
        }

        // Update last action
        $state['lastAction'] = [
            'type' => $action,
            'playerIndex' => $playerIndex,
            'timestamp' => $timestamp,
        ];

        // Check if phase should advance
        if ($this->allPlayersSubmitted($state) || $this->allPlayersReady($state)) {
            $state = $this->advancePhase($state);
        }

        return $state;
    }

    /**
     * Advance to the next phase based on current phase
     */
    private function advancePhase(array $state): array
    {
        // Reset submission tracking
        $state['submittedThisTurn'] = array_fill(0, $state['playerCount'], false);

        switch ($state['phase']) {
            case 'INITIAL_PROMPT':
                // All prompts submitted, rotate sketchbooks and start drawing
                $state = $this->rotateSketchbooks($state);
                $state['phase'] = 'DRAWING';
                $state['currentTurn'] = 1;
                break;

            case 'DRAWING':
                // All drawings submitted, rotate and move to guessing
                $state = $this->rotateSketchbooks($state);
                $state['currentTurn']++;

                if ($state['currentTurn'] > $state['maxTurns']) {
                    // Round complete, move to reveal
                    $state['phase'] = 'REVEAL';
                    if ($state['scoringEnabled']) {
                        $state = $this->calculateRoundScores($state);
                    }
                } else {
                    $state['phase'] = 'GUESSING';
                }
                break;

            case 'GUESSING':
                // All guesses submitted, rotate and move to drawing
                $state = $this->rotateSketchbooks($state);
                $state['currentTurn']++;

                if ($state['currentTurn'] > $state['maxTurns']) {
                    // Round complete, move to reveal
                    $state['phase'] = 'REVEAL';
                    if ($state['scoringEnabled']) {
                        $state = $this->calculateRoundScores($state);
                    }
                } else {
                    $state['phase'] = 'DRAWING';
                }
                break;

            case 'REVEAL':
                // All players ready to continue from reveal
                $state['phase'] = 'ROUND_OVER';
                break;

            case 'ROUND_OVER':
                // All players ready to continue
                if ($state['currentRound'] >= $state['rounds']) {
                    // Game over
                    $state['phase'] = 'GAME_OVER';
                } else {
                    // Start next round
                    $state = $this->startNextRound($state);
                }
                break;
        }

        return $state;
    }

    /**
     * Rotate sketchbooks to next player
     */
    private function rotateSketchbooks(array $state): array
    {
        foreach ($state['sketchbooks'] as &$sketchbook) {
            $sketchbook['currentHolderId'] = ($sketchbook['currentHolderId'] + 1) % $state['playerCount'];
        }

        return $state;
    }

    /**
     * Find which sketchbook a player currently holds
     */
    private function findSketchbookHeldBy(array $state, int $playerIndex): int
    {
        foreach ($state['sketchbooks'] as $id => $sketchbook) {
            if ($sketchbook['currentHolderId'] === $playerIndex) {
                return $id;
            }
        }

        throw new \RuntimeException("Player $playerIndex is not holding any sketchbook");
    }

    /**
     * Check if all players have submitted this turn
     */
    private function allPlayersSubmitted(array $state): bool
    {
        foreach ($state['submittedThisTurn'] as $submitted) {
            if (!$submitted) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if all players are ready to continue
     */
    private function allPlayersReady(array $state): bool
    {
        // Only relevant for ROUND_OVER and REVEAL phases
        if ($state['phase'] !== 'ROUND_OVER' && $state['phase'] !== 'REVEAL') {
            return false;
        }

        foreach ($state['playersReadyToContinue'] as $ready) {
            if (!$ready) {
                return false;
            }
        }
        return true;
    }

    /**
     * Calculate scores for completed round
     */
    private function calculateRoundScores(array $state): array
    {
        if (!$state['scoringEnabled']) {
            return $state;
        }

        $roundResults = [];

        foreach ($state['sketchbooks'] as $sketchbookId => $sketchbook) {
            $pages = $sketchbook['pages'];

            if (empty($pages)) {
                continue;
            }

            $originalPrompt = $pages[0]['text'] ?? '';
            $finalGuess = end($pages)['text'] ?? '';

            $matches = [];

            // Award points for accurate guesses
            foreach ($pages as $page) {
                if ($page['type'] === 'guess') {
                    $similarity = $this->calculateSimilarity($originalPrompt, $page['text']);

                    if ($similarity > 0.9) {
                        // Exact match: 10 points
                        $state['scores'][$page['guesserId']] += 10;
                        $matches[] = [
                            'playerIndex' => $page['guesserId'],
                            'pointsAwarded' => 10,
                            'reason' => 'exact_match',
                        ];
                    } elseif ($similarity > 0.7) {
                        // Close match: 5 points
                        $state['scores'][$page['guesserId']] += 5;
                        $matches[] = [
                            'playerIndex' => $page['guesserId'],
                            'pointsAwarded' => 5,
                            'reason' => 'close_match',
                        ];
                    }
                }
            }

            // Bonus points for prompt author if final guess matches original
            if ($this->calculateSimilarity($originalPrompt, $finalGuess) > 0.8) {
                $state['scores'][$sketchbookId] += 15;
                $matches[] = [
                    'playerIndex' => $sketchbookId,
                    'pointsAwarded' => 15,
                    'reason' => 'successful_transmission',
                ];
            }

            $roundResults[] = [
                'sketchbookId' => $sketchbookId,
                'originalPrompt' => $originalPrompt,
                'finalGuess' => $finalGuess,
                'progression' => $pages,
                'matches' => $matches,
            ];
        }

        $state['roundResults'] = $roundResults;

        return $state;
    }

    /**
     * Calculate text similarity (0.0 to 1.0)
     */
    private function calculateSimilarity(string $str1, string $str2): float
    {
        $str1 = strtolower(trim($str1));
        $str2 = strtolower(trim($str2));

        if ($str1 === $str2) {
            return 1.0;
        }

        if (empty($str1) || empty($str2)) {
            return 0.0;
        }

        // Use similar_text for similarity calculation
        similar_text($str1, $str2, $percent);

        return $percent / 100.0;
    }

    /**
     * Start next round
     */
    private function startNextRound(array $state): array
    {
        $state['currentRound']++;
        $state['currentTurn'] = 0;
        $state['phase'] = 'INITIAL_PROMPT';

        // Reset sketchbooks
        for ($i = 0; $i < $state['playerCount']; $i++) {
            $state['sketchbooks'][$i] = [
                'ownerId' => $i,
                'currentHolderId' => $i,
                'pages' => [],
            ];
        }

        // Reset tracking flags
        $state['playersReadyToContinue'] = array_fill(0, $state['playerCount'], false);
        $state['submittedThisTurn'] = array_fill(0, $state['playerCount'], false);
        $state['roundResults'] = null;

        return $state;
    }

    public function checkGameOver(array $state): array
    {
        if ($state['phase'] !== 'GAME_OVER') {
            return ['isOver' => false];
        }

        // Sort players by score (descending)
        $playerScores = [];
        for ($i = 0; $i < $state['playerCount']; $i++) {
            $playerScores[] = [
                'index' => $i,
                'score' => $state['scores'][$i],
            ];
        }

        usort($playerScores, fn($a, $b) => $b['score'] <=> $a['score']);

        // Create placements array (0-indexed player indices in order of placement)
        $placements = array_map(fn($p) => $p['index'], $playerScores);

        return [
            'isOver' => true,
            'winner' => $placements[0], // Highest score
            'placements' => $placements,
        ];
    }

    public function getPlayerView(array $state, int $playerIndex): array
    {
        // In Telestrations, there's no hidden information during most phases
        // All players can see the full state

        // During DRAWING and GUESSING phases, players only need to see their current sketchbook
        // But we return full state to keep it simple - frontend can filter if needed

        return $state;
    }

    public function serializeState(array $state): string
    {
        return json_encode($state);
    }

    public function deserializeState(string $state): array
    {
        return json_decode($state, true);
    }
}
