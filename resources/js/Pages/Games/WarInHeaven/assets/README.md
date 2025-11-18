# War in Heaven Assets

This directory contains all game-specific assets for War in Heaven.

## Folder Structure

### cards/
Card images organized by faction:
- `faction1/` - Faction 1 card images
- `faction2/` - Faction 2 card images

**Format**: PNG or SVG
**Naming**: `{card_id}.png` (e.g., `f1_attack_boost.png`)
**Size**: 300x420px (or proportional)

### pieces/
Game piece images/SVGs:
- `faction1/` - Faction 1 piece sprites
- `faction2/` - Faction 2 piece sprites

**Format**: SVG (preferred for scalability)
**Naming**: `{piece_type}.svg` (e.g., `warrior.svg`)
**Size**: Design at 100x100px, will scale

### board/
Board and hex tile assets:
- `hex_tile.svg` - Base hex tile
- `hex_tile_highlight.svg` - Highlighted hex
- `hex_tile_selected.svg` - Selected hex
- `board_background.svg` - Background texture

**Format**: SVG
**Requirements**: Flat-top or pointy-top hexagon (consistent throughout)

### sounds/
Sound effect files:
- `move.mp3` - Piece movement sound
- `combat.mp3` - Combat sound
- `card_play.mp3` - Card played sound
- `card_draw.mp3` - Card drawn sound
- `victory.mp3` - Victory sound
- `defeat.mp3` - Defeat sound

**Format**: MP3 or OGG
**Size**: Keep files small (<100KB if possible)

### styles/
Game-specific CSS:
- `war-in-heaven.module.css` - Main game styles

## Asset Guidelines

1. **Optimization** - Compress images and optimize SVGs
2. **Consistency** - Maintain consistent art style
3. **Accessibility** - Ensure sufficient contrast
4. **Performance** - Lazy load large assets when possible

## TODO

- [ ] Design and add card images
- [ ] Design and add piece sprites
- [ ] Create hex tile variations
- [ ] Add/find sound effects
- [ ] Create game-specific CSS styles
