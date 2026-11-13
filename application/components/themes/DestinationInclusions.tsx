'use client';

import React from 'react';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';

interface DestinationInclusionsProps {
  inclusions: string[];
  exclusions: string[];
}

export default function DestinationInclusions({
  inclusions,
  exclusions,
}: DestinationInclusionsProps) {
  const theme = useDestinationTheme();

  return (
    <section className="mb-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Inclusions Card */}
        <div
          className="p-6 sm:p-8 rounded-[2rem] transition-all"
          style={{
            backgroundColor: theme.colors.surfaceCard,
            border: `1px solid ${theme.colors.border}`,
            backdropFilter: theme.cards.glassmorphism ? 'blur(10px)' : 'none',
          }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                backgroundColor: theme.colors.badgeBg,
                color: theme.colors.primary,
              }}
            >
              ✓
            </span>
            <h3
              className="font-headline text-xl font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              Package Inclusions
            </h3>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-[13px] leading-relaxed">
            {inclusions.map((inc, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="font-bold shrink-0 mt-0.5"
                  style={{ color: theme.colors.accent }}
                >
                  ✓
                </span>
                <span style={{ color: theme.colors.textSecondary }}>{inc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions Card */}
        <div
          className="p-6 sm:p-8 rounded-[2rem] transition-all"
          style={{
            backgroundColor: theme.colors.surfaceCard,
            border: `1px solid ${theme.colors.border}`,
            backdropFilter: theme.cards.glassmorphism ? 'blur(10px)' : 'none',
          }}
        >
          <div className="flex items-center gap-2.5 mb-5 text-rose-700">
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
              ✕
            </span>
            <h3
              className="font-headline text-xl font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              Package Exclusions
            </h3>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-[13px] leading-relaxed">
            {exclusions.map((exc, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
                <span style={{ color: theme.colors.textSecondary }}>{exc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

