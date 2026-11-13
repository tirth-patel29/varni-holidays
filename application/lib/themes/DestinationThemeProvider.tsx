'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { DestinationTheme } from './types';
import { KERALA_THEME } from './registry';

interface DestinationThemeContextValue {
  theme: DestinationTheme;
}

const DestinationThemeContext = createContext<DestinationThemeContextValue | null>(null);

export function useDestinationTheme(): DestinationTheme {
  const context = useContext(DestinationThemeContext);
  return context ? context.theme : KERALA_THEME;
}

export function useDestinationThemeSafe(): DestinationTheme | null {
  const context = useContext(DestinationThemeContext);
  return context ? context.theme : null;
}

interface DestinationThemeProviderProps {
  theme: DestinationTheme;
  children: React.ReactNode;
  className?: string;
}

export function DestinationThemeProvider({
  theme,
  children,
  className = '',
}: DestinationThemeProviderProps) {
  // Compute CSS custom properties for dynamic scoping
  const cssVariables = useMemo(() => {
    return {
      '--theme-primary': theme.colors.primary,
      '--theme-primary-hover': theme.colors.primaryHover,
      '--theme-secondary': theme.colors.secondary,
      '--theme-accent': theme.colors.accent,
      '--theme-surface': theme.colors.surface,
      '--theme-surface-elevated': theme.colors.surfaceElevated,
      '--theme-surface-muted': theme.colors.surfaceMuted,
      '--theme-surface-card': theme.colors.surfaceCard,
      '--theme-border': theme.colors.border,
      '--theme-border-subtle': theme.colors.borderSubtle,
      '--theme-text-primary': theme.colors.textPrimary,
      '--theme-text-secondary': theme.colors.textSecondary,
      '--theme-text-muted': theme.colors.textMuted,
      '--theme-badge-bg': theme.colors.badgeBg,
      '--theme-badge-text': theme.colors.badgeText,
      '--theme-orb-1': theme.colors.ambientOrbPrimary,
      '--theme-orb-2': theme.colors.ambientOrbSecondary,
    } as React.CSSProperties;
  }, [theme]);

  return (
    <DestinationThemeContext.Provider value={{ theme }}>
      <div
        className={`destination-theme-scope w-full min-h-screen relative bg-transparent transition-colors duration-500 ${className}`}
        style={{
          ...cssVariables,
          color: theme.colors.textSecondary,
        }}
        data-destination-theme={theme.id}
      >
        {children}
      </div>
    </DestinationThemeContext.Provider>
  );
}
