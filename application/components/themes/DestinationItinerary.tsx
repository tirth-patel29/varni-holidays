'use client';

import React from 'react';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';

export interface ItineraryDayItem {
  dayNumber: number;
  title: string;
  description: string;
  meals: string;
  stayDestination: string;
  route?: string;
}

interface DestinationItineraryProps {
  itineraryDays: ItineraryDayItem[];
  durationNights: number;
  durationDays: number;
}

export default function DestinationItinerary({
  itineraryDays,
  durationNights,
  durationDays,
}: DestinationItineraryProps) {
  const theme = useDestinationTheme();

  return (
    <section className="mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest block mb-1"
            style={{ color: theme.colors.primary }}
          >
            {durationNights} Nights / {durationDays} Days Day-Wise Route
          </span>
          <h2
            className="font-headline text-2xl sm:text-3xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            Complete Planned Itinerary
          </h2>
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: theme.colors.textMuted }}
        >
          Dedicated private vehicle at your disposal daily from 8:00 AM to 8:00 PM
        </span>
      </div>

      <div className="space-y-4">
        {itineraryDays.map((item) => (
          <div
            key={item.dayNumber}
            className="p-6 sm:p-7 rounded-3xl transition-all duration-300 hover:shadow-md flex flex-col md:flex-row gap-6 items-start"
            style={{
              backgroundColor: theme.colors.surfaceCard,
              border: `1px solid ${theme.colors.border}`,
              backdropFilter: theme.cards.glassmorphism ? 'blur(10px)' : 'none',
            }}
          >
            {/* Left Day Pill & Night Stay (Fixed Width) */}
            <div className="md:w-40 shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
              <span
                className="px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-xs text-white"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Day {item.dayNumber}
              </span>
              <span
                className="text-xs font-bold mt-1"
                style={{ color: theme.colors.secondary }}
              >
                Night in {item.stayDestination}
              </span>
            </div>

            {/* Right Details */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3
                  className="font-headline text-base sm:text-lg font-bold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {item.title}
                </h3>
                {item.meals && (
                  <span
                    className="text-[11px] font-semibold px-3 py-1 rounded-full w-fit shrink-0"
                    style={{
                      backgroundColor: theme.colors.badgeBg,
                      color: theme.colors.badgeText,
                    }}
                  >
                    {item.meals}
                  </span>
                )}
              </div>

              {item.route && (
                <span
                  className="text-xs font-semibold block"
                  style={{ color: theme.colors.secondary }}
                >
                  Route: {item.route}
                </span>
              )}

              <p
                className="text-xs sm:text-[13px] leading-relaxed"
                style={{ color: theme.colors.textSecondary }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
