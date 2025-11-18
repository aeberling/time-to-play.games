<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Card Manager Component
 *
 * Manages card decks, hands, and card plays for both factions
 */
class CardManager
{
    /**
     * Initialize card decks for all factions
     *
     * @param array $factions Array of faction identifiers
     * @return array Card state for all factions
     */
    public function initializeDecks(array $factions): array
    {
        $cardStates = [];

        foreach ($factions as $faction) {
            // Load faction-specific cards from data files
            $deckCards = $this->loadFactionCards($faction);

            $cardStates[$faction] = [
                'deck' => $deckCards,
                'hand' => [],
                'discard' => [],
                'inPlay' => [],
            ];

            // Draw initial hand
            $cardStates = $this->drawCards($cardStates, $faction, 5); // Draw 5 cards
        }

        return $cardStates;
    }

    /**
     * Draw cards from deck to hand
     *
     * @param array $cardStates All faction card states
     * @param string $faction Faction identifier
     * @param int $count Number of cards to draw
     * @return array Updated card states
     */
    public function drawCards(array $cardStates, string $faction, int $count): array
    {
        for ($i = 0; $i < $count; $i++) {
            if (empty($cardStates[$faction]['deck'])) {
                // Shuffle discard pile back into deck
                $cardStates = $this->reshuffleDeck($cardStates, $faction);
            }

            if (!empty($cardStates[$faction]['deck'])) {
                $card = array_shift($cardStates[$faction]['deck']);
                $cardStates[$faction]['hand'][] = $card;
            }
        }

        return $cardStates;
    }

    /**
     * Play a card from hand
     *
     * @param array $cardStates All faction card states
     * @param string $faction Faction identifier
     * @param string $cardId Card ID to play
     * @return array Updated card states
     */
    public function playCard(array $cardStates, string $faction, string $cardId): array
    {
        $hand = &$cardStates[$faction]['hand'];

        foreach ($hand as $index => $card) {
            if ($card['id'] === $cardId) {
                $playedCard = array_splice($hand, $index, 1)[0];
                $cardStates[$faction]['inPlay'][] = $playedCard;
                break;
            }
        }

        return $cardStates;
    }

    /**
     * Discard a card
     *
     * @param array $cardStates All faction card states
     * @param string $faction Faction identifier
     * @param string $cardId Card ID to discard
     * @param string $source Source location ('hand' or 'inPlay')
     * @return array Updated card states
     */
    public function discardCard(array $cardStates, string $faction, string $cardId, string $source = 'hand'): array
    {
        $sourceArray = &$cardStates[$faction][$source];

        foreach ($sourceArray as $index => $card) {
            if ($card['id'] === $cardId) {
                $discardedCard = array_splice($sourceArray, $index, 1)[0];
                $cardStates[$faction]['discard'][] = $discardedCard;
                break;
            }
        }

        return $cardStates;
    }

    /**
     * Shuffle discard pile back into deck
     *
     * @param array $cardStates All faction card states
     * @param string $faction Faction identifier
     * @return array Updated card states
     */
    private function reshuffleDeck(array $cardStates, string $faction): array
    {
        $discard = $cardStates[$faction]['discard'];
        shuffle($discard);

        $cardStates[$faction]['deck'] = $discard;
        $cardStates[$faction]['discard'] = [];

        return $cardStates;
    }

    /**
     * Load cards for a specific faction from data files
     *
     * @param string $faction Faction identifier
     * @return array Array of card data
     */
    private function loadFactionCards(string $faction): array
    {
        // TODO: Load from actual JSON data files
        // For now, return placeholder cards

        $cards = [];
        for ($i = 1; $i <= 20; $i++) {
            $cards[] = [
                'id' => "{$faction}_card_{$i}",
                'faction' => $faction,
                'name' => "Card {$i}",
                'type' => 'ACTION',
                'attack' => rand(1, 5),
                'defense' => rand(1, 5),
                'abilities' => [],
            ];
        }

        shuffle($cards);
        return $cards;
    }

    /**
     * Get card by ID
     *
     * @param array $cardStates All faction card states
     * @param string $faction Faction identifier
     * @param string $cardId Card ID
     * @return array|null Card data or null
     */
    public function getCard(array $cardStates, string $faction, string $cardId): ?array
    {
        $allCards = array_merge(
            $cardStates[$faction]['deck'],
            $cardStates[$faction]['hand'],
            $cardStates[$faction]['discard'],
            $cardStates[$faction]['inPlay']
        );

        foreach ($allCards as $card) {
            if ($card['id'] === $cardId) {
                return $card;
            }
        }

        return null;
    }
}
