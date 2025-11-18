# War in Heaven - Public Assets

This directory contains publicly accessible game assets for War in Heaven.

## Directory Structure

```
war-in-heaven/
├── cards/          # Card images
│   ├── faction1/   # Faction 1 cards
│   └── faction2/   # Faction 2 cards
├── pieces/         # Game piece sprites
│   ├── faction1/   # Faction 1 pieces
│   └── faction2/   # Faction 2 pieces
├── board/          # Board assets
└── ui/             # UI elements
```

## Asset Guidelines

### Cards
- **Format**: PNG or WebP
- **Dimensions**: 300x420px (portrait)
- **Naming**: `{card_id}.png`
- **Optimization**: Compress for web

### Pieces
- **Format**: SVG (preferred) or PNG
- **Dimensions**: 100x100px for design
- **Naming**: `{piece_type}.svg`
- **Style**: Clear silhouettes

### Board
- **Format**: SVG for tiles, PNG/WebP for backgrounds
- **Hex Tiles**: Consistent orientation (flat-top or pointy-top)
- **Naming**: Descriptive (e.g., `hex_tile_normal.svg`)

### UI
- **Format**: SVG (preferred)
- **Content**: Reusable UI elements (card backs, icons, etc.)

## Build Process

Assets in `resources/js/Pages/Games/WarInHeaven/assets/` should be copied here during the build process or served directly from resources during development.

## Notes

- Keep file sizes optimized
- Use consistent naming conventions
- Maintain art style consistency across all assets
