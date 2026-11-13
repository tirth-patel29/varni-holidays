'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TourPackageCatalogueItem } from '@/lib/quotations/catalogue';
import { DestinationTheme } from '@/lib/themes/types';
import { DestinationThemeProvider } from '@/lib/themes/DestinationThemeProvider';
import DestinationBackgroundEnvironment from './DestinationBackgroundEnvironment';
import DestinationPackageHero from './DestinationPackageHero';
import DestinationHighlights from './DestinationHighlights';
import DestinationGallerySection from './DestinationGallerySection';
import DestinationItinerary from './DestinationItinerary';
import DestinationInclusions from './DestinationInclusions';
import DestinationPricingSection from './DestinationPricingSection';
import { KERALA_ITINERARIES, KeralaDuration, KERALA_DURATION_OPTIONS } from '@/lib/pricing/kerala';

interface DestinationPackageViewProps {
  packageItem: TourPackageCatalogueItem;
  theme: DestinationTheme;
}

export default function DestinationPackageView({
  packageItem,
  theme,
}: DestinationPackageViewProps) {
  // Support duration switching for packages that have options (like Kerala 5N6D vs 6N7D)
  const isKerala = theme.id === 'kerala' || packageItem.slug === 'kerala-6n7d-winter';
  const [keralaDuration, setKeralaDuration] = useState<KeralaDuration>('6N7D');

  // If Kerala, use duration-specific itinerary; otherwise use packageItem's itineraryDays
  const activeItinerary = isKerala
    ? KERALA_ITINERARIES[keralaDuration].map((item, idx) => ({
        dayNumber: idx + 1,
        title: item.title,
        description: item.desc,
        meals: item.meals,
        stayDestination: item.stay,
        route: item.route,
      }))
    : packageItem.itineraryDays.map((item) => ({
        dayNumber: item.dayNumber,
        title: item.title,
        description: item.description,
        meals: item.meals,
        stayDestination: item.stayDestination,
      }));

  const activeDurationNights = isKerala
    ? (keralaDuration === '5N6D' ? 5 : 6)
    : packageItem.durationNights;

  const activeDurationDays = isKerala
    ? (keralaDuration === '5N6D' ? 6 : 7)
    : packageItem.durationDays;

  const keralaDurations = KERALA_DURATION_OPTIONS.map((d) => ({
    code: d.code,
    label: d.label,
  }));

  return (
    <DestinationThemeProvider theme={theme}>
      {/* 5-Layer Fixed Background Environment: Panoramic Photography, Balanced Gradient, Ambient Glow, Snowfall/Mist */}
      <DestinationBackgroundEnvironment />

      {/* Main Page Content Layer — Layer 4 & 5 (z-20 / z-30) */}
      <div className="relative z-20 w-full max-w-[1380px] mx-auto px-4 md:px-8 py-6">
        
        {/* Layer 5: High-Contrast Frosted Glass Breadcrumb Pill */}
        <nav
          aria-label="Breadcrumb"
          className="inline-flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-full bg-white/94 backdrop-blur-md border border-white/70 shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-xs font-semibold mb-6 relative z-30 transition-all hover:bg-white"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">home</span>
            <span>Home</span>
          </Link>

          <span className="material-symbols-outlined text-[14px] text-slate-400 select-none">
            chevron_right
          </span>

          <Link
            href="/packages"
            className="text-slate-700 hover:text-slate-950 transition-colors"
          >
            Holiday Packages
          </Link>

          <span className="material-symbols-outlined text-[14px] text-slate-400 select-none">
            chevron_right
          </span>

          {/* Destination Scope Pill */}
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border shadow-2xs"
            style={{
              backgroundColor: theme.colors.badgeBg,
              color: theme.colors.badgeText,
              borderColor: theme.colors.borderSubtle,
            }}
          >
            {theme.name}
          </span>

          <span className="material-symbols-outlined text-[14px] text-slate-400 select-none hidden sm:inline">
            chevron_right
          </span>

          {/* Active Package Title with Destination Accent Dot */}
          <span
            className="hidden sm:flex items-center gap-1.5 text-slate-950 font-extrabold max-w-[260px] md:max-w-md truncate"
            title={packageItem.title}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <span className="truncate">{packageItem.title}</span>
            <span className="text-[11px] font-bold text-slate-500 shrink-0">
              ({activeDurationNights}N/{activeDurationDays}D)
            </span>
          </span>
        </nav>

        {/* Themed Hero Showcase with Verified High-Res Photography */}
        <DestinationPackageHero
          packageItem={packageItem}
          currentDurationCode={isKerala ? keralaDuration : undefined}
          onDurationChange={isKerala ? (code) => setKeralaDuration(code as KeralaDuration) : undefined}
          availableDurations={isKerala ? keralaDurations : undefined}
        />

        {/* Curated Highlights Bento */}
        <DestinationHighlights />

        {/* 6-Photo Visual Atmosphere & Storytelling Gallery */}
        <DestinationGallerySection />

        {/* Complete Day-Wise Itinerary */}
        <DestinationItinerary
          itineraryDays={activeItinerary}
          durationNights={activeDurationNights}
          durationDays={activeDurationDays}
        />

        {/* Inclusions & Exclusions */}
        <DestinationInclusions
          inclusions={packageItem.inclusions}
          exclusions={packageItem.exclusions}
        />

        {/* Dynamic Pricing Engine & Formal Proposal Request */}
        <DestinationPricingSection
          packageItem={packageItem}
          currentDuration={keralaDuration}
          onDurationChange={setKeralaDuration}
        />
      </div>
    </DestinationThemeProvider>
  );
}
