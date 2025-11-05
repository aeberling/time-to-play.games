<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Games\GameRegistry;
use App\Games\Engines\WarEngine;
use App\Games\Engines\SwoopEngine;
use App\Games\Engines\OhHellEngine;

/**
 * Game Service Provider
 *
 * Registers all game engines with the GameRegistry.
 * Adding a new game is as simple as:
 * 1. Create a new engine class implementing GameEngineInterface
 * 2. Add one line here to register it
 * 3. Done!
 */
class GameServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register GameRegistry as a singleton
        $this->app->singleton(GameRegistry::class, function ($app) {
            return GameRegistry::getInstance();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $registry = GameRegistry::getInstance();

        // Register all game engines
        // To add a new game, just add one line here!
        $registry->register(new WarEngine());
        $registry->register(new SwoopEngine());
        $registry->register(new OhHellEngine());
    }
}
