<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\GamePlayerController;
use App\Http\Controllers\Api\GameMoveController;
use App\Http\Controllers\Api\GameTestController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserThemeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no authentication required)
Route::get('/games/types', [GameController::class, 'types']);

// Protected routes (require authentication)
// Using 'auth' middleware for session-based authentication (Inertia SPA)
Route::middleware('auth')->group(function () {
    // User endpoints
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/users/online', [UserController::class, 'online']);
    Route::post('/users/heartbeat', [UserController::class, 'heartbeat']);

    // Theme endpoints
    Route::get('/user/theme', [UserThemeController::class, 'show']);
    Route::put('/user/theme', [UserThemeController::class, 'update']);

    // Game management
    Route::prefix('games')->group(function () {
        // List and create games
        Route::get('/', [GameController::class, 'index']);
        Route::post('/', [GameController::class, 'store']);

        // Specific game operations
        Route::get('/{id}', [GameController::class, 'show']);
        Route::delete('/{id}', [GameController::class, 'destroy']);
        Route::get('/{id}/state', [GameController::class, 'state']);
        Route::get('/{id}/stats', [GameController::class, 'stats']);
        Route::post('/{id}/start', [GameController::class, 'start']);
        Route::post('/{id}/continue', [GameController::class, 'continueToNextRound']);
        Route::post('/{id}/archive', [GameController::class, 'archive']);

        // Player actions
        Route::post('/{gameId}/join', [GamePlayerController::class, 'join']);
        Route::post('/{gameId}/leave', [GamePlayerController::class, 'leave']);
        Route::post('/{gameId}/ready', [GamePlayerController::class, 'ready']);
        Route::post('/{gameId}/connect', [GamePlayerController::class, 'connect']);

        // Game moves
        Route::post('/{gameId}/move', [GameMoveController::class, 'store']);

        // Test/Debug endpoints (development only)
        Route::prefix('/{gameId}/test')->group(function () {
            Route::post('/setup-war', [GameTestController::class, 'setupWarScenario']);
            Route::post('/set-state', [GameTestController::class, 'setGameState']);
        });
    });
});
