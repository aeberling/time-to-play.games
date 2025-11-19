<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    protected $fillable = [
        'game_type',
        'name',
        'status',
        'max_players',
        'timer_config',
        'game_options',
        'current_state',
        'state_snapshot',
        'winner_id',
        'is_archived',
        'archived_at',
    ];

    protected $casts = [
        'timer_config' => 'array',
        'game_options' => 'array',
        'current_state' => 'string', // JSON string for game engine
        'state_snapshot' => 'string', // Final state when game ends
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
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

    /**
     * Scope a query to only include active (non-archived) games
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    /**
     * Scope a query to only include archived games
     */
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    /**
     * Get the creator of the game (player with index 0)
     */
    public function creator()
    {
        return $this->gamePlayers()->where('player_index', 0)->first();
    }
}
