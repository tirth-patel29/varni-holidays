'use client';

import React from 'react';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';
import { getDestinationAssets } from '@/lib/themes/destination-assets';
import AmbientVisualEffects from './AmbientVisualEffects';

export default function DestinationBackgroundEnvironment() {
  const theme = useDestinationTheme();
  const assets = getDestinationAssets(theme.id);

  const isKashmir = theme.id === 'kashmir';
  const isKerala = theme.id === 'kerala';

  // Tuned multi-stop gradient overlays ensuring WCAG AAA content readability while revealing panoramic photography
  const gradientOverlay = isKashmir
    ? 'linear-gradient(180deg, rgba(8, 30, 56, 0.85) 0%, rgba(11, 37, 69, 0.72) 18%, rgba(240, 247, 255, 0.88) 50%, rgba(244, 248, 252, 0.96) 100%)'
    : isKerala
    ? 'linear-gradient(180deg, rgba(10, 51, 37, 0.85) 0%, rgba(13, 74, 54, 0.72) 18%, rgba(244, 242, 237, 0.88) 50%, rgba(249, 248, 245, 0.96) 100%)'
    : 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.72) 18%, rgba(250, 250, 249, 0.88) 50%, rgba(255, 255, 255, 0.96) 100%)';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* LAYER 1: Full-Viewport Fixed High-Resolution Panoramic Landscape Photo */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-100 opacity-65"
        style={{
          backgroundImage: `url('${assets.fullPageBackground}')`,
          backgroundAttachment: 'fixed',
        }}
      />

      {/* LAYER 2: Soft Atmospheric Depth & Blur */}
      <div className="fixed inset-0 backdrop-blur-[1px] opacity-80" />

      {/* LAYER 3: Controlled Readability Gradient */}
      <div
        className="fixed inset-0 transition-opacity duration-1000"
        style={{ background: gradientOverlay }}
      />

      {/* LAYER 4: Destination Ambient Glow Orbs */}
      <div
        className="absolute -top-40 -left-40 w-[42rem] h-[42rem] rounded-full blur-[140px] opacity-60 transition-all duration-1000"
        style={{ backgroundColor: theme.colors.ambientOrbPrimary }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[38rem] h-[38rem] rounded-full blur-[150px] opacity-50 transition-all duration-1000"
        style={{ backgroundColor: theme.colors.ambientOrbSecondary }}
      />

      {/* LAYER 5: Active Non-Obtrusive Particle Canvas (Snowfall / Mist) */}
      <AmbientVisualEffects />
    </div>
  );
}
