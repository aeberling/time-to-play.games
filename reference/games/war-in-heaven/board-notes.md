# War in Heaven - Board Structure

## Board Overview

The board has a diamond/rhombus shape composed of hexagonal tiles arranged in 9 rows. The board expands from top to row 4 (5 hexes), narrows at the center dividing line (row 5 with 4 hexes), then expands again to row 6 (5 hexes) before tapering to the bottom.

**Total hex count:** 32 hexes

## Hex Types

1. **Standard Spaces** - 26 hexes (regular playable spaces)
2. **Dividing Line** - 4 hexes (middle row - row 5)
3. **Entry Spaces** - 4 hexes total (2 at top for one faction, 2 at bottom for opposing faction)

## Board Dimensions by Row

- **Row 1** (top): 2 hexes (entry spaces - Faction 1)
- **Row 2**: 3 hexes
- **Row 3**: 4 hexes
- **Row 4**: 5 hexes
- **Row 5** (center): 4 hexes (dividing line/middle row)
- **Row 6**: 5 hexes
- **Row 7**: 4 hexes
- **Row 8**: 3 hexes
- **Row 9** (bottom): 2 hexes (entry spaces - Faction 2)

## Visual Representation

```
        [A1][B1]                    <- Entry Spaces (Faction 1)
      [A2][B2][C2]
    [A3][B3][C3][D3]
  [A4][B4][C4][D4][E4]
    [A5][B5][C5][D5]                <- Dividing Line (Middle Row)
  [A6][B6][C6][D6][E6]
    [A7][B7][C7][D7]
      [A8][B8][C8]
        [A9][B9]                    <- Entry Spaces (Faction 2)
```

## Coordinate System

Using chess-like notation with columns (A-E) and rows (1-9):

### Row 1 (Top - 2 hexes)
- A1, B1 (Entry Spaces - Faction 1)

### Row 2 (3 hexes)
- A2, B2, C2

### Row 3 (4 hexes)
- A3, B3, C3, D3

### Row 4 (5 hexes)
- A4, B4, C4, D4, E4

### Row 5 (Center - 4 hexes)
- A5, B5, C5, D5 (Dividing Line - Middle Row)

### Row 6 (5 hexes)
- A6, B6, C6, D6, E6

### Row 7 (4 hexes)
- A7, B7, C7, D7

### Row 8 (3 hexes)
- A8, B8, C8

### Row 9 (Bottom - 2 hexes)
- A9, B9 (Entry Spaces - Faction 2)

## Board Characteristics

- **Symmetry**: The board is vertically symmetrical (top and bottom mirror each other)
- **Dividing Line**: Row 5 represents the middle row - the dividing line between the two halves of the board (narrowed to 4 hexes)
- **Entry Spaces**: Hexes at rows 1 and 9 are where characters from each faction enter the board
  - Row 1 (A1, B1): Faction 1 entry points
  - Row 9 (A9, B9): Faction 2 entry points
- **Maximum Width**: 5 hexes at rows 4 and 6 (the dividing line narrows to 4 hexes)

## Adjacency Notes

In a hex grid, each hex can have up to 6 neighbors. Edge hexes will have fewer neighbors:
- Corner hexes (A1, B1, A9, B9) have 2-3 neighbors
- Edge hexes have 3-4 neighbors
- Interior hexes have 6 neighbors

The offset-row layout means adjacency calculation will need to account for the staggered positioning of hexes in alternating rows.
