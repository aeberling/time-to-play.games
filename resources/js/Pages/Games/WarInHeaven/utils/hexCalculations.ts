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
