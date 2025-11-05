<?php

namespace App\Games\ValueObjects;

/**
 * Value object representing a deck of cards
 */
class Deck
{
    /**
     * @param array<Card> $cards
     */
    private function __construct(
        private array $cards
    ) {}

    /**
     * Create a standard 52-card deck
     */
    public static function standard52(): self
    {
        $cards = [];

        foreach (Card::SUITS as $suit) {
            foreach (Card::RANKS as $rank) {
                $cards[] = Card::create($suit, $rank);
            }
        }

        return new self($cards);
    }

    /**
     * Create a deck from an array of card data
     */
    public static function fromArray(array $cardsData): self
    {
        $cards = array_map(
            fn($cardData) => Card::fromArray($cardData),
            $cardsData
        );

        return new self($cards);
    }

    /**
     * Create an empty deck
     */
    public static function empty(): self
    {
        return new self([]);
    }

    /**
     * Shuffle the deck
     */
    public function shuffle(): self
    {
        $cards = $this->cards;
        shuffle($cards);
        return new self($cards);
    }

    /**
     * Deal a specified number of cards from the top
     * Returns array with ['dealt' => Deck, 'remaining' => Deck]
     */
    public function deal(int $count): array
    {
        if ($count > count($this->cards)) {
            throw new \InvalidArgumentException("Cannot deal {$count} cards from deck of " . count($this->cards));
        }

        $dealt = array_slice($this->cards, 0, $count);
        $remaining = array_slice($this->cards, $count);

        return [
            'dealt' => new self($dealt),
            'remaining' => new self($remaining),
        ];
    }

    /**
     * Deal one card from the top
     * Returns array with ['card' => Card, 'remaining' => Deck]
     */
    public function dealOne(): array
    {
        if (empty($this->cards)) {
            throw new \InvalidArgumentException("Cannot deal from empty deck");
        }

        $card = $this->cards[0];
        $remaining = array_slice($this->cards, 1);

        return [
            'card' => $card,
            'remaining' => new self($remaining),
        ];
    }

    /**
     * Add a card to the bottom of the deck
     */
    public function addToBottom(Card $card): self
    {
        $cards = $this->cards;
        $cards[] = $card;
        return new self($cards);
    }

    /**
     * Add a card to the top of the deck
     */
    public function addToTop(Card $card): self
    {
        $cards = $this->cards;
        array_unshift($cards, $card);
        return new self($cards);
    }

    /**
     * Add multiple cards to the bottom
     */
    public function addCardsToBottom(array $cards): self
    {
        $newCards = $this->cards;
        foreach ($cards as $card) {
            $newCards[] = $card;
        }
        return new self($newCards);
    }

    /**
     * Add multiple cards to the top
     */
    public function addCardsToTop(array $cards): self
    {
        $newCards = $this->cards;
        foreach (array_reverse($cards) as $card) {
            array_unshift($newCards, $card);
        }
        return new self($newCards);
    }

    /**
     * Get the top card without removing it
     */
    public function peek(): ?Card
    {
        return $this->cards[0] ?? null;
    }

    /**
     * Get the bottom card without removing it
     */
    public function peekBottom(): ?Card
    {
        return $this->cards[count($this->cards) - 1] ?? null;
    }

    /**
     * Get all cards
     */
    public function getCards(): array
    {
        return $this->cards;
    }

    /**
     * Get the number of cards in the deck
     */
    public function count(): int
    {
        return count($this->cards);
    }

    /**
     * Check if deck is empty
     */
    public function isEmpty(): bool
    {
        return empty($this->cards);
    }

    /**
     * Sort the deck by value
     */
    public function sort(): self
    {
        $cards = $this->cards;
        usort($cards, fn($a, $b) => $a->compare($b));
        return new self($cards);
    }

    /**
     * Reverse the order of cards
     */
    public function reverse(): self
    {
        return new self(array_reverse($this->cards));
    }

    /**
     * Convert to array for serialization
     */
    public function toArray(): array
    {
        return array_map(fn($card) => $card->toArray(), $this->cards);
    }

    /**
     * Merge with another deck
     */
    public function merge(Deck $other): self
    {
        return new self(array_merge($this->cards, $other->cards));
    }

    /**
     * Split deck into N equal parts (for dealing to players)
     * Returns array of Deck objects
     */
    public function split(int $parts): array
    {
        if ($parts <= 0) {
            throw new \InvalidArgumentException("Parts must be positive");
        }

        $cardsPerPart = (int) floor(count($this->cards) / $parts);
        $decks = [];

        for ($i = 0; $i < $parts; $i++) {
            $start = $i * $cardsPerPart;
            $cards = array_slice($this->cards, $start, $cardsPerPart);
            $decks[] = new self($cards);
        }

        return $decks;
    }
}
