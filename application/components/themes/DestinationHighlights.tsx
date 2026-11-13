'use client';

import React from 'react';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';

interface HighlightItem {
  icon: string;
  title: string;
  desc: string;
}

interface DestinationHighlightsProps {
  highlights?: HighlightItem[];
}

export default function DestinationHighlights({ highlights }: DestinationHighlightsProps) {
  const theme = useDestinationTheme();

  // Default highlights based on active destination
  const defaultHighlights: HighlightItem[] =
    theme.id === 'kashmir'
      ? [
          {
            icon: 'ac_unit',
            title: 'Gulmarg Gondola & Snow Peaks',
            desc: 'Ascend to Apharwat peak at 13,780 ft via the world\'s highest cable car with panoramic Himalayan views.',
          },
          {
            icon: 'directions_boat',
            title: 'Dal Lake Heritage Houseboat',
            desc: 'Stay in carved cedar wood houseboats with sunset Shikara rides past floating markets and lotus blooms.',
          },
          {
            icon: 'park',
            title: 'Pahalgam Pine Meadows',
            desc: 'Wander along the Lidder River, visit Betaab Valley, Aru Valley and scenic mini-Switzerland Baisaran.',
          },
          {
            icon: 'local_florist',
            title: 'Mughal Gardens Srinagar',
            desc: 'Explore terraced water cascades and Persian architecture at Nishat Bagh and Shalimar Bagh.',
          },
        ]
      : theme.id === 'rajasthan'
      ? [
          {
            icon: 'castle',
            title: 'Amber Fort & Royal Palaces',
            desc: 'Ascend royal battlements, mirror halls of Sheesh Mahal, and the iconic pink façade of Hawa Mahal.',
          },
          {
            icon: 'terrain',
            title: 'Sam Sand Dunes Camel Safari',
            desc: 'Witness golden desert sunsets on camelback followed by live Rajasthani folk dances around a campfire.',
          },
          {
            icon: 'sailing',
            title: 'Lake Pichola Boat Cruise',
            desc: 'Sail past fairytale white marble palaces and heritage ghats in the romantic city of lakes, Udaipur.',
          },
          {
            icon: 'shield',
            title: 'Mehrangarh Fort Jodhpur',
            desc: 'Marvel at one of India\'s largest forts perched high above the vibrant blue-painted historic quarter.',
          },
        ]
      : [
          {
            icon: 'landscape',
            title: 'Munnar Tea Hills',
            desc: 'Visit Mattupetty Dam, Echo Point, Kundala Lake, and endangered Nilgiri Tahr at Eravikulam National Park.',
          },
          {
            icon: 'forest',
            title: 'Periyar Wildlife Sanctuary',
            desc: 'Discover aromatic cardamom, pepper, and cinnamon on guided spice walks with optional lake boat safaris.',
          },
          {
            icon: 'directions_boat',
            title: 'Alleppey Backwaters Cruise',
            desc: 'Tranquil palm-fringed canal cruises aboard traditional houseboats with fresh culinary hospitality.',
          },
          {
            icon: 'beach_access',
            title: 'Kovalam Beach & Poovar',
            desc: 'Golden sand shores, Lighthouse Beach sunset strolls, and the sacred ocean confluence of Poovar Island.',
          },
        ];

  const items = highlights && highlights.length > 0 ? highlights : defaultHighlights;

  return (
    <section className="mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest block mb-1"
            style={{ color: theme.colors.primary }}
          >
            {theme.name} Signature Moments
          </span>
          <h2
            className="font-headline text-2xl sm:text-3xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            Curated Journey Highlights
          </h2>
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: theme.colors.textMuted }}
        >
          Included in all verified seasonal departure itineraries
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1"
            style={{
              backgroundColor: theme.colors.surfaceCard,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
              backdropFilter: theme.cards.glassmorphism ? 'blur(10px)' : 'none',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
              style={{
                backgroundColor: theme.colors.surfaceMuted,
                color: theme.colors.primary,
                border: `1px solid ${theme.colors.borderSubtle}`,
              }}
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
            </div>

            <h3
              className="font-headline text-base font-bold mb-2 leading-snug"
              style={{ color: theme.colors.textPrimary }}
            >
              {item.title}
            </h3>

            <p
              className="text-xs leading-relaxed"
              style={{ color: theme.colors.textSecondary }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
