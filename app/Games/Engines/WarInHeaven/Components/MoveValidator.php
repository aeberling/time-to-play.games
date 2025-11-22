<?php

namespace App\Games\Engines\WarInHeaven\Components;

use App\Games\ValueObjects\ValidationResult;

/**
 * Move Validator Component
 *
 * Validates all player moves for War in Heaven including:
 * - 4 different movement types (standard, Uriel/Leviathen, Camiel/Asmodeus, Jophiel/Belphegor)
 * - Token deployment
 * - Attacks
 */
class MoveValidator
{
    private HexBoard $board;
    private PieceManager $pieceManager;

    public function __construct(HexBoard $board, PieceManager $pieceManager)
    {
        $this->board = $board;
        $this->pieceManager = $pieceManager;
    }

    /**
     * Validate piece movement
     *
     * Handles 4 movement types:
     * 1. Standard: 1 space to adjacent hex
     * 2. Uriel/Leviathen: 2 spaces in any direction, can move through occupied
     * 3. Camiel/Asmodeus: Straight line any distance, cannot pass through occupied
     * 4. Jophiel/Belphegor: Standard + push/pull ability
     */
    public function validatePieceMovement(array $state, array $move, int $playerIndex): ValidationResult
    {
        $from = $move['from'];
        $to = $move['to'];

        // Check if source hex exists
        if (!isset($state['board'][$from])) {
            return ValidationResult::invalid('Invalid source position');
        }

        // Check if destination hex exists
        if (!isset($state['board'][$to])) {
            return ValidationResult::invalid('Invalid destination position');
        }

        // Check if there's a token at source
        $token = $state['board'][$from]['occupiedBy'] ?? null;
        if (!$token) {
            return ValidationResult::invalid('No token at source position');
        }

        // Check if token belongs to current player
        $playerFaction = $state['players'][$playerIndex]['faction'];
        if ($token['faction'] !== $playerFaction) {
            return ValidationResult::invalid('Token does not belong to you');
        }

        // Check if token is active (not depleted)
        if (!($token['isActive'] ?? true)) {
            return ValidationResult::invalid('Token is depleted (needs recharge)');
        }

        // Check if it's action phase
        if ($state['phase'] !== 'action') {
            return ValidationResult::invalid('Can only move during action phase');
        }

        // Check if player has actions remaining
        if ($state['actionsRemaining'] <= 0) {
            return ValidationResult::invalid('No actions remaining');
        }

        // Check if destination is occupied by friendly token
        $destToken = $state['board'][$to]['occupiedBy'] ?? null;
        if ($destToken && $destToken['faction'] === $playerFaction) {
            return ValidationResult::invalid('Destination occupied by your token');
        }

        // Validate movement based on token's special ability
        $cardId = $token['cardId'] ?? '';

        // Uriel / Leviathen: Move 2 spaces, can move through occupied
        if (in_array($cardId, ['angel_uriel', 'demon_leviathen'])) {
            $distance = $this->board->getDistance($from, $to);
            if ($distance > 2) {
                return ValidationResult::invalid('Uriel/Leviathen can move max 2 spaces');
            }
            // Can move through occupied hexes, so no path check needed
            return ValidationResult::valid();
        }

        // Camiel / Asmodeus: Move any distance in straight line, cannot pass through occupied
        if (in_array($cardId, ['angel_camiel', 'demon_asmodeus'])) {
            // Check if destination is a gate (cannot move onto gates)
            if ($state['board'][$to]['type'] === 'gate') {
                return ValidationResult::invalid('Camiel/Asmodeus cannot move onto gate spaces');
            }

            // Check if hexes are in a straight line
            if (!$this->areInStraightLine($from, $to, $state['board'])) {
                return ValidationResult::invalid('Camiel/Asmodeus can only move in straight lines');
            }

            // Check that path is clear (no pieces in between)
            if (!$this->isPathClear($from, $to, $state['board'])) {
                return ValidationResult::invalid('Path blocked by another token');
            }

            return ValidationResult::valid();
        }

        // Jophiel / Belphegor: Standard movement (validated below)
        // Note: Push/pull is a separate ability, not part of movement validation

        // Standard movement: 1 space to adjacent hex
        $adjacent = $this->board->getAdjacentHexes($from);
        if (!in_array($to, $adjacent)) {
            return ValidationResult::invalid('Can only move to adjacent hex (1 space)');
        }

        // Destination must be unoccupied or have enemy token (for attack-move)
        if ($destToken && $destToken['faction'] !== $playerFaction) {
            // This would be an attack, not a simple move
            return ValidationResult::invalid('Destination occupied by enemy (use attack action)');
        }

        return ValidationResult::valid();
    }

    /**
     * Validate token deployment
     */
    public function validateCardPlay(array $state, array $move, int $playerIndex): ValidationResult
    {
        $cardId = $move['cardId'];
        $tokenIndex = $move['tokenIndex'] ?? 0;
        $to = $move['to'];

        $playerFaction = $state['players'][$playerIndex]['faction'];

        // Check if card is deployed
        $cardManager = new CardManager();
        if (!$cardManager->isCardDeployed($state['cards'], $playerFaction, $cardId)) {
            return ValidationResult::invalid('Card not deployed');
        }

        // Check if token from this card is already on board
        $token = $this->pieceManager->getTokenAt($state['board'], $to);
        if ($token) {
            return ValidationResult::invalid('Destination hex already occupied');
        }

        // Check if it's action phase
        if ($state['phase'] !== 'action') {
            return ValidationResult::invalid('Can only deploy during action phase');
        }

        // Check if player has actions remaining
        if ($state['actionsRemaining'] <= 0) {
            return ValidationResult::invalid('No actions remaining');
        }

        // Check if deployment hex is valid
        // Standard deployment: Must deploy to own deployment zone
        if ($playerFaction === 'angels' && !in_array($to, ['A1', 'B1'])) {
            return ValidationResult::invalid('Angels must deploy to A1 or B1');
        }
        if ($playerFaction === 'demons' && !in_array($to, ['A9', 'B9'])) {
            return ValidationResult::invalid('Demons must deploy to A9 or B9');
        }

        // TODO: Raphael special ability - can deploy adjacent to any ally
        // Would need to check if cardId is angel_raphael and validate adjacent deployment

        return ValidationResult::valid();
    }

    /**
     * Validate attack action
     */
    public function validateAttack(array $state, array $move, int $playerIndex): ValidationResult
    {
        $attackers = $move['attackers'] ?? [];
        $target = $move['target'];

        if (empty($attackers)) {
            return ValidationResult::invalid('No attackers selected');
        }

        // Check if it's combat phase
        if ($state['phase'] !== 'combat') {
            return ValidationResult::invalid('Can only attack during combat phase');
        }

        $playerFaction = $state['players'][$playerIndex]['faction'];

        // Check target exists and is enemy
        $targetToken = $state['board'][$target]['occupiedBy'] ?? null;
        if (!$targetToken) {
            return ValidationResult::invalid('No token at target position');
        }
        if ($targetToken['faction'] === $playerFaction) {
            return ValidationResult::invalid('Cannot attack your own tokens');
        }

        // Validate each attacker
        foreach ($attackers as $attackerPos) {
            $attackerToken = $state['board'][$attackerPos]['occupiedBy'] ?? null;

            if (!$attackerToken) {
                return ValidationResult::invalid("No token at attacker position {$attackerPos}");
            }

            if ($attackerToken['faction'] !== $playerFaction) {
                return ValidationResult::invalid('Attacker does not belong to you');
            }

            if (!($attackerToken['isActive'] ?? true)) {
                return ValidationResult::invalid('Attacker is depleted (needs recharge)');
            }

            // Check if attacker is adjacent to target
            $adjacent = $this->board->getAdjacentHexes($attackerPos);
            if (!in_array($target, $adjacent)) {
                return ValidationResult::invalid("Attacker at {$attackerPos} not adjacent to target");
            }
        }

        return ValidationResult::valid();
    }

    /**
     * Validate recharge action
     */
    public function validateRecharge(array $state, string $coordinate, int $playerIndex): ValidationResult
    {
        // Check if it's recharge phase
        if ($state['phase'] !== 'recharge') {
            return ValidationResult::invalid('Can only recharge during recharge phase');
        }

        // Check if player has recharges remaining
        if ($state['rechargesRemaining'] <= 0) {
            return ValidationResult::invalid('No recharges remaining');
        }

        $playerFaction = $state['players'][$playerIndex]['faction'];

        // Check if there's a token at position
        $token = $state['board'][$coordinate]['occupiedBy'] ?? null;
        if (!$token) {
            return ValidationResult::invalid('No token at position');
        }

        // Check if token belongs to player
        if ($token['faction'] !== $playerFaction) {
            return ValidationResult::invalid('Token does not belong to you');
        }

        // Check if token is already active
        if ($token['isActive'] ?? true) {
            return ValidationResult::invalid('Token is already active');
        }

        return ValidationResult::valid();
    }

    /**
     * Get all valid piece movements for a player
     */
    public function getAllValidPieceMovements(array $state, int $playerIndex): array
    {
        $validMoves = [];
        $playerFaction = $state['players'][$playerIndex]['faction'];

        $tokens = $this->pieceManager->getTokensForFaction($state['board'], $playerFaction);

        foreach ($tokens as $tokenData) {
            $fromPos = $tokenData['position'];
            $token = $tokenData['token'];

            // Skip if token is not active
            if (!($token['isActive'] ?? true)) {
                continue;
            }

            // Get possible destinations based on token type
            $cardId = $token['cardId'] ?? '';

            if (in_array($cardId, ['angel_uriel', 'demon_leviathen'])) {
                // Can move up to 2 spaces
                $destinations = $this->board->getHexesInRange($fromPos, 2, $state['board']);
            } elseif (in_array($cardId, ['angel_camiel', 'demon_asmodeus'])) {
                // Can move any distance in straight line
                $destinations = $this->getAllStraightLineDestinations($fromPos, $state['board']);
            } else {
                // Standard: 1 space adjacent
                $destinations = $this->board->getAdjacentHexes($fromPos);
            }

            foreach ($destinations as $dest) {
                $move = [
                    'type' => 'MOVE_PIECE',
                    'from' => $fromPos,
                    'to' => $dest,
                ];

                if ($this->validatePieceMovement($state, $move, $playerIndex)->isValid()) {
                    $validMoves[] = $move;
                }
            }
        }

        return $validMoves;
    }

    /**
     * Get all valid card plays for a player
     */
    public function getAllValidCardPlays(array $state, int $playerIndex): array
    {
        // Token deployment validation
        $validMoves = [];
        $playerFaction = $state['players'][$playerIndex]['faction'];

        // Get deployment zones
        $deploymentZones = $playerFaction === 'angels' ? ['A1', 'B1'] : ['A9', 'B9'];

        $cardManager = new CardManager();
        $deployedCards = $cardManager->getDeployedCards($state['cards'], $playerFaction);

        foreach ($deployedCards as $card) {
            // Each card can have multiple tokens
            $tokenCount = $card['tokenCount'] ?? 1;

            for ($i = 0; $i < $tokenCount; $i++) {
                foreach ($deploymentZones as $zone) {
                    $move = [
                        'type' => 'DEPLOY_TOKEN',
                        'cardId' => $card['id'],
                        'tokenIndex' => $i,
                        'to' => $zone,
                    ];

                    if ($this->validateCardPlay($state, $move, $playerIndex)->isValid()) {
                        $validMoves[] = $move;
                    }
                }
            }
        }

        return $validMoves;
    }

    /**
     * Get all valid attacks for a player
     */
    public function getAllValidAttacks(array $state, int $playerIndex): array
    {
        $validMoves = [];
        $playerFaction = $state['players'][$playerIndex]['faction'];
        $enemyFaction = $playerFaction === 'angels' ? 'demons' : 'angels';

        $playerTokens = $this->pieceManager->getTokensForFaction($state['board'], $playerFaction);
        $enemyTokens = $this->pieceManager->getTokensForFaction($state['board'], $enemyFaction);

        // For each enemy token, find all adjacent player tokens that can attack it
        foreach ($enemyTokens as $enemyData) {
            $targetPos = $enemyData['position'];
            $adjacentHexes = $this->board->getAdjacentHexes($targetPos);

            $attackers = [];
            foreach ($adjacentHexes as $hex) {
                $token = $state['board'][$hex]['occupiedBy'] ?? null;
                if ($token && $token['faction'] === $playerFaction && ($token['isActive'] ?? true)) {
                    $attackers[] = $hex;
                }
            }

            if (!empty($attackers)) {
                $validMoves[] = [
                    'type' => 'ATTACK',
                    'attackers' => $attackers,
                    'target' => $targetPos,
                ];
            }
        }

        return $validMoves;
    }

    /**
     * Check if two hexes are in a straight line
     */
    private function areInStraightLine(string $from, string $to, array $board): bool
    {
        // Parse coordinates
        preg_match('/([A-Z])(\d+)/', $from, $fromMatch);
        preg_match('/([A-Z])(\d+)/', $to, $toMatch);

        if (count($fromMatch) !== 3 || count($toMatch) !== 3) {
            return false;
        }

        $fromCol = $fromMatch[1];
        $fromRow = (int)$fromMatch[2];
        $toCol = $toMatch[1];
        $toRow = (int)$toMatch[2];

        // Same column (vertical line)
        if ($fromCol === $toCol) {
            return true;
        }

        // Same row (horizontal line)
        if ($fromRow === $toRow) {
            return true;
        }

        // Diagonal line (column changes by same amount as row)
        $colDiff = abs(ord($toCol) - ord($fromCol));
        $rowDiff = abs($toRow - $fromRow);

        return $colDiff === $rowDiff;
    }

    /**
     * Check if path between two hexes is clear (no occupied hexes in between)
     */
    private function isPathClear(string $from, string $to, array $board): bool
    {
        // Get all hexes in the path between from and to (excluding endpoints)
        $path = $this->getHexesInPath($from, $to);

        foreach ($path as $hex) {
            if ($hex !== $from && $hex !== $to) {
                if (isset($board[$hex]['occupiedBy']) && $board[$hex]['occupiedBy'] !== null) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Get all hexes in a path between two positions
     */
    private function getHexesInPath(string $from, string $to): array
    {
        // Simple implementation: just return from and to
        // For a full implementation, would need to trace the path
        return [$from, $to];
    }

    /**
     * Get all possible straight-line destinations from a position
     */
    private function getAllStraightLineDestinations(string $from, array $board): array
    {
        $destinations = [];

        // For simplicity, return all hexes on the board
        // A full implementation would trace each straight line direction
        foreach ($board as $coordinate => $hex) {
            if ($coordinate !== $from && $this->areInStraightLine($from, $coordinate, $board)) {
                $destinations[] = $coordinate;
            }
        }

        return $destinations;
    }
}
