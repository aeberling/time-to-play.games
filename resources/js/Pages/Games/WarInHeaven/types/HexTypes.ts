/**
 * Hex Grid Types
 */

export interface HexCoordinates {
    q: number;
    r: number;
    s?: number;
}

export interface PixelCoordinates {
    x: number;
    y: number;
}

export interface HexDimensions {
    size: number;
    width: number;
    height: number;
}

export enum HexDirection {
    East = 0,
    NorthEast = 1,
    NorthWest = 2,
    West = 3,
    SouthWest = 4,
    SouthEast = 5,
}

export interface HexLayout {
    orientation: HexOrientation;
    size: number;
    origin: PixelCoordinates;
}

export interface HexOrientation {
    f0: number;
    f1: number;
    f2: number;
    f3: number;
    b0: number;
    b1: number;
    b2: number;
    b3: number;
    startAngle: number;
}

// Predefined orientations
export const FLAT_ORIENTATION: HexOrientation = {
    f0: 3.0 / 2.0,
    f1: 0.0,
    f2: Math.sqrt(3.0) / 2.0,
    f3: Math.sqrt(3.0),
    b0: 2.0 / 3.0,
    b1: 0.0,
    b2: -1.0 / 3.0,
    b3: Math.sqrt(3.0) / 3.0,
    startAngle: 0.0,
};

export const POINTY_ORIENTATION: HexOrientation = {
    f0: Math.sqrt(3.0),
    f1: Math.sqrt(3.0) / 2.0,
    f2: 0.0,
    f3: 3.0 / 2.0,
    b0: Math.sqrt(3.0) / 3.0,
    b1: -1.0 / 3.0,
    b2: 0.0,
    b3: 2.0 / 3.0,
    startAngle: 0.5,
};

// ============================================================================
// War in Heaven Specific Types
// ============================================================================

export type HexType = 'standard' | 'deploy' | 'gate';
export type Faction = 'angels' | 'demons';

export interface HexState {
    coordinate: string;
    type: HexType;
    owner?: Faction; // For deploy spaces
    occupiedBy: string | null; // Token ID or null
}
