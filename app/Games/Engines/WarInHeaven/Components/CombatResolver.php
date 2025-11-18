<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Combat Resolver Component
 *
 * Handles combat resolution between pieces
 */
class CombatResolver
{
    private CardManager $cardManager;

    public function __construct(CardManager $cardManager)
    {
        $this->cardManager = $cardManager;
    }

    /**
     * Resolve combat between attacker and defender
     *
     * @param array $attacker Attacker piece data
     * @param array $defender Defender piece data
     * @param array $state Full game state (for card effects, etc.)
     * @return array Combat result
     */
    public function resolve(array $attacker, array $defender, array $state): array
    {
        // Base combat values
        $attackPower = $attacker['attack'] ?? 1;
        $defensePower = $defender['defense'] ?? 1;

        // TODO: Apply card modifiers
        // TODO: Apply terrain modifiers
        // TODO: Apply special abilities

        // Calculate damage
        $damageToDefender = max(0, $attackPower - $defensePower);
        $damageToAttacker = 0; // Attacker might take counter-attack damage

        // Apply damage
        $defenderHealth = ($defender['health'] ?? 1) - $damageToDefender;
        $attackerHealth = ($attacker['health'] ?? 1) - $damageToAttacker;

        return [
            'attackerHealth' => max(0, $attackerHealth),
            'defenderHealth' => max(0, $defenderHealth),
            'attackerEliminated' => $attackerHealth <= 0,
            'defenderEliminated' => $defenderHealth <= 0,
            'damageDealt' => $damageToDefender,
            'damageTaken' => $damageToAttacker,
        ];
    }

    /**
     * Calculate combat preview (for UI)
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
}
