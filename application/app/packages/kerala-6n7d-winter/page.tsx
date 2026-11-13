import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOUR_PACKAGES_CATALOGUE } from '@/lib/quotations/catalogue';
import { KERALA_THEME } from '@/lib/themes/registry';
import DestinationPackageView from '@/components/themes/DestinationPackageView';

export const metadata: Metadata = {
  title: 'Scenic Kerala & Backwaters Grand Tour (6N/7D) — Varni Holidays',
  description:
    'Experience Munnar tea plantations, Thekkady Periyar wildlife, Alleppey houseboat backwaters, and Kovalam beach with authentic Gujarati meal guidance and verified rates.',
  openGraph: {
    title: 'Scenic Kerala & Backwaters Grand Tour (6N/7D) | Varni Holidays',
    description: 'Explore Kerala with verified winter package pricing, 5 hotel tiers, and private vehicle at disposal.',
    images: [{ url: KERALA_THEME.hero.image }],
  },
};

export default function KeralaPackageDetailPage() {
  const pkg = TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === 'kerala-6n7d-winter');

  if (!pkg) {
    notFound();
  }

  return <DestinationPackageView packageItem={pkg} theme={KERALA_THEME} />;
}
