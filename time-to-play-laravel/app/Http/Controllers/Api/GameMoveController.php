<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GameService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * GameMoveController
 *
 * Handles making moves in games
 */
class GameMoveController extends Controller
{
    public function __construct(
        private GameService $gameService
    ) {}

    /**
     * Make a move in a game
     *
     * POST /api/games/{gameId}/move
     */
    public function store(Request $request, int $gameId): JsonResponse
    {
        $validated = $request->validate([
            'move' => 'required|array',
        ]);

        try {
            $user = $request->user();

            \Log::info('Making move', [
                'game_id' => $gameId,
                'user_id' => $user->id,
                'move_data' => $validated['move'],
            ]);

            $newState = $this->gameService->makeMove(
                $gameId,
                $user->id,
                $validated['move']
            );

            return response()->json([
                'message' => 'Move made successfully',
                'state' => $newState,
            ]);
        } catch (\Exception $e) {
            \Log::error('Move failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
