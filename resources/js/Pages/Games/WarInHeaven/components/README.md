# War in Heaven Components

This directory contains all React components for the War in Heaven game.

## Folder Structure

### HexBoard/
Components related to the hex grid board:
- `HexBoard.tsx` - Main board container and renderer
- `HexTile.tsx` - Individual hex tile component
- `Piece.tsx` - Game piece rendering on hex tiles
- `HexGrid.tsx` - Hex grid layout system
- `index.ts` - Barrel exports

### CardDisplay/
Components for card visualization and interaction:
- `CardHand.tsx` - Player's card hand display
- `Card.tsx` - Individual card component
- `CardDetail.tsx` - Enlarged card view
- `DeckIndicator.tsx` - Deck and discard pile indicators
- `index.ts` - Barrel exports

### FactionPanel/
Faction-specific UI components:
- `FactionPanel.tsx` - Main faction panel container
- `FactionInfo.tsx` - Faction abilities and information
- `ResourceDisplay.tsx` - Resources and victory points
- `index.ts` - Barrel exports

### GameInfo/
Game state and information components:
- `GameInfo.tsx` - Overall game state display
- `PlayerPanel.tsx` - Player information panel
- `TurnIndicator.tsx` - Current turn indicator
- `index.ts` - Barrel exports

### CombatDisplay/
Combat visualization components:
- `CombatModal.tsx` - Combat resolution UI
- `CombatAnimation.tsx` - Combat animation effects
- `index.ts` - Barrel exports

### GameControls/
Game control components:
- `ActionButtons.tsx` - Player action buttons
- `EndTurnButton.tsx` - End turn button
- `index.ts` - Barrel exports

## Component Guidelines

1. **Use TypeScript** - All components should be typed
2. **Export via index.ts** - Use barrel exports for cleaner imports
3. **Follow naming conventions** - PascalCase for component files
4. **Keep components focused** - Single responsibility principle
5. **Use custom hooks** - Extract logic into hooks when appropriate
