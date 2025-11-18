<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Piece Manager Component
 *
 * Manages game pieces on the board, including:
 * - Piece tracking
 * - Piece movement
 * - Piece removal (capture)
 * - Piece queries
 */
class PieceManager
{
    private HexBoard $board;

    public function __construct(HexBoard $board)
    {
        $this->board = $board;
    }

    /**
     * Move a piece from one position to another
     *
     * @param array $boardState Current board state
     * @param string $from Source hex key
     * @param string $to Destination hex key
     * @return array Updated board state
     */
    public function movePiece(array $boardState, string $from, string $to): array
    {
        $piece = $boardState['hexes'][$from]['piece'] ?? null;

        if (!$piece) {
            return $boardState; // No piece to move
        }

        // Remove piece from source
        $boardState['hexes'][$from]['piece'] = null;

        // Place piece at destination
        $boardState['hexes'][$to]['piece'] = $piece;

        // Mark piece as having moved this turn
        $boardState['hexes'][$to]['piece']['hasMoved'] = true;

        return $boardState;
    }

    /**
     * Remove a piece from the board
     *
     * @param array $boardState Current board state
     * @param string $hexKey Hex position key
     * @return array Updated board state
     */
    public function removePiece(array $boardState, string $hexKey): array
    {
        $boardState['hexes'][$hexKey]['piece'] = null;
        return $boardState;
    }

    /**
     * Get piece at a specific position
     *
     * @param array $boardState Current board state
     * @param string $hexKey Hex position key
     * @return array|null Piece data or null
     */
    public function getPieceAt(array $boardState, string $hexKey): ?array
    {
        return $boardState['hexes'][$hexKey]['piece'] ?? null;
    }

    /**
     * Get all pieces belonging to a faction
     *
     * @param array $boardState Current board state
     * @param string $faction Faction identifier
     * @return array Array of pieces with their positions
     */
    public function getPiecesForFaction(array $boardState, string $faction): array
    {
        $pieces = [];

        foreach ($boardState['hexes'] as $hexKey => $hex) {
            if ($hex['piece'] && $hex['piece']['faction'] === $faction) {
                $pieces[] = [
                    'position' => $hexKey,
                    'piece' => $hex['piece'],
                ];
            }
        }

        return $pieces;
    }

    /**
     * Get all pieces on the board
     *
     * @param array $boardState Current board state
     * @return array Array of all pieces with positions
     */
    public function getAllPieces(array $boardState): array
    {
        $pieces = [];

        foreach ($boardState['hexes'] as $hexKey => $hex) {
            if ($hex['piece']) {
                $pieces[] = [
                    'position' => $hexKey,
                    'piece' => $hex['piece'],
                ];
            }
        }

        return $pieces;
    }

    /**
     * Check if a position is occupied
     *
     * @param array $boardState Current board state
     * @param string $hexKey Hex position key
     * @return bool True if occupied
     */
    public function isOccupied(array $boardState, string $hexKey): bool
    {
        return !empty($boardState['hexes'][$hexKey]['piece']);
    }

    /**
     * Reset "hasMoved" flag for all pieces of a faction
     * Called at the start of each turn
     *
     * @param array $boardState Current board state
     * @param string $faction Faction identifier
     * @return array Updated board state
     */
    public function resetMovementFlags(array $boardState, string $faction): array
    {
        foreach ($boardState['hexes'] as $hexKey => &$hex) {
            if ($hex['piece'] && $hex['piece']['faction'] === $faction) {
                $hex['piece']['hasMoved'] = false;
            }
        }

        return $boardState;
    }

    /**
     * Count remaining pieces for a faction
     *
     * @param array $boardState Current board state
     * @param string $faction Faction identifier
     * @return int Number of pieces
     */
    public function countPieces(array $boardState, string $faction): int
    {
        return count($this->getPiecesForFaction($boardState, $faction));
    }
}
