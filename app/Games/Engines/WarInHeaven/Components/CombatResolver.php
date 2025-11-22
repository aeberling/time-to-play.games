<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Combat Resolver Component
 *
 * Handles combat resolution for War in Heaven:
 * - Multiple attackers can attack one defender
 * - Gabriel/Baal provide combat bonuses
 * - Simple damage calculation: Total Attack - Defense
 * - Binary elimination (no health tracking)
 */
class CombatResolver
{
    private CardManager $cardManager;
    private PieceManager $pieceManager;

    public function __construct(CardManager $cardManager, PieceManager $pieceManager)
    {
        $this->cardManager = $cardManager;
        $this->pieceManager = $pieceManager;
    }

    /**
     * Resolve combat with multiple attackers vs one defender
     *
     * @param array $attackerPositions Array of hex coordinates with attacking tokens
     * @param string $defenderPosition Hex coordinate of defender
     * @param array $state Full game state
     * @return array Combat result with elimination status
     */
    public function resolveMultiAttack(array $attackerPositions, string $defenderPosition, array $state): array
    {
        $board = $state['board'];

        // Get defender token
        $defender = $board[$defenderPosition]['occupiedBy'] ?? null;
        if (!$defender) {
            return [
                'defenderEliminated' => false,
                'totalAttack' => 0,
                'defense' => 0,
                'damage' => 0,
                'error' => 'No defender at target position',
            ];
        }

        // Get all attacker tokens
        $attackers = [];
        foreach ($attackerPositions as $pos) {
            $token = $board[$pos]['occupiedBy'] ?? null;
            if ($token) {
                $attackers[] = [
                    'position' => $pos,
                    'token' => $token,
                ];
            }
        }

        if (empty($attackers)) {
            return [
                'defenderEliminated' => false,
                'totalAttack' => 0,
                'defense' => 0,
                'damage' => 0,
                'error' => 'No valid attackers',
            ];
        }

        // Calculate total attack with bonuses
        $totalAttack = 0;
        $defenderFaction = $defender['faction'];
        $attackerFaction = $attackers[0]['token']['faction']; // All attackers same faction

        // Check for Gabriel/Baal bonuses
        $gabrielOnField = $this->isCardDeployedOnBoard($state, 'angels', 'angel_gabriel');
        $baalOnField = $this->isCardDeployedOnBoard($state, 'demons', 'demon_baal');

        foreach ($attackers as $attackerData) {
            $token = $attackerData['token'];
            $attack = $token['attack'] ?? 1;

            // Apply Gabriel bonus: +2 Attack to all Angel troops
            if ($gabrielOnField && $attackerFaction === 'angels' && ($token['subtype'] ?? '') === 'troop') {
                $attack += 2;
            }

            // Apply Baal bonus: +2 Attack to Lucifer (demon commander)
            if ($baalOnField && ($token['cardId'] ?? '') === 'demon_lucifer') {
                $attack += 2;
            }

            $totalAttack += $attack;
        }

        // Calculate defender's defense with bonuses
        $defense = $defender['defense'] ?? 1;

        // Apply Gabriel bonus: +2 Defense to all Angel troops
        if ($gabrielOnField && $defenderFaction === 'angels' && ($defender['subtype'] ?? '') === 'troop') {
            $defense += 2;
        }

        // Apply Baal bonus: +2 Defense to Lucifer
        if ($baalOnField && ($defender['cardId'] ?? '') === 'demon_lucifer') {
            $defense += 2;
        }

        // Calculate damage: Attack - Defense
        $damage = max(0, $totalAttack - $defense);

        // In War in Heaven, any damage > 0 eliminates the defender
        $defenderEliminated = $damage > 0;

        return [
            'defenderEliminated' => $defenderEliminated,
            'totalAttack' => $totalAttack,
            'defense' => $defense,
            'damage' => $damage,
            'attackerCount' => count($attackers),
            'hadGabrielBonus' => $gabrielOnField && $defenderFaction === 'angels',
            'hadBaalBonus' => $baalOnField && ($defenderFaction === 'demons' && ($defender['cardId'] ?? '') === 'demon_lucifer'),
        ];
    }

    /**
     * Resolve combat between single attacker and defender (legacy support)
     *
     * @param array $attacker Attacker piece data
     * @param array $defender Defender piece data
     * @param array $state Full game state
     * @return array Combat result
     */
    public function resolve(array $attacker, array $defender, array $state): array
    {
        $attackPower = $attacker['attack'] ?? 1;
        $defensePower = $defender['defense'] ?? 1;

        // Check for combat bonuses
        $gabrielOnField = $this->isCardDeployedOnBoard($state, 'angels', 'angel_gabriel');
        $baalOnField = $this->isCardDeployedOnBoard($state, 'demons', 'demon_baal');

        $attackerFaction = $attacker['faction'];
        $defenderFaction = $defender['faction'];

        // Apply Gabriel bonus to attacker
        if ($gabrielOnField && $attackerFaction === 'angels' && ($attacker['subtype'] ?? '') === 'troop') {
            $attackPower += 2;
        }

        // Apply Baal bonus to attacker
        if ($baalOnField && ($attacker['cardId'] ?? '') === 'demon_lucifer') {
            $attackPower += 2;
        }

        // Apply Gabriel bonus to defender
        if ($gabrielOnField && $defenderFaction === 'angels' && ($defender['subtype'] ?? '') === 'troop') {
            $defensePower += 2;
        }

        // Apply Baal bonus to defender
        if ($baalOnField && ($defender['cardId'] ?? '') === 'demon_lucifer') {
            $defensePower += 2;
        }

        // Calculate damage
        $damageToDefender = max(0, $attackPower - $defensePower);
        $defenderEliminated = $damageToDefender > 0;

        return [
            'attackerHealth' => 1, // Not used in War in Heaven
            'defenderHealth' => $defenderEliminated ? 0 : 1,
            'attackerEliminated' => false, // Attackers never eliminated from combat
            'defenderEliminated' => $defenderEliminated,
            'damageDealt' => $damageToDefender,
            'damageTaken' => 0, // No counter-attack
            'totalAttack' => $attackPower,
            'defense' => $defensePower,
        ];
    }

    /**
     * Calculate combat preview for UI (multi-attacker)
     *
     * @param array $attackerPositions Array of attacker hex coordinates
     * @param string $defenderPosition Defender hex coordinate
     * @param array $state Full game state
     * @return array Predicted combat outcome
     */
    public function previewMultiAttack(array $attackerPositions, string $defenderPosition, array $state): array
    {
        return $this->resolveMultiAttack($attackerPositions, $defenderPosition, $state);
    }

    /**
     * Calculate combat preview for UI (single attacker)
     *
     * @param array $attacker Attacker piece data
     * @param array $defender Defender piece data
     * @param array $state Full game state
     * @return array Predicted combat outcome
     */
    public function preview(array $attacker, array $defender, array $state): array
    {
        return $this->resolve($attacker, $defender, $state);
    }

    /**
     * Apply combat result to game state
     *
     * @param array $state Current game state
     * @param array $combatResult Result from resolveMultiAttack()
     * @param array $attackerPositions Positions of attacking tokens
     * @param string $defenderPosition Position of defender
     * @return array Updated game state
     */
    public function applyCombatResult(array $state, array $combatResult, array $attackerPositions, string $defenderPosition): array
    {
        // Mark all attackers as depleted
        foreach ($attackerPositions as $pos) {
            if (isset($state['board'][$pos]['occupiedBy'])) {
                $state['board'][$pos]['occupiedBy']['isActive'] = false;
            }
        }

        // Remove defender if eliminated
        if ($combatResult['defenderEliminated']) {
            $defender = $state['board'][$defenderPosition]['occupiedBy'] ?? null;

            // Remove token from board
            $state['board'][$defenderPosition]['occupiedBy'] = null;

            // Discard the defender's card if it was eliminated
            if ($defender) {
                $cardId = $defender['cardId'] ?? null;
                $faction = $defender['faction'] ?? null;

                if ($cardId && $faction) {
                    $state['cards'] = $this->cardManager->discardCard($state['cards'], $faction, $cardId);
                }
            }
        }

        return $state;
    }

    /**
     * Check if a specific card is deployed on the battlefield
     *
     * @param array $state Game state
     * @param string $faction Faction to check
     * @param string $cardId Card ID to look for
     * @return bool True if card is deployed and has token on board
     */
    private function isCardDeployedOnBoard(array $state, string $faction, string $cardId): bool
    {
        // Check if card is in deployed pile
        if (!$this->cardManager->isCardDeployed($state['cards'], $faction, $cardId)) {
            return false;
        }

        // Check if there's a token from this card on the board
        foreach ($state['board'] as $hex) {
            $token = $hex['occupiedBy'] ?? null;
            if ($token && ($token['cardId'] ?? '') === $cardId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get combat strength preview for a token (for UI display)
     *
     * @param array $token Token data
     * @param array $state Game state
     * @param bool $isAttacking True if calculating attack strength
     * @return int Effective combat value with bonuses
     */
    public function getCombatStrength(array $token, array $state, bool $isAttacking = true): int
    {
        $value = $isAttacking ? ($token['attack'] ?? 1) : ($token['defense'] ?? 1);
        $faction = $token['faction'] ?? '';
        $cardId = $token['cardId'] ?? '';
        $subtype = $token['subtype'] ?? '';

        // Check for Gabriel/Baal bonuses
        $gabrielOnField = $this->isCardDeployedOnBoard($state, 'angels', 'angel_gabriel');
        $baalOnField = $this->isCardDeployedOnBoard($state, 'demons', 'demon_baal');

        // Gabriel bonus: +2 to angel troops
        if ($gabrielOnField && $faction === 'angels' && $subtype === 'troop') {
            $value += 2;
        }

        // Baal bonus: +2 to Lucifer
        if ($baalOnField && $cardId === 'demon_lucifer') {
            $value += 2;
        }

        return $value;
    }
}
