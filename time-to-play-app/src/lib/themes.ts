export const THEMES = {
  'ocean-breeze': {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Calm blues and soft pinks',
    colors: {
      primary: {
        50: '#e6f4f9',
        500: '#2891b8',
        600: '#227a9d',
        900: '#0e354b',
      },
      accent: {
        50: '#fce8f0',
        500: '#d63571',
        600: '#b82d5f',
        900: '#5e1529',
      },
    },
  },
  'sunset-glow': {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm oranges and purples',
    colors: {
      primary: {
        50: '#fff3e0',
        500: '#ff9800',
        600: '#f57c00',
        900: '#e65100',
      },
      accent: {
        50: '#f3e5f5',
        500: '#9c27b0',
        600: '#7b1fa2',
        900: '#4a148c',
      },
    },
  },
  'forest-calm': {
    id: 'forest-calm',
    name: 'Forest Calm',
    description: 'Natural greens and browns',
    colors: {
      primary: {
        50: '#e8f5e9',
        500: '#4caf50',
        600: '#43a047',
        900: '#1b5e20',
      },
      accent: {
        50: '#efebe9',
        500: '#795548',
        600: '#6d4c41',
        900: '#3e2723',
      },
    },
  },
  'purple-dream': {
    id: 'purple-dream',
    name: 'Purple Dream',
    description: 'Royal purples and magentas',
    colors: {
      primary: {
        50: '#f3e5f5',
        500: '#673ab7',
        600: '#5e35b1',
        900: '#311b92',
      },
      accent: {
        50: '#fce4ec',
        500: '#e91e63',
        600: '#d81b60',
        900: '#880e4f',
      },
    },
  },
  'neon-nights': {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Electric cyan and hot pink',
    colors: {
      primary: {
        50: '#e0f7fa',
        500: '#00bcd4',
        600: '#00acc1',
        900: '#006064',
      },
      accent: {
        50: '#fce4ec',
        500: '#ff4081',
        600: '#f50057',
        900: '#c51162',
      },
    },
  },
};

export type ThemeId = keyof typeof THEMES;

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId];
  if (!theme) return;

  const root = document.documentElement;

  // Apply primary colors
  Object.entries(theme.colors.primary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });

  // Apply accent colors
  Object.entries(theme.colors.accent).forEach(([shade, color]) => {
    root.style.setProperty(`--color-accent-${shade}`, color);
  });

  // Save theme preference
  localStorage.setItem('theme', themeId);
}

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'ocean-breeze';
  const stored = localStorage.getItem('theme') as ThemeId;
  return THEMES[stored] ? stored : 'ocean-breeze';
}
