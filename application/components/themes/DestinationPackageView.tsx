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
      {/* 5-Layer Fixed Background Environment: Panoramic Photography, Depth Blur, Dynamic Gradients, Ambient Glow, Snowfall/Mist */}
      <DestinationBackgroundEnvironment />

      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-4 md:px-8 py-6">
        
        {/* Themed Breadcrumb Bar */}
        <div className="flex items-center gap-2 text-xs mb-6 font-semibold" style={{ color: theme.colors.textMuted }}>
          <Link href="/" className="hover:opacity-80 transition-opacity">
            Home
          </Link>
          <span>/</span>
          <Link href="/packages" className="hover:opacity-80 transition-opacity">
            Packages
          </Link>
          <span>/</span>
          <span className="font-extrabold" style={{ color: theme.colors.primary }}>
            {packageItem.destination} ({activeDurationNights}N / {activeDurationDays}D)
          </span>
        </div>

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
