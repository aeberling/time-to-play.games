<?php

namespace App\Games\Engines\WarInHeaven\ValueObjects;

/**
 * Game Piece Value Object
 *
 * Represents a game piece with its attributes
 */
class GamePiece
{
    public readonly string $id;
    public readonly string $type;
    public readonly string $faction;
    public readonly int $health;
    public readonly int $maxHealth;
    public readonly int $attack;
    public readonly int $defense;
    public readonly int $movementRange;
    public readonly int $attackRange;
    public readonly array $abilities;
    public readonly bool $hasMoved;

    public function __construct(
        string $id,
        string $type,
        string $faction,
        int $health,
        int $maxHealth,
        int $attack,
        int $defense,
        int $movementRange = 1,
        int $attackRange = 1,
        array $abilities = [],
        bool $hasMoved = false
    ) {
        $this->id = $id;
        $this->type = $type;
        $this->faction = $faction;
        $this->health = $health;
        $this->maxHealth = $maxHealth;
        $this->attack = $attack;
        $this->defense = $defense;
        $this->movementRange = $movementRange;
        $this->attackRange = $attackRange;
        $this->abilities = $abilities;
        $this->hasMoved = $hasMoved;
    }

    /**
     * Create a piece from array data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            type: $data['type'],
            faction: $data['faction'],
            health: $data['health'],
            maxHealth: $data['maxHealth'] ?? $data['health'],
            attack: $data['attack'] ?? 1,
            defense: $data['defense'] ?? 1,
            movementRange: $data['movementRange'] ?? 1,
            attackRange: $data['attackRange'] ?? 1,
            abilities: $data['abilities'] ?? [],
            hasMoved: $data['hasMoved'] ?? false
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'faction' => $this->faction,
            'health' => $this->health,
            'maxHealth' => $this->maxHealth,
            'attack' => $this->attack,
            'defense' => $this->defense,
            'movementRange' => $this->movementRange,
            'attackRange' => $this->attackRange,
            'abilities' => $this->abilities,
            'hasMoved' => $this->hasMoved,
        ];
    }

    /**
     * Check if piece is alive
     */
    public function isAlive(): bool
    {
        return $this->health > 0;
    }

    /**
     * Apply damage to piece
     */
    public function takeDamage(int $damage): self
    {
        $newHealth = max(0, $this->health - $damage);

        return new self(
            $this->id,
            $this->type,
            $this->faction,
            $newHealth,
            $this->maxHealth,
            $this->attack,
            $this->defense,
            $this->movementRange,
            $this->attackRange,
            $this->abilities,
            $this->hasMoved
        );
    }

    /**
     * Mark piece as having moved
     */
    public function markAsMoved(): self
    {
        return new self(
            $this->id,
            $this->type,
            $this->faction,
            $this->health,
            $this->maxHealth,
            $this->attack,
            $this->defense,
            $this->movementRange,
            $this->attackRange,
            $this->abilities,
            true
        );
    }

    /**
     * Reset movement flag
     */
    public function resetMovement(): self
    {
        return new self(
            $this->id,
            $this->type,
            $this->faction,
            $this->health,
            $this->maxHealth,
            $this->attack,
            $this->defense,
            $this->movementRange,
            $this->attackRange,
            $this->abilities,
            false
        );
    }

    /**
     * Check if piece has a specific ability
     */
    public function hasAbility(string $ability): bool
    {
        return in_array($ability, $this->abilities);
    }
}
