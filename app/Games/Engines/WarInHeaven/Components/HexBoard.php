<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Hex Board Component
 *
 * Manages the hexagonal game board for War in Heaven
 * Uses string coordinates (A1, B5, etc.) matching the frontend
 */
class HexBoard
{
    /**
     * Initialize the standard War in Heaven board layout
     *
     * Board structure (top to bottom):
     * Row 1 (Angel Deploy): A1, B1
     * Row 2: A2, B2, C2
     * Row 3: A3, B3, C3, D3
     * Row 4: A4, B4, C4, D4, E4
     * Row 5 (Gates): A5, B5, C5, D5
     * Row 6: A6, B6, C6, D6, E6
     * Row 7: A7, B7, C7, D7
     * Row 8: A8, B8, C8
     * Row 9 (Demon Deploy): A9, B9
     */
    public function initializeStandardLayout(array $factions): array
    {
        // Define all hex coordinates
        $allHexes = [
            'A1', 'B1',                            // Angel deploy zone
            'A2', 'B2', 'C2',
            'A3', 'B3', 'C3', 'D3',
            'A4', 'B4', 'C4', 'D4', 'E4',
            'A5', 'B5', 'C5', 'D5',                // Gates
            'A6', 'B6', 'C6', 'D6', 'E6',
            'A7', 'B7', 'C7', 'D7',
            'A8', 'B8', 'C8',
            'A9', 'B9',                            // Demon deploy zone
        ];

        $gateHexes = ['A5', 'B5', 'C5', 'D5'];
        $angelDeployHexes = ['A1', 'B1'];
        $demonDeployHexes = ['A9', 'B9'];

        $hexes = [];

        foreach ($allHexes as $coordinate) {
            $hexData = [
                'coordinate' => $coordinate,
                'type' => 'standard',
                'occupiedBy' => null,
            ];

            if (in_array($coordinate, $gateHexes)) {
                $hexData['type'] = 'gate';
            } elseif (in_array($coordinate, $angelDeployHexes)) {
                $hexData['type'] = 'deploy';
                $hexData['owner'] = 'angels';
            } elseif (in_array($coordinate, $demonDeployHexes)) {
                $hexData['type'] = 'deploy';
                $hexData['owner'] = 'demons';
            }

            $hexes[$coordinate] = $hexData;
        }

        return $hexes;
    }

    /**
     * Get all adjacent hexes to a given coordinate
     */
    public function getAdjacentHexes(string $coordinate): array
    {
        // Parse coordinate (e.g., "B5" -> column: B, row: 5)
        preg_match('/([A-Z])(\d+)/', $coordinate, $matches);
        if (count($matches) !== 3) {
            return [];
        }

        $col = $matches[1];
        $row = (int)$matches[2];

        $neighbors = [];

        // Define adjacency based on row structure
        // Each row has a specific pattern of connections
        switch ($row) {
            case 1: // A1, B1
                if ($col === 'A') {
                    $neighbors = ['B1', 'A2', 'B2'];
                } elseif ($col === 'B') {
                    $neighbors = ['A1', 'B2', 'C2'];
                }
                break;

            case 2: // A2, B2, C2
                if ($col === 'A') {
                    $neighbors = ['A1', 'B1', 'B2', 'A3', 'B3'];
                } elseif ($col === 'B') {
                    $neighbors = ['A1', 'A2', 'C2', 'B3', 'C3'];
                } elseif ($col === 'C') {
                    $neighbors = ['B1', 'B2', 'C3', 'D3'];
                }
                break;

            case 3: // A3, B3, C3, D3
                if ($col === 'A') {
                    $neighbors = ['A2', 'B2', 'B3', 'A4', 'B4'];
                } elseif ($col === 'B') {
                    $neighbors = ['A2', 'A3', 'C3', 'B4', 'C4'];
                } elseif ($col === 'C') {
                    $neighbors = ['B2', 'B3', 'D3', 'C4', 'D4'];
                } elseif ($col === 'D') {
                    $neighbors = ['C2', 'C3', 'D4', 'E4'];
                }
                break;

            case 4: // A4, B4, C4, D4, E4
                if ($col === 'A') {
                    $neighbors = ['A3', 'B3', 'B4', 'A5', 'B5'];
                } elseif ($col === 'B') {
                    $neighbors = ['A3', 'A4', 'C4', 'B5', 'C5'];
                } elseif ($col === 'C') {
                    $neighbors = ['B3', 'B4', 'D4', 'C5', 'D5'];
                } elseif ($col === 'D') {
                    $neighbors = ['C3', 'C4', 'E4', 'D5'];
                } elseif ($col === 'E') {
                    $neighbors = ['D3', 'D4'];
                }
                break;

            case 5: // A5, B5, C5, D5 (Gates)
                if ($col === 'A') {
                    $neighbors = ['A4', 'B4', 'B5', 'A6', 'B6'];
                } elseif ($col === 'B') {
                    $neighbors = ['A4', 'A5', 'C5', 'B6', 'C6'];
                } elseif ($col === 'C') {
                    $neighbors = ['B4', 'B5', 'D5', 'C6', 'D6'];
                } elseif ($col === 'D') {
                    $neighbors = ['C4', 'C5', 'E6', 'D6'];
                }
                break;

            case 6: // A6, B6, C6, D6, E6
                if ($col === 'A') {
                    $neighbors = ['A5', 'B5', 'B6', 'A7', 'B7'];
                } elseif ($col === 'B') {
                    $neighbors = ['A5', 'A6', 'C6', 'B7', 'C7'];
                } elseif ($col === 'C') {
                    $neighbors = ['B5', 'B6', 'D6', 'C7', 'D7'];
                } elseif ($col === 'D') {
                    $neighbors = ['C5', 'C6', 'E6', 'D7'];
                } elseif ($col === 'E') {
                    $neighbors = ['D5', 'D6'];
                }
                break;

            case 7: // A7, B7, C7, D7
                if ($col === 'A') {
                    $neighbors = ['A6', 'B6', 'B7', 'A8', 'B8'];
                } elseif ($col === 'B') {
                    $neighbors = ['A6', 'A7', 'C7', 'B8', 'C8'];
                } elseif ($col === 'C') {
                    $neighbors = ['B6', 'B7', 'D7', 'C8'];
                } elseif ($col === 'D') {
                    $neighbors = ['C6', 'C7', 'E6'];
                }
                break;

            case 8: // A8, B8, C8
                if ($col === 'A') {
                    $neighbors = ['A7', 'B7', 'B8', 'A9', 'B9'];
                } elseif ($col === 'B') {
                    $neighbors = ['A7', 'A8', 'C8', 'B9'];
                } elseif ($col === 'C') {
                    $neighbors = ['B7', 'B8', 'C7', 'D7'];
                }
                break;

            case 9: // A9, B9
                if ($col === 'A') {
                    $neighbors = ['A8', 'B8'];
                } elseif ($col === 'B') {
                    $neighbors = ['A8', 'A9', 'B8'];
                }
                break;
        }

        return $neighbors;
    }

    /**
     * Calculate distance between two hexes
     */
    public function getDistance(string $from, string $to): int
    {
        // Use breadth-first search to find shortest path
        if ($from === $to) {
            return 0;
        }

        $visited = [$from => true];
        $queue = [['hex' => $from, 'distance' => 0]];
        $front = 0;

        while ($front < count($queue)) {
            $current = $queue[$front++];
            $neighbors = $this->getAdjacentHexes($current['hex']);

            foreach ($neighbors as $neighbor) {
                if ($neighbor === $to) {
                    return $current['distance'] + 1;
                }

                if (!isset($visited[$neighbor])) {
                    $visited[$neighbor] = true;
                    $queue[] = ['hex' => $neighbor, 'distance' => $current['distance'] + 1];
                }
            }
        }

        return -1; // Not connected
    }

    /**
     * Check if two hexes are adjacent
     */
    public function areAdjacent(string $hex1, string $hex2): bool
    {
        $neighbors = $this->getAdjacentHexes($hex1);
        return in_array($hex2, $neighbors);
    }

    /**
     * Get all hexes in a straight line from start to end
     * Used for Camiel/Asmodeus straight-line movement
     */
    public function getHexesInLine(string $from, string $to): array
    {
        // This is a simplified implementation
        // For a proper hex grid, you'd need to check if hexes are truly in a line
        // For now, returning empty array if not implemented
        return [];
    }

    /**
     * Get hexes within range of a position
     */
    public function getHexesInRange(string $center, int $range, array $board): array
    {
        if ($range === 0) {
            return [$center];
        }

        $hexes = [];
        $visited = [$center => true];
        $queue = [['hex' => $center, 'distance' => 0]];
        $front = 0;

        while ($front < count($queue)) {
            $current = $queue[$front++];

            if ($current['distance'] <= $range) {
                $hexes[] = $current['hex'];
            }

            if ($current['distance'] < $range) {
                $neighbors = $this->getAdjacentHexes($current['hex']);
                foreach ($neighbors as $neighbor) {
                    if (!isset($visited[$neighbor]) && isset($board[$neighbor])) {
                        $visited[$neighbor] = true;
                        $queue[] = ['hex' => $neighbor, 'distance' => $current['distance'] + 1];
                    }
                }
            }
        }

        return $hexes;
    }
}
