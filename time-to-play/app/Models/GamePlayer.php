<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GamePlayer extends Model
{
    protected $fillable = [
        'game_id',
        'user_id',
        'player_index',
        'is_ready',
        'is_connected',
        'placement',
        'score',
    ];

    protected $casts = [
        'is_ready' => 'boolean',
        'is_connected' => 'boolean',
        'player_index' => 'integer',
        'placement' => 'integer',
        'score' => 'integer',
    ];

    /**
     * Get the game this player belongs to
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Get the user this game player represents
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
