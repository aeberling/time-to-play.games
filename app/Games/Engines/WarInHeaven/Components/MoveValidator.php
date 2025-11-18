<?php

namespace App\Games\Engines\WarInHeaven\Components;

use App\Games\ValueObjects\ValidationResult;

/**
 * Move Validator Component
 *
 * Validates all player moves including:
 * - Piece movement
 * - Card plays
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
     */
    public function validatePieceMovement(array $state, array $move, int $playerIndex): ValidationResult
    {
        $from = $move['from'];
        $to = $move['to'];

        // Check if source hex exists
        if (!isset($state['board']['hexes'][$from])) {
            return ValidationResult::invalid('Invalid source position');
        }

        // Check if destination hex exists
        if (!isset($state['board']['hexes'][$to])) {
            return ValidationResult::invalid('Invalid destination position');
        }

        // Check if there's a piece at source
        $piece = $state['board']['hexes'][$from]['piece'] ?? null;
        if (!$piece) {
            return ValidationResult::invalid('No piece at source position');
        }

        // Check if piece belongs to current player
        $playerFaction = $state['players'][$playerIndex]['faction'];
        if ($piece['faction'] !== $playerFaction) {
            return ValidationResult::invalid('Piece does not belong to you');
        }

        // Check if piece has already moved this turn
        if ($piece['hasMoved'] ?? false) {
            return ValidationResult::invalid('Piece has already moved this turn');
        }

        // Check if destination is occupied by friendly piece
        $destPiece = $state['board']['hexes'][$to]['piece'] ?? null;
        if ($destPiece && $destPiece['faction'] === $playerFaction) {
            return ValidationResult::invalid('Destination occupied by your piece');
        }

        // Calculate distance
        $fromCoords = HexBoard::parseHexKey($from);
        $toCoords = HexBoard::parseHexKey($to);
        $distance = $this->board->getDistance(
            $fromCoords['q'],
            $fromCoords['r'],
            $toCoords['q'],
            $toCoords['r']
        );

        // Check if distance is within piece's movement range
        $movementRange = $piece['movementRange'] ?? 1;
        if ($distance > $movementRange) {
            return ValidationResult::invalid("Destination too far (max range: {$movementRange})");
        }

        // TODO: Check path for obstacles (depending on piece type)
        // Some pieces might be able to jump, others must have clear path

        return ValidationResult::valid();
    }

    /**
     * Validate card play
     */
    public function validateCardPlay(array $state, array $move, int $playerIndex): ValidationResult
    {
        $cardId = $move['cardId'];
        $playerFaction = $state['players'][$playerIndex]['faction'];

        // Check if card is in player's hand
        $hand = $state['cards'][$playerFaction]['hand'];
        $cardInHand = false;

        foreach ($hand as $card) {
            if ($card['id'] === $cardId) {
                $cardInHand = true;
                break;
            }
        }

        if (!$cardInHand) {
            return ValidationResult::invalid('Card not in hand');
        }

        // TODO: Validate card-specific requirements
        // - Resource cost
        // - Valid targets
        // - Phase restrictions

        return ValidationResult::valid();
    }

    /**
     * Validate attack action
     */
    public function validateAttack(array $state, array $move, int $playerIndex): ValidationResult
    {
        $attackerPos = $move['attacker'];
        $defenderPos = $move['defender'];

        // Check if both positions exist
        if (!isset($state['board']['hexes'][$attackerPos]) || !isset($state['board']['hexes'][$defenderPos])) {
            return ValidationResult::invalid('Invalid position');
        }

        // Check if attacker exists and belongs to player
        $attacker = $state['board']['hexes'][$attackerPos]['piece'] ?? null;
        if (!$attacker) {
            return ValidationResult::invalid('No attacker at position');
        }

        $playerFaction = $state['players'][$playerIndex]['faction'];
        if ($attacker['faction'] !== $playerFaction) {
            return ValidationResult::invalid('Attacker does not belong to you');
        }

        // Check if defender exists
        $defender = $state['board']['hexes'][$defenderPos]['piece'] ?? null;
        if (!$defender) {
            return ValidationResult::invalid('No defender at position');
        }

        // Check if defender is enemy
        if ($defender['faction'] === $playerFaction) {
            return ValidationResult::invalid('Cannot attack your own piece');
        }

        // Check if target is in range
        $attackerCoords = HexBoard::parseHexKey($attackerPos);
        $defenderCoords = HexBoard::parseHexKey($defenderPos);
        $distance = $this->board->getDistance(
            $attackerCoords['q'],
            $attackerCoords['r'],
            $defenderCoords['q'],
            $defenderCoords['r']
        );

        $attackRange = $attacker['attackRange'] ?? 1;
        if ($distance > $attackRange) {
            return ValidationResult::invalid("Target out of range (max range: {$attackRange})");
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

        $pieces = $this->pieceManager->getPiecesForFaction($state['board'], $playerFaction);

        foreach ($pieces as $pieceData) {
            $fromPos = $pieceData['position'];
            $piece = $pieceData['piece'];

            // Skip if piece has already moved
            if ($piece['hasMoved'] ?? false) {
                continue;
            }

            $movementRange = $piece['movementRange'] ?? 1;
            $fromCoords = HexBoard::parseHexKey($fromPos);

            $possibleDestinations = $this->board->getHexesInRange(
                $fromCoords['q'],
                $fromCoords['r'],
                $movementRange
            );

            foreach ($possibleDestinations as $dest) {
                $toPos = "q:{$dest['q']},r:{$dest['r']}";

                $move = [
                    'type' => 'MOVE_PIECE',
                    'from' => $fromPos,
                    'to' => $toPos,
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
        $validMoves = [];
        $playerFaction = $state['players'][$playerIndex]['faction'];

        $hand = $state['cards'][$playerFaction]['hand'];

        foreach ($hand as $card) {
            $move = [
                'type' => 'PLAY_CARD',
                'cardId' => $card['id'],
            ];

            if ($this->validateCardPlay($state, $move, $playerIndex)->isValid()) {
                $validMoves[] = $move;
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
        $enemyFaction = $playerFaction === 'FACTION1' ? 'FACTION2' : 'FACTION1';

        $playerPieces = $this->pieceManager->getPiecesForFaction($state['board'], $playerFaction);
        $enemyPieces = $this->pieceManager->getPiecesForFaction($state['board'], $enemyFaction);

        foreach ($playerPieces as $attackerData) {
            foreach ($enemyPieces as $defenderData) {
                $move = [
                    'type' => 'ATTACK',
                    'attacker' => $attackerData['position'],
                    'defender' => $defenderData['position'],
                ];

                if ($this->validateAttack($state, $move, $playerIndex)->isValid()) {
                    $validMoves[] = $move;
                }
            }
        }

        return $validMoves;
    }
}
