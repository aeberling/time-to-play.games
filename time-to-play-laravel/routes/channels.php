<?php

use Illuminate\Support\Facades\Broadcast;

// Private user channel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Game presence channel - tracks who's connected to a specific game
Broadcast::channel('game.{gameId}', function ($user, $gameId) {
    // TODO: Verify user is actually a player in this game
    // For now, allow anyone (will add proper auth later)
    return [
        'id' => $user->id,
        'name' => $user->display_name ?? $user->username ?? 'Guest',
        'avatar_url' => $user->avatar_url,
    ];
});

// Private game channel - for game state updates
Broadcast::channel('game.{gameId}.private', function ($user, $gameId) {
    // TODO: Verify user is actually a player in this game
    return true;
});
