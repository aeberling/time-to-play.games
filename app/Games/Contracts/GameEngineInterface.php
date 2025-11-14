<?php

namespace App\Games\Contracts;

use App\Games\ValueObjects\ValidationResult;

/**
 * Interface that all game engines must implement
 * This ensures consistency across all game types and makes adding new games trivial
 */
interface GameEngineInterface
{
    /**
     * Get the unique identifier for this game type
     */
    public function getGameType(): string;

    /**
     * Get human-readable name
     */
    public function getName(): string;

    /**
     * Get game configuration (player count, description, etc.)
     */
    public function getConfig(): array;

    /**
     * Initialize a new game state
     *
     * @param array $players Array of player data
     * @param array $options Optional game configuration
     * @return array The initial game state
     */
    public function initializeGame(array $players, array $options = []): array;

    /**
     * Validate if a move is legal
     *
     * @param array $state Current game state
     * @param array $move Move data to validate
     * @param int $playerIndex Index of player making the move
     * @return ValidationResult
     */
    public function validateMove(array $state, array $move, int $playerIndex): ValidationResult;

    /**
     * Apply a validated move and return new state
     *
     * @param array $state Current game state
     * @param array $move Move data
     * @param int $playerIndex Index of player making the move
     * @return array Updated game state
     */
    public function applyMove(array $state, array $move, int $playerIndex): array;

    /**
     * Check if game is over and determine winner
     *
     * @param array $state Current game state
     * @return array ['isOver' => bool, 'winner' => ?int, 'placements' => ?array]
     */
    public function checkGameOver(array $state): array;

    /**
     * Get player-specific view (hide opponent cards, etc.)
     *
     * @param array $state Current game state
     * @param int $playerIndex Index of player requesting view
     * @return array Filtered state for this player
     */
    public function getPlayerView(array $state, int $playerIndex): array;

    /**
     * Serialize state for storage
     *
     * @param array $state Game state
     * @return string JSON encoded state
     */
    public function serializeState(array $state): string;

    /**
     * Deserialize state from storage
     *
     * @param string $state JSON encoded state
     * @return array Game state
     */
    public function deserializeState(string $state): array;
}
