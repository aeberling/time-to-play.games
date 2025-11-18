# War in Heaven - Board Layout Specification

## Board Overview

**Total Hexes:** 32
**Shape:** Vertical diamond/rhombus with symmetric top and bottom halves
**Hex Orientation:** Flat-top hexagons (horizontal flat edge on top)
**Coordinate System:** Letter-Number notation (A-E columns, 1-9 rows)

---

## Hex Type Definitions

### 1. Deploy Spaces (4 hexes total)
**Angels Deploy Spaces:** A1, B1 (top)
**Demons Deploy Spaces:** A9, B9 (bottom)

**Properties:**
- Light gray color (visual distinction)
- Only the owning faction can deploy to these spaces
- Troops can move onto/off these spaces normally
- Starting positions for deployed Allies

### 2. Gate/Bridge Spaces (Pearly Gates) (4 hexes total)
**Location:** A5, B5, C5, D5 (center row - the dividing line)

**Properties:**
- Dark gray color (visual distinction)
- Control grants bonus recharge at end of turn
- Control = having more tokens than opponent on these 4 hexes
- Some Allies (Camiel, Asmodeus) cannot move onto or past these spaces
- Zadkiel's win condition requires occupying all 4 spaces

### 3. Standard Spaces (24 hexes)
All remaining hexes on the board

**Properties:**
- White/standard color
- Regular battlefield spaces
- No special rules

---

## Complete Board Layout

```
        [A1*][B1*]                    <- Deploy (Angels)
      [A2][B2][C2]
    [A3][B3][C3][D3]                  <- Angels starting: Troops on A3,B3,C3,D3; Commander on B2
  [A4][B4][C4][D4][E4]
    [A5#][B5#][C5#][D5#]              <- Gate/Bridge (Pearly Gates)
  [A6][B6][C6][D6][E6]
    [A7][B7][C7][D7]                  <- Demons starting: Troops on A7,B7,C7,D7; Commander on B8
      [A8][B8][C8]
        [A9*][B9*]                    <- Deploy (Demons)

Legend:
* = Deploy Space
# = Gate/Bridge Space (Pearly Gates)
No symbol = Standard Space
```

---

## Starting Positions

### Angels Faction (Top)
- **Commander (Michael):** B2
- **Troops (Heaven's Militia):**
  - Troop 1: A3
  - Troop 2: B3
  - Troop 3: C3
  - Troop 4: D3

### Demons Faction (Bottom)
- **Commander (Lucifer):** B8
- **Troops (Fallen Angels):**
  - Troop 1: A7
  - Troop 2: B7
  - Troop 3: C7
  - Troop 4: D7

**Notes:**
- All starting tokens begin as active (face-up)
- All 6 Allies per faction start off the battlefield on their cards (active)
- Starting setup is symmetric for both factions

---

## Hex Adjacency System

Using **offset coordinates** (odd-r horizontal layout):

### Adjacency Rules for Flat-Top Hexagons
For a hex at position [Col][Row]:

**Even Rows (2, 4, 6, 8):**
- NW: [Col-1][Row-1]
- NE: [Col][Row-1]
- E: [Col+1][Row]
- SE: [Col][Row+1]
- S: [Col+1][Row+1]  *(note: different from odd rows)*
- W: [Col-1][Row]

**Odd Rows (1, 3, 5, 7, 9):**
- NW: [Col][Row-1]  *(note: different from even rows)*
- NE: [Col+1][Row-1]
- E: [Col+1][Row]
- SE: [Col+1][Row+1]
- SW: [Col][Row+1]
- W: [Col-1][Row]

### Example Adjacencies

**B2 (Even Row) neighbors:**
- NW: A1
- NE: B1
- E: C2
- SE: B3
- SW: C3
- W: A2

**B3 (Odd Row) neighbors:**
- NW: B2
- NE: C2
- E: C3
- SE: C4
- SW: B4
- W: A3

**B5 (Odd Row - Center) neighbors:**
- NW: B4
- NE: C4
- E: C5
- SE: C6
- SW: B6
- W: A5

---

## All Hex Coordinates by Type

### Deploy Spaces (4)
```json
{
  "angels_deploy": ["A1", "B1"],
  "demons_deploy": ["A9", "B9"]
}
```

### Gate/Bridge Spaces (4)
```json
{
  "gate_bridge": ["A5", "B5", "C5", "D5"]
}
```

### Standard Spaces (24)
```json
{
  "standard": [
    "A2", "B2", "C2",
    "A3", "B3", "C3", "D3",
    "A4", "B4", "C4", "D4", "E4",
    "A6", "B6", "C6", "D6", "E6",
    "A7", "B7", "C7", "D7",
    "A8", "B8", "C8"
  ]
}
```

---

## Hex Pixel Positioning (for SVG/Canvas)

### Hex Dimensions
```javascript
const HEX_SIZE = 40; // radius from center to corner
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE; // ~69.28
const HEX_HEIGHT = 2 * HEX_SIZE; // 80
const VERT_SPACING = HEX_HEIGHT * 0.75; // 60 (vertical distance between row centers)
const HORIZ_SPACING = HEX_WIDTH; // horizontal distance between column centers
```

### Row Offsets (Odd-R Horizontal Layout)
```javascript
// For flat-top hexagons with odd-r offset
function getHexPixelPosition(col, row) {
  const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0); // A=0, B=1, etc.
  const rowIndex = row - 1; // Convert to 0-indexed

  // Odd rows are offset by half a hex width to the right
  const xOffset = (rowIndex % 2 === 0) ? 0 : HEX_WIDTH / 2;

  const x = colIndex * HEX_WIDTH + xOffset;
  const y = rowIndex * VERT_SPACING;

  return { x, y };
}
```

### Center Point Calculation
```javascript
// Calculate center point for each row to center the entire board
const rowWidths = {
  1: 2, 2: 3, 3: 4, 4: 5,
  5: 4, // center row
  6: 5, 7: 4, 8: 3, 9: 2
};

function getRowCenterOffset(row) {
  const maxWidth = 5;
  const rowWidth = rowWidths[row];
  const offset = (maxWidth - rowWidth) * (HEX_WIDTH / 2);
  return offset;
}
```

---

## Board Dimensions

### Logical Dimensions
- **Rows:** 9
- **Max Columns:** 5 (rows 4 and 6)
- **Min Columns:** 2 (rows 1 and 9)
- **Center Row:** Row 5 (4 hexes)

### Visual Dimensions (Approximate)
```
Width: ~5.5 hex widths = ~380px (at HEX_SIZE=40)
Height: ~9 rows = ~540px (at HEX_SIZE=40)
```

---

## Coordinate Validation

### Valid Hex Coordinates
```javascript
const VALID_HEXES = {
  1: ['A1', 'B1'],
  2: ['A2', 'B2', 'C2'],
  3: ['A3', 'B3', 'C3', 'D3'],
  4: ['A4', 'B4', 'C4', 'D4', 'E4'],
  5: ['A5', 'B5', 'C5', 'D5'],
  6: ['A6', 'B6', 'C6', 'D6', 'E6'],
  7: ['A7', 'B7', 'C7', 'D7'],
  8: ['A8', 'B8', 'C8'],
  9: ['A9', 'B9']
};

function isValidHex(col, row) {
  if (row < 1 || row > 9) return false;
  const hex = col + row;
  return VALID_HEXES[row].includes(hex);
}
```

---

## Hex Distance Calculation

### Offset to Axial Conversion
```javascript
// Convert offset coordinates to axial (q, r) for distance calculations
function offsetToAxial(col, row) {
  const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0);
  const rowIndex = row - 1;

  const q = colIndex - (rowIndex - (rowIndex % 2)) / 2;
  const r = rowIndex;

  return { q, r };
}

// Axial distance
function axialDistance(hex1, hex2) {
  const a1 = offsetToAxial(hex1.col, hex1.row);
  const a2 = offsetToAxial(hex2.col, hex2.row);

  return (Math.abs(a1.q - a2.q) +
          Math.abs(a1.q + a1.r - a2.q - a2.r) +
          Math.abs(a1.r - a2.r)) / 2;
}
```

---

## Special Movement Rules by Hex Type

### Deploy Spaces
- Can move onto these spaces normally
- Can only deploy to your faction's deploy spaces
- Must be unoccupied to deploy

### Gate/Bridge Spaces
- Most tokens can move onto these normally
- **Exception:** Camiel and Asmodeus cannot move onto or past these spaces
- Controlling these spaces (having more tokens than opponent) grants end-of-turn recharge bonus

### Standard Spaces
- No special movement rules
- Standard adjacency and movement rules apply

---

## Straight Line Definitions (for Jophiel/Belphegor)

A "straight line" in hex grid consists of hexes in one of 6 directions:

### Six Hex Directions
1. **East (E):** Increasing column, same row
2. **West (W):** Decreasing column, same row
3. **Northeast (NE):** Increasing column, decreasing row (with offset rules)
4. **Northwest (NW):** Decreasing column, decreasing row (with offset rules)
5. **Southeast (SE):** Increasing column, increasing row (with offset rules)
6. **Southwest (SW):** Decreasing column, increasing row (with offset rules)

**Example: Jophiel on C4**
- E line: D4, E4
- W line: B4, A4
- NE line: C3, D2, D1 (if they existed)
- NW line: B3, B2, B1
- SE line: D5, D6, E7 (if existed)
- SW line: C5, B6, B7, B8

---

## Implementation Notes

### For Game Engine
1. Store board state as object/map with hex coordinates as keys
2. Each hex object should track:
   - Position (col, row)
   - Hex type (deploy, gate, standard)
   - Occupied token (if any)
   - Owner faction (for deploy spaces)

### For Frontend Rendering
1. Use SVG for scalable hex rendering
2. Calculate pixel positions using offset coordinate formulas
3. Apply visual styling based on hex type
4. Handle click/touch events for hex selection
5. Show valid move indicators based on selected token

### For Movement Validation
1. Check destination hex is valid coordinate
2. Check destination is adjacent (for standard movement)
3. Check destination is unoccupied (or enemy for attack)
4. Apply special movement rules (Uriel, Camiel, etc.)
5. Block Camiel/Asmodeus from Gate/Bridge spaces

---

## Visual Design Recommendations

### Colors
- **Deploy Spaces:** `#E8E8E8` (light gray)
- **Gate/Bridge Spaces:** `#606060` (dark gray)
- **Standard Spaces:** `#F5F5F5` (off-white)
- **Angels Faction:** `#FFB200` (gold)
- **Demons Faction:** `#7F0212` (dark red)

### Hex Styling
- Thin borders between hexes
- Subtle shadow for depth
- Highlight on hover
- Strong highlight on selection
- Valid move indicator (green glow/border)
- Invalid move indicator (red)

### Token Display
- Circular tokens with faction color
- Character icon centered
- Attack/Defense stats visible
- Active/Inactive state clearly shown
- Smooth movement animations
