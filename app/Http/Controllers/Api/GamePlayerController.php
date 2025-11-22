<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GameService;
use App\Events\LobbyGameUpdated;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * GamePlayerController
 *
 * Handles player-specific actions in games (join, leave, ready, etc.)
 */
class GamePlayerController extends Controller
{
    public function __construct(
        private GameService $gameService
    ) {}

    /**
     * Join a game
     *
     * POST /api/games/{gameId}/join
     */
    public function join(Request $request, int $gameId): JsonResponse
    {
        try {
            $user = $request->user();

            $gamePlayer = $this->gameService->addPlayerToGame($gameId, $user->id);

            $gamePlayer->load(['game', 'user']);

            // Broadcast game update to lobby
            $game = Game::with(['gamePlayers.user'])->findOrFail($gameId);
            broadcast(new LobbyGameUpdated($game));

            // Broadcast to game's private channel so waiting room updates immediately
            broadcast(new \App\Events\GameStateUpdated(
                $gameId,
                $game->current_state ? json_decode($game->current_state, true) : []
            ));

            return response()->json([
                'message' => 'Joined game successfully',
                'game_player' => $gamePlayer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Leave a game
     *
     * POST /api/games/{gameId}/leave
     */
    public function leave(Request $request, int $gameId): JsonResponse
    {
        try {
            $user = $request->user();

            $this->gameService->removePlayerFromGame($gameId, $user->id);

            // Broadcast to game's private channel so waiting room updates immediately
            $game = Game::with(['gamePlayers.user'])->find($gameId);
            if ($game) {
                broadcast(new \App\Events\GameStateUpdated(
                    $gameId,
                    $game->current_state ? json_decode($game->current_state, true) : []
                ));
            }

            return response()->json([
                'message' => 'Left game successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Mark player as ready
     *
     * POST /api/games/{gameId}/ready
     */
    public function ready(Request $request, int $gameId): JsonResponse
    {
        try {
            $user = $request->user();
            $ready = $request->input('ready', true);

            $this->gameService->setPlayerReady($gameId, $user->id, $ready);

            // Broadcast game update to lobby so it shows updated ready status
            $game = Game::with(['gamePlayers.user'])->findOrFail($gameId);
            broadcast(new LobbyGameUpdated($game));

            return response()->json([
                'message' => $ready ? 'Marked as ready' : 'Marked as not ready',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update connection status
     *
     * POST /api/games/{gameId}/connect
     */
    public function connect(Request $request, int $gameId): JsonResponse
    {
        try {
            $user = $request->user();
            $connected = $request->input('connected', true);

            $this->gameService->setPlayerConnected($gameId, $user->id, $connected);

            return response()->json([
                'message' => $connected ? 'Marked as connected' : 'Marked as disconnected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
