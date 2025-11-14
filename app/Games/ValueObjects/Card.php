<?php

namespace App\Games\ValueObjects;

/**
 * Value object representing a playing card
 */
class Card
{
    public const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
    public const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    private function __construct(
        private string $suit,
        private string $rank,
        private int $value,
        private string $imageUrl
    ) {}

    /**
     * Create a card from suit and rank
     */
    public static function create(string $suit, string $rank): self
    {
        if (!in_array($suit, self::SUITS)) {
            throw new \InvalidArgumentException("Invalid suit: {$suit}");
        }

        if (!in_array($rank, self::RANKS)) {
            throw new \InvalidArgumentException("Invalid rank: {$rank}");
        }

        $value = self::calculateValue($rank);
        $imageUrl = "/images/cards/{$rank}_of_{$suit}.svg";

        return new self($suit, $rank, $value, $imageUrl);
    }

    /**
     * Create a card from array (for deserialization)
     */
    public static function fromArray(array $data): self
    {
        return new self(
            $data['suit'],
            $data['rank'],
            $data['value'],
            $data['imageUrl']
        );
    }

    /**
     * Calculate numeric value for a rank (used in War game)
     */
    private static function calculateValue(string $rank): int
    {
        return match ($rank) {
            '2' => 2,
            '3' => 3,
            '4' => 4,
            '5' => 5,
            '6' => 6,
            '7' => 7,
            '8' => 8,
            '9' => 9,
            '10' => 10,
            'J' => 11,
            'Q' => 12,
            'K' => 13,
            'A' => 14,
        };
    }

    /**
     * Get the suit
     */
    public function getSuit(): string
    {
        return $this->suit;
    }

    /**
     * Get the rank
     */
    public function getRank(): string
    {
        return $this->rank;
    }

    /**
     * Get the numeric value
     */
    public function getValue(): int
    {
        return $this->value;
    }

    /**
     * Get the image URL
     */
    public function getImageUrl(): string
    {
        return $this->imageUrl;
    }

    /**
     * Check if this card is red
     */
    public function isRed(): bool
    {
        return in_array($this->suit, ['hearts', 'diamonds']);
    }

    /**
     * Check if this card is black
     */
    public function isBlack(): bool
    {
        return in_array($this->suit, ['clubs', 'spades']);
    }

    /**
     * Convert to array for serialization
     */
    public function toArray(): array
    {
        return [
            'suit' => $this->suit,
            'rank' => $this->rank,
            'value' => $this->value,
            'imageUrl' => $this->imageUrl,
        ];
    }

    /**
     * Get a unique identifier for this card
     */
    public function getId(): string
    {
        return "{$this->rank}_of_{$this->suit}";
    }

    /**
     * Compare this card to another (for sorting)
     */
    public function compare(Card $other): int
    {
        if ($this->value !== $other->value) {
            return $this->value <=> $other->value;
        }

        // If values are equal, sort by suit
        $suitOrder = array_flip(self::SUITS);
        return $suitOrder[$this->suit] <=> $suitOrder[$other->suit];
    }

    /**
     * Check if two cards are equal
     */
    public function equals(Card $other): bool
    {
        return $this->suit === $other->suit && $this->rank === $other->rank;
    }

    /**
     * String representation
     */
    public function __toString(): string
    {
        return "{$this->rank} of {$this->suit}";
    }
}
