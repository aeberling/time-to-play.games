<?php

namespace App\Games\Engines;

use App\Games\Contracts\GameEngineInterface;
use App\Games\ValueObjects\Card;
use App\Games\ValueObjects\Deck;
use App\Games\ValueObjects\ValidationResult;

/**
 * War Card Game Engine
 *
 * Simple two-player card game where players compete to win all 52 cards.
 * Players simultaneously flip cards, higher card wins both cards.
 * When cards tie, "War" is declared with additional cards played.
 */
class WarEngine implements GameEngineInterface
{
    public function getGameType(): string
    {
        return 'WAR';
    }

    public function getName(): string
    {
        return 'War';
    }

    public function getConfig(): array
    {
        return [
            'minPlayers' => 2,
            'maxPlayers' => 2,
            'description' => 'A simple two-player card game where the highest card wins',
            'difficulty' => 'Easy',
            'estimatedDuration' => '10-20 minutes',
            'requiresStrategy' => false,
        ];
    }

    public function initializeGame(array $players, array $options = []): array
    {
        if (count($players) !== 2) {
            throw new \InvalidArgumentException('War requires exactly 2 players');
        }

        // Create and shuffle deck
        $deck = Deck::standard52()->shuffle();

        // Split deck evenly between players
        $decks = $deck->split(2);

        return [
            'players' => $players,
            'player1Deck' => $decks[0]->toArray(),
            'player2Deck' => $decks[1]->toArray(),
            'cardsInPlay' => [
                'player1' => [],
                'player2' => [],
            ],
            'phase' => 'FLIP',
            'waitingFor' => 'BOTH',
            'turnCount' => 0,
            'warDepth' => 0,
            'lastAction' => null,
        ];
    }

    public function validateMove(array $state, array $move, int $playerIndex): ValidationResult
    {
        // Check if game is over
        if ($state['phase'] === 'GAME_OVER') {
            return ValidationResult::invalid('Game is over');
        }

        // Check if it's player's turn
        $waitingFor = $state['waitingFor'];
        if ($waitingFor === 'PLAYER_1' && $playerIndex !== 0) {
            return ValidationResult::invalid('Not your turn');
        }
        if ($waitingFor === 'PLAYER_2' && $playerIndex !== 1) {
            return ValidationResult::invalid('Not your turn');
        }

        // Check if player has cards
        $deckKey = $playerIndex === 0 ? 'player1Deck' : 'player2Deck';
        if (empty($state[$deckKey])) {
            return ValidationResult::invalid('No cards left');
        }

        // For War game, the only action is "flip"
        if (!isset($move['action']) || $move['action'] !== 'flip') {
            return ValidationResult::invalid('Invalid action');
        }

        return ValidationResult::valid();
    }

    public function applyMove(array $state, array $move, int $playerIndex): array
    {
        if ($move['action'] === 'flip') {
            $deckKey = $playerIndex === 0 ? 'player1Deck' : 'player2Deck';
            $playKey = $playerIndex === 0 ? 'player1' : 'player2';

            // Get top card from player's deck
            $deck = Deck::fromArray($state[$deckKey]);
            $result = $deck->dealOne();

            // Add card to play area
            $state['cardsInPlay'][$playKey][] = $result['card']->toArray();

            // Update deck
            $state[$deckKey] = $result['remaining']->toArray();

            // Check if both players have flipped
            if (!empty($state['cardsInPlay']['player1']) && !empty($state['cardsInPlay']['player2'])) {
                // Resolve the round
                $state = $this->resolveRound($state);
            } else {
                // Wait for other player
                $state['waitingFor'] = $playerIndex === 0 ? 'PLAYER_2' : 'PLAYER_1';
            }
        }

        return $state;
    }

    private function resolveRound(array $state): array
    {
        $player1Card = Card::fromArray(end($state['cardsInPlay']['player1']));
        $player2Card = Card::fromArray(end($state['cardsInPlay']['player2']));

        $state['turnCount']++;

        if ($player1Card->getValue() > $player2Card->getValue()) {
            // Player 1 wins
            return $this->playerWinsRound($state, 0);
        } elseif ($player2Card->getValue() > $player1Card->getValue()) {
            // Player 2 wins
            return $this->playerWinsRound($state, 1);
        } else {
            // War!
            return $this->initiateWar($state);
        }
    }

    private function playerWinsRound(array $state, int $winnerIndex): array
    {
        // Collect all cards in play
        $allCards = array_merge(
            $state['cardsInPlay']['player1'],
            $state['cardsInPlay']['player2']
        );

        // Add to winner's deck (at bottom)
        $deckKey = $winnerIndex === 0 ? 'player1Deck' : 'player2Deck';
        $state[$deckKey] = array_merge($state[$deckKey], $allCards);

        // Clear cards in play
        $state['cardsInPlay'] = [
            'player1' => [],
            'player2' => [],
        ];

        $state['phase'] = 'FLIP';
        $state['waitingFor'] = 'BOTH';
        $state['warDepth'] = 0;

        $state['lastAction'] = [
            'type' => 'WIN_ROUND',
            'winner' => $winnerIndex === 0 ? 'PLAYER_1' : 'PLAYER_2',
            'cardsWon' => count($allCards),
            'timestamp' => now()->toISOString(),
        ];

        // Check if game is over
        if (empty($state['player1Deck']) || empty($state['player2Deck'])) {
            $state = $this->endGame($state, $winnerIndex);
        }

        return $state;
    }

    private function initiateWar(array $state): array
    {
        $state['phase'] = 'WAR';
        $state['warDepth']++;

        $state['lastAction'] = [
            'type' => 'WAR',
            'timestamp' => now()->toISOString(),
        ];

        // Each player must place 3 cards face down + 1 face up
        // Check if players have enough cards
        if (count($state['player1Deck']) < 4 || count($state['player2Deck']) < 4) {
            // Player without enough cards loses
            $winner = count($state['player1Deck']) >= 4 ? 0 : 1;
            return $this->endGame($state, $winner);
        }

        // Auto-play war cards (3 face down, 1 face up)
        $p1Deck = Deck::fromArray($state['player1Deck']);
        $p2Deck = Deck::fromArray($state['player2Deck']);

        $p1War = $p1Deck->deal(4);
        $p2War = $p2Deck->deal(4);

        // Add war cards to play
        $state['cardsInPlay']['player1'] = array_merge(
            $state['cardsInPlay']['player1'],
            $p1War['dealt']->toArray()
        );
        $state['cardsInPlay']['player2'] = array_merge(
            $state['cardsInPlay']['player2'],
            $p2War['dealt']->toArray()
        );

        // Update decks
        $state['player1Deck'] = $p1War['remaining']->toArray();
        $state['player2Deck'] = $p2War['remaining']->toArray();

        // Resolve with the face-up cards (last card in each war set)
        return $this->resolveRound($state);
    }

    private function endGame(array $state, int $winnerIndex): array
    {
        $state['phase'] = 'GAME_OVER';
        $state['waitingFor'] = 'NONE';

        $state['lastAction'] = [
            'type' => 'GAME_OVER',
            'winner' => $winnerIndex === 0 ? 'PLAYER_1' : 'PLAYER_2',
            'timestamp' => now()->toISOString(),
        ];

        return $state;
    }

    public function checkGameOver(array $state): array
    {
        // Check if either player has no cards
        if (empty($state['player1Deck'])) {
            return [
                'isOver' => true,
                'winner' => 1, // Player 2 wins (index 1)
                'placements' => [1, 0], // Player 2 first, Player 1 second
            ];
        }

        if (empty($state['player2Deck'])) {
            return [
                'isOver' => true,
                'winner' => 0, // Player 1 wins (index 0)
                'placements' => [0, 1], // Player 1 first, Player 2 second
            ];
        }

        // Check turn limit (prevent infinite games)
        if ($state['turnCount'] >= 500) {
            // Winner is player with more cards
            $winner = count($state['player1Deck']) > count($state['player2Deck']) ? 0 : 1;
            $placements = $winner === 0 ? [0, 1] : [1, 0];

            return [
                'isOver' => true,
                'winner' => $winner,
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
        // In War, both players see the same information
        // (opponent's deck count is visible, but not the cards)
        return $state;
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
