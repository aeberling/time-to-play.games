<?php

namespace App\Games\Engines\WarInHeaven\ValueObjects;

/**
 * Piece Card Value Object
 *
 * Represents a card that can be played in the game
 */
class PieceCard
{
    public readonly string $id;
    public readonly string $name;
    public readonly string $type;
    public readonly string $faction;
    public readonly int $attack;
    public readonly int $defense;
    public readonly array $abilities;
    public readonly int $resourceCost;
    public readonly string $description;

    public function __construct(
        string $id,
        string $name,
        string $type,
        string $faction,
        int $attack = 0,
        int $defense = 0,
        array $abilities = [],
        int $resourceCost = 0,
        string $description = ''
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->type = $type;
        $this->faction = $faction;
        $this->attack = $attack;
        $this->defense = $defense;
        $this->abilities = $abilities;
        $this->resourceCost = $resourceCost;
        $this->description = $description;
    }

    /**
     * Create a card from array data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            name: $data['name'],
            type: $data['type'],
            faction: $data['faction'],
            attack: $data['attack'] ?? 0,
            defense: $data['defense'] ?? 0,
            abilities: $data['abilities'] ?? [],
            resourceCost: $data['resourceCost'] ?? 0,
            description: $data['description'] ?? ''
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'faction' => $this->faction,
            'attack' => $this->attack,
            'defense' => $this->defense,
            'abilities' => $this->abilities,
            'resourceCost' => $this->resourceCost,
            'description' => $this->description,
        ];
    }

    /**
     * Check if card has a specific ability
     */
    public function hasAbility(string $ability): bool
    {
        return in_array($ability, $this->abilities);
    }
}
