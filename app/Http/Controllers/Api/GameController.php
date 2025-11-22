<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GameService;
use App\Models\Game;
use App\Games\GameRegistry;
use App\Events\GameCreated;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * GameController
 *
 * Handles game CRUD operations and game management endpoints
 */
class GameController extends Controller
{
    public function __construct(
        private GameService $gameService,
        private GameRegistry $gameRegistry
    ) {}

    /**
     * Get list of available game types
     *
     * GET /api/games/types
     */
    public function types(): JsonResponse
    {
        $games = $this->gameRegistry->getGamesList();

        return response()->json([
            'games' => $games,
        ]);
    }

    /**
     * Get list of games (with filters)
     *
     * GET /api/games
     */
    public function index(Request $request): JsonResponse
    {
        $query = Game::with(['gamePlayers.user', 'winner'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by game type
        if ($request->has('game_type')) {
            $query->where('game_type', $request->game_type);
        }

        // Filter by user participation
        if ($request->has('user_id')) {
            $query->whereHas('gamePlayers', function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            });
        }

        // Exclude completed/abandoned games
        if ($request->boolean('exclude_completed')) {
            $query->whereNotIn('status', ['COMPLETED', 'ABANDONED']);
        }

        // Exclude archived games by default (unless specifically requesting archived games)
        if (!$request->boolean('include_archived')) {
            $query->where('is_archived', false);
        }

        $games = $query->paginate(20);

        return response()->json($games);
    }

    /**
     * Create a new game
     *
     * POST /api/games
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'game_type' => 'required|string|in:SWOOP,OH_HELL,TELESTRATIONS,WAR_IN_HEAVEN',
            'max_players' => 'required|integer|min:2|max:8',
            'timer_config' => 'nullable|array',
            'timer_config.turn_time' => 'nullable|integer|min:10|max:300',
            'timer_config.total_time' => 'nullable|integer|min:60',
            'game_options' => 'nullable|array',
            'game_options.startingHandSize' => 'nullable|integer|min:1|max:13',
            'game_options.endingHandSize' => 'nullable|integer|min:1|max:13',
            'game_options.scoringVariant' => 'nullable|string|in:standard,partial',
            'game_options.scoreLimit' => 'nullable|integer|min:50|max:1000',
            'game_options.scoringMethod' => 'nullable|string|in:beginner,normal',
        ]);

        $user = $request->user();

        // Additional validation for Oh Hell specific options
        if ($validated['game_type'] === 'OH_HELL' && isset($validated['game_options'])) {
            $options = $validated['game_options'];
            $maxPlayers = $validated['max_players'];

            if (isset($options['startingHandSize']) || isset($options['endingHandSize'])) {
                $startingHandSize = $options['startingHandSize'] ?? 10;
                $endingHandSize = $options['endingHandSize'] ?? 1;
                $maxCardsPerRound = max($startingHandSize, $endingHandSize);
                $maxPossibleCards = floor(52 / $maxPlayers);

                if ($maxCardsPerRound > $maxPossibleCards) {
                    return response()->json([
                        'message' => "With {$maxPlayers} players, maximum hand size is {$maxPossibleCards} (using a 52-card deck)",
                        'errors' => [
                            'game_options' => ["Maximum hand size exceeded for {$maxPlayers} players"]
                        ]
                    ], 422);
                }
            }
        }

        $game = $this->gameService->createGame(
            $validated['game_type'],
            $user->id,
            $validated['max_players'],
            $validated['timer_config'] ?? null,
            $validated['game_options'] ?? null
        );

        $game->load(['gamePlayers.user']);

        // Broadcast game creation to lobby
        broadcast(new GameCreated($game));

        return response()->json([
            'game' => $game,
            'message' => 'Game created successfully',
        ], 201);
    }

    /**
     * Get a specific game
     *
     * GET /api/games/{id}
     */
    public function show(int $id): JsonResponse
    {
        $game = Game::with(['gamePlayers.user', 'winner', 'gameMoves'])
            ->findOrFail($id);

        return response()->json([
            'game' => $game,
        ]);
    }

    /**
     * Get game state for current player
     *
     * GET /api/games/{id}/state
     */
    public function state(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $playerView = $this->gameService->getPlayerView($id, $user->id);

        return response()->json([
            'state' => $playerView,
        ]);
    }

    /**
     * Start a game
     *
     * POST /api/games/{id}/start
     */
    public function start(int $id): JsonResponse
    {
        try {
            $state = $this->gameService->startGame($id);

            return response()->json([
                'message' => 'Game started',
                'state' => $state,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Delete/abandon a game
     *
     * DELETE /api/games/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $game = Game::with('gamePlayers')->findOrFail($id);
        $user = $request->user();

        // Check if user is the creator (player_index 0)
        $creator = $game->gamePlayers()->where('player_index', 0)->first();

        if (!$creator || $creator->user_id !== $user->id) {
            return response()->json([
                'message' => 'Only the game creator can cancel the game',
            ], 403);
        }

        // Only allow cancellation if game hasn't started or is still in waiting/ready
        if (!in_array($game->status, ['WAITING', 'READY'])) {
            return response()->json([
                'message' => 'Cannot cancel a game that is already in progress',
            ], 400);
        }

        // Mark game as abandoned
        $game->update(['status' => 'ABANDONED']);

        // Broadcast cancellation to all players in the game
        $cancelledBy = $user->display_name ?? $user->username ?? 'Host';
        broadcast(new \App\Events\GameCancelled($id, $cancelledBy));

        // Broadcast lobby update so game is removed from lobby
        broadcast(new \App\Events\LobbyGameUpdated($game));

        return response()->json([
            'message' => 'Game cancelled successfully',
        ]);
    }

    /**
     * Get game statistics
     *
     * GET /api/games/{id}/stats
     */
    public function stats(int $id): JsonResponse
    {
        $game = Game::with(['gamePlayers.user', 'gameMoves'])->findOrFail($id);

        $stats = [
            'total_moves' => $game->gameMoves()->count(),
            'duration' => $game->status === 'COMPLETED'
                ? $game->updated_at->diffInSeconds($game->created_at)
                : null,
            'players' => $game->gamePlayers->map(function ($gp) use ($game) {
                return [
                    'user_id' => $gp->user_id,
                    'name' => $gp->user->display_name ?? $gp->user->username,
                    'placement' => $gp->placement,
                    'score' => $gp->score,
                    'moves_made' => $game->gameMoves()->where('user_id', $gp->user_id)->count(),
                ];
            }),
        ];

        return response()->json($stats);
    }

    /**
     * Continue to next round
     *
     * POST /api/games/{id}/continue
     */
    public function continueToNextRound(int $id): JsonResponse
    {
        try {
            $state = $this->gameService->continueToNextRound($id);

            return response()->json([
                'message' => 'Next round started',
                'state' => $state,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Archive a game (end game early)
     *
     * POST /api/games/{id}/archive
     */
    public function archive(Request $request, int $id): JsonResponse
    {
        $game = Game::with('gamePlayers')->findOrFail($id);
        $user = $request->user();

        // Check if user is the creator (player_index 0)
        $creator = $game->gamePlayers()->where('player_index', 0)->first();

        if (!$creator || $creator->user_id !== $user->id) {
            return response()->json([
                'message' => 'Only the game creator can end the game',
            ], 403);
        }

        // Don't allow archiving already archived or completed games
        if ($game->is_archived) {
            return response()->json([
                'message' => 'Game is already archived',
            ], 400);
        }

        // Archive the game
        $game->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);

        return response()->json([
            'message' => 'Game archived successfully',
            'game' => $game,
        ]);
    }
}
