<?php

namespace App\Games\Engines;

use App\Games\Contracts\GameEngineInterface;
use App\Games\ValueObjects\Card;
use App\Games\ValueObjects\Deck;
use App\Games\ValueObjects\ValidationResult;

/**
 * Oh Hell! (Bugger Your Neighbor) Card Game Engine
 *
 * Strategic trick-taking game for 3-5 players where players must bid exactly how many tricks they'll win.
 * Features dealer bidding restriction ensuring at least one player must fail each round.
 * Game progresses through 19 rounds (10 cards down to 1, then back up to 10).
 */
class OhHellEngine implements GameEngineInterface
{
    public function getGameType(): string
    {
        return 'OH_HELL';
    }

    public function getName(): string
    {
        return 'Oh Hell!';
    }

    public function getConfig(): array
    {
        return [
            'minPlayers' => 3,
            'maxPlayers' => 5,
            'description' => 'Strategic trick-taking game with exact bidding',
            'difficulty' => 'Hard',
            'estimatedDuration' => '45-60 minutes',
            'requiresStrategy' => true,
        ];
    }

    public function initializeGame(array $players, array $options = []): array
    {
        $playerCount = count($players);

        if ($playerCount < 3 || $playerCount > 5) {
            throw new \InvalidArgumentException('Oh Hell requires 3-5 players');
        }

        // Get configurable options with defaults
        $startingHandSize = $options['startingHandSize'] ?? 10;
        $endingHandSize = $options['endingHandSize'] ?? 1;
        $scoringVariant = $options['scoringVariant'] ?? 'standard';

        // Validate hand sizes
        if ($startingHandSize < 1 || $startingHandSize > 13) {
            throw new \InvalidArgumentException('Starting hand size must be between 1 and 13');
        }
        if ($endingHandSize < 1 || $endingHandSize > 13) {
            throw new \InvalidArgumentException('Ending hand size must be between 1 and 13');
        }

        // Validate max cards based on player count (52 cards in deck)
        $maxCardsPerRound = max($startingHandSize, $endingHandSize);
        $maxPossibleCards = floor(52 / $playerCount);
        if ($maxCardsPerRound > $maxPossibleCards) {
            throw new \InvalidArgumentException(
                "With {$playerCount} players, maximum hand size is {$maxPossibleCards} (using a 52-card deck)"
            );
        }

        // Determine round progression
        $isAscending = $startingHandSize < $endingHandSize;
        $totalRounds = abs($endingHandSize - $startingHandSize) + 1;

        $state = [
            'players' => $players,
            'playerCount' => $playerCount,
            'startingHandSize' => $startingHandSize,
            'endingHandSize' => $endingHandSize,
            'scoringVariant' => $scoringVariant,
            'currentRound' => 1,
            'totalRounds' => $totalRounds,
            'cardsThisRound' => $startingHandSize,
            'isAscending' => $isAscending,
            'trumpSuit' => null,
            'trumpCard' => null,
            'trumpBroken' => false,
            'dealerIndex' => 0,
            'playerHands' => [],
            'phase' => 'BIDDING',
            'bids' => array_fill(0, $playerCount, null),
            'currentBidder' => 1, // Player to left of dealer bids first
            'currentTrick' => [
                'cards' => [],
                'leadSuit' => null,
                'currentPlayer' => 1,
            ],
            'tricksWon' => array_fill(0, $playerCount, 0),
            'completedTricks' => [],
            'scores' => array_fill(0, $playerCount, 0),
            'roundScores' => array_fill(0, $playerCount, 0),
            'playersReadyToContinue' => array_fill(0, $playerCount, false),
            'lastAction' => null,
        ];

        // Deal first round
        return $this->startRound($state);
    }

    private function startRound(array $state): array
    {
        // Deal cards
        $dealResult = $this->dealRound($state['cardsThisRound'], $state['playerCount']);

        $state['playerHands'] = $dealResult['hands'];
        $state['trumpCard'] = $dealResult['trumpCard'];
        $state['trumpSuit'] = $dealResult['trumpSuit'];

        // Reset round state
        $state['phase'] = 'BIDDING';
        $state['bids'] = array_fill(0, $state['playerCount'], null);
        $state['currentBidder'] = ($state['dealerIndex'] + 1) % $state['playerCount'];
        $state['tricksWon'] = array_fill(0, $state['playerCount'], 0);
        $state['completedTricks'] = [];
        $state['roundScores'] = array_fill(0, $state['playerCount'], 0);
        $state['trumpBroken'] = false;
        $state['playersReadyToContinue'] = array_fill(0, $state['playerCount'], false);

        $state['currentTrick'] = [
            'cards' => [],
            'leadSuit' => null,
            'currentPlayer' => ($state['dealerIndex'] + 1) % $state['playerCount'],
        ];

        return $state;
    }

    private function dealRound(int $cardsPerPlayer, int $playerCount): array
    {
        $deck = Deck::standard52()->shuffle();
        $hands = [];

        // Deal cards to each player
        for ($i = 0; $i < $playerCount; $i++) {
            $result = $deck->deal($cardsPerPlayer);
            $hands[] = $result['dealt']->toArray();
            $deck = $result['remaining'];
        }

        // Determine trump from next card (if any remain)
        if (!$deck->isEmpty()) {
            $trumpResult = $deck->dealOne();
            $trumpCard = $trumpResult['card'];

            return [
                'hands' => $hands,
                'trumpCard' => $trumpCard->toArray(),
                'trumpSuit' => $trumpCard->getSuit(),
            ];
        }

        // No trump if all cards dealt
        return [
            'hands' => $hands,
            'trumpCard' => null,
            'trumpSuit' => null,
        ];
    }

    public function validateMove(array $state, array $move, int $playerIndex): ValidationResult
    {
        if ($state['phase'] === 'BIDDING') {
            if (($move['action'] ?? null) !== 'BID') {
                return ValidationResult::invalid('Must bid during bidding phase');
            }

            if ($state['currentBidder'] !== $playerIndex) {
                return ValidationResult::invalid('Not your turn to bid');
            }

            $bid = $move['bid'] ?? null;
            if ($bid === null || $bid < 0 || $bid > $state['cardsThisRound']) {
                return ValidationResult::invalid("Bid must be between 0 and {$state['cardsThisRound']}");
            }

            // Check dealer restriction
            if ($playerIndex === $state['dealerIndex']) {
                $totalBids = array_sum(array_filter($state['bids'], fn($b) => $b !== null));
                $totalTricks = $state['cardsThisRound'];

                if ($totalBids + $bid === $totalTricks) {
                    return ValidationResult::invalid("Dealer cannot bid {$bid} - would make total bids equal total tricks");
                }
            }

            return ValidationResult::valid();
        }

        if ($state['phase'] === 'PLAYING') {
            if (($move['action'] ?? null) !== 'PLAY_CARD') {
                return ValidationResult::invalid('Must play card during playing phase');
            }

            if ($state['currentTrick']['currentPlayer'] !== $playerIndex) {
                return ValidationResult::invalid('Not your turn to play');
            }

            if (empty($move['card'])) {
                return ValidationResult::invalid('Must specify a card to play');
            }

            // Check player has card
            $cardData = $move['card'];
            if (!$this->playerHasCard($state['playerHands'][$playerIndex], $cardData)) {
                return ValidationResult::invalid('You do not have this card');
            }

            // Check following suit
            $card = Card::fromArray($cardData);
            $leadSuit = $state['currentTrick']['leadSuit'];

            if ($leadSuit && $card->getSuit() !== $leadSuit) {
                // Must follow suit if possible
                $hasLeadSuit = $this->hasCardsOfSuit($state['playerHands'][$playerIndex], $leadSuit);

                if ($hasLeadSuit) {
                    return ValidationResult::invalid("Must follow suit ({$leadSuit})");
                }
            }

            // Check trump breaking rule - can't lead with trump until trump is broken
            if (!$leadSuit && $state['trumpSuit'] && $card->getSuit() === $state['trumpSuit'] && !$state['trumpBroken']) {
                \Log::info('Trump breaking validation', [
                    'player_index' => $playerIndex,
                    'trump_suit' => $state['trumpSuit'],
                    'card_suit' => $card->getSuit(),
                    'trump_broken' => $state['trumpBroken'],
                ]);

                // Leading with trump when trump hasn't been broken - check if player has only trump cards
                $hasNonTrump = false;
                foreach ($state['playerHands'][$playerIndex] as $handCard) {
                    if ($handCard['suit'] !== $state['trumpSuit']) {
                        $hasNonTrump = true;
                        break;
                    }
                }

                if ($hasNonTrump) {
                    return ValidationResult::invalid("Cannot lead with trump until trump is broken");
                }
            }

            return ValidationResult::valid();
        }

        if ($state['phase'] === 'ROUND_OVER') {
            if (($move['action'] ?? null) !== 'CONTINUE_ROUND') {
                return ValidationResult::invalid('Must continue to next round');
            }

            return ValidationResult::valid();
        }

        return ValidationResult::invalid('Invalid game phase');
    }

    private function playerHasCard(array $hand, array $cardData): bool
    {
        foreach ($hand as $handCardData) {
            if ($handCardData['suit'] === $cardData['suit'] && $handCardData['rank'] === $cardData['rank']) {
                return true;
            }
        }
        return false;
    }

    private function hasCardsOfSuit(array $hand, string $suit): bool
    {
        foreach ($hand as $cardData) {
            if ($cardData['suit'] === $suit) {
                return true;
            }
        }
        return false;
    }

    public function applyMove(array $state, array $move, int $playerIndex): array
    {
        if (($move['action'] ?? null) === 'BID') {
            $state['bids'][$playerIndex] = $move['bid'];

            $state['lastAction'] = [
                'type' => 'BID',
                'playerIndex' => $playerIndex,
                'bid' => $move['bid'],
                'timestamp' => now()->toISOString(),
            ];

            // Check if all players have bid
            $allBid = true;
            foreach ($state['bids'] as $bid) {
                if ($bid === null) {
                    $allBid = false;
                    break;
                }
            }

            if ($allBid) {
                // Move to playing phase
                $state['phase'] = 'PLAYING';
                $state['currentBidder'] = null;
            } else {
                // Next player bids
                $state['currentBidder'] = ($playerIndex + 1) % $state['playerCount'];
            }

            return $state;
        }

        if (($move['action'] ?? null) === 'PLAY_CARD') {
            $card = Card::fromArray($move['card']);

            // Remove card from player's hand
            $state['playerHands'][$playerIndex] = $this->removeCardFromHand(
                $state['playerHands'][$playerIndex],
                $move['card']
            );

            // Check if trump is being broken
            if ($state['trumpSuit'] && $card->getSuit() === $state['trumpSuit'] && !$state['trumpBroken']) {
                $state['trumpBroken'] = true;
                \Log::info('Trump has been broken!', [
                    'player_index' => $playerIndex,
                    'card' => $move['card'],
                    'lead_suit' => $state['currentTrick']['leadSuit'] ?? null,
                ]);
            }

            // Add to current trick
            $state['currentTrick']['cards'][] = [
                'playerIndex' => $playerIndex,
                'card' => $move['card'],
            ];

            // Set lead suit if first card
            if (count($state['currentTrick']['cards']) === 1) {
                $state['currentTrick']['leadSuit'] = $card->getSuit();
            }

            $state['lastAction'] = [
                'type' => 'PLAY_CARD',
                'playerIndex' => $playerIndex,
                'card' => $move['card'],
                'timestamp' => now()->toISOString(),
            ];

            // Check if trick is complete
            if (count($state['currentTrick']['cards']) === $state['playerCount']) {
                // Determine trick winner
                $winner = $this->determineTrickWinner(
                    $state['currentTrick'],
                    $state['trumpSuit']
                );
                $state['tricksWon'][$winner]++;

                $state['completedTricks'][] = array_merge($state['currentTrick'], ['winner' => $winner]);

                $state['lastAction'] = [
                    'type' => 'TRICK_WON',
                    'trickWinner' => $winner,
                    'timestamp' => now()->toISOString(),
                ];

                // Check if round is over
                $handEmpty = true;
                foreach ($state['playerHands'] as $hand) {
                    if (!empty($hand)) {
                        $handEmpty = false;
                        break;
                    }
                }

                if ($handEmpty) {
                    return $this->endRound($state);
                }

                // Start new trick
                $state['currentTrick'] = [
                    'cards' => [],
                    'leadSuit' => null,
                    'currentPlayer' => $winner, // Winner leads next trick
                ];
            } else {
                // Next player's turn
                $state['currentTrick']['currentPlayer'] =
                    ($state['currentTrick']['currentPlayer'] + 1) % $state['playerCount'];
            }

            return $state;
        }

        if (($move['action'] ?? null) === 'CONTINUE_ROUND') {
            // Mark this player as ready to continue
            $state['playersReadyToContinue'][$playerIndex] = true;

            $state['lastAction'] = [
                'type' => 'PLAYER_READY_TO_CONTINUE',
                'playerIndex' => $playerIndex,
                'timestamp' => now()->toISOString(),
            ];

            // Check if all players are ready to continue
            $allReady = true;
            foreach ($state['playersReadyToContinue'] as $ready) {
                if (!$ready) {
                    $allReady = false;
                    break;
                }
            }

            // If all players are ready, advance to next round
            if ($allReady) {
                return $this->advanceToNextRound($state);
            }

            return $state;
        }

        return $state;
    }

    private function removeCardFromHand(array $hand, array $cardToRemove): array
    {
        return array_values(array_filter($hand, function($cardData) use ($cardToRemove) {
            return !($cardData['suit'] === $cardToRemove['suit'] && $cardData['rank'] === $cardToRemove['rank']);
        }));
    }

    private function determineTrickWinner(array $trick, ?string $trumpSuit): int
    {
        $cards = $trick['cards'];
        $leadSuit = $trick['leadSuit'];

        $winningIndex = 0;
        $winningCard = Card::fromArray($cards[0]['card']);

        for ($i = 1; $i < count($cards); $i++) {
            $card = Card::fromArray($cards[$i]['card']);

            // Trump beats non-trump
            if ($trumpSuit && $card->getSuit() === $trumpSuit && $winningCard->getSuit() !== $trumpSuit) {
                $winningIndex = $i;
                $winningCard = $card;
                continue;
            }

            // Both trump: higher value wins
            if ($trumpSuit && $card->getSuit() === $trumpSuit && $winningCard->getSuit() === $trumpSuit) {
                if ($card->getValue() > $winningCard->getValue()) {
                    $winningIndex = $i;
                    $winningCard = $card;
                }
            }
            // Both lead suit: higher value wins
            elseif ($card->getSuit() === $leadSuit && $winningCard->getSuit() === $leadSuit) {
                if ($card->getValue() > $winningCard->getValue()) {
                    $winningIndex = $i;
                    $winningCard = $card;
                }
            }
            // Current is lead suit, winner is not (and not trump): current wins
            elseif ($card->getSuit() === $leadSuit &&
                    (!$trumpSuit || $winningCard->getSuit() !== $trumpSuit) &&
                    $winningCard->getSuit() !== $leadSuit) {
                $winningIndex = $i;
                $winningCard = $card;
            }
        }

        return $cards[$winningIndex]['playerIndex'];
    }

    private function endRound(array $state): array
    {
        // Calculate scores
        for ($i = 0; $i < $state['playerCount']; $i++) {
            $bid = $state['bids'][$i];
            $won = $state['tricksWon'][$i];

            if ($bid === $won) {
                // Made bid exactly
                $state['roundScores'][$i] = 10 + $bid;
            } else {
                // Missed bid
                if ($state['scoringVariant'] === 'standard') {
                    $state['roundScores'][$i] = 0;
                } else {
                    // Partial scoring: 1 point per trick won
                    $state['roundScores'][$i] = $won;
                }
            }

            $state['scores'][$i] += $state['roundScores'][$i];
        }

        $state['phase'] = 'ROUND_OVER';

        $state['lastAction'] = [
            'type' => 'ROUND_END',
            'timestamp' => now()->toISOString(),
        ];

        return $state;
    }

    /**
     * Advance to next round (called externally after round over)
     */
    public function advanceToNextRound(array $state): array
    {
        $state['currentRound']++;

        // Check if game is over
        if ($state['currentRound'] > $state['totalRounds']) {
            $state['phase'] = 'GAME_OVER';
            return $state;
        }

        // Advance dealer
        $state['dealerIndex'] = ($state['dealerIndex'] + 1) % $state['playerCount'];

        // Determine cards for next round based on configuration
        if ($state['isAscending']) {
            $state['cardsThisRound']++;
        } else {
            $state['cardsThisRound']--;
        }

        // Deal new round
        return $this->startRound($state);
    }

    public function checkGameOver(array $state): array
    {
        if ($state['phase'] === 'GAME_OVER') {
            // Find highest score
            $highestScore = max($state['scores']);
            $winnerId = array_search($highestScore, $state['scores']);

            // Create placements array sorted by score (highest score = best placement)
            $scoresCopy = $state['scores'];
            arsort($scoresCopy);
            $placements = array_keys($scoresCopy);

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
        // Hide other players' hands
        $viewState = $state;

        for ($i = 0; $i < $state['playerCount']; $i++) {
            if ($i !== $playerIndex) {
                $handCount = count($state['playerHands'][$i]);
                $viewState['playerHands'][$i] = array_fill(0, $handCount, ['hidden' => true]);
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
