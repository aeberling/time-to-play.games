<?php

namespace App\Games\Engines;

use App\Games\Contracts\GameEngineInterface;
use App\Games\ValueObjects\Card;
use App\Games\ValueObjects\Deck;
use App\Games\ValueObjects\ValidationResult;

/**
 * Swoop Card Game Engine
 *
 * Fast-paced shedding game for 3-8 players.
 * Players race to get rid of all cards: hand, face-up table cards, and mystery face-down cards.
 * Features the exciting "swoop" mechanic where 4 equal cards clear the pile.
 */
class SwoopEngine implements GameEngineInterface
{
    private const CARD_POINTS = [
        'A' => 1,
        '2' => 2, '3' => 3, '4' => 4, '5' => 5, '6' => 6, '7' => 7, '8' => 8, '9' => 9,
        'J' => 10, 'Q' => 12, 'K' => 13,
        '10' => 50, // Special card
    ];

    public function getGameType(): string
    {
        return 'SWOOP';
    }

    public function getName(): string
    {
        return 'Swoop';
    }

    public function getConfig(): array
    {
        return [
            'minPlayers' => 3,
            'maxPlayers' => 8,
            'description' => 'Race to get rid of all your cards with strategic swoops',
            'difficulty' => 'Medium',
            'estimatedDuration' => '15-30 minutes per round',
            'requiresStrategy' => true,
        ];
    }

    public function initializeGame(array $players, array $options = []): array
    {
        $playerCount = count($players);

        if ($playerCount < 3 || $playerCount > 8) {
            throw new \InvalidArgumentException('Swoop requires 3-8 players');
        }

        // Determine number of decks based on player count
        $deckCount = $this->getDeckCount($playerCount);

        // Create and shuffle multiple decks with jokers
        $deck = $this->createDecks($deckCount)->shuffle();

        // Deal 19 cards to each player
        $playerHands = [];
        $faceUpCards = [];
        $mysteryCards = [];
        $scores = array_fill(0, $playerCount, 0);

        for ($i = 0; $i < $playerCount; $i++) {
            $playerCards = $deck->deal(19);
            $deck = $playerCards['remaining'];

            $cards = Deck::fromArray($playerCards['dealt']->toArray());

            // 4 mystery cards (face down)
            $mystery = $cards->deal(4);
            $mysteryCards[] = $mystery['dealt']->toArray();

            // 4 face-up cards
            $remaining = $mystery['remaining'];
            $faceUp = $remaining->deal(4);
            $faceUpCards[] = $faceUp['dealt']->toArray();

            // 11 hand cards
            $playerHands[] = $faceUp['remaining']->toArray();
        }

        return [
            'players' => $players,
            'playerCount' => $playerCount,
            'playerHands' => $playerHands,
            'faceUpCards' => $faceUpCards,
            'mysteryCards' => $mysteryCards,
            'playPile' => [],
            'removedCards' => [],
            'currentPlayerIndex' => 0,
            'phase' => 'PLAYING',
            'round' => 1,
            'scores' => $scores,
            'lastAction' => null,
            'recentSwoop' => false,
        ];
    }

    private function getDeckCount(int $playerCount): int
    {
        if ($playerCount <= 4) return 2;
        if ($playerCount <= 6) return 3;
        return 4;
    }

    private function createDecks(int $deckCount): Deck
    {
        $allCards = [];

        for ($deckNum = 1; $deckNum <= $deckCount; $deckNum++) {
            // Add standard 52 cards
            $standardDeck = Deck::standard52();
            $allCards = array_merge($allCards, $standardDeck->getCards());

            // Add 2 jokers per deck (represented as special cards)
            for ($j = 1; $j <= 2; $j++) {
                // Jokers are created manually as they're not in standard deck
                $allCards[] = $this->createJoker($deckNum, $j);
            }
        }

        return Deck::fromArray(array_map(fn($card) => $card->toArray(), $allCards));
    }

    private function createJoker(int $deckNum, int $jokerNum): Card
    {
        return Card::fromArray([
            'suit' => 'hearts', // Jokers use hearts suit but are special
            'rank' => 'J', // Use Jack rank but mark as special
            'value' => 0, // Special value
            'imageUrl' => "/images/cards/joker.svg",
        ]);
    }

    public function validateMove(array $state, array $move, int $playerIndex): ValidationResult
    {
        // Check if it's player's turn
        if ($playerIndex !== $state['currentPlayerIndex']) {
            return ValidationResult::invalid('Not your turn');
        }

        // Check if game is over
        if ($state['phase'] === 'ROUND_OVER' || $state['phase'] === 'GAME_OVER') {
            return ValidationResult::invalid('Round/Game is over');
        }

        $action = $move['action'] ?? null;

        if ($action === 'SKIP') {
            return ValidationResult::valid(); // Skipping is always valid
        }

        if ($action === 'PICKUP') {
            if (empty($state['playPile'])) {
                return ValidationResult::invalid('No pile to pick up');
            }
            return ValidationResult::valid();
        }

        if ($action === 'PLAY') {
            if (empty($move['cards'])) {
                return ValidationResult::invalid('No cards specified');
            }

            // Verify player owns these cards
            if (!$this->playerHasCards($state, $playerIndex, $move)) {
                return ValidationResult::invalid('You do not have these cards');
            }

            // All cards must be same rank
            $cards = array_map(fn($cardData) => Card::fromArray($cardData), $move['cards']);
            $firstRank = $cards[0]->getRank();
            foreach ($cards as $card) {
                if ($card->getRank() !== $firstRank) {
                    return ValidationResult::invalid('All cards must have the same rank');
                }
            }

            // Check if play is valid against pile
            $isValidPlay = $this->isValidPlay($cards, $state['playPile']);
            if (!$isValidPlay['valid']) {
                return ValidationResult::invalid($isValidPlay['error']);
            }

            // Check swoop constraint: cannot create more than 4 equal cards
            if (!$this->isSpecialCard($cards[0])) {
                $topCard = $this->getTopPileCard($state['playPile']);
                if ($topCard && $topCard->getRank() === $firstRank) {
                    $equalCount = $this->countEqualCardsOnTop($state['playPile']);
                    if ($equalCount + count($cards) > 4) {
                        return ValidationResult::invalid('Cannot create more than 4 equal cards on pile');
                    }
                }
            }

            return ValidationResult::valid();
        }

        return ValidationResult::invalid('Invalid action');
    }

    private function playerHasCards(array $state, int $playerIndex, array $move): bool
    {
        $cardIds = array_map(fn($c) => $c['suit'] . '_' . $c['rank'], $move['cards']);

        // Check hand
        if ($move['fromHand'] ?? false) {
            $hand = array_map(fn($c) => $c['suit'] . '_' . $c['rank'], $state['playerHands'][$playerIndex]);
            foreach ($cardIds as $id) {
                if (!in_array($id, $hand)) return false;
            }
        }

        // Check face-up
        if (!empty($move['fromFaceUp'])) {
            $faceUp = $state['faceUpCards'][$playerIndex];
            foreach ($move['fromFaceUp'] as $idx) {
                if ($idx < 0 || $idx >= count($faceUp)) return false;
            }
        }

        // Check mystery
        if (isset($move['fromMystery'])) {
            $mystery = $state['mysteryCards'][$playerIndex];
            if ($move['fromMystery'] < 0 || $move['fromMystery'] >= count($mystery)) {
                return false;
            }
        }

        return true;
    }

    private function isValidPlay(array $cards, array $pile): array
    {
        // Special cards (10s) can always be played
        if ($this->isSpecialCard($cards[0])) {
            return ['valid' => true];
        }

        // Empty pile - any card valid
        if (empty($pile)) {
            return ['valid' => true];
        }

        // Get top card of pile
        $topCard = Card::fromArray($pile[count($pile) - 1]);

        // Cannot play higher rank (unless it's a special card)
        if ($cards[0]->getValue() > $topCard->getValue()) {
            return ['valid' => false, 'error' => 'Card is higher than pile top - you must pick up the pile'];
        }

        // Equal or lower is valid
        return ['valid' => true];
    }

    private function isSpecialCard(Card $card): bool
    {
        return $card->getRank() === '10' || $card->getValue() === 0; // 10s and Jokers
    }

    private function countEqualCardsOnTop(array $pile): int
    {
        if (empty($pile)) return 0;

        $topCard = Card::fromArray($pile[count($pile) - 1]);
        $count = 0;

        for ($i = count($pile) - 1; $i >= 0; $i--) {
            $card = Card::fromArray($pile[$i]);
            if ($card->getRank() === $topCard->getRank()) {
                $count++;
            } else {
                break;
            }
        }

        return $count;
    }

    private function getTopPileCard(array $pile): ?Card
    {
        if (empty($pile)) return null;
        return Card::fromArray($pile[count($pile) - 1]);
    }

    public function applyMove(array $state, array $move, int $playerIndex): array
    {
        $action = $move['action'];

        if ($action === 'SKIP') {
            $state['lastAction'] = [
                'type' => 'SKIP',
                'playerIndex' => $playerIndex,
                'timestamp' => now()->toISOString(),
            ];

            $state['currentPlayerIndex'] = ($playerIndex + 1) % $state['playerCount'];
            return $state;
        }

        if ($action === 'PICKUP') {
            // Add pile to player's hand
            $state['playerHands'][$playerIndex] = array_merge(
                $state['playerHands'][$playerIndex],
                $state['playPile']
            );

            $state['playPile'] = [];

            $state['lastAction'] = [
                'type' => 'PICKUP',
                'playerIndex' => $playerIndex,
                'timestamp' => now()->toISOString(),
            ];

            $state['currentPlayerIndex'] = ($playerIndex + 1) % $state['playerCount'];
            return $state;
        }

        if ($action === 'PLAY') {
            // Remove cards from player's areas
            $state = $this->removeCardsFromPlayer($state, $playerIndex, $move);

            // Add cards to pile
            $state['playPile'] = array_merge($state['playPile'], $move['cards']);

            $cards = array_map(fn($cardData) => Card::fromArray($cardData), $move['cards']);
            $isSwoopCard = $this->isSpecialCard($cards[0]);

            // Check for swoop
            $swoopTriggered = $isSwoopCard || $this->checkSwoop($state['playPile']);

            $state['lastAction'] = [
                'type' => $swoopTriggered ? 'SWOOP' : 'PLAY',
                'playerIndex' => $playerIndex,
                'swoopTriggered' => $swoopTriggered,
                'timestamp' => now()->toISOString(),
            ];

            if ($swoopTriggered) {
                // Remove pile from game
                $state['removedCards'] = array_merge($state['removedCards'], $state['playPile']);
                $state['playPile'] = [];
                $state['recentSwoop'] = true;
                // Same player goes again - don't increment turn
            } else {
                $state['recentSwoop'] = false;
                // Next player's turn
                $state['currentPlayerIndex'] = ($playerIndex + 1) % $state['playerCount'];
            }

            // Check if player won the round
            if ($this->hasPlayerWonRound($state, $playerIndex)) {
                return $this->endRound($state, $playerIndex);
            }

            return $state;
        }

        return $state;
    }

    private function removeCardsFromPlayer(array $state, int $playerIndex, array $move): array
    {
        $cardIds = array_map(fn($c) => $c['suit'] . '_' . $c['rank'], $move['cards']);

        // Remove from hand
        if ($move['fromHand'] ?? false) {
            $state['playerHands'][$playerIndex] = array_filter(
                $state['playerHands'][$playerIndex],
                fn($c) => !in_array($c['suit'] . '_' . $c['rank'], $cardIds)
            );
            $state['playerHands'][$playerIndex] = array_values($state['playerHands'][$playerIndex]);
        }

        // Remove from face-up
        if (!empty($move['fromFaceUp'])) {
            $indices = $move['fromFaceUp'];
            rsort($indices); // Remove from end first
            foreach ($indices as $idx) {
                array_splice($state['faceUpCards'][$playerIndex], $idx, 1);
            }
        }

        // Remove from mystery
        if (isset($move['fromMystery'])) {
            array_splice($state['mysteryCards'][$playerIndex], $move['fromMystery'], 1);
        }

        return $state;
    }

    private function checkSwoop(array $pile): bool
    {
        if (count($pile) < 4) return false;

        // Check if top 4 cards are equal
        $top4 = array_slice($pile, -4);
        $cards = array_map(fn($cardData) => Card::fromArray($cardData), $top4);

        $firstRank = $cards[0]->getRank();
        foreach ($cards as $card) {
            if ($card->getRank() !== $firstRank) {
                return false;
            }
        }

        return true;
    }

    private function hasPlayerWonRound(array $state, int $playerIndex): bool
    {
        return empty($state['playerHands'][$playerIndex]) &&
               empty($state['faceUpCards'][$playerIndex]) &&
               empty($state['mysteryCards'][$playerIndex]);
    }

    private function endRound(array $state, int $winnerIndex): array
    {
        // Calculate scores for all other players
        for ($i = 0; $i < $state['playerCount']; $i++) {
            if ($i === $winnerIndex) continue;

            $allCards = array_merge(
                $state['playerHands'][$i],
                $state['faceUpCards'][$i],
                $state['mysteryCards'][$i]
            );

            $points = $this->calculatePoints($allCards);
            $state['scores'][$i] += $points;
        }

        // Check if game is over (someone reached 500+)
        $maxScore = max($state['scores']);
        if ($maxScore >= 500) {
            $state['phase'] = 'GAME_OVER';
        } else {
            $state['phase'] = 'ROUND_OVER';
        }

        $state['lastAction'] = [
            'type' => 'ROUND_END',
            'playerIndex' => $winnerIndex,
            'timestamp' => now()->toISOString(),
        ];

        return $state;
    }

    private function calculatePoints(array $cardDataArray): int
    {
        $total = 0;
        foreach ($cardDataArray as $cardData) {
            $card = Card::fromArray($cardData);
            $rank = $card->getRank();
            $total += self::CARD_POINTS[$rank] ?? 0;
        }
        return $total;
    }

    public function checkGameOver(array $state): array
    {
        if ($state['phase'] === 'GAME_OVER') {
            // Find player with lowest score
            $lowestScore = PHP_INT_MAX;
            $winnerId = 0;

            for ($i = 0; $i < $state['playerCount']; $i++) {
                if ($state['scores'][$i] < $lowestScore) {
                    $lowestScore = $state['scores'][$i];
                    $winnerId = $i;
                }
            }

            // Create placements array sorted by score (lowest score = best placement)
            $placements = [];
            $scoresCopy = $state['scores'];
            asort($scoresCopy);
            foreach (array_keys($scoresCopy) as $playerIndex) {
                $placements[] = $playerIndex;
            }

            return [
                'isOver' => true,
                'winner' => $winnerId,
                'placements' => $placements,
            ];
        }

        return [
            'isOver' => false,
            'winner' => null,
            'placements' => null,
        ];
    }

    public function getPlayerView(array $state, int $playerIndex): array
    {
        // Hide other players' hands and mystery cards
        $viewState = $state;

        for ($i = 0; $i < $state['playerCount']; $i++) {
            if ($i !== $playerIndex) {
                // Replace with count only
                $handCount = count($state['playerHands'][$i]);
                $mysteryCount = count($state['mysteryCards'][$i]);

                $viewState['playerHands'][$i] = array_fill(0, $handCount, ['hidden' => true]);
                $viewState['mysteryCards'][$i] = array_fill(0, $mysteryCount, ['hidden' => true]);
            }
        }

        return $viewState;
    }

    public function serializeState(array $state): string
    {
        return json_encode($state);
    }

    public function deserializeState(string $state): array
    {
        return json_decode($state, true);
    }
}
