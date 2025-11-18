/**
 * Hex Grid Calculation Utilities
 *
 * Based on: https://www.redblobgames.com/grids/hexagons/
 */

import type { HexCoordinates, PixelCoordinates, HexLayout, HexOrientation } from '../types/HexTypes';
import { FLAT_ORIENTATION, POINTY_ORIENTATION } from '../types/HexTypes';

/**
 * Calculate distance between two hex positions
 */
export function hexDistance(a: HexCoordinates, b: HexCoordinates): number {
    const s1 = a.s ?? -a.q - a.r;
    const s2 = b.s ?? -b.q - b.r;

    return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(s1 - s2)) / 2;
}

/**
 * Get all neighbor positions of a hex
 */
export function hexNeighbors(hex: HexCoordinates): HexCoordinates[] {
    const directions: [number, number][] = [
        [1, 0],   // East
        [1, -1],  // NorthEast
        [0, -1],  // NorthWest
        [-1, 0],  // West
        [-1, 1],  // SouthWest
        [0, 1],   // SouthEast
    ];

    return directions.map(([dq, dr]) => ({
        q: hex.q + dq,
        r: hex.r + dr,
        s: -hex.q - dq - hex.r - dr,
    }));
}

/**
 * Get neighbor in a specific direction
 */
export function hexNeighbor(hex: HexCoordinates, direction: number): HexCoordinates {
    const directions: [number, number][] = [
        [1, 0],   // East
        [1, -1],  // NorthEast
        [0, -1],  // NorthWest
        [-1, 0],  // West
        [-1, 1],  // SouthWest
        [0, 1],   // SouthEast
    ];

    const dir = directions[direction % 6];
    return {
        q: hex.q + dir[0],
        r: hex.r + dir[1],
        s: -hex.q - dir[0] - hex.r - dir[1],
    };
}

/**
 * Get all hexes within a certain range
 */
export function hexRange(center: HexCoordinates, range: number): HexCoordinates[] {
    const results: HexCoordinates[] = [];

    for (let dq = -range; dq <= range; dq++) {
        const r1 = Math.max(-range, -dq - range);
        const r2 = Math.min(range, -dq + range);

        for (let dr = r1; dr <= r2; dr++) {
            results.push({
                q: center.q + dq,
                r: center.r + dr,
                s: -center.q - dq - center.r - dr,
            });
        }
    }

    return results;
}

/**
 * Get line/path between two hexes
 */
export function hexLine(a: HexCoordinates, b: HexCoordinates): HexCoordinates[] {
    const distance = hexDistance(a, b);
    const results: HexCoordinates[] = [];

    for (let i = 0; i <= distance; i++) {
        const t = i / Math.max(distance, 1);

        const q = Math.round(a.q + (b.q - a.q) * t);
        const r = Math.round(a.r + (b.r - a.r) * t);

        results.push({ q, r, s: -q - r });
    }

    return results;
}

/**
 * Convert hex coordinates to pixel coordinates
 */
export function hexToPixel(hex: HexCoordinates, layout: HexLayout): PixelCoordinates {
    const orientation = layout.orientation;
    const x = (orientation.f0 * hex.q + orientation.f1 * hex.r) * layout.size;
    const y = (orientation.f2 * hex.q + orientation.f3 * hex.r) * layout.size;

    return {
        x: x + layout.origin.x,
        y: y + layout.origin.y,
    };
}

/**
 * Convert pixel coordinates to hex coordinates
 */
export function pixelToHex(point: PixelCoordinates, layout: HexLayout): HexCoordinates {
    const orientation = layout.orientation;

    const pt = {
        x: (point.x - layout.origin.x) / layout.size,
        y: (point.y - layout.origin.y) / layout.size,
    };

    const q = orientation.b0 * pt.x + orientation.b1 * pt.y;
    const r = orientation.b2 * pt.x + orientation.b3 * pt.y;

    return hexRound({ q, r, s: -q - r });
}

/**
 * Round fractional hex coordinates to nearest hex
 */
export function hexRound(hex: HexCoordinates): HexCoordinates {
    const s = hex.s ?? -hex.q - hex.r;

    let q = Math.round(hex.q);
    let r = Math.round(hex.r);
    let sRounded = Math.round(s);

    const qDiff = Math.abs(q - hex.q);
    const rDiff = Math.abs(r - hex.r);
    const sDiff = Math.abs(sRounded - s);

    if (qDiff > rDiff && qDiff > sDiff) {
        q = -r - sRounded;
    } else if (rDiff > sDiff) {
        r = -q - sRounded;
    } else {
        sRounded = -q - r;
    }

    return { q, r, s: sRounded };
}

/**
 * Convert hex to a string key for indexing
 */
export function hexToKey(hex: HexCoordinates): string {
    return `q:${hex.q},r:${hex.r}`;
}

/**
 * Parse a hex key string into coordinates
 */
export function keyToHex(key: string): HexCoordinates {
    const match = key.match(/q:(-?\d+),r:(-?\d+)/);
    if (!match) {
        throw new Error(`Invalid hex key: ${key}`);
    }

    const q = parseInt(match[1], 10);
    const r = parseInt(match[2], 10);

    return { q, r, s: -q - r };
}

/**
 * Get corners of a hex in pixel coordinates
 */
export function hexCorners(hex: HexCoordinates, layout: HexLayout): PixelCoordinates[] {
    const corners: PixelCoordinates[] = [];
    const center = hexToPixel(hex, layout);

    for (let i = 0; i < 6; i++) {
        const angle = 2.0 * Math.PI * (layout.orientation.startAngle + i) / 6.0;
        corners.push({
            x: center.x + layout.size * Math.cos(angle),
            y: center.y + layout.size * Math.sin(angle),
        });
    }

    return corners;
}

/**
 * Check if two hexes are equal
 */
export function hexEquals(a: HexCoordinates, b: HexCoordinates): boolean {
    return a.q === b.q && a.r === b.r;
}

/**
 * Get a default flat-top hex layout
 */
export function getDefaultLayout(hexSize: number, origin: PixelCoordinates = { x: 0, y: 0 }): HexLayout {
    return {
        orientation: FLAT_ORIENTATION,
        size: hexSize,
        origin,
    };
}

// ============================================================================
// War in Heaven Specific Functions
// ============================================================================

export const HEX_SIZE = 40; // Radius from center to corner
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE; // ~69.28
export const HEX_HEIGHT = 2 * HEX_SIZE; // 80
export const VERT_SPACING = HEX_HEIGHT * 0.75; // 60 (vertical distance between row centers)

/**
 * Convert offset coordinates (A1, B2, etc.) to axial coordinates (q, r)
 */
export function offsetToAxial(col: string, row: number): HexCoordinates {
    const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0); // A=0, B=1, etc.
    const rowIndex = row - 1; // Convert to 0-indexed

    // For odd-r horizontal layout (flat-top)
    const q = colIndex - (rowIndex - (rowIndex % 2)) / 2;
    const r = rowIndex;

    return { q, r, s: -q - r };
}

/**
 * Convert axial coordinates back to offset coordinates
 */
export function axialToOffset(hex: HexCoordinates): { col: string; row: number } {
    const col = String.fromCharCode('A'.charCodeAt(0) + hex.q + (hex.r - (hex.r % 2)) / 2);
    const row = hex.r + 1; // Convert to 1-indexed

    return { col, row };
}

/**
 * Get pixel position for a hex using offset coordinates (A1, B2, etc.)
 */
export function getHexPixelPosition(col: string, row: number): PixelCoordinates {
    const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0); // A=0, B=1, etc.
    const rowIndex = row - 1; // Convert to 0-indexed

    // Calculate row center offset to center the board
    const rowWidths: Record<number, number> = {
        1: 2, 2: 3, 3: 4, 4: 5,
        5: 4, // center row
        6: 5, 7: 4, 8: 3, 9: 2
    };

    const maxWidth = 5;
    const rowWidth = rowWidths[row] || 0;

    // Base x position for the row (centered)
    const rowStartX = (maxWidth - rowWidth) * (HEX_WIDTH / 2);

    // For flat-top hexagons with odd-r offset:
    // Even rows (2, 4, 6, 8) nestle between odd row hexes
    const isEvenRow = row % 2 === 0;
    // No offset needed - rows are already properly aligned
    const nestleOffset = 0;

    const x = rowStartX + colIndex * HEX_WIDTH + nestleOffset;
    const y = rowIndex * VERT_SPACING;

    return { x, y };
}

/**
 * Get adjacent hex coordinates in offset notation
 * Returns valid War in Heaven board coordinates only
 */
export function getAdjacentHexes(coordinate: string): string[] {
    const col = coordinate.charAt(0);
    const row = parseInt(coordinate.substring(1));
    const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0);

    const adjacents: string[] = [];

    // For odd-r horizontal layout
    const isEvenRow = row % 2 === 0;

    if (isEvenRow) {
        // Even rows (2, 4, 6, 8)
        const neighbors = [
            [colIndex - 1, row - 1], // NW
            [colIndex, row - 1],     // NE
            [colIndex + 1, row],     // E
            [colIndex, row + 1],     // SE
            [colIndex - 1, row + 1], // SW
            [colIndex - 1, row],     // W
        ];

        for (const [c, r] of neighbors) {
            if (c >= 0 && c <= 4) { // Valid column range
                const coord = String.fromCharCode('A'.charCodeAt(0) + c) + r;
                if (isValidHex(coord)) {
                    adjacents.push(coord);
                }
            }
        }
    } else {
        // Odd rows (1, 3, 5, 7, 9)
        const neighbors = [
            [colIndex, row - 1],     // NW
            [colIndex + 1, row - 1], // NE
            [colIndex + 1, row],     // E
            [colIndex + 1, row + 1], // SE
            [colIndex, row + 1],     // SW
            [colIndex - 1, row],     // W
        ];

        for (const [c, r] of neighbors) {
            if (c >= 0 && c <= 4) { // Valid column range
                const coord = String.fromCharCode('A'.charCodeAt(0) + c) + r;
                if (isValidHex(coord)) {
                    adjacents.push(coord);
                }
            }
        }
    }

    return adjacents;
}

/**
 * Check if a coordinate is a valid hex on the War in Heaven board
 */
export function isValidHex(coordinate: string): boolean {
    const VALID_HEXES: Record<number, string[]> = {
        1: ['A1', 'B1'],
        2: ['A2', 'B2', 'C2'],
        3: ['A3', 'B3', 'C3', 'D3'],
        4: ['A4', 'B4', 'C4', 'D4', 'E4'],
        5: ['A5', 'B5', 'C5', 'D5'],
        6: ['A6', 'B6', 'C6', 'D6', 'E6'],
        7: ['A7', 'B7', 'C7', 'D7'],
        8: ['A8', 'B8', 'C8'],
        9: ['A9', 'B9'],
    };

    const row = parseInt(coordinate.substring(1));
    return VALID_HEXES[row]?.includes(coordinate) || false;
}

/**
 * Calculate distance between two hexes using offset coordinates
 */
export function getHexDistance(coord1: string, coord2: string): number {
    const col1 = coord1.charAt(0);
    const row1 = parseInt(coord1.substring(1));
    const col2 = coord2.charAt(0);
    const row2 = parseInt(coord2.substring(1));

    const axial1 = offsetToAxial(col1, row1);
    const axial2 = offsetToAxial(col2, row2);

    return hexDistance(axial1, axial2);
}

/**
 * Get all hexes in a straight line from a starting hex in one of the 6 directions
 * Used for Jophiel/Belphegor abilities and Camiel/Asmodeus movement
 */
export function getHexesInLine(start: string, direction: number, maxDistance: number = 10): string[] {
    const col = start.charAt(0);
    const row = parseInt(start.substring(1));
    const axial = offsetToAxial(col, row);

    const line: string[] = [];
    let current = axial;

    for (let i = 1; i <= maxDistance; i++) {
        current = hexNeighbor(current, direction);
        const { col: newCol, row: newRow } = axialToOffset(current);
        const coordinate = newCol + newRow;

        if (!isValidHex(coordinate)) {
            break; // Stop if we go off the board
        }

        line.push(coordinate);
    }

    return line;
}
