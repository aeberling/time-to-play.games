<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Temporary debug route - no middleware to avoid database calls
Route::get('/debug-env', function () {
    return response()->json([
        'DB_HOST' => env('DB_HOST'),
        'DB_PORT' => env('DB_PORT'),
        'DB_DATABASE' => env('DB_DATABASE'),
        'DB_USERNAME' => env('DB_USERNAME'),
        'DB_PASSWORD' => env('DB_PASSWORD') ? 'SET (' . strlen(env('DB_PASSWORD')) . ' chars)' : 'NOT SET',
        'PGSSLMODE' => env('PGSSLMODE'),
        'PGSSLROOTCERT' => env('PGSSLROOTCERT'),
        'APP_DEBUG' => env('APP_DEBUG'),
        'APP_ENV' => env('APP_ENV'),
        'APP_KEY' => env('APP_KEY') ? 'SET' : 'NOT SET',
    ]);
})->middleware([]);

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
