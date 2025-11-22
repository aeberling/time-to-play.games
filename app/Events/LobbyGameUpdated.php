<?php

namespace App\Events;

use App\Models\Game;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event fired when a game in the lobby is updated
 * (e.g., player joins, leaves, game status changes)
 * Broadcasts to the lobby channel immediately (synchronously)
 */
class LobbyGameUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Game $game
    ) {
        // Eager load relationships
        $this->game->load(['gamePlayers.user']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('lobby'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'game.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        // Only send essential game data to avoid payload size limits
        return [
            'game' => [
                'id' => $this->game->id,
                'name' => $this->game->name,
                'game_type' => $this->game->game_type,
                'status' => $this->game->status,
                'max_players' => $this->game->max_players,
                'player_count' => $this->game->gamePlayers->count(),
                'game_players' => $this->game->gamePlayers->map(fn($gp) => [
                    'id' => $gp->id,
                    'user_id' => $gp->user_id,
                    'player_index' => $gp->player_index,
                    'is_ready' => $gp->is_ready,
                    'is_connected' => $gp->is_connected,
                    'user' => [
                        'id' => $gp->user->id,
                        'name' => $gp->user->name,
                        'display_name' => $gp->user->display_name,
                        'avatar_url' => $gp->user->avatar_url,
                    ]
                ])->toArray(),
                'created_at' => $this->game->created_at?->toISOString(),
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}
