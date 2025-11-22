<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Win Condition Checker Component
 *
 * Checks all victory conditions for War in Heaven:
 * 1. Commander Elimination (immediate victory)
 * 2. Zadkiel Special: Angels control all 4 Pearly Gates
 * 3. Beelzebub Special: All Demon allies on battlefield
 */
class WinConditionChecker
{
    private CardManager $cardManager;
    private PieceManager $pieceManager;

    public function __construct(CardManager $cardManager, PieceManager $pieceManager)
    {
        $this->cardManager = $cardManager;
        $this->pieceManager = $pieceManager;
    }

    /**
     * Check if game is over and determine winner
     *
     * @param array $state Full game state
     * @return array|null Victory data or null if game continues
     */
    public function check(array $state): ?array
    {
        // Check commander elimination (highest priority)
        $commanderResult = $this->checkCommanderElimination($state);
        if ($commanderResult) {
            return $commanderResult;
        }

        // Check Zadkiel victory: Angels control all 4 Pearly Gates
        $zadkielResult = $this->checkZadkielVictory($state);
        if ($zadkielResult) {
            return $zadkielResult;
        }

        // Check Beelzebub victory: All demon allies on battlefield
        $beelzebubResult = $this->checkBeelzebubVictory($state);
        if ($beelzebubResult) {
            return $beelzebubResult;
        }

        return null; // Game continues
    }

    /**
     * Check for commander elimination victory
     *
     * The game ends immediately when either commander (Michael or Lucifer) is eliminated
     */
    private function checkCommanderElimination(array $state): ?array
    {
        $michaelOnBoard = $this->isCardOnBoard($state, 'angel_michael');
        $luciferOnBoard = $this->isCardOnBoard($state, 'demon_lucifer');

        // Michael eliminated - Demons win
        if (!$michaelOnBoard) {
            return [
                'condition' => 'COMMANDER_ELIMINATION',
                'winner' => 'demons',
                'winnerIndex' => $this->getFactionPlayerIndex($state, 'demons'),
                'description' => 'Michael has been eliminated',
            ];
        }

        // Lucifer eliminated - Angels win
        if (!$luciferOnBoard) {
            return [
                'condition' => 'COMMANDER_ELIMINATION',
                'winner' => 'angels',
                'winnerIndex' => $this->getFactionPlayerIndex($state, 'angels'),
                'description' => 'Lucifer has been eliminated',
            ];
        }

        return null;
    }

    /**
     * Check Zadkiel special victory condition
     *
     * Angels WIN if Zadkiel is on the battlefield and they control all 4 Pearly Gate spaces
     * (A5, B5, C5, D5)
     */
    private function checkZadkielVictory(array $state): ?array
    {
        // Zadkiel must be on the battlefield
        if (!$this->isCardOnBoard($state, 'angel_zadkiel')) {
            return null;
        }

        $gateHexes = ['A5', 'B5', 'C5', 'D5'];
        $allGatesControlled = true;

        foreach ($gateHexes as $hex) {
            $token = $state['board'][$hex]['occupiedBy'] ?? null;

            // Gate must be occupied by an angel token
            if (!$token || $token['faction'] !== 'angels') {
                $allGatesControlled = false;
                break;
            }
        }

        if ($allGatesControlled) {
            return [
                'condition' => 'ZADKIEL_VICTORY',
                'winner' => 'angels',
                'winnerIndex' => $this->getFactionPlayerIndex($state, 'angels'),
                'description' => 'Angels control all 4 Pearly Gates with Zadkiel on the battlefield',
            ];
        }

        return null;
    }

    /**
     * Check Beelzebub special victory condition
     *
     * Demons WIN if all demon allies are on the battlefield
     * Allies are the 7 cards: Leviathen, Asmodeus, Belphegor, Beelzebub, Mammon, Baal
     * (Note: Lucifer is commander, Fallen Angels are troops, not counted as allies)
     */
    private function checkBeelzebubVictory(array $state): ?array
    {
        // Beelzebub must be on the battlefield for this victory condition
        if (!$this->isCardOnBoard($state, 'demon_beelzebub')) {
            return null;
        }

        // All demon allies (excluding commander and troops)
        $demonAllies = [
            'demon_leviathen',
            'demon_asmodeus',
            'demon_belphegor',
            'demon_beelzebub',
            'demon_mammon',
            'demon_baal',
        ];

        $allAlliesOnBoard = true;

        foreach ($demonAllies as $allyCardId) {
            if (!$this->isCardOnBoard($state, $allyCardId)) {
                $allAlliesOnBoard = false;
                break;
            }
        }

        if ($allAlliesOnBoard) {
            return [
                'condition' => 'BEELZEBUB_VICTORY',
                'winner' => 'demons',
                'winnerIndex' => $this->getFactionPlayerIndex($state, 'demons'),
                'description' => 'All demon allies are on the battlefield',
            ];
        }

        return null;
    }

    /**
     * Check if a specific card has at least one token on the board
     *
     * @param array $state Game state
     * @param string $cardId Card ID to check
     * @return bool True if card has token on board
     */
    private function isCardOnBoard(array $state, string $cardId): bool
    {
        foreach ($state['board'] as $hex) {
            $token = $hex['occupiedBy'] ?? null;
            if ($token && ($token['cardId'] ?? '') === $cardId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get player index for a faction
     *
     * @param array $state Game state
     * @param string $faction Faction name (angels/demons)
     * @return int Player index
     */
    private function getFactionPlayerIndex(array $state, string $faction): int
    {
        foreach ($state['players'] as $index => $player) {
            if ($player['faction'] === $faction) {
                return $index;
            }
        }

        return 0;
    }

    /**
     * Get gate control status for UI display
     *
     * @param array $state Game state
     * @return array Gate control info
     */
    public function getGateControlStatus(array $state): array
    {
        $gateHexes = ['A5', 'B5', 'C5', 'D5'];
        $angelGates = 0;
        $demonGates = 0;
        $neutralGates = 0;

        foreach ($gateHexes as $hex) {
            $token = $state['board'][$hex]['occupiedBy'] ?? null;

            if (!$token) {
                $neutralGates++;
            } elseif ($token['faction'] === 'angels') {
                $angelGates++;
            } elseif ($token['faction'] === 'demons') {
                $demonGates++;
            }
        }

        return [
            'angelGates' => $angelGates,
            'demonGates' => $demonGates,
            'neutralGates' => $neutralGates,
            'totalGates' => 4,
        ];
    }

    /**
     * Get deployed allies count for UI display
     *
     * @param array $state Game state
     * @param string $faction Faction to check
     * @return array Ally deployment info
     */
    public function getAllyDeploymentStatus(array $state, string $faction): array
    {
        $allAllyCardIds = [];

        if ($faction === 'angels') {
            $allAllyCardIds = [
                'angel_uriel',
                'angel_camiel',
                'angel_jophiel',
                'angel_zadkiel',
                'angel_raphael',
                'angel_gabriel',
            ];
        } elseif ($faction === 'demons') {
            $allAllyCardIds = [
                'demon_leviathen',
                'demon_asmodeus',
                'demon_belphegor',
                'demon_beelzebub',
                'demon_mammon',
                'demon_baal',
            ];
        }

        $deployedCount = 0;

        foreach ($allAllyCardIds as $cardId) {
            if ($this->isCardOnBoard($state, $cardId)) {
                $deployedCount++;
            }
        }

        return [
            'deployedAllies' => $deployedCount,
            'totalAllies' => count($allAllyCardIds),
            'allDeployed' => $deployedCount === count($allAllyCardIds),
        ];
    }
}
