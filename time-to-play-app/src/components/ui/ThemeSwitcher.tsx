'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';
import { THEMES, ThemeId, applyTheme, getStoredTheme } from '@/lib/themes';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('ocean-breeze');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const theme = getStoredTheme();
    setCurrentTheme(theme);
    applyTheme(theme);
  }, []);

  const handleThemeChange = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">Theme</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Theme Picker */}
          <Card className="absolute right-0 top-full mt-2 z-50 w-80 shadow-xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Choose Your Theme</h3>
              <div className="space-y-2">
                {Object.values(THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id as ThemeId)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md',
                      currentTheme === theme.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{theme.name}</span>
                      {currentTheme === theme.id && (
                        <Check className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {theme.description}
                    </p>
                    <div className="flex gap-1">
                      {Object.entries(theme.colors.primary)
                        .filter(([shade]) => ['500', '600'].includes(shade))
                        .map(([shade, color]) => (
                          <div
                            key={shade}
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      {Object.entries(theme.colors.accent)
                        .filter(([shade]) => ['500', '600'].includes(shade))
                        .map(([shade, color]) => (
                          <div
                            key={shade}
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
