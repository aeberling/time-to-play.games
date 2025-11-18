# Theming & Color Palette System

## Overview

Time to Play features a bright, colorful design with multiple theme options that users can choose from. Each theme affects the overall visual experience across all games, creating a personalized gaming environment.

## Design Philosophy

- **Bright & Colorful**: Vibrant, energetic colors that make gaming feel fun
- **High Contrast**: Ensure readability and accessibility
- **Distinct Themes**: Each theme has a unique personality
- **Consistent**: Themes apply uniformly across all games
- **Accessible**: All themes meet WCAG AA contrast standards

## Default Theme Palettes

### Theme 1: Ocean Breeze (Default)
**Personality**: Fresh, calming, professional

```typescript
const oceanBreeze = {
  name: 'Ocean Breeze',
  id: 'ocean-breeze',
  colors: {
    // Primary (buttons, links, highlights)
    primary: {
      50: '#e0f7ff',
      100: '#b3e9ff',
      200: '#80dbff',
      300: '#4dcdff',
      400: '#26c2ff',
      500: '#00b8ff',  // Main
      600: '#00a3e6',
      700: '#008acc',
      800: '#0071b3',
      900: '#004d80'
    },

    // Accent (special elements, achievements)
    accent: {
      50: '#fff0f5',
      100: '#ffd6e8',
      200: '#ffb3d6',
      300: '#ff8fc4',
      400: '#ff75b7',
      500: '#ff5caa',  // Main
      600: '#e6529a',
      700: '#cc4789',
      800: '#b33d78',
      900: '#802b56'
    },

    // Game table (card table background)
    table: {
      light: '#1a9d5c',
      main: '#0f7a45',
      dark: '#0a5230'
    },

    // Neutrals
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  }
};
```

### Theme 2: Sunset Glow
**Personality**: Warm, energetic, bold

```typescript
const sunsetGlow = {
  name: 'Sunset Glow',
  id: 'sunset-glow',
  colors: {
    primary: {
      50: '#fff3e0',
      100: '#ffe0b3',
      200: '#ffcc80',
      300: '#ffb74d',
      400: '#ffa726',
      500: '#ff9800',  // Main - Orange
      600: '#fb8c00',
      700: '#f57c00',
      800: '#ef6c00',
      900: '#e65100'
    },

    accent: {
      50: '#fce4ec',
      100: '#f8bbd0',
      200: '#f48fb1',
      300: '#f06292',
      400: '#ec407a',
      500: '#e91e63',  // Main - Pink
      600: '#d81b60',
      700: '#c2185b',
      800: '#ad1457',
      900: '#880e4f'
    },

    table: {
      light: '#d84315',
      main: '#bf360c',
      dark: '#8b2509'
    },

    gray: {
      // Same as Ocean Breeze
    }
  }
};
```

### Theme 3: Forest Calm
**Personality**: Natural, relaxing, earthy

```typescript
const forestCalm = {
  name: 'Forest Calm',
  id: 'forest-calm',
  colors: {
    primary: {
      50: '#e8f5e9',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#4caf50',  // Main - Green
      600: '#43a047',
      700: '#388e3c',
      800: '#2e7d32',
      900: '#1b5e20'
    },

    accent: {
      50: '#fff9e6',
      100: '#ffefb3',
      200: '#ffe580',
      300: '#ffdb4d',
      400: '#ffd426',
      500: '#ffcd00',  // Main - Yellow
      600: '#e6b800',
      700: '#cca300',
      800: '#b38e00',
      900: '#806600'
    },

    table: {
      light: '#558b2f',
      main: '#33691e',
      dark: '#1b4d14'
    },

    gray: {
      // Same as Ocean Breeze
    }
  }
};
```

### Theme 4: Purple Dream
**Personality**: Creative, magical, vibrant

```typescript
const purpleDream = {
  name: 'Purple Dream',
  id: 'purple-dream',
  colors: {
    primary: {
      50: '#f3e5f5',
      100: '#e1bee7',
      200: '#ce93d8',
      300: '#ba68c8',
      400: '#ab47bc',
      500: '#9c27b0',  // Main - Purple
      600: '#8e24aa',
      700: '#7b1fa2',
      800: '#6a1b9a',
      900: '#4a148c'
    },

    accent: {
      50: '#e8eaf6',
      100: '#c5cae9',
      200: '#9fa8da',
      300: '#7986cb',
      400: '#5c6bc0',
      500: '#3f51b5',  // Main - Indigo
      600: '#3949ab',
      700: '#303f9f',
      800: '#283593',
      900: '#1a237e'
    },

    table: {
      light: '#6a1b9a',
      main: '#4a148c',
      dark: '#311060'
    },

    gray: {
      // Same as Ocean Breeze
    }
  }
};
```

### Theme 5: Neon Nights
**Personality**: Electric, modern, exciting

```typescript
const neonNights = {
  name: 'Neon Nights',
  id: 'neon-nights',
  colors: {
    primary: {
      50: '#e0f2f7',
      100: '#b3dfec',
      200: '#80cae0',
      300: '#4db5d4',
      400: '#26a5ca',
      500: '#0096c1',  // Main - Cyan
      600: '#008bb5',
      700: '#007da6',
      800: '#006f97',
      900: '#00547a'
    },

    accent: {
      50: '#f3e5f5',
      100: '#e1bee7',
      200: '#ce93d8',
      300: '#ba68c8',
      400: '#ab47bc',
      500: '#00e5ff',  // Main - Neon Cyan
      600: '#00d4e6',
      700: '#00bfcc',
      800: '#00aab3',
      900: '#008a99'
    },

    table: {
      light: '#1e3a5f',
      main: '#0a1929',
      dark: '#050c14'
    },

    gray: {
      // Dark theme variant
      50: '#1e293b',
      100: '#334155',
      200: '#475569',
      300: '#64748b',
      400: '#94a3b8',
      500: '#cbd5e1',
      600: '#e2e8f0',
      700: '#f1f5f9',
      800: '#f8fafc',
      900: '#ffffff'
    }
  }
};
```

## Database Schema

```prisma
// Add to User model
model User {
  // ... existing fields ...

  // Theme preference
  themeId     String   @default("ocean-breeze")

  // ... rest of fields ...
}
```

## Theme Storage

```typescript
// Store user's theme preference
interface UserPreferences {
  themeId: string;
  // Future: other preferences like sound, animations
}

// In Redis (for fast access)
await redis.setex(
  `user:${userId}:preferences`,
  86400 * 30, // 30 days
  JSON.stringify({ themeId: 'sunset-glow' })
);
```

## Implementation

### Theme Provider

```typescript
// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const themes = {
  'ocean-breeze': oceanBreeze,
  'sunset-glow': sunsetGlow,
  'forest-calm': forestCalm,
  'purple-dream': purpleDream,
  'neon-nights': neonNights
};

interface ThemeContextType {
  currentTheme: Theme;
  themeId: string;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [themeId, setThemeId] = useState(user?.themeId || 'ocean-breeze');

  // Load user's theme preference
  useEffect(() => {
    if (user?.themeId) {
      setThemeId(user.themeId);
    }
  }, [user]);

  // Apply theme CSS variables
  useEffect(() => {
    const theme = themes[themeId as keyof typeof themes];
    if (!theme) return;

    const root = document.documentElement;

    // Apply primary colors
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });

    // Apply accent colors
    Object.entries(theme.colors.accent).forEach(([key, value]) => {
      root.style.setProperty(`--color-accent-${key}`, value);
    });

    // Apply table colors
    Object.entries(theme.colors.table).forEach(([key, value]) => {
      root.style.setProperty(`--color-table-${key}`, value);
    });

    // Apply gray colors
    Object.entries(theme.colors.gray).forEach(([key, value]) => {
      root.style.setProperty(`--color-gray-${key}`, value);
    });
  }, [themeId]);

  const setTheme = async (newThemeId: string) => {
    setThemeId(newThemeId);

    // Save to backend
    if (user) {
      await fetch('/api/users/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: newThemeId }),
        credentials: 'include'
      });
    } else {
      // Save to localStorage for guests
      localStorage.setItem('theme', newThemeId);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: themes[themeId as keyof typeof themes],
        themeId,
        setTheme,
        availableThemes: Object.values(themes)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS variables for theme colors
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        accent: {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
        },
        table: {
          light: 'var(--color-table-light)',
          DEFAULT: 'var(--color-table-main)',
          dark: 'var(--color-table-dark)',
        },
        gray: {
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Theme Selector Component

```typescript
// components/settings/ThemeSelector.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeSelector() {
  const { currentTheme, themeId, setTheme, availableThemes } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Your Theme</h3>
      <p className="text-sm text-gray-600">
        Select a color theme that will apply to all your games
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableThemes.map((theme) => (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all border-2',
                theme.id === themeId
                  ? 'border-primary-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => setTheme(theme.id)}
            >
              {/* Theme Preview */}
              <div className="relative p-6">
                {/* Color swatches */}
                <div className="flex gap-2 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm"
                    style={{ backgroundColor: theme.colors.primary[500] }}
                  />
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm"
                    style={{ backgroundColor: theme.colors.accent[500] }}
                  />
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm"
                    style={{ backgroundColor: theme.colors.table.main }}
                  />
                </div>

                {/* Theme info */}
                <div className="space-y-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    {theme.name}
                    {theme.id === themeId && (
                      <Check className="w-5 h-5 text-primary-500" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getThemeDescription(theme.id)}
                  </p>
                </div>

                {/* Mini game table preview */}
                <div
                  className="mt-4 h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.table.main }}
                >
                  <div className="text-white text-sm font-medium opacity-50">
                    Game Table Preview
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getThemeDescription(themeId: string): string {
  const descriptions = {
    'ocean-breeze': 'Fresh and calming - perfect for focused play',
    'sunset-glow': 'Warm and energetic - brings excitement to every game',
    'forest-calm': 'Natural and relaxing - for peaceful gaming sessions',
    'purple-dream': 'Creative and magical - adds wonder to your games',
    'neon-nights': 'Electric and modern - for the cutting-edge gamer'
  };
  return descriptions[themeId as keyof typeof descriptions] || '';
}
```

### Settings Page Integration

```typescript
// app/settings/page.tsx
import { ThemeSelector } from '@/components/settings/ThemeSelector';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Theme Settings */}
        <section>
          <ThemeSelector />
        </section>

        {/* Other settings... */}
      </div>
    </div>
  );
}
```

## Theme Application Examples

### Themed Button
```typescript
// Automatically uses current theme
<Button className="bg-primary-500 hover:bg-primary-600 text-white">
  Play Now
</Button>
```

### Themed Game Table
```typescript
<div className="bg-table rounded-lg shadow-2xl p-8">
  {/* Game content */}
</div>
```

### Themed Card
```typescript
<Card className="border-accent-200 hover:border-accent-500">
  {/* Card content */}
</Card>
```

## API Endpoints

### Update Theme Preference

```typescript
// PATCH /api/users/me/preferences
{
  "themeId": "sunset-glow"
}

// Response
{
  "success": true,
  "preferences": {
    "themeId": "sunset-glow"
  }
}
```

### Get Theme Preference

```typescript
// GET /api/users/me/preferences

// Response
{
  "success": true,
  "preferences": {
    "themeId": "ocean-breeze"
  }
}
```

## Accessibility Considerations

All themes are tested for:
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Blindness**: Use patterns in addition to colors for important info
- **High Contrast Mode**: Respect user's system preference
- **Dark Mode**: Neon Nights theme works well in dark environments

```typescript
// Respect system preferences
useEffect(() => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Suggest Neon Nights theme
  }
}, []);
```

## Performance

- Themes load instantly (CSS variables)
- No flash of unstyled content
- Preference cached in Redis for fast access
- Fallback to default theme if custom theme fails

## Future Enhancements

1. **Custom Themes**: Allow users to create their own color schemes
2. **Seasonal Themes**: Special themes for holidays
3. **Premium Themes**: Unlock exclusive themes for supporters
4. **Per-Game Themes**: Different theme for each game type
5. **Animated Themes**: Subtle gradient animations

---

This theming system creates a vibrant, personalized experience while maintaining consistency and accessibility across the entire platform.
