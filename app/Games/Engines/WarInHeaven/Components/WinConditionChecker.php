<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Win Condition Checker Component
 *
 * Checks various victory conditions
 */
class WinConditionChecker
{
    /**
     * Check if game is over and determine winner
     *
     * @param array $state Full game state
     * @return array|null Victory data or null if game continues
     */
    public function check(array $state): ?array
    {
        // Check elimination victory (all enemy pieces destroyed)
        $eliminationResult = $this->checkElimination($state);
        if ($eliminationResult) {
            return $eliminationResult;
        }

        // Check victory points
        $victoryPointsResult = $this->checkVictoryPoints($state);
        if ($victoryPointsResult) {
            return $victoryPointsResult;
        }

        // Check objective victory (if implemented)
        // TODO: Implement objective-based victory

        // Check timeout/resignation (handled elsewhere)

        return null; // Game continues
    }

    /**
     * Check for elimination victory
     */
    private function checkElimination(array $state): ?array
    {
        $faction1Pieces = 0;
        $faction2Pieces = 0;

        foreach ($state['board']['hexes'] as $hex) {
            if ($hex['piece']) {
                if ($hex['piece']['faction'] === 'FACTION1') {
                    $faction1Pieces++;
                } elseif ($hex['piece']['faction'] === 'FACTION2') {
                    $faction2Pieces++;
                }
            }
        }

        if ($faction1Pieces === 0) {
            return [
                'condition' => 'ELIMINATION',
                'winner' => 'FACTION2',
                'winnerIndex' => $this->getFactionPlayerIndex($state, 'FACTION2'),
            ];
        }

        if ($faction2Pieces === 0) {
            return [
                'condition' => 'ELIMINATION',
                'winner' => 'FACTION1',
                'winnerIndex' => $this->getFactionPlayerIndex($state, 'FACTION1'),
            ];
        }

        return null;
    }

    /**
     * Check for victory points win
     */
    private function checkVictoryPoints(array $state): ?array
    {
        $threshold = $state['config']['victoryPointsToWin'] ?? 10;

        $faction1VP = $state['resources']['FACTION1']['victoryPoints'] ?? 0;
        $faction2VP = $state['resources']['FACTION2']['victoryPoints'] ?? 0;

        if ($faction1VP >= $threshold) {
            return [
                'condition' => 'VICTORY_POINTS',
                'winner' => 'FACTION1',
                'winnerIndex' => $this->getFactionPlayerIndex($state, 'FACTION1'),
                'points' => $faction1VP,
            ];
        }

        if ($faction2VP >= $threshold) {
            return [
                'condition' => 'VICTORY_POINTS',
                'winner' => 'FACTION2',
                'winnerIndex' => $this->getFactionPlayerIndex($state, 'FACTION2'),
                'points' => $faction2VP,
            ];
        }

        return null;
    }

    /**
     * Get player index for a faction
     */
    private function getFactionPlayerIndex(array $state, string $faction): int
    {
        foreach ($state['players'] as $player) {
            if ($player['faction'] === $faction) {
                return $player['playerIndex'];
            }
        }

        return 0;
    }
}
