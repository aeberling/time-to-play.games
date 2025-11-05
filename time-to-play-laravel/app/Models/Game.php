<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    protected $fillable = [
        'game_type',
        'status',
        'max_players',
        'timer_config',
        'game_options',
        'current_state',
        'state_snapshot',
        'winner_id',
    ];

    protected $casts = [
        'timer_config' => 'array',
        'game_options' => 'array',
        'current_state' => 'string', // JSON string for game engine
        'state_snapshot' => 'string', // Final state when game ends
    ];

    /**
     * Get the players in this game
     */
    public function gamePlayers(): HasMany
    {
        return $this->hasMany(GamePlayer::class);
    }

    /**
     * Get the moves made in this game
     */
    public function gameMoves(): HasMany
    {
        return $this->hasMany(GameMove::class);
    }

    /**
     * Get the winner of the game
     */
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }
}
