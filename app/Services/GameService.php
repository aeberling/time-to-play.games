<?php

namespace App\Services;

use App\Games\GameRegistry;
use App\Events\GameStateUpdated;
use App\Events\MoveMade;
use App\Events\PlayerJoinedGame;
use App\Events\PlayerLeftGame;
use App\Models\Game;
use App\Models\GamePlayer;
use App\Models\GameMove;
use Illuminate\Support\Facades\DB;

/**
 * GameService
 *
 * Coordinates game operations between the database, game engines, and real-time broadcasting.
 * This is the main service for managing game state and player interactions.
 */
class GameService
{
    public function __construct(
        private GameRegistry $registry
    ) {}

    /**
     * Create a new game
     */
    public function createGame(
        string $gameType,
        int $hostUserId,
        int $maxPlayers,
        ?array $timerConfig = null,
        ?array $gameOptions = null
    ): Game {
        // Verify game type exists
        $engine = $this->registry->get($gameType);

        // Generate a random game name
        $gameName = GameNameGenerator::generate($gameType);

        $game = Game::create([
            'game_type' => $gameType,
            'name' => $gameName,
            'status' => 'WAITING',
            'max_players' => $maxPlayers,
            'timer_config' => $timerConfig,
            'game_options' => $gameOptions,
        ]);

        // Add host as first player
        $this->addPlayerToGame($game->id, $hostUserId, 0);

        return $game;
    }

    /**
     * Add a player to a game
     */
    public function addPlayerToGame(int $gameId, int $userId, ?int $playerIndex = null): GamePlayer
    {
        $game = Game::findOrFail($gameId);

        // Check if game is full
        if ($game->gamePlayers()->count() >= $game->max_players) {
            throw new \Exception('Game is full');
        }

        // Check if player already in game
        if ($game->gamePlayers()->where('user_id', $userId)->exists()) {
            throw new \Exception('Player already in game');
        }

        // Auto-assign player index if not provided
        if ($playerIndex === null) {
            $playerIndex = $game->gamePlayers()->count();
        }

        $gamePlayer = GamePlayer::create([
            'game_id' => $gameId,
            'user_id' => $userId,
            'player_index' => $playerIndex,
            'is_ready' => false,
            'is_connected' => true,
        ]);

        // Broadcast player joined
        $user = $gamePlayer->user;
        broadcast(new PlayerJoinedGame(
            $gameId,
            $userId,
            $user->display_name ?? $user->username ?? 'Guest',
            $user->avatar_url
        ));

        // Check if game should start (all players joined)
        if ($game->gamePlayers()->count() === $game->max_players) {
            $this->updateGameStatus($gameId, 'READY');
        }

        return $gamePlayer;
    }

    /**
     * Remove a player from a game
     */
    public function removePlayerFromGame(int $gameId, int $userId): void
    {
        $gamePlayer = GamePlayer::where('game_id', $gameId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $user = $gamePlayer->user;

        $gamePlayer->delete();

        // Broadcast player left
        broadcast(new PlayerLeftGame(
            $gameId,
            $userId,
            $user->display_name ?? $user->username ?? 'Guest'
        ));

        // If game hasn't started, cancel it if no players left
        $game = Game::find($gameId);
        if ($game && $game->status === 'WAITING' && $game->gamePlayers()->count() === 0) {
            $game->update(['status' => 'ABANDONED']);
        }
    }

    /**
     * Start a game (initialize game state)
     */
    public function startGame(int $gameId): array
    {
        $game = Game::with('gamePlayers.user')->findOrFail($gameId);

        if ($game->status !== 'READY') {
            throw new \Exception('Game is not ready to start');
        }

        // Get game engine
        $engine = $this->registry->get($game->game_type);

        // Prepare players array for engine
        $players = $game->gamePlayers()
            ->orderBy('player_index')
            ->get()
            ->map(fn($gp) => [
                'id' => $gp->user_id,
                'name' => $gp->user->display_name ?? $gp->user->username ?? 'Guest',
                'avatar_url' => $gp->user->avatar_url,
            ])
            ->toArray();

        // Get game options (if any)
        $gameOptions = $game->game_options ?? [];

        // Initialize game state with options
        $gameState = $engine->initializeGame($players, $gameOptions);

        // Save state to database
        $game->update([
            'status' => 'IN_PROGRESS',
            'current_state' => $engine->serializeState($gameState),
        ]);

        // Broadcast initial state to all players (failures won't prevent game start)
        try {
            broadcast(new GameStateUpdated($gameId, $gameState));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast game state', [
                'game_id' => $gameId,
                'error' => $e->getMessage(),
            ]);
        }

        // Broadcast lobby update (so game is removed from available games)
        try {
            broadcast(new \App\Events\LobbyGameUpdated($game));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast lobby update', [
                'game_id' => $gameId,
                'error' => $e->getMessage(),
            ]);
        }

        return $gameState;
    }

    /**
     * Make a move in a game
     */
    public function makeMove(int $gameId, int $userId, array $moveData): array
    {
        $result = DB::transaction(function () use ($gameId, $userId, $moveData) {
            $game = Game::lockForUpdate()->findOrFail($gameId);

            if ($game->status !== 'IN_PROGRESS') {
                throw new \Exception('Game is not in progress');
            }

            // Get player index
            $gamePlayer = $game->gamePlayers()->where('user_id', $userId)->firstOrFail();
            $playerIndex = $gamePlayer->player_index;

            \Log::info('Move validation debug', [
                'user_id' => $userId,
                'player_index' => $playerIndex,
                'waiting_for' => $game->current_state['waitingFor'] ?? 'unknown',
            ]);

            // Get game engine
            $engine = $this->registry->get($game->game_type);

            // Deserialize current state
            $currentState = $engine->deserializeState($game->current_state);

            \Log::info('Deserialized state', [
                'waiting_for' => $currentState['waitingFor'] ?? 'unknown',
                'phase' => $currentState['phase'] ?? 'unknown',
            ]);

            // Validate move
            $validation = $engine->validateMove($currentState, $moveData, $playerIndex);

            if (!$validation->isValid()) {
                throw new \Exception($validation->getError() ?? 'Invalid move');
            }

            // Apply move
            $newState = $engine->applyMove($currentState, $moveData, $playerIndex);

            // Save move to database
            GameMove::create([
                'game_id' => $gameId,
                'user_id' => $userId,
                'move_number' => $game->gameMoves()->count() + 1,
                'move_data' => json_encode($moveData),
            ]);

            // Check if game is over
            $gameOverResult = $engine->checkGameOver($newState);

            if ($gameOverResult['isOver']) {
                $game->update([
                    'status' => 'COMPLETED',
                    'current_state' => $engine->serializeState($newState),
                    'state_snapshot' => $engine->serializeState($newState),
                    'winner_id' => isset($gameOverResult['winner'])
                        ? $game->gamePlayers()->where('player_index', $gameOverResult['winner'])->first()?->user_id
                        : null,
                ]);

                // Update player placements
                if (isset($gameOverResult['placements'])) {
                    foreach ($gameOverResult['placements'] as $placement => $playerIndex) {
                        $game->gamePlayers()
                            ->where('player_index', $playerIndex)
                            ->update(['placement' => $placement + 1]); // 1-indexed
                    }
                }
            } else {
                // Update game state
                $game->update([
                    'current_state' => $engine->serializeState($newState),
                ]);
            }

            return [
                'newState' => $newState,
                'playerIndex' => $playerIndex,
                'moveData' => $moveData,
            ];
        });

        // Broadcast move to all players (outside transaction to avoid rollback on broadcast failure)
        try {
            broadcast(new MoveMade($gameId, $result['playerIndex'], $result['moveData'], $result['newState']));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast move', [
                'game_id' => $gameId,
                'error' => $e->getMessage(),
            ]);
        }

        return $result['newState'];
    }

    /**
     * Get current game state for a specific player
     */
    public function getPlayerView(int $gameId, int $userId): array
    {
        $game = Game::findOrFail($gameId);
        $gamePlayer = $game->gamePlayers()->where('user_id', $userId)->firstOrFail();

        // If game hasn't started yet, return empty state
        if ($game->current_state === null) {
            return [
                'status' => $game->status,
                'message' => 'Game has not started yet',
            ];
        }

        $engine = $this->registry->get($game->game_type);
        $state = $engine->deserializeState($game->current_state);

        return $engine->getPlayerView($state, $gamePlayer->player_index);
    }

    /**
     * Update game status
     */
    public function updateGameStatus(int $gameId, string $status): void
    {
        $game = Game::findOrFail($gameId);
        $game->update(['status' => $status]);

        // Broadcast status change
        $state = $game->current_state ? json_decode($game->current_state, true) : [];
        broadcast(new GameStateUpdated($gameId, $state));
    }

    /**
     * Mark player as ready
     */
    public function setPlayerReady(int $gameId, int $userId, bool $ready = true): void
    {
        $gamePlayer = GamePlayer::where('game_id', $gameId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $gamePlayer->update(['is_ready' => $ready]);

        // Broadcast ready status change to other players in the game
        $game = Game::with('gamePlayers.user')->findOrFail($gameId);
        try {
            broadcast(new GameStateUpdated($gameId, $game->current_state ? json_decode($game->current_state, true) : []));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast ready status update', [
                'game_id' => $gameId,
                'error' => $e->getMessage(),
            ]);
        }

        // Check if all players are ready
        $allReady = $game->gamePlayers()->where('is_ready', false)->count() === 0;

        if ($allReady && $game->status === 'READY') {
            $this->startGame($gameId);
        }
    }

    /**
     * Update player connection status
     */
    public function setPlayerConnected(int $gameId, int $userId, bool $connected = true): void
    {
        GamePlayer::where('game_id', $gameId)
            ->where('user_id', $userId)
            ->update(['is_connected' => $connected]);
    }

    /**
     * Continue to the next round
     */
    public function continueToNextRound(int $gameId): array
    {
        $newState = DB::transaction(function () use ($gameId) {
            $game = Game::lockForUpdate()->findOrFail($gameId);

            if ($game->status !== 'IN_PROGRESS') {
                throw new \Exception('Game is not in progress');
            }

            // Get game engine
            $engine = $this->registry->get($game->game_type);

            // Deserialize current state
            $currentState = $engine->deserializeState($game->current_state);

            // Check if we can start next round (must be in ROUND_OVER phase)
            if (($currentState['phase'] ?? null) !== 'ROUND_OVER') {
                throw new \Exception('Cannot start next round - current round is not over');
            }

            // Start next round using the engine
            $newState = $engine->startNextRound($currentState);

            // Update game state
            $game->update([
                'current_state' => $engine->serializeState($newState),
            ]);

            return $newState;
        });

        // Broadcast new state to all players (outside transaction to avoid rollback on broadcast failure)
        try {
            broadcast(new GameStateUpdated($gameId, $newState));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast game state update', [
                'game_id' => $gameId,
                'error' => $e->getMessage(),
            ]);
        }

        return $newState;
    }
}
