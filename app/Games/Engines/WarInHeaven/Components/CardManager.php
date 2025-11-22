<?php

namespace App\Games\Engines\WarInHeaven\Components;

/**
 * Card Manager Component
 *
 * Manages cards for both Angel and Demon factions
 * Handles deck initialization, drawing, playing, and discarding
 */
class CardManager
{
    /**
     * Initialize decks for both factions
     *
     * @param array $factions Array of faction names (e.g., ['angels', 'demons'])
     * @return array Card state structure for all factions
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
     * Get all Angel cards (9 cards total)
     */
    private function getAngelCards(): array
    {
        return [
            // Commander (Cost 0)
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

            // Troops (Cost 0)
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

            // Allies (Cost 1)
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
                'id' => 'angel_camiel',
                'name' => 'Camiel',
                'cost' => 1,
                'attack' => 6,
                'defense' => 2,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Camiel[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconcamiel.png',
                'specialAbility' => 'straight_line_movement',
                'specialText' => 'Can move any number of spaces in a straight line. Cannot move onto or past Pearly Gate spaces.',
                'flavorText' => 'Strength, courage and war.',
            ],

            // Allies (Cost 2)
            [
                'id' => 'angel_jophiel',
                'name' => 'Jophiel',
                'cost' => 2,
                'attack' => 2,
                'defense' => 4,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Jophiel[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconjophiel.png',
                'specialAbility' => 'pull_troops',
                'specialText' => 'At the end of her move, each opponent\'s Troops in a straight line to her moves one space closer to her.',
                'flavorText' => 'Beauty of God.',
            ],

            [
                'id' => 'angel_zadkiel',
                'name' => 'Zadkiel',
                'cost' => 2,
                'attack' => 1,
                'defense' => 3,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Zadkiel[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconzadkiel.png',
                'specialAbility' => 'gate_victory',
                'specialText' => 'WIN if you control the Pearly Gates by occupying all 4 spaces.',
                'flavorText' => 'The righteousness of God.',
            ],

            // Allies (Cost 3)
            [
                'id' => 'angel_raphael',
                'name' => 'Raphael',
                'cost' => 3,
                'attack' => 0,
                'defense' => 4,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Raphael[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconraphael.png',
                'specialAbility' => 'free_deploy_troop',
                'specialText' => 'At the start of each Round, may Deploy 1 of your ready or depleted Troops to the Battle Field for free.',
                'flavorText' => 'Heal the earth which the fallen angels have defiled.',
            ],

            [
                'id' => 'angel_gabriel',
                'name' => 'Gabriel',
                'cost' => 3,
                'attack' => 3,
                'defense' => 3,
                'subtype' => 'ally',
                'faction' => 'angels',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Gabriel[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/icongabriel.png',
                'specialAbility' => 'bolster_troops',
                'specialText' => 'Bolster your Troops by +2 Attack and +2 Defense.',
                'flavorText' => 'Messenger of God.',
            ],
        ];
    }

    /**
     * Get all Demon cards (9 cards total)
     */
    private function getDemonCards(): array
    {
        return [
            // Commander (Cost 0)
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
                'flavorText' => 'Lucifer was extremely prideful and rebelled against his Father.',
            ],

            // Troops (Cost 0)
            [
                'id' => 'demon_fallen',
                'name' => 'Fallen Angels',
                'cost' => 0,
                'attack' => 1,
                'defense' => 1,
                'subtype' => 'troop',
                'faction' => 'demons',
                'tokenCount' => 4,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Fallen_Angels[face,4].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconfallenangels.png',
                'specialAbility' => null,
                'specialText' => 'Start the game with 4 Troops on the Battle Field.',
                'flavorText' => 'How art thou fallen from heaven.',
            ],

            // Allies (Cost 1)
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
                'flavorText' => 'Demon of the deadly sin envy.',
            ],

            [
                'id' => 'demon_asmodeus',
                'name' => 'Asmodeus',
                'cost' => 1,
                'attack' => 6,
                'defense' => 2,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Asmodeus[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconasmodeus.png',
                'specialAbility' => 'straight_line_movement',
                'specialText' => 'Can move any number of spaces in a straight line. Cannot move onto or past Pearly Gate spaces.',
                'flavorText' => 'Demon of the deadly sin lust.',
            ],

            // Allies (Cost 2)
            [
                'id' => 'demon_belphegor',
                'name' => 'Belphegor',
                'cost' => 2,
                'attack' => 2,
                'defense' => 4,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Belphegor[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconbelphegor.png',
                'specialAbility' => 'push_troops',
                'specialText' => 'At the end of his move, each opponent\'s Troops in a straight line to him moves one space way from him.',
                'flavorText' => 'Demon of the deadly sin sloth.',
            ],

            [
                'id' => 'demon_beelzebub',
                'name' => 'Beelzebub',
                'cost' => 2,
                'attack' => 1,
                'defense' => 3,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Beelzebub[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconbeelzebub.png',
                'specialAbility' => 'all_allies_victory',
                'specialText' => 'WIN if all of your Allies are on the Battle Field.',
                'flavorText' => 'Demon of the deadly sin gluttony.',
            ],

            // Allies (Cost 3)
            [
                'id' => 'demon_mammon',
                'name' => 'Mammon',
                'cost' => 3,
                'attack' => 0,
                'defense' => 4,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Mammon[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconmammon.png',
                'specialAbility' => 'extra_recharge',
                'specialText' => 'At the start of each Round, may recharge up to one token. This is in addition to normal Recharge game rule.',
                'flavorText' => 'Demon of the deadly sin greed.',
            ],

            [
                'id' => 'demon_baal',
                'name' => 'Baal',
                'cost' => 3,
                'attack' => 3,
                'defense' => 3,
                'subtype' => 'ally',
                'faction' => 'demons',
                'tokenCount' => 1,
                'cardImageUrl' => '/assets/games/war-in-heaven/card-images/Baal[face,1].png',
                'iconUrl' => '/assets/games/war-in-heaven/icons/iconbaal.png',
                'specialAbility' => 'bolster_commander',
                'specialText' => 'Bolster Lucifer by +2 Attack and +2 Defense.',
                'flavorText' => 'Demon of the deadly sin fear.',
            ],
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
     * Get card by ID from any location
     */
    public function getCard(array $cardState, string $cardId): ?array
    {
        foreach ($cardState as $faction => $state) {
            foreach (array_merge($state['deck'], $state['hand'], $state['deployed'], $state['discarded']) as $card) {
                if ($card['id'] === $cardId) {
                    return $card;
                }
            }
        }

        return null;
    }

    /**
     * Check if player has a specific card in hand
     */
    public function hasCardInHand(array $cardState, string $faction, string $cardId): bool
    {
        foreach ($cardState[$faction]['hand'] as $card) {
            if ($card['id'] === $cardId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if card is deployed on battlefield
     */
    public function isCardDeployed(array $cardState, string $faction, string $cardId): bool
    {
        foreach ($cardState[$faction]['deployed'] as $card) {
            if ($card['id'] === $cardId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all deployed cards for a faction
     */
    public function getDeployedCards(array $cardState, string $faction): array
    {
        return $cardState[$faction]['deployed'] ?? [];
    }
}
