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
        $this->combatResolver = new CombatResolver($this->cardManager, $this->pieceManager);
        $this->winConditionChecker = new WinConditionChecker($this->cardManager, $this->pieceManager);
    }

    /**
     * Get the game type identifier
     */
    public function getGameType(): string
    {
        return 'WAR_IN_HEAVEN';
    }

    /**
     * Get human-readable name
     */
    public function getName(): string
    {
        return 'War in Heaven';
    }

    /**
     * Get game configuration
     */
    public function getConfig(): array
    {
        return [
            'minPlayers' => 2,
            'maxPlayers' => 2,
            'description' => 'Asymmetrical hex-based strategy game with unique factions and abilities',
            'difficulty' => 'Hard',
            'estimatedDuration' => '45-60 minutes',
            'requiresStrategy' => true,
        ];
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
        $factions = ['angels', 'demons'];
        shuffle($factions); // Random faction assignment

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

        // Draw initial hands (3 cards each)
        $cardStates = $this->cardManager->drawCards($cardStates, 'angels', 3);
        $cardStates = $this->cardManager->drawCards($cardStates, 'demons', 3);

        // Deploy commanders and troops to starting positions
        $cardStates = $this->cardManager->playCard($cardStates, 'angels', 'angel_michael');
        $cardStates = $this->cardManager->playCard($cardStates, 'angels', 'angel_militia');
        $cardStates = $this->cardManager->playCard($cardStates, 'demons', 'demon_lucifer');
        $cardStates = $this->cardManager->playCard($cardStates, 'demons', 'demon_fallen');

        // Place commanders and troops on board
        // Angels start at top (A1, B1 deployment zone)
        $boardState = $this->pieceManager->deployToken($boardState, 'A1', [
            'id' => 'token_michael',
            'cardId' => 'angel_michael',
            'faction' => 'angels',
            'subtype' => 'commander',
            'attack' => 5,
            'defense' => 6,
            'isActive' => true,
        ]);

        // Deploy 4 angel militia troops
        $angelTroopPositions = ['B1', 'A2', 'B2', 'C2'];
        foreach ($angelTroopPositions as $index => $pos) {
            $boardState = $this->pieceManager->deployToken($boardState, $pos, [
                'id' => 'token_militia_' . $index,
                'cardId' => 'angel_militia',
                'faction' => 'angels',
                'subtype' => 'troop',
                'attack' => 1,
                'defense' => 1,
                'isActive' => true,
            ]);
        }

        // Demons start at bottom (A9, B9 deployment zone)
        $boardState = $this->pieceManager->deployToken($boardState, 'B9', [
            'id' => 'token_lucifer',
            'cardId' => 'demon_lucifer',
            'faction' => 'demons',
            'subtype' => 'commander',
            'attack' => 5,
            'defense' => 6,
            'isActive' => true,
        ]);

        // Deploy 4 fallen angel troops
        $demonTroopPositions = ['A9', 'A8', 'B8', 'C8'];
        foreach ($demonTroopPositions as $index => $pos) {
            $boardState = $this->pieceManager->deployToken($boardState, $pos, [
                'id' => 'token_fallen_' . $index,
                'cardId' => 'demon_fallen',
                'faction' => 'demons',
                'subtype' => 'troop',
                'attack' => 1,
                'defense' => 1,
                'isActive' => true,
            ]);
        }

        return [
            'gameType' => $this->getGameType(),
            'status' => 'READY',

            // Players
            'players' => $playerStates,
            'currentTurn' => 0, // Player 0 (angels) starts
            'phase' => 'recharge', // recharge, action, combat, end
            'round' => 1,
            'actionsRemaining' => 3, // 3 actions per turn
            'rechargesRemaining' => 2, // 2 recharges per turn

            // Board state
            'board' => $boardState,

            // Card state
            'cards' => $cardStates,

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
            'DEPLOY_TOKEN' => $this->moveValidator->validateCardPlay($state, $move, $playerIndex),
            'ATTACK' => $this->moveValidator->validateAttack($state, $move, $playerIndex),
            'RECHARGE' => $this->moveValidator->validateRecharge($state, $move['coordinate'] ?? '', $playerIndex),
            'END_PHASE' => ValidationResult::valid(),
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
            'DEPLOY_TOKEN' => $this->applyTokenDeployment($state, $move, $playerIndex),
            'ATTACK' => $this->applyAttack($state, $move, $playerIndex),
            'RECHARGE' => $this->applyRecharge($state, $move, $playerIndex),
            'END_PHASE' => $this->applyEndPhase($state, $playerIndex),
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
    public function checkGameOver(array $state): array
    {
        $result = $this->winConditionChecker->check($state);

        if ($result === null) {
            return ['isOver' => false];
        }

        return [
            'isOver' => true,
            'winner' => $result['winnerIndex'] ?? null,
            'placements' => null,
            'condition' => $result['condition'] ?? null,
            'faction' => $result['winner'] ?? null,
        ];
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
        $state['actionsRemaining'] = max(0, $state['actionsRemaining'] - 1);

        return $state;
    }

    /**
     * Apply token deployment to game state
     */
    private function applyTokenDeployment(array $state, array $move, int $playerIndex): array
    {
        $faction = $state['players'][$playerIndex]['faction'];
        $cardId = $move['cardId'];
        $to = $move['to'];

        // Get card data
        $card = $this->cardManager->getCard($state['cards'], $cardId);
        if (!$card) {
            return $state;
        }

        // Deploy card (mark as deployed)
        $state['cards'] = $this->cardManager->playCard($state['cards'], $faction, $cardId);

        // Create token from card data
        $tokenData = [
            'id' => 'token_' . $cardId . '_' . time(),
            'cardId' => $cardId,
            'faction' => $faction,
            'subtype' => $card['subtype'],
            'attack' => $card['attack'],
            'defense' => $card['defense'],
            'isActive' => false, // Deployed tokens start depleted
        ];

        // Place token on board
        $state['board'] = $this->pieceManager->deployToken($state['board'], $to, $tokenData);
        $state['actionsRemaining'] = max(0, $state['actionsRemaining'] - 1);

        return $state;
    }

    /**
     * Apply attack action to game state
     */
    private function applyAttack(array $state, array $move, int $playerIndex): array
    {
        $attackers = $move['attackers'] ?? [];
        $target = $move['target'];

        // Resolve multi-attacker combat
        $combatResult = $this->combatResolver->resolveMultiAttack($attackers, $target, $state);

        // Apply combat result (handles elimination and depleting attackers)
        $state = $this->combatResolver->applyCombatResult($state, $combatResult, $attackers, $target);

        return $state;
    }

    /**
     * Apply recharge action to game state
     */
    private function applyRecharge(array $state, array $move, int $playerIndex): array
    {
        $coordinate = $move['coordinate'];

        $state['board'] = $this->pieceManager->rechargeToken($state['board'], $coordinate);
        $state['rechargesRemaining'] = max(0, $state['rechargesRemaining'] - 1);

        return $state;
    }

    /**
     * End the current phase
     */
    private function applyEndPhase(array $state, int $playerIndex): array
    {
        $currentPhase = $state['phase'];

        // Transition to next phase
        $phaseOrder = ['recharge', 'action', 'combat', 'end'];
        $currentIndex = array_search($currentPhase, $phaseOrder);
        $nextIndex = ($currentIndex + 1) % count($phaseOrder);

        $state['phase'] = $phaseOrder[$nextIndex];

        // Reset phase-specific counters
        if ($state['phase'] === 'action') {
            $state['actionsRemaining'] = 3;
        }

        return $state;
    }

    /**
     * End the current player's turn
     */
    private function applyEndTurn(array $state, int $playerIndex): array
    {
        // Recharge all tokens for current player
        $faction = $state['players'][$playerIndex]['faction'];
        foreach ($state['board'] as $coordinate => $hex) {
            if ($hex['occupiedBy'] && $hex['occupiedBy']['faction'] === $faction) {
                $state['board'] = $this->pieceManager->rechargeToken($state['board'], $coordinate);
            }
        }

        // Advance to next player
        $state['currentTurn'] = ($state['currentTurn'] + 1) % count($state['players']);

        // If back to player 0, increment round
        if ($state['currentTurn'] === 0) {
            $state['round']++;
        }

        // Reset phase to recharge
        $state['phase'] = 'recharge';
        $state['rechargesRemaining'] = 2;
        $state['actionsRemaining'] = 3;

        // Draw 1 card for new turn
        $newFaction = $state['players'][$state['currentTurn']]['faction'];
        $state['cards'] = $this->cardManager->drawCards($state['cards'], $newFaction, 1);

        return $state;
    }

    /**
     * Get player-specific view of the game state
     */
    public function getPlayerView(array $state, int $playerIndex): array
    {
        // Clone state to avoid modifying original
        $viewState = $state;

        // Hide opponent's hand cards
        $playerFaction = $state['players'][$playerIndex]['faction'];

        foreach ($viewState['cards'] as $faction => &$cardState) {
            if ($faction !== $playerFaction) {
                // Hide opponent's hand, but show hand count
                $handCount = count($cardState['hand'] ?? []);
                $cardState['hand'] = array_fill(0, $handCount, ['hidden' => true]);
            }
        }

        return $viewState;
    }

    /**
     * Serialize game state for storage
     */
    public function serializeState(array $state): string
    {
        return json_encode($state);
    }

    /**
     * Deserialize game state from storage
     */
    public function deserializeState(string $state): array
    {
        return json_decode($state, true);
    }
}
