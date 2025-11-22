# War in Heaven - Backend Implementation Guide

## Quick Start for Next Session

### Current Status
- ✅ HexBoard component complete
- ✅ WarInHeaven.tsx multiplayer wrapper complete
- ⚠️ CardManager needs implementation (NEXT)
- ⚠️ Other components pending

### Immediate Next Task
**Implement CardManager.php** - This is the next critical component.

---

## CardManager Implementation Template

Create: `/app/Games/Engines/WarInHeaven/Components/CardManager.php`

```php
<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Card Manager Component
 *
 * Manages cards for both Angel and Demon factions
 */
class CardManager
{
    /**
     * Initialize decks for both factions
     */
    public function initializeDecks(array $factions): array
    {
        $cardState = [];

        foreach ($factions as $faction) {
            $cards = $this->getCardsForFaction($faction);

            $cardState[$faction] = [
                'deck' => $cards,
                'hand' => [],
                'deployed' => [],
                'discarded' => [],
            ];
        }

        return $cardState;
    }

    /**
     * Get all cards for a faction
     */
    private function getCardsForFaction(string $faction): array
    {
        if ($faction === 'angels') {
            return $this->getAngelCards();
        } else {
            return $this->getDemonCards();
        }
    }

    /**
     * Get all Angel cards
     */
    private function getAngelCards(): array
    {
        return [
            // Commander
            [
                'id' => 'angel_michael',
                'name' => 'Michael',
                'cost' => 0,
                'attack' => 5,
                'defense' => 6,
                'subtype' => 'commander',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Michael[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconmichael.png',
                'specialAbility' => 'teleport_ally',
                'specialText' => 'Once per game, may move one of your Allies or Troops on the Battle Field to a space adjacent to Michael.',
                'flavorText' => 'Defender of faith, protector of souls and symbol of divine justice.',
            ],

            // Troops
            [
                'id' => 'angel_militia',
                'name' => "Heaven's Militia",
                'cost' => 0,
                'attack' => 1,
                'defense' => 1,
                'subtype' => 'troop',
                'faction' => 'angels',
                'tokenCount' => 4,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Heaven_s_Militia[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconmilitia.png',
                'specialAbility' => null,
                'specialText' => 'Start the game with 4 Troops on the Battle Field.',
                'flavorText' => 'Symbols of justice and might, deliverers of God\'s Wrath, and the bane of wickedness.',
            ],

            // Allies
            [
                'id' => 'angel_uriel',
                'name' => 'Uriel',
                'cost' => 1,
                'attack' => 3,
                'defense' => 2,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Uriel[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconuriel.png',
                'specialAbility' => 'move_2_spaces',
                'specialText' => 'Moves 2 spaces in any direction. May move through occupied spaces.',
                'flavorText' => 'At least wars can end, diseases can be cured, and evil can be vanquished. But stupidity? That thing is about as ever-lasting as His glory.',
            ],

            [
                'id' => 'angel_gabriel',
                'name' => 'Gabriel',
                'cost' => 1,
                'attack' => 2,
                'defense' => 3,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Gabriel[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/icongabriel.png',
                'specialAbility' => 'combat_bonus',
                'specialText' => '+1 Attack when engaged in combat.',
                'flavorText' => 'Strength and faith. Courage and righteousness. Virtue and glory. The essence of Gabriel.',
            ],

            [
                'id' => 'angel_raphael',
                'name' => 'Raphael',
                'cost' => 1,
                'attack' => 2,
                'defense' => 2,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Raphael[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconraphael.png',
                'specialAbility' => 'free_deploy',
                'specialText' => 'Once per turn, may be deployed from your hand for free to a space adjacent to any of your Allies.',
                'flavorText' => 'Where there is pain, she heals. Where there is sorrow, she comforts. Where there is darkness, she brings light.',
            ],

            [
                'id' => 'angel_camiel',
                'name' => 'Camiel',
                'cost' => 1,
                'attack' => 2,
                'defense' => 3,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Camiel[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconcamiel.png',
                'specialAbility' => 'straight_line_movement',
                'specialText' => 'Can move in a straight line any number of spaces as long as there are no obstacles.',
                'flavorText' => 'In the face of insurmountable adversity, when all hope seems lost, Camiel arrives like a storm to sweep away the darkness.',
            ],

            [
                'id' => 'angel_jophiel',
                'name' => 'Jophiel',
                'cost' => 1,
                'attack' => 3,
                'defense' => 2,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Jophiel[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconjophiel.png',
                'specialAbility' => 'push_pull',
                'specialText' => 'Can push or pull an adjacent enemy token 1 space.',
                'flavorText' => 'Beauty, wisdom, and understanding incarnate. The divine spark that ignites the flame of knowledge.',
            ],

            // Add remaining 9 allies with similar structure
            // Raziel, Sariel, Remiel, Ariel, Haniel, Azrael, Metatron, Sandalphon, Cassiel
        ];
    }

    /**
     * Get all Demon cards
     */
    private function getDemonCards(): array
    {
        return [
            // Commander
            [
                'id' => 'demon_lucifer',
                'name' => 'Lucifer',
                'cost' => 0,
                'attack' => 5,
                'defense' => 6,
                'subtype' => 'commander',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Lucifer[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconlucifer.png',
                'specialAbility' => 'teleport_ally',
                'specialText' => 'Once per game, may move one of your Allies or Troops on the Battle Field to a space adjacent to Lucifer.',
                'flavorText' => 'The Morning Star. The Lightbringer. The First of the Fallen.',
            ],

            // Troops
            [
                'id' => 'demon_legion',
                'name' => 'Legion',
                'cost' => 0,
                'attack' => 1,
                'defense' => 1,
                'subtype' => 'troop',
                'faction' => 'demons',
                'tokenCount' => 4,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Legion[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconlegion.png',
                'specialAbility' => null,
                'specialText' => 'Start the game with 4 Troops on the Battle Field.',
                'flavorText' => 'Countless, relentless, and utterly devoted to their dark master.',
            ],

            // Allies
            [
                'id' => 'demon_leviathen',
                'name' => 'Leviathen',
                'cost' => 1,
                'attack' => 3,
                'defense' => 2,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Leviathen[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconleviathen.png',
                'specialAbility' => 'move_2_spaces',
                'specialText' => 'Moves 2 spaces in any direction. May move through occupied spaces.',
                'flavorText' => 'The great serpent of the deep, ancient beyond reckoning, powerful beyond measure.',
            ],

            [
                'id' => 'demon_baal',
                'name' => 'Baal',
                'cost' => 1,
                'attack' => 2,
                'defense' => 3,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Baal[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconbaal.png',
                'specialAbility' => 'combat_bonus',
                'specialText' => '+1 Attack when engaged in combat.',
                'flavorText' => 'Lord of storms and warfare, master of strategic destruction.',
            ],

            [
                'id' => 'demon_mammon',
                'name' => 'Mammon',
                'cost' => 1,
                'attack' => 2,
                'defense' => 2,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Mammon[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconmammon.png',
                'specialAbility' => 'extra_recharge',
                'specialText' => 'You gain +1 Recharge per turn.',
                'flavorText' => 'Greed incarnate, the demon of material wealth and avarice.',
            ],

            [
                'id' => 'demon_asmodeus',
                'name' => 'Asmodeus',
                'cost' => 1,
                'attack' => 2,
                'defense' => 3,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Asmodeus[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconasmodeus.png',
                'specialAbility' => 'straight_line_movement',
                'specialText' => 'Can move in a straight line any number of spaces as long as there are no obstacles.',
                'flavorText' => 'Prince of lust, king of demons, and master of wrath.',
            ],

            [
                'id' => 'demon_belphegor',
                'name' => 'Belphegor',
                'cost' => 1,
                'attack' => 3,
                'defense' => 2,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Belphegor[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconbelphegor.png',
                'specialAbility' => 'push_pull',
                'specialText' => 'Can push or pull an adjacent enemy token 1 space.',
                'flavorText' => 'The demon of sloth, who tempts mortals with false discoveries and inventions.',
            ],

            // Add remaining 9 allies with similar structure
            // Beelzebub, Azazel, Abaddon, Belial, Lilith, Moloch, Astaroth, Mephistopheles, Sammael
        ];
    }

    /**
     * Draw cards from deck to hand
     */
    public function drawCards(array $cardState, string $faction, int $count): array
    {
        for ($i = 0; $i < $count; $i++) {
            if (count($cardState[$faction]['deck']) > 0) {
                $card = array_shift($cardState[$faction]['deck']);
                $cardState[$faction]['hand'][] = $card;
            }
        }

        return $cardState;
    }

    /**
     * Play a card from hand (deploy it)
     */
    public function playCard(array $cardState, string $faction, string $cardId): array
    {
        $hand = $cardState[$faction]['hand'];

        foreach ($hand as $index => $card) {
            if ($card['id'] === $cardId) {
                // Remove from hand
                unset($cardState[$faction]['hand'][$index]);
                $cardState[$faction]['hand'] = array_values($cardState[$faction]['hand']);

                // Add to deployed
                $cardState[$faction]['deployed'][] = $card;
                break;
            }
        }

        return $cardState;
    }

    /**
     * Discard a card (removed from play)
     */
    public function discardCard(array $cardState, string $faction, string $cardId): array
    {
        // Remove from deployed and add to discarded
        $deployed = $cardState[$faction]['deployed'];

        foreach ($deployed as $index => $card) {
            if ($card['id'] === $cardId) {
                unset($cardState[$faction]['deployed'][$index]);
                $cardState[$faction]['deployed'] = array_values($cardState[$faction]['deployed']);
                $cardState[$faction]['discarded'][] = $card;
                break;
            }
        }

        return $cardState;
    }

    /**
     * Get card by ID
     */
    public function getCard(array $cardState, string $cardId): ?array
    {
        foreach ($cardState as $faction => $state) {
            foreach (array_merge($state['deck'], $state['hand'], $state['deployed']) as $card) {
                if ($card['id'] === $cardId) {
                    return $card;
                }
            }
        }

        return null;
    }
}
```

---

## Movement Validation Reference

### Standard Movement (Most Pieces)
```php
// Check if destination is exactly 1 space away
$adjacent = $this->board->getAdjacentHexes($from);
$isValid = in_array($to, $adjacent);
```

### Uriel/Leviathen Movement (2 spaces, through occupied)
```php
// Can move up to 2 spaces in any direction
$distance = $this->board->getDistance($from, $to);
$isValid = $distance <= 2;
```

### Camiel/Asmodeus Movement (Straight line, any distance)
```php
// Check if hexes are in a straight line
// AND no pieces between them
$hexesInLine = $this->board->getHexesInLine($from, $to);
$pathClear = true;
foreach ($hexesInLine as $hex) {
    if ($hex !== $from && $hex !== $to && $board[$hex]['occupiedBy'] !== null) {
        $pathClear = false;
        break;
    }
}
$isValid = !empty($hexesInLine) && $pathClear;
```

### Jophiel/Belphegor (Standard + Push/Pull)
```php
// Standard movement
$adjacent = $this->board->getAdjacentHexes($from);
$isValid = in_array($to, $adjacent);

// Plus special push/pull ability (separate action)
```

---

## Combat Resolution Reference

```php
public function resolve(array $attacker, array $defender, array $state): array
{
    // Get base attack
    $attack = $attacker['attack'];

    // Check for Gabriel (angels) or Baal (demons) combat bonus
    $attackerFaction = $attacker['faction'];
    $bonusCard = $attackerFaction === 'angels' ? 'angel_gabriel' : 'demon_baal';

    // Check if bonus card is on the battlefield
    $hasCombatBonus = false;
    foreach ($state['board'] as $hex) {
        if ($hex['occupiedBy'] &&
            $hex['occupiedBy']['cardId'] === $bonusCard &&
            $hex['occupiedBy']['isActive']) {
            $hasCombatBonus = true;
            break;
        }
    }

    if ($hasCombatBonus) {
        $attack += 1;
    }

    // Calculate damage
    $defense = $defender['defense'];
    $damage = $attack - $defense;

    // Determine if defender is eliminated
    $defenderEliminated = $damage > 0;

    return [
        'attackerEliminated' => false,
        'defenderEliminated' => $defenderEliminated,
        'attackerHealth' => $attacker['defense'], // Not used in this game
        'defenderHealth' => $defenderEliminated ? 0 : $defender['defense'],
        'damage' => max(0, $damage),
        'combatBonus' => $hasCombatBonus,
    ];
}
```

---

## Gate Control Calculation

```php
public function calculateGateControl(array $state): array
{
    $gateHexes = ['A5', 'B5', 'C5', 'D5'];
    $angelGates = 0;
    $demonGates = 0;

    foreach ($gateHexes as $hex) {
        if ($state['board'][$hex]['occupiedBy']) {
            $faction = $state['board'][$hex]['occupiedBy']['faction'];
            if ($faction === 'angels') {
                $angelGates++;
            } else {
                $demonGates++;
            }
        }
    }

    $controllingFaction = null;
    if ($angelGates === 4) {
        $controllingFaction = 'angels';
    } elseif ($demonGates === 4) {
        $controllingFaction = 'demons';
    }

    return [
        'angels' => $angelGates,
        'demons' => $demonGates,
        'controllingFaction' => $controllingFaction,
    ];
}
```

---

## Starting Game State Example

```php
[
    'gameType' => 'WAR_IN_HEAVEN',
    'status' => 'IN_PROGRESS',

    'players' => [
        [
            'userId' => 1,
            'faction' => 'angels',
            'playerIndex' => 0,
            'isConnected' => true,
        ],
        [
            'userId' => 2,
            'faction' => 'demons',
            'playerIndex' => 1,
            'isConnected' => true,
        ],
    ],

    'currentTurn' => 0, // Angels start
    'phase' => 'recharge', // Phases: recharge, action, combat, end
    'round' => 1,

    'board' => [
        // 29 hexes total
        'A1' => [
            'coordinate' => 'A1',
            'type' => 'deploy',
            'owner' => 'angels',
            'occupiedBy' => null,
        ],
        // ... etc
    ],

    'cards' => [
        'angels' => [
            'deck' => [...], // 16 cards
            'hand' => [],
            'deployed' => [
                // Michael and Militia start deployed
                ['id' => 'angel_michael', ...],
                ['id' => 'angel_militia', ...],
            ],
            'discarded' => [],
        ],
        'demons' => [
            'deck' => [...],
            'hand' => [],
            'deployed' => [
                ['id' => 'demon_lucifer', ...],
                ['id' => 'demon_legion', ...],
            ],
            'discarded' => [],
        ],
    ],

    'actionsRemaining' => 3,
    'rechargesRemaining' => 1,
    'selectedAttackers' => [],
    'combatTarget' => null,
    'combatLog' => [],
    'moveHistory' => [],

    'victoryCondition' => null,
    'winner' => null,
]
```

---

## Testing Commands

### Create Test Game
```php
php artisan tinker

use App\Models\User;
use App\Services\GameService;
use App\Games\GameRegistry;

$user1 = User::first();
$user2 = User::skip(1)->first();

$gameService = app(GameService::class);
$game = $gameService->createGame('WAR_IN_HEAVEN', $user1->id, 2);

// Add second player
$gameService->joinGame($game->id, $user2->id);

// Start game
$gameService->startGame($game->id);

// Check state
$state = json_decode($game->fresh()->current_state, true);
print_r($state);
```

---

## Helpful Queries During Development

```php
// Get current game state
$game = Game::find(1);
$state = json_decode($game->current_state, true);

// Check board
print_r($state['board']['A5']); // Check a gate hex

// Check cards
print_r($state['cards']['angels']['hand']); // Check angel's hand

// Check who's turn
echo "Current turn: " . $state['currentTurn']; // 0 or 1
echo "Faction: " . $state['players'][$state['currentTurn']]['faction'];

// Make a move
use App\Services\GameService;
$gameService = app(GameService::class);
$gameService->makeMove($game->id, $user1->id, [
    'type' => 'MOVE_PIECE',
    'from' => 'A1',
    'to' => 'A2',
]);
```

---

## Common Pitfalls to Avoid

1. **Faction naming:** Backend uses 'angels'/'demons' NOT 'FACTION1'/'FACTION2'
2. **Coordinate format:** Use strings like 'A5' not objects {q:1, r:2}
3. **Token vs Card:** Cards are in hand/deck, Tokens are on the board
4. **Active state:** Tokens can be active or depleted (depleted can't move/attack)
5. **Phase flow:** Must follow recharge → action → combat → end
6. **Move validation:** ALWAYS validate moves before applying them

---

## File Creation Order

1. ✅ HexBoard.php (DONE)
2. ⚠️ CardManager.php (NEXT - use template above)
3. ⚠️ PieceManager.php
4. ⚠️ MoveValidator.php
5. ⚠️ CombatResolver.php
6. ⚠️ WinConditionChecker.php
7. ⚠️ Update WarInHeavenEngine.php to use all components

---

## Questions for User (If Needed)

1. **Remaining cards:** The frontend has 16 cards per faction, but only 7 are fully defined. Should I:
   - Use generic stats for the remaining 9 allies?
   - Wait for card definitions?
   - Copy from game rules document?

2. **Starting setup:** Should starting tokens be pre-placed on the board, or deployed during setup phase?

3. **Special abilities:** Some cards have vague ability descriptions. Need clarification on:
   - Raziel, Sariel, Remiel (angels)
   - Beelzebub, Azazel, Abaddon, Belial, Lilith, Moloch, Astaroth, Mephistopheles, Sammael (demons)

---

## Progress Tracking

Use this checklist to track progress across sessions:

```
Backend Components:
[✅] HexBoard.php
[⚠️] CardManager.php - IN PROGRESS
[⚠️] PieceManager.php
[⚠️] MoveValidator.php
[⚠️] CombatResolver.php
[⚠️] WinConditionChecker.php
[⚠️] WarInHeavenEngine.php updates

Frontend Integration:
[✅] WarInHeaven.tsx wrapper
[⚠️] GameView.tsx refactor
[⚠️] Type definitions
[⚠️] Remove gameStore.ts

Testing:
[⚠️] Unit tests for components
[⚠️] Integration test (create/join/play)
[⚠️] Special abilities test
[⚠️] Victory conditions test
```
