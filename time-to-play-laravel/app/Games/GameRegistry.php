<?php

namespace App\Games;

use App\Games\Contracts\GameEngineInterface;

/**
 * Registry for all available game engines
 * Singleton pattern ensures consistent game engine instances across the application
 */
class GameRegistry
{
    private static ?self $instance = null;

    /**
     * @var array<string, GameEngineInterface>
     */
    private array $engines = [];

    /**
     * Private constructor for singleton pattern
     */
    private function __construct()
    {
    }

    /**
     * Get the singleton instance
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Register a game engine
     */
    public function register(GameEngineInterface $engine): void
    {
        $gameType = $engine->getGameType();

        if (isset($this->engines[$gameType])) {
            throw new \RuntimeException("Game engine '{$gameType}' is already registered");
        }

        $this->engines[$gameType] = $engine;
    }

    /**
     * Get a game engine by type
     *
     * @throws \InvalidArgumentException if game type not found
     */
    public function get(string $gameType): GameEngineInterface
    {
        if (!isset($this->engines[$gameType])) {
            throw new \InvalidArgumentException("Game engine '{$gameType}' not found");
        }

        return $this->engines[$gameType];
    }

    /**
     * Check if a game type is registered
     */
    public function has(string $gameType): bool
    {
        return isset($this->engines[$gameType]);
    }

    /**
     * Get all registered game types
     *
     * @return array<string>
     */
    public function getAvailableGameTypes(): array
    {
        return array_keys($this->engines);
    }

    /**
     * Get all registered engines
     *
     * @return array<string, GameEngineInterface>
     */
    public function all(): array
    {
        return $this->engines;
    }

    /**
     * Get basic info about all available games
     *
     * @return array<array{type: string, name: string, config: array}>
     */
    public function getGamesList(): array
    {
        $games = [];

        foreach ($this->engines as $engine) {
            $games[] = [
                'type' => $engine->getGameType(),
                'name' => $engine->getName(),
                'config' => $engine->getConfig(),
            ];
        }

        return $games;
    }

    /**
     * Clear all registered engines (useful for testing)
     */
    public function clear(): void
    {
        $this->engines = [];
    }

    /**
     * Prevent cloning
     */
    private function __clone()
    {
    }

    /**
     * Prevent unserialization
     */
    public function __wakeup()
    {
        throw new \RuntimeException("Cannot unserialize singleton");
    }
}
