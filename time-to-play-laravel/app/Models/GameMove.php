<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameMove extends Model
{
    protected $fillable = [
        'game_id',
        'user_id',
        'move_number',
        'move_data',
    ];

    protected $casts = [
        'move_number' => 'integer',
        'move_data' => 'string', // JSON string
    ];

    /**
     * Get the game this move belongs to
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Get the user who made this move
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
