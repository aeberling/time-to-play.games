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
    // Normal/Traditional scoring
    private const NORMAL_CARD_POINTS = [
        'A' => 10,
        '2' => 2, '3' => 3, '4' => 4, '5' => 5, '6' => 6, '7' => 7, '8' => 8, '9' => 9,
        'J' => 10, 'Q' => 10, 'K' => 10,
        '10' => 50, // Special card
    ];

    // Beginner scoring - simplified
    private const BEGINNER_CARD_POINTS = [
        'A' => 5,
        '2' => 5, '3' => 5, '4' => 5, '5' => 5, '6' => 5, '7' => 5, '8' => 5, '9' => 5,
        'J' => 10, 'Q' => 10, 'K' => 10,
        '10' => 50, // Special card (Jokers also worth 50)
    ];

    // Legacy CARD_POINTS for backward compatibility (used for card values in gameplay, not scoring)
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

        // Get score limit from options (default 300)
        $scoreLimit = $options['scoreLimit'] ?? 300;

        // Get scoring method from options (default 'beginner')
        $scoringMethod = $options['scoringMethod'] ?? 'beginner';

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
            'scoreLimit' => $scoreLimit,
            'scoringMethod' => $scoringMethod,
            'lastAction' => null,
            'recentSwoop' => null,
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

            // All cards must be same rank (excluding wild cards: 10s and Jokers)
            $cards = array_map(fn($cardData) => Card::fromArray($cardData), $move['cards']);

            // Filter out wild cards to get the base rank
            $nonWildCards = array_filter($cards, fn($card) => !$this->isSpecialCard($card));

            if (count($nonWildCards) > 0) {
                // If there are non-wild cards, they must all have the same rank
                $firstRank = array_values($nonWildCards)[0]->getRank();
                foreach ($nonWildCards as $card) {
                    if ($card->getRank() !== $firstRank) {
                        return ValidationResult::invalid('All non-wild cards must have the same rank');
                    }
                }
            }
            // If all cards are wild, that's valid (e.g., playing multiple 10s or Jokers)

            // Check if play is valid against pile
            $isValidPlay = $this->isValidPlay($cards, $state['playPile']);
            if (!$isValidPlay['valid']) {
                // Special case: if playing from mystery cards, this is valid but triggers auto-pickup
                if ($move['fromMystery'] ?? false) {
                    return ValidationResult::valid(); // Will be handled in applyMove
                }
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

        // Build a list of all available card IDs from the specified sources
        $availableCards = [];

        // Add cards from hand if specified
        if ($move['fromHand'] ?? false) {
            $hand = array_map(fn($c) => $c['suit'] . '_' . $c['rank'], $state['playerHands'][$playerIndex]);
            $availableCards = array_merge($availableCards, $hand);
        }

        // Add cards from face-up if specified
        if ($move['fromFaceUp'] ?? false) {
            $faceUp = array_map(fn($c) => $c['suit'] . '_' . $c['rank'], $state['faceUpCards'][$playerIndex]);
            $availableCards = array_merge($availableCards, $faceUp);
        }

        // Add cards from mystery if specified
        if ($move['fromMystery'] ?? false) {
            $mystery = array_map(fn($c) => $c['suit'] . '_' . $c['rank'], $state['mysteryCards'][$playerIndex]);
            $availableCards = array_merge($availableCards, $mystery);
        }

        // Check that all cards being played are available from the specified sources
        foreach ($cardIds as $id) {
            $key = array_search($id, $availableCards);
            if ($key === false) {
                return false;
            }
            // Remove the card from available cards (to handle duplicate ranks)
            unset($availableCards[$key]);
            $availableCards = array_values($availableCards);
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
        // Use Swoop-specific card values (A=1, not 14)
        $playedValue = $this->getSwoopValue($cards[0]);
        $topValue = $this->getSwoopValue($topCard);

        if ($playedValue > $topValue) {
            return ['valid' => false, 'error' => 'Card is higher than pile top - you must pick up the pile'];
        }

        // Equal or lower is valid
        return ['valid' => true];
    }

    /**
     * Get the Swoop-specific value for a card (A=1, not 14)
     */
    private function getSwoopValue(Card $card): int
    {
        return self::CARD_POINTS[$card->getRank()] ?? $card->getValue();
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
            $cards = array_map(fn($cardData) => Card::fromArray($cardData), $move['cards']);

            // Check if this is a mystery card that can't be played (auto-pickup case)
            $isValidPlay = $this->isValidPlay($cards, $state['playPile']);
            $isFromMystery = $move['fromMystery'] ?? false;

            if (!$isValidPlay['valid'] && $isFromMystery) {
                // Mystery card can't be played - pick up pile + mystery card
                $state = $this->removeCardsFromPlayer($state, $playerIndex, $move);

                // Add pile AND the mystery card to player's hand
                $state['playerHands'][$playerIndex] = array_merge(
                    $state['playerHands'][$playerIndex],
                    $state['playPile'],
                    $move['cards'] // Add the revealed mystery card
                );

                $state['playPile'] = [];

                $state['lastAction'] = [
                    'type' => 'PICKUP',
                    'playerIndex' => $playerIndex,
                    'cardsPlayed' => 0,
                    'timestamp' => now()->toISOString(),
                ];

                $state['currentPlayerIndex'] = ($playerIndex + 1) % $state['playerCount'];
                return $state;
            }

            // Normal play - Remove cards from player's areas
            $state = $this->removeCardsFromPlayer($state, $playerIndex, $move);

            // Add cards to pile
            $state['playPile'] = array_merge($state['playPile'], $move['cards']);

            $isSwoopCard = $this->isSpecialCard($cards[0]);

            // Check for swoop
            $swoopTriggered = $isSwoopCard || $this->checkSwoop($state['playPile']);

            $state['lastAction'] = [
                'type' => $swoopTriggered ? 'SWOOP' : 'PLAY',
                'playerIndex' => $playerIndex,
                'swoopTriggered' => $swoopTriggered,
                'cardsPlayed' => count($move['cards']),
                'timestamp' => now()->toISOString(),
            ];

            if ($swoopTriggered) {
                // Remove pile from game
                $state['removedCards'] = array_merge($state['removedCards'], $state['playPile']);
                $state['playPile'] = [];
                $state['recentSwoop'] = now()->toISOString();
                // Same player goes again - don't increment turn
            } else {
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
            $remainingCards = [];
            $cardsToRemove = $cardIds; // Make a copy to track what still needs removing

            foreach ($state['playerHands'][$playerIndex] as $card) {
                $cardId = $card['suit'] . '_' . $card['rank'];
                $key = array_search($cardId, $cardsToRemove);
                if ($key !== false) {
                    // This card should be removed
                    unset($cardsToRemove[$key]);
                    $cardsToRemove = array_values($cardsToRemove);
                } else {
                    // Keep this card
                    $remainingCards[] = $card;
                }
            }
            $state['playerHands'][$playerIndex] = $remainingCards;
        }

        // Remove from face-up
        if ($move['fromFaceUp'] ?? false) {
            $remainingCards = [];
            $cardsToRemove = $cardIds; // Make a copy to track what still needs removing

            foreach ($state['faceUpCards'][$playerIndex] as $card) {
                $cardId = $card['suit'] . '_' . $card['rank'];
                $key = array_search($cardId, $cardsToRemove);
                if ($key !== false) {
                    // This card should be removed
                    unset($cardsToRemove[$key]);
                    $cardsToRemove = array_values($cardsToRemove);
                } else {
                    // Keep this card
                    $remainingCards[] = $card;
                }
            }
            $state['faceUpCards'][$playerIndex] = $remainingCards;
        }

        // Remove from mystery
        if ($move['fromMystery'] ?? false) {
            $remainingCards = [];
            $cardsToRemove = $cardIds; // Make a copy to track what still needs removing

            foreach ($state['mysteryCards'][$playerIndex] as $card) {
                $cardId = $card['suit'] . '_' . $card['rank'];
                $key = array_search($cardId, $cardsToRemove);
                if ($key !== false) {
                    // This card should be removed
                    unset($cardsToRemove[$key]);
                    $cardsToRemove = array_values($cardsToRemove);
                } else {
                    // Keep this card
                    $remainingCards[] = $card;
                }
            }
            $state['mysteryCards'][$playerIndex] = $remainingCards;
        }

        return $state;
    }

    private function checkSwoop(array $pile): bool
    {
        if (count($pile) < 4) return false;

        // Check if top 4 cards are equal (treating wild cards as matching)
        $top4 = array_slice($pile, -4);
        $cards = array_map(fn($cardData) => Card::fromArray($cardData), $top4);

        // Find the base rank (first non-wild card, or null if all wild)
        $baseRank = null;
        foreach ($cards as $card) {
            if (!$this->isSpecialCard($card)) {
                $baseRank = $card->getRank();
                break;
            }
        }

        // If all cards are wild (all 10s/Jokers), that counts as a swoop
        if ($baseRank === null) {
            return true;
        }

        // Check if all non-wild cards match the base rank
        foreach ($cards as $card) {
            if (!$this->isSpecialCard($card) && $card->getRank() !== $baseRank) {
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
        // Calculate scores for all players and track their remaining cards
        $roundResults = [];
        $scoringMethod = $state['scoringMethod'] ?? 'beginner';

        for ($i = 0; $i < $state['playerCount']; $i++) {
            $allCards = array_merge(
                $state['playerHands'][$i],
                $state['faceUpCards'][$i],
                $state['mysteryCards'][$i]
            );

            $points = $i === $winnerIndex ? 0 : $this->calculatePoints($allCards, $scoringMethod);
            $state['scores'][$i] += $points;

            $roundResults[] = [
                'playerIndex' => $i,
                'remainingCards' => $allCards,
                'pointsThisRound' => $points,
                'totalScore' => $state['scores'][$i],
            ];
        }

        // Check if game is over (someone reached the score limit)
        $scoreLimit = $state['scoreLimit'] ?? 300;
        $maxScore = max($state['scores']);
        if ($maxScore >= $scoreLimit) {
            $state['phase'] = 'GAME_OVER';
        } else {
            $state['phase'] = 'ROUND_OVER';
        }

        $state['roundResults'] = $roundResults;
        $state['lastAction'] = [
            'type' => 'ROUND_END',
            'playerIndex' => $winnerIndex,
            'timestamp' => now()->toISOString(),
        ];

        return $state;
    }

    /**
     * Start the next round after round ends
     */
    public function startNextRound(array $state): array
    {
        if ($state['phase'] !== 'ROUND_OVER') {
            throw new \RuntimeException('Can only start next round when phase is ROUND_OVER');
        }

        // Increment round number
        $state['round']++;

        // Determine number of decks based on player count
        $deckCount = $this->getDeckCount($state['playerCount']);

        // Create and shuffle new decks
        $deck = $this->createDecks($deckCount)->shuffle();

        // Deal 19 cards to each player
        $playerHands = [];
        $faceUpCards = [];
        $mysteryCards = [];

        for ($i = 0; $i < $state['playerCount']; $i++) {
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

        // Reset game state for new round
        $state['playerHands'] = $playerHands;
        $state['faceUpCards'] = $faceUpCards;
        $state['mysteryCards'] = $mysteryCards;
        $state['playPile'] = [];
        $state['removedCards'] = [];
        $state['currentPlayerIndex'] = 0;
        $state['phase'] = 'PLAYING';
        $state['lastAction'] = [
            'type' => 'ROUND_START',
            'playerIndex' => null,
            'timestamp' => now()->toISOString(),
        ];
        $state['recentSwoop'] = null;
        $state['roundResults'] = null; // Clear previous round results

        return $state;
    }

    private function calculatePoints(array $cardDataArray, string $scoringMethod = 'beginner'): int
    {
        $pointsTable = $scoringMethod === 'normal'
            ? self::NORMAL_CARD_POINTS
            : self::BEGINNER_CARD_POINTS;

        $total = 0;
        foreach ($cardDataArray as $cardData) {
            $card = Card::fromArray($cardData);
            $rank = $card->getRank();
            // Handle Jokers (value 0)
            if ($card->getValue() === 0) {
                $total += 50; // Jokers always worth 50
            } else {
                $total += $pointsTable[$rank] ?? 0;
            }
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
