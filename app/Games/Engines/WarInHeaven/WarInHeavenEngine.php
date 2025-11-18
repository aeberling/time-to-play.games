<?php

namespace App\Games\Engines\WarInHeaven;

use App\Games\Contracts\GameEngineInterface;
use App\Games\Engines\WarInHeaven\Components\HexBoard;
use App\Games\Engines\WarInHeaven\Components\PieceManager;
use App\Games\Engines\WarInHeaven\Components\CardManager;
use App\Games\Engines\WarInHeaven\Components\MoveValidator;
use App\Games\Engines\WarInHeaven\Components\CombatResolver;
use App\Games\Engines\WarInHeaven\Components\WinConditionChecker;
use App\Games\ValueObjects\ValidationResult;

/**
 * War in Heaven - Asymmetrical Hex-Based Strategy Game Engine
 *
 * A 2-player tactical game with hex-based board, unique factions,
 * game pieces, and cards that define piece attributes.
 */
class WarInHeavenEngine implements GameEngineInterface
{
    private HexBoard $board;
    private PieceManager $pieceManager;
    private CardManager $cardManager;
    private MoveValidator $moveValidator;
    private CombatResolver $combatResolver;
    private WinConditionChecker $winConditionChecker;

    public function __construct()
    {
        $this->board = new HexBoard();
        $this->pieceManager = new PieceManager($this->board);
        $this->cardManager = new CardManager();
        $this->moveValidator = new MoveValidator($this->board, $this->pieceManager);
        $this->combatResolver = new CombatResolver($this->cardManager);
        $this->winConditionChecker = new WinConditionChecker();
    }

    /**
     * Get the game type identifier
     */
    public function getGameType(): string
    {
        return 'WAR_IN_HEAVEN';
    }

    /**
     * Initialize a new game state
     *
     * @param array $players Array of player data
     * @param array $options Game configuration options
     * @return array Initial game state
     */
    public function initializeGame(array $players, array $options = []): array
    {
        // Assign factions to players
        $factions = ['FACTION1', 'FACTION2'];
        shuffle($factions); // Random faction assignment (or allow selection)

        $playerStates = [];
        foreach ($players as $index => $player) {
            $playerStates[] = [
                'userId' => $player['id'],
                'faction' => $factions[$index],
                'playerIndex' => $index,
                'isConnected' => true,
            ];
        }

        // Initialize board with starting pieces
        $boardState = $this->board->initializeStandardLayout($factions);

        // Initialize card decks for each faction
        $cardStates = $this->cardManager->initializeDecks($factions);

        return [
            'gameType' => $this->getGameType(),
            'status' => 'READY',

            // Players
            'players' => $playerStates,
            'currentTurn' => 0, // Player 0 starts
            'turnPhase' => 'DRAW', // DRAW, MOVEMENT, COMBAT, END
            'round' => 1,

            // Board state
            'board' => $boardState,

            // Card state
            'cards' => $cardStates,

            // Game resources
            'resources' => [
                'FACTION1' => [
                    'victoryPoints' => 0,
                    'specialResource' => 3, // TODO: Define resource system
                ],
                'FACTION2' => [
                    'victoryPoints' => 0,
                    'specialResource' => 3,
                ],
            ],

            // Move history
            'moveHistory' => [],

            // Victory conditions
            'victoryCondition' => null,
            'winner' => null,

            // Configuration
            'config' => array_merge($this->getDefaultConfig(), $options),
        ];
    }

    /**
     * Validate a move before applying it
     */
    public function validateMove(array $state, array $move, int $playerIndex): ValidationResult
    {
        // Check if it's the player's turn
        if ($state['currentTurn'] !== $playerIndex) {
            return ValidationResult::invalid('Not your turn');
        }

        // Validate based on move type
        $moveType = $move['type'] ?? null;

        return match($moveType) {
            'MOVE_PIECE' => $this->moveValidator->validatePieceMovement($state, $move, $playerIndex),
            'PLAY_CARD' => $this->moveValidator->validateCardPlay($state, $move, $playerIndex),
            'ATTACK' => $this->moveValidator->validateAttack($state, $move, $playerIndex),
            'END_TURN' => ValidationResult::valid(),
            default => ValidationResult::invalid('Unknown move type'),
        };
    }

    /**
     * Apply a validated move to the game state
     */
    public function applyMove(array $state, array $move, int $playerIndex): array
    {
        $moveType = $move['type'];

        $newState = match($moveType) {
            'MOVE_PIECE' => $this->applyPieceMovement($state, $move, $playerIndex),
            'PLAY_CARD' => $this->applyCardPlay($state, $move, $playerIndex),
            'ATTACK' => $this->applyAttack($state, $move, $playerIndex),
            'END_TURN' => $this->applyEndTurn($state, $playerIndex),
            default => $state,
        };

        // Add to move history
        $newState['moveHistory'][] = [
            'turn' => $state['round'],
            'player' => $playerIndex,
            'action' => $moveType,
            'data' => $move,
            'timestamp' => time(),
        ];

        return $newState;
    }

    /**
     * Check if the game is over and determine winner
     */
    public function checkGameOver(array $state): ?array
    {
        return $this->winConditionChecker->check($state);
    }

    /**
     * Get all valid moves for current player
     */
    public function getValidMoves(array $state, int $playerIndex): array
    {
        $validMoves = [];

        // Get valid piece movements
        $pieceMovements = $this->moveValidator->getAllValidPieceMovements($state, $playerIndex);
        $validMoves = array_merge($validMoves, $pieceMovements);

        // Get valid card plays
        $cardPlays = $this->moveValidator->getAllValidCardPlays($state, $playerIndex);
        $validMoves = array_merge($validMoves, $cardPlays);

        // Get valid attacks
        $attacks = $this->moveValidator->getAllValidAttacks($state, $playerIndex);
        $validMoves = array_merge($validMoves, $attacks);

        return $validMoves;
    }

    /**
     * Get default game configuration
     */
    private function getDefaultConfig(): array
    {
        return [
            'boardSize' => 11, // 11x11 hex grid
            'turnTimeLimit' => 300, // 5 minutes per turn
            'victoryPointsToWin' => 10,
            'startingHandSize' => 5,
        ];
    }

    /**
     * Apply piece movement to game state
     */
    private function applyPieceMovement(array $state, array $move, int $playerIndex): array
    {
        $from = $move['from'];
        $to = $move['to'];

        $state['board'] = $this->pieceManager->movePiece($state['board'], $from, $to);

        return $state;
    }

    /**
     * Apply card play to game state
     */
    private function applyCardPlay(array $state, array $move, int $playerIndex): array
    {
        $faction = $state['players'][$playerIndex]['faction'];
        $cardId = $move['cardId'];

        $state['cards'] = $this->cardManager->playCard($state['cards'], $faction, $cardId);

        // Apply card effects (TODO: implement card effect system)

        return $state;
    }

    /**
     * Apply attack action to game state
     */
    private function applyAttack(array $state, array $move, int $playerIndex): array
    {
        $attackerPos = $move['attacker'];
        $defenderPos = $move['defender'];

        $combatResult = $this->combatResolver->resolve(
            $state['board'][$attackerPos]['piece'],
            $state['board'][$defenderPos]['piece'],
            $state
        );

        // Apply combat results to pieces
        if ($combatResult['defenderEliminated']) {
            $state['board'] = $this->pieceManager->removePiece($state['board'], $defenderPos);
        } else {
            // Apply damage
            $state['board'][$defenderPos]['piece']['health'] = $combatResult['defenderHealth'];
        }

        if ($combatResult['attackerEliminated']) {
            $state['board'] = $this->pieceManager->removePiece($state['board'], $attackerPos);
        } else {
            $state['board'][$attackerPos]['piece']['health'] = $combatResult['attackerHealth'];
        }

        return $state;
    }

    /**
     * End the current player's turn
     */
    private function applyEndTurn(array $state, int $playerIndex): array
    {
        // Advance to next player
        $state['currentTurn'] = ($state['currentTurn'] + 1) % count($state['players']);

        // If back to player 0, increment round
        if ($state['currentTurn'] === 0) {
            $state['round']++;
        }

        // Reset turn phase
        $state['turnPhase'] = 'DRAW';

        // Draw cards for new turn
        $faction = $state['players'][$state['currentTurn']]['faction'];
        $state['cards'] = $this->cardManager->drawCards($state['cards'], $faction, 1);

        return $state;
    }
}
