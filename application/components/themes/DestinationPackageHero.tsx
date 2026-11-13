'use client';

import React from 'react';
import Image from 'next/image';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';
import { COMPANY_CONTACT } from '@/lib/config/contact';
import { TourPackageCatalogueItem } from '@/lib/quotations/catalogue';
import InteractiveDestinationButton from './InteractiveDestinationButton';

interface DestinationPackageHeroProps {
  packageItem: TourPackageCatalogueItem;
  currentDurationCode?: string;
  onDurationChange?: (code: string) => void;
  availableDurations?: Array<{ code: string; label: string }>;
  climateInfo?: {
    temperature: string;
    seasonLabel: string;
    validityNote: string;
  };
}

export default function DestinationPackageHero({
  packageItem,
  currentDurationCode,
  onDurationChange,
  availableDurations,
  climateInfo,
}: DestinationPackageHeroProps) {
  const theme = useDestinationTheme();

  const climate = climateInfo || theme.hero.climateDefault;

  return (
    <section className="relative mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Main Hero Artwork Frame (8 Cols) */}
        <div className="lg:col-span-8 relative min-h-[500px] md:min-h-[560px] rounded-[2rem] overflow-hidden flex flex-col justify-between p-6 md:p-10 text-white shadow-2xl border border-white/20 group">
          
          {/* Background Image - Explicit z-0 with Next.js Image for optimal crisp rendering */}
          <div className="absolute inset-0 z-0">
            <Image
              src={theme.hero.image}
              alt={packageItem.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            />
          </div>

          {/* Destination Contrast Overlay - Explicit z-10 with tuned darkening gradient */}
          <div
            className="absolute inset-0 z-10 transition-opacity duration-700 pointer-events-none"
            style={{ background: theme.colors.heroOverlay }}
          />

          {/* Content - Explicit z-20 ensuring 100% readability & interactivity */}
          <div className="relative z-20 flex flex-col justify-between h-full min-h-[440px] md:min-h-[480px]">
            
            {/* Top Badges & Duration Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3.5 py-1.5 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/30"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    color: theme.colors.secondary,
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">{theme.decorative.icon}</span>
                  <span>{theme.name} • {climate.seasonLabel}</span>
                </span>

                {/* Optional Duration Switcher */}
                {availableDurations && availableDurations.length > 1 && onDurationChange && (
                  <div className="inline-flex items-center bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/30">
                    {availableDurations.map((dur) => (
                      <button
                        key={dur.code}
                        type="button"
                        onClick={() => onDurationChange(dur.code)}
                        className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                          currentDurationCode === dur.code
                            ? 'bg-white text-slate-900 shadow-md font-extrabold'
                            : 'text-white/80 hover:text-white'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md border border-white/30"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  color: theme.colors.textPrimary,
                }}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: theme.colors.primary }}
                >
                  verified
                </span>
                <span>Private Dedicated Chauffeur</span>
              </span>
            </div>

            {/* Bottom Title & Specs */}
            <div className="mt-auto pt-16">
              <span
                className="text-xs uppercase tracking-widest font-extrabold block mb-2 px-3 py-1 rounded-md backdrop-blur-md inline-block border border-white/20"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  color: theme.colors.secondary,
                }}
              >
                {theme.hero.atmosphereTag}
              </span>
              <h1 className="font-headline text-3xl sm:text-5xl font-extrabold leading-tight mb-3 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                {packageItem.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/95 max-w-2xl mb-6 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium">
                {packageItem.overview}
              </p>

              {/* Interactive Destination Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <InteractiveDestinationButton
                  href="#pricing-calculator"
                  variant="primary"
                  icon="expand_more"
                >
                  Configure Live Tariff
                </InteractiveDestinationButton>

                <InteractiveDestinationButton
                  href={COMPANY_CONTACT.whatsapp.buildUrl(
                    `Hello Varni Holidays, I want to inquire about the ${packageItem.title} (${packageItem.durationNights}N/${packageItem.durationDays}D)`
                  )}
                  variant="whatsapp"
                  target="_blank"
                  icon="chat"
                >
                  WhatsApp Counselor
                </InteractiveDestinationButton>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Highlights Widgets (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          
          {/* Climate & Seasonality Widget */}
          <div
            className="p-5 rounded-[2rem] transition-all bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-lg"
            style={{
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: theme.colors.textMuted }}
              >
                Climate & Best Season
              </span>
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: theme.colors.surfaceMuted,
                  color: theme.colors.primary,
                }}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {theme.id === 'kashmir' ? 'ac_unit' : 'sunny'}
                </span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="font-headline text-2xl font-extrabold"
                style={{ color: theme.colors.textPrimary }}
              >
                {climate.temperature}
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: theme.colors.secondary }}
              >
                {climate.seasonLabel}
              </span>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: theme.colors.textSecondary }}
            >
              {climate.validityNote}
            </p>
          </div>

          {/* Quick Price Matrix Glance */}
          <div
            className="p-5 rounded-[2rem] space-y-3 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-lg"
            style={{
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-bold uppercase tracking-wider block"
                style={{ color: theme.colors.textPrimary }}
              >
                Verified Published Rates
              </span>
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#FFFFFF',
                }}
              >
                {packageItem.durationNights} Nights / {packageItem.durationDays} Days
              </span>
            </div>

            <div
              className="space-y-1.5 text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              <div className="flex justify-between">
                <span>Standard Vehicle (Sedan):</span>
                <span className="font-bold" style={{ color: theme.colors.textPrimary }}>
                  From ₹{packageItem.defaultPriceInr?.toLocaleString('en-IN')} / person
                </span>
              </div>
              <div className="flex justify-between">
                <span>Family Group (Innova Crysta):</span>
                <span className="font-bold" style={{ color: theme.colors.textPrimary }}>
                  From ₹{Math.round(packageItem.defaultPriceInr * 0.88)?.toLocaleString('en-IN')} / person
                </span>
              </div>
              <div className="flex justify-between">
                <span>Large Group (Tempo Traveller):</span>
                <span className="font-bold" style={{ color: theme.colors.textPrimary }}>
                  From ₹{Math.round(packageItem.defaultPriceInr * 0.76)?.toLocaleString('en-IN')} / person
                </span>
              </div>
            </div>

            <span
              className="text-[10px] block pt-1.5 border-t"
              style={{
                borderColor: theme.colors.borderSubtle,
                color: theme.colors.textMuted,
              }}
            >
              Includes dedicated private vehicle 8am–8pm, chauffeur bata, tolls, parking & taxes.
            </span>
          </div>

          {/* Authentic Gujarati Hospitality Trust Badge */}
          <div
            className="p-4 rounded-[2rem] flex items-center gap-3 transition-all bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-lg"
            style={{
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: theme.colors.primary,
                color: '#FFFFFF',
              }}
            >
              <span className="material-symbols-outlined text-[20px]">restaurant</span>
            </div>
            <div>
              <span
                className="text-xs font-bold block"
                style={{ color: theme.colors.textPrimary }}
              >
                Jain & Swaminarayan Dining
              </span>
              <span
                className="text-[11px]"
                style={{ color: theme.colors.textMuted }}
              >
                {theme.decorative.bannerTagline}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
