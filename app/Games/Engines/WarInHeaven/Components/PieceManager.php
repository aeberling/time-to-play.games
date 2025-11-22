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
     * Move a token from one position to another
     *
     * @param array $board Current board (hexes array)
     * @param string $from Source hex coordinate (e.g., 'A5')
     * @param string $to Destination hex coordinate
     * @return array Updated board
     */
    public function movePiece(array $board, string $from, string $to): array
    {
        $token = $board[$from]['occupiedBy'] ?? null;

        if (!$token) {
            return $board; // No token to move
        }

        // Remove token from source
        $board[$from]['occupiedBy'] = null;

        // Place token at destination
        $board[$to]['occupiedBy'] = $token;

        // Update token position
        $board[$to]['occupiedBy']['position'] = $to;

        // Mark token as depleted (used action)
        $board[$to]['occupiedBy']['isActive'] = false;

        return $board;
    }

    /**
     * Deploy a new token to the board
     *
     * @param array $board Current board
     * @param string $to Destination hex coordinate
     * @param array $tokenData Token data to place
     * @return array Updated board
     */
    public function deployToken(array $board, string $to, array $tokenData): array
    {
        if (isset($board[$to]['occupiedBy']) && $board[$to]['occupiedBy'] !== null) {
            // Hex already occupied
            return $board;
        }

        // Place token
        $board[$to]['occupiedBy'] = array_merge($tokenData, [
            'position' => $to,
            'isActive' => false, // Deployed tokens are depleted
        ]);

        return $board;
    }

    /**
     * Remove a token from the board (eliminated in combat)
     *
     * @param array $board Current board
     * @param string $coordinate Hex coordinate
     * @return array Updated board
     */
    public function removePiece(array $board, string $coordinate): array
    {
        if (isset($board[$coordinate])) {
            $board[$coordinate]['occupiedBy'] = null;
        }
        return $board;
    }

    /**
     * Get token at a specific position
     *
     * @param array $board Current board
     * @param string $coordinate Hex coordinate
     * @return array|null Token data or null
     */
    public function getTokenAt(array $board, string $coordinate): ?array
    {
        return $board[$coordinate]['occupiedBy'] ?? null;
    }

    /**
     * Get all tokens belonging to a faction
     *
     * @param array $board Current board
     * @param string $faction Faction identifier (angels/demons)
     * @return array Array of tokens with their positions
     */
    public function getTokensForFaction(array $board, string $faction): array
    {
        $tokens = [];

        foreach ($board as $coordinate => $hex) {
            if ($hex['occupiedBy'] && $hex['occupiedBy']['faction'] === $faction) {
                $tokens[] = [
                    'position' => $coordinate,
                    'token' => $hex['occupiedBy'],
                ];
            }
        }

        return $tokens;
    }

    /**
     * Get all tokens on the board
     *
     * @param array $board Current board
     * @return array Array of all tokens with positions
     */
    public function getAllTokens(array $board): array
    {
        $tokens = [];

        foreach ($board as $coordinate => $hex) {
            if ($hex['occupiedBy']) {
                $tokens[] = [
                    'position' => $coordinate,
                    'token' => $hex['occupiedBy'],
                ];
            }
        }

        return $tokens;
    }

    /**
     * Check if a position is occupied
     *
     * @param array $board Current board
     * @param string $coordinate Hex coordinate
     * @return bool True if occupied
     */
    public function isOccupied(array $board, string $coordinate): bool
    {
        return isset($board[$coordinate]['occupiedBy']) && $board[$coordinate]['occupiedBy'] !== null;
    }

    /**
     * Recharge a token (make it active again)
     *
     * @param array $board Current board
     * @param string $coordinate Hex coordinate
     * @return array Updated board
     */
    public function rechargeToken(array $board, string $coordinate): array
    {
        if (isset($board[$coordinate]['occupiedBy'])) {
            $board[$coordinate]['occupiedBy']['isActive'] = true;
        }
        return $board;
    }

    /**
     * Count remaining tokens for a faction
     *
     * @param array $board Current board
     * @param string $faction Faction identifier
     * @return int Number of tokens
     */
    public function countTokens(array $board, string $faction): int
    {
        return count($this->getTokensForFaction($board, $faction));
    }

    /**
     * Find token by ID on the board
     *
     * @param array $board Current board
     * @param string $tokenId Token ID to find
     * @return string|null Hex coordinate where token is located, or null
     */
    public function findTokenPosition(array $board, string $tokenId): ?string
    {
        foreach ($board as $coordinate => $hex) {
            if ($hex['occupiedBy'] && $hex['occupiedBy']['id'] === $tokenId) {
                return $coordinate;
            }
        }
        return null;
    }
}
