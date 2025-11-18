<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event fired when a player makes a move
 * Broadcasts to all players in the game immediately (synchronously)
 */
class MoveMade implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $gameId,
        public int $playerIndex,
        public array $move,
        public array $newGameState
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("game.{$this->gameId}.private"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'game.move.made';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'gameId' => $this->gameId,
            'playerIndex' => $this->playerIndex,
            'move' => $this->move,
            // Note: newGameState removed to avoid Pusher payload size limits
            // Clients should refetch state when receiving this event
            'timestamp' => now()->toISOString(),
        ];
    }
}
