<?php

namespace App\Games\Engines\WarInHeaven\Components;

use App\Games\Engines\WarInHeaven\ValueObjects\HexPosition;

/**
 * Hex Board Component
 *
 * Manages the hexagonal game board, including:
 * - Board initialization
 * - Hex grid operations
 * - Piece placement/removal
 * - Terrain management
 */
class HexBoard
{
    private int $boardSize;

    public function __construct(int $boardSize = 11)
    {
        $this->boardSize = $boardSize;
    }

    /**
     * Initialize a standard board layout with starting pieces
     *
     * @param array $factions Array of faction identifiers
     * @return array Board state
     */
    public function initializeStandardLayout(array $factions): array
    {
        $hexes = $this->createEmptyGrid();

        // TODO: Place starting pieces for each faction
        // This will depend on the specific starting configuration

        return [
            'layout' => 'standard_11x11',
            'size' => $this->boardSize,
            'hexes' => $hexes,
        ];
    }

    /**
     * Create an empty hex grid
     *
     * @return array Empty hex grid with all positions
     */
    private function createEmptyGrid(): array
    {
        $hexes = [];
        $radius = floor($this->boardSize / 2);

        // Using axial coordinates (q, r)
        for ($q = -$radius; $q <= $radius; $q++) {
            $r1 = max(-$radius, -$q - $radius);
            $r2 = min($radius, -$q + $radius);

            for ($r = $r1; $r <= $r2; $r++) {
                $key = $this->getHexKey($q, $r);
                $hexes[$key] = [
                    'q' => $q,
                    'r' => $r,
                    's' => -$q - $r, // Third cube coordinate
                    'terrain' => 'normal',
                    'piece' => null,
                ];
            }
        }

        return $hexes;
    }

    /**
     * Get hex at specific position
     *
     * @param int $q Axial Q coordinate
     * @param int $r Axial R coordinate
     * @return array|null Hex data or null if not found
     */
    public function getHex(array $board, int $q, int $r): ?array
    {
        $key = $this->getHexKey($q, $r);
        return $board['hexes'][$key] ?? null;
    }

    /**
     * Get all neighbor hexes of a position
     *
     * @param int $q Axial Q coordinate
     * @param int $r Axial R coordinate
     * @return array Array of neighbor positions
     */
    public function getNeighbors(int $q, int $r): array
    {
        // Axial direction vectors
        $directions = [
            [1, 0],   // East
            [1, -1],  // Northeast
            [0, -1],  // Northwest
            [-1, 0],  // West
            [-1, 1],  // Southwest
            [0, 1],   // Southeast
        ];

        $neighbors = [];
        foreach ($directions as [$dq, $dr]) {
            $neighbors[] = ['q' => $q + $dq, 'r' => $r + $dr];
        }

        return $neighbors;
    }

    /**
     * Calculate distance between two hex positions
     *
     * @param int $q1 Start Q coordinate
     * @param int $r1 Start R coordinate
     * @param int $q2 End Q coordinate
     * @param int $r2 End R coordinate
     * @return int Distance in hex tiles
     */
    public function getDistance(int $q1, int $r1, int $q2, int $r2): int
    {
        // Convert to cube coordinates for easier distance calculation
        $s1 = -$q1 - $r1;
        $s2 = -$q2 - $r2;

        return (abs($q1 - $q2) + abs($r1 - $r2) + abs($s1 - $s2)) / 2;
    }

    /**
     * Check if a hex position is valid on the board
     *
     * @param int $q Axial Q coordinate
     * @param int $r Axial R coordinate
     * @return bool True if valid
     */
    public function isValidPosition(int $q, int $r): bool
    {
        $s = -$q - $r;
        $radius = floor($this->boardSize / 2);

        return abs($q) <= $radius && abs($r) <= $radius && abs($s) <= $radius;
    }

    /**
     * Get all hexes in range from a position
     *
     * @param int $q Center Q coordinate
     * @param int $r Center R coordinate
     * @param int $range Range in hex tiles
     * @return array Array of hex positions within range
     */
    public function getHexesInRange(int $q, int $r, int $range): array
    {
        $hexes = [];

        for ($dq = -$range; $dq <= $range; $dq++) {
            $r1 = max(-$range, -$dq - $range);
            $r2 = min($range, -$dq + $range);

            for ($dr = $r1; $dr <= $r2; $dr++) {
                $targetQ = $q + $dq;
                $targetR = $r + $dr;

                if ($this->isValidPosition($targetQ, $targetR)) {
                    $hexes[] = ['q' => $targetQ, 'r' => $targetR];
                }
            }
        }

        return $hexes;
    }

    /**
     * Generate a unique key for a hex position
     *
     * @param int $q Axial Q coordinate
     * @param int $r Axial R coordinate
     * @return string Hex key
     */
    private function getHexKey(int $q, int $r): string
    {
        return "q:{$q},r:{$r}";
    }

    /**
     * Parse a hex key into coordinates
     *
     * @param string $key Hex key
     * @return array Array with 'q' and 'r' coordinates
     */
    public static function parseHexKey(string $key): array
    {
        preg_match('/q:(-?\d+),r:(-?\d+)/', $key, $matches);
        return [
            'q' => (int)$matches[1],
            'r' => (int)$matches[2],
        ];
    }
}
