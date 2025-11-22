/**
 * War in Heaven Card Types
 *
 * Cards are definitions/templates that can be played to deploy tokens.
 * Tokens are the actual pieces on the board (tracked in board state, not card state).
 */

import { Faction, TokenSubtype } from './HexTypes';

export interface WarCard {
    id: string;
    name: string;
    cost: number;
    attack: number;
    defense: number;
    subtype: TokenSubtype;
    faction: Faction;
    tokenCount: number;
    cardImageUrl?: string;
    iconUrl?: string;
    specialAbility?: string | null;
    specialText?: string;
    flavorText?: string;
}

export interface FactionCards {
    deck: WarCard[];
    hand: WarCard[];
    deployed: WarCard[];
    discarded: WarCard[];
}
