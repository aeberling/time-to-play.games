<?php

namespace App\Games\Engines\WarInHeaven\ValueObjects;

/**
 * Hex Position Value Object
 *
 * Represents a position on the hex grid using axial coordinates (q, r)
 * Immutable value object with coordinate conversion utilities
 */
class HexPosition
{
    public readonly int $q;
    public readonly int $r;
    public readonly int $s;

    public function __construct(int $q, int $r)
    {
        $this->q = $q;
        $this->r = $r;
        $this->s = -$q - $r; // Cube coordinate s
    }

    /**
     * Create from cube coordinates
     */
    public static function fromCube(int $q, int $r, int $s): self
    {
        if ($q + $r + $s !== 0) {
            throw new \InvalidArgumentException('Invalid cube coordinates: q + r + s must equal 0');
        }

        return new self($q, $r);
    }

    /**
     * Create from offset coordinates (row, col)
     */
    public static function fromOffset(int $col, int $row, bool $isEvenOffset = true): self
    {
        // Convert offset to axial
        if ($isEvenOffset) {
            $q = $col - (int)(($row + ($row & 1)) / 2);
            $r = $row;
        } else {
            $q = $col - (int)(($row - ($row & 1)) / 2);
            $r = $row;
        }

        return new self($q, $r);
    }

    /**
     * Convert to offset coordinates
     */
    public function toOffset(bool $isEvenOffset = true): array
    {
        if ($isEvenOffset) {
            $col = $this->q + (int)(($this->r + ($this->r & 1)) / 2);
            $row = $this->r;
        } else {
            $col = $this->q + (int)(($this->r - ($this->r & 1)) / 2);
            $row = $this->r;
        }

        return ['col' => $col, 'row' => $row];
    }

    /**
     * Get neighbor in a specific direction
     * Directions: 0=E, 1=NE, 2=NW, 3=W, 4=SW, 5=SE
     */
    public function neighbor(int $direction): self
    {
        $directions = [
            [1, 0],   // East
            [1, -1],  // Northeast
            [0, -1],  // Northwest
            [-1, 0],  // West
            [-1, 1],  // Southwest
            [0, 1],   // Southeast
        ];

        $dir = $directions[$direction % 6];
        return new self($this->q + $dir[0], $this->r + $dir[1]);
    }

    /**
     * Get all 6 neighbors
     */
    public function neighbors(): array
    {
        $neighbors = [];
        for ($i = 0; $i < 6; $i++) {
            $neighbors[] = $this->neighbor($i);
        }
        return $neighbors;
    }

    /**
     * Calculate distance to another position
     */
    public function distanceTo(self $other): int
    {
        return (abs($this->q - $other->q) + abs($this->r - $other->r) + abs($this->s - $other->s)) / 2;
    }

    /**
     * Get all positions within a certain range
     */
    public function getRange(int $range): array
    {
        $results = [];

        for ($dq = -$range; $dq <= $range; $dq++) {
            $r1 = max(-$range, -$dq - $range);
            $r2 = min($range, -$dq + $range);

            for ($dr = $r1; $dr <= $r2; $dr++) {
                $results[] = new self($this->q + $dq, $this->r + $dr);
            }
        }

        return $results;
    }

    /**
     * Convert to string key for array indexing
     */
    public function toKey(): string
    {
        return "q:{$this->q},r:{$this->r}";
    }

    /**
     * Parse a hex key string into a HexPosition
     */
    public static function fromKey(string $key): self
    {
        preg_match('/q:(-?\d+),r:(-?\d+)/', $key, $matches);

        if (!$matches) {
            throw new \InvalidArgumentException("Invalid hex key format: {$key}");
        }

        return new self((int)$matches[1], (int)$matches[2]);
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'q' => $this->q,
            'r' => $this->r,
            's' => $this->s,
        ];
    }

    /**
     * Check equality with another position
     */
    public function equals(self $other): bool
    {
        return $this->q === $other->q && $this->r === $other->r;
    }

    /**
     * Get line/path to another hex position
     */
    public function lineTo(self $target): array
    {
        $distance = $this->distanceTo($target);
        $results = [];

        for ($i = 0; $i <= $distance; $i++) {
            $t = $i / max($distance, 1);

            $q = round($this->q + ($target->q - $this->q) * $t);
            $r = round($this->r + ($target->r - $this->r) * $t);

            $results[] = new self((int)$q, (int)$r);
        }

        return $results;
    }
}
