# Game Theme System

The game theme system allows users to customize the visual appearance of the gaming area with different color schemes.

## Features

- **6 Pre-built Themes**: Ocean Breeze (default), Forest Green, Royal Purple, Sunset Orange, Midnight Dark, and Ruby Red
- **User Preferences**: Theme selection is saved to the user's profile
- **Game Area Only**: Themes apply to game components and cards, not the entire application
- **CSS Variables**: Dynamic theming using CSS custom properties
- **React Context**: Centralized theme management via ThemeContext

## Architecture

### Backend

1. **Database**: `users.theme_id` column stores user's theme preference (default: 'ocean-breeze')
2. **API Endpoints**:
   - `GET /api/user/theme` - Get current user's theme
   - `PUT /api/user/theme` - Update user's theme preference
3. **Controller**: `App\Http\Controllers\Api\UserThemeController`

### Frontend

1. **Theme Config**: `/resources/js/config/themes.ts`
   - Defines all available themes and color schemes
   - Exports `getTheme()` and `getThemeList()` helpers

2. **Theme Context**: `/resources/js/contexts/ThemeContext.tsx`
   - Provides theme state and setter across the app
   - Applies CSS variables to document root
   - Syncs with backend on theme change

3. **Theme Selector**: `/resources/js/Components/ThemeSelector.tsx`
   - Dropdown UI for selecting themes
   - Shows theme previews and descriptions
   - Available in the authenticated layout header

4. **Game Card Component**: `/resources/js/Components/GameCard.tsx`
   - Reusable card component that respects theme colors
   - Supports face-up/face-down, small/large sizes
   - Handles playability states and borders

5. **CSS Variables**: `/resources/css/app.css`
   - Defines CSS custom properties for theming
   - Provides utility classes like `.game-bg`, `.game-card`, `.game-btn-primary`

## Theme Color Properties

Each theme defines these color properties:

- `background` / `backgroundSecondary` - Game area backgrounds
- `cardBackground` / `cardBorder` - Card styling
- `cardBackFace` / `cardBackBorder` - Face-down card styling
- `redSuit` / `blackSuit` - Card suit colors
- `primary` / `primaryHover` - Primary action buttons
- `success` / `successHover` - Success buttons
- `danger` / `dangerHover` - Danger buttons
- `textPrimary` / `textSecondary` / `textMuted` - Text colors
- `highlight` / `winner` / `active` - State indicators
- `border` / `borderLight` - Border colors

## Usage

### Using Theme in Components

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyGameComponent() {
  const { theme, themeId, setTheme } = useTheme();

  // Use theme colors directly
  const color = theme.colors.primary;

  // Or use CSS classes
  return <div className="game-bg game-border">...</div>;
}
```

### Using GameCard Component

```tsx
import GameCard from '@/Components/GameCard';

<GameCard
  card={myCard}
  faceDown={false}
  small={false}
  onClick={() => playCard(myCard)}
  isPlayable={true}
/>
```

### CSS Utility Classes

- `.game-bg` - Primary background
- `.game-bg-secondary` - Secondary background
- `.game-card` - Card background and border
- `.game-card-back` - Face-down card styling
- `.game-btn-primary` - Primary button
- `.game-btn-success` - Success button
- `.game-btn-danger` - Danger button
- `.game-text-primary` / `.game-text-secondary` / `.game-text-muted` - Text colors
- `.game-border` / `.game-border-light` - Border colors

## Available Themes

1. **Ocean Breeze** (default) - Cool blue tones
2. **Forest Green** - Classic casino green
3. **Royal Purple** - Elegant purple and gold
4. **Sunset Orange** - Warm sunset colors
5. **Midnight Dark** - Dark mode with midnight blue
6. **Ruby Red** - Bold red with luxury vibes

## Adding New Themes

To add a new theme:

1. Add theme definition to `/resources/js/config/themes.ts`
2. Add validation rule to `UserThemeController.php` (line 30)
3. Theme will automatically appear in theme selector

## Implementation Status

- ✅ Database migration and model
- ✅ Backend API endpoints
- ✅ Theme configuration and definitions
- ✅ React context for theme management
- ✅ Theme selector UI component
- ✅ CSS variables and utility classes
- ✅ GameCard component
- ✅ War game themed
- ✅ Oh Hell game themed
- ⏳ Swoop game (pending)
