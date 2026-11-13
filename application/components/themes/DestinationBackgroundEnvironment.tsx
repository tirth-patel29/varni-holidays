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

  // Balanced atmospheric gradient overlays — preserves panoramic photography visibility without excessive white fog
  const gradientOverlay = isKashmir
    ? 'linear-gradient(180deg, rgba(8, 30, 56, 0.78) 0%, rgba(11, 37, 69, 0.55) 20%, rgba(224, 242, 254, 0.35) 55%, rgba(240, 247, 255, 0.65) 100%)'
    : isKerala
    ? 'linear-gradient(180deg, rgba(10, 51, 37, 0.78) 0%, rgba(13, 74, 54, 0.55) 20%, rgba(235, 245, 238, 0.35) 55%, rgba(244, 242, 237, 0.65) 100%)'
    : 'linear-gradient(180deg, rgba(15, 23, 42, 0.78) 0%, rgba(30, 41, 59, 0.55) 20%, rgba(250, 250, 249, 0.35) 55%, rgba(255, 255, 255, 0.65) 100%)';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none isolate"
      aria-hidden="true"
    >
      {/* LAYER 1: Full-Viewport Fixed High-Resolution Panoramic Landscape Photo */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-100 opacity-75"
        style={{
          backgroundImage: `url('${assets.fullPageBackground}')`,
          backgroundAttachment: 'fixed',
        }}
      />

      {/* LAYER 2: Balanced Readability Gradient Overlay */}
      <div
        className="fixed inset-0 transition-opacity duration-1000"
        style={{ background: gradientOverlay }}
      />

      {/* LAYER 3: Ambient Destination Glow Orbs (Layer 1-2 sub-element) */}
      <div
        className="absolute -top-36 -left-36 w-[38rem] h-[38rem] rounded-full blur-[140px] opacity-45 transition-all duration-1000 pointer-events-none"
        style={{ backgroundColor: theme.colors.ambientOrbPrimary }}
      />
      <div
        className="absolute top-1/2 -right-36 w-[34rem] h-[34rem] rounded-full blur-[150px] opacity-35 transition-all duration-1000 pointer-events-none"
        style={{ backgroundColor: theme.colors.ambientOrbSecondary }}
      />

      {/* LAYER 4: Active Non-Obtrusive Particle Canvas (Snowfall / Mist) — Layer 3 (z-10) */}
      <AmbientVisualEffects />
    </div>
  );
}
