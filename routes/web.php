<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Temporary debug route
Route::get('/debug-db', function () {
    return response()->json([
        'DB_HOST' => config('database.connections.pgsql.host'),
        'DB_PORT' => config('database.connections.pgsql.port'),
        'DB_DATABASE' => config('database.connections.pgsql.database'),
        'DB_USERNAME' => config('database.connections.pgsql.username'),
        'DB_PASSWORD' => config('database.connections.pgsql.password') ? 'SET' : 'NOT SET',
        'PGSSLMODE' => env('PGSSLMODE'),
        'PGSSLROOTCERT' => env('PGSSLROOTCERT'),
        'APP_DEBUG' => config('app.debug'),
        'APP_ENV' => config('app.env'),
    ]);
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Game Routes
    Route::get('/games/lobby', function () {
        return Inertia::render('Games/Lobby');
    })->name('games.lobby');

    Route::get('/games/{id}', function ($id) {
        // Fetch game to determine which component to render
        $game = \App\Models\Game::findOrFail($id);

        // Route to appropriate game component based on type
        $component = match($game->game_type) {
            'WAR' => 'Games/War',
            'SWOOP' => 'Games/Swoop',
            'OH_HELL' => 'Games/OhHell',
            default => throw new \Exception('Unknown game type'),
        };

        return Inertia::render($component, [
            'gameId' => $id,
        ]);
    })->name('games.show');
});

require __DIR__.'/auth.php';
