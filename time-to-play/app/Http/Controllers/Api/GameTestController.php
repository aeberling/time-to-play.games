<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Games\GameRegistry;
use App\Models\Game;
use App\Events\GameStateUpdated;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * GameTestController
 *
 * Controller for testing and debugging games (development only)
 */
class GameTestController extends Controller
{
    public function __construct(
        private GameRegistry $registry
    ) {}

    /**
     * Set up a war scenario in the game
     *
     * POST /api/games/{gameId}/test/setup-war
     */
    public function setupWarScenario(Request $request, int $gameId): JsonResponse
    {
        try {
            $game = Game::findOrFail($gameId);

            if ($game->status !== 'IN_PROGRESS') {
                return response()->json([
                    'message' => 'Game must be in progress',
                ], 400);
            }

            $engine = $this->registry->get($game->game_type);

            if ($engine->getGameType() !== 'WAR') {
                return response()->json([
                    'message' => 'This endpoint only works for War games',
                ], 400);
            }

            // Deserialize current state
            $state = $engine->deserializeState($game->current_state);

            // Create a simple war scenario:
            // Both players get Kings on top of their decks to trigger WAR
            // Each player needs at least 5 cards (1 King + 4 for WAR)

            // Create the King cards
            $kingOfHearts = [
                'rank' => 'K',
                'suit' => 'hearts',
                'value' => 13,
                'imageUrl' => '/images/cards/K_of_hearts.svg',
            ];

            $kingOfSpades = [
                'rank' => 'K',
                'suit' => 'spades',
                'value' => 13,
                'imageUrl' => '/images/cards/K_of_spades.svg',
            ];

            // Ensure each player has enough cards for WAR and keep ALL their cards
            // Just replace the first card with a King, keep everything else
            \Log::info('Original player1Deck count: ' . count($state['player1Deck']));
            \Log::info('First card before: ' . json_encode($state['player1Deck'][0] ?? 'none'));

            if (count($state['player1Deck']) >= 5) {
                // Replace only the first card with King, keep ALL the rest
                $remainingCards = array_slice($state['player1Deck'], 1);
                $state['player1Deck'] = array_merge(
                    [$kingOfHearts],
                    $remainingCards
                );
                // Re-index to ensure numeric keys start at 0
                $state['player1Deck'] = array_values($state['player1Deck']);
            } else {
                // Not enough cards for a proper WAR - need at least 5 (1 for flip + 4 for WAR)
                return response()->json([
                    'message' => 'Player 1 does not have enough cards for a WAR scenario (needs at least 5)',
                ], 400);
            }

            if (count($state['player2Deck']) >= 5) {
                // Replace only the first card with King, keep ALL the rest
                $remainingCards = array_slice($state['player2Deck'], 1);
                $state['player2Deck'] = array_merge(
                    [$kingOfSpades],
                    $remainingCards
                );
                // Re-index to ensure numeric keys start at 0
                $state['player2Deck'] = array_values($state['player2Deck']);
            } else {
                // Not enough cards for a proper WAR - need at least 5 (1 for flip + 4 for WAR)
                return response()->json([
                    'message' => 'Player 2 does not have enough cards for a WAR scenario (needs at least 5)',
                ], 400);
            }

            // Clear any cards in play
            $state['cardsInPlay'] = [
                'player1' => [],
                'player2' => [],
            ];

            // Reset to both players ready to flip
            $state['phase'] = 'FLIP';
            $state['waitingFor'] = 'BOTH';

            \Log::info('After setup - player1Deck[0]: ' . json_encode($state['player1Deck'][0]));
            \Log::info('After setup - player2Deck[0]: ' . json_encode($state['player2Deck'][0]));
            \Log::info('After setup - player1Deck count: ' . count($state['player1Deck']));
            \Log::info('After setup - player2Deck count: ' . count($state['player2Deck']));

            // Save the modified state
            $game->update([
                'current_state' => $engine->serializeState($state),
            ]);

            // Broadcast the updated state to all players
            broadcast(new GameStateUpdated($gameId, $state));

            return response()->json([
                'message' => 'War scenario set up successfully',
                'info' => 'Both players now have a King as their next card. When both players flip, a WAR will occur!',
                'state' => $state,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Set up a custom game state
     *
     * POST /api/games/{gameId}/test/set-state
     */
    public function setGameState(Request $request, int $gameId): JsonResponse
    {
        $validated = $request->validate([
            'state' => 'required|array',
        ]);

        try {
            $game = Game::findOrFail($gameId);

            if ($game->status !== 'IN_PROGRESS') {
                return response()->json([
                    'message' => 'Game must be in progress',
                ], 400);
            }

            $engine = $this->registry->get($game->game_type);

            // Save the modified state
            $game->update([
                'current_state' => $engine->serializeState($validated['state']),
            ]);

            return response()->json([
                'message' => 'Game state updated successfully',
                'state' => $validated['state'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
