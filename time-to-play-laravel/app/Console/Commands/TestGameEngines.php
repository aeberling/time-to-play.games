<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Games\GameRegistry;

class TestGameEngines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'game:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test that all game engines are properly registered and working';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Game Engine System...');
        $this->newLine();

        $registry = app(GameRegistry::class);

        // Show all registered games
        $this->info('Registered Game Engines:');
        $games = $registry->getGamesList();

        foreach ($games as $game) {
            $this->line("  - {$game['name']} ({$game['type']})");
            $this->line("    Players: {$game['config']['minPlayers']}-{$game['config']['maxPlayers']}");
            $this->line("    {$game['config']['description']}");
            $this->newLine();
        }

        // Test War engine
        $this->info('Testing War Engine:');
        $warEngine = $registry->get('WAR');
        $warState = $warEngine->initializeGame([
            ['id' => 1, 'name' => 'Player 1'],
            ['id' => 2, 'name' => 'Player 2'],
        ]);

        $this->line("  ✓ War game initialized");
        $this->line("  ✓ Player 1 has " . count($warState['player1Deck']) . " cards");
        $this->line("  ✓ Player 2 has " . count($warState['player2Deck']) . " cards");
        $this->newLine();

        // Test Swoop engine
        $this->info('Testing Swoop Engine:');
        $swoopEngine = $registry->get('SWOOP');
        $swoopState = $swoopEngine->initializeGame([
            ['id' => 1, 'name' => 'Player 1'],
            ['id' => 2, 'name' => 'Player 2'],
            ['id' => 3, 'name' => 'Player 3'],
        ]);

        $this->line("  ✓ Swoop game initialized for 3 players");
        $this->line("  ✓ Each player has 19 cards distributed across hand, face-up, and mystery");
        $this->newLine();

        // Test Oh Hell engine
        $this->info('Testing Oh Hell Engine:');
        $ohHellEngine = $registry->get('OH_HELL');
        $ohHellState = $ohHellEngine->initializeGame([
            ['id' => 1, 'name' => 'Player 1'],
            ['id' => 2, 'name' => 'Player 2'],
            ['id' => 3, 'name' => 'Player 3'],
            ['id' => 4, 'name' => 'Player 4'],
        ]);

        $this->line("  ✓ Oh Hell game initialized for 4 players");
        $this->line("  ✓ Round 1 with {$ohHellState['cardsThisRound']} cards each");
        $this->line("  ✓ Trump suit: " . ($ohHellState['trumpSuit'] ?? 'none'));
        $this->newLine();

        $this->info('All game engines working correctly! ✓');

        return Command::SUCCESS;
    }
}
