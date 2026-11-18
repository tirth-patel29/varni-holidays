import type { Metadata, Viewport } from 'next';
import React from 'react';
import { PwaShell } from '@/components/pwa/PwaShell';
import { PwaBottomNav } from '@/components/pwa/PwaBottomNav';

export const metadata: Metadata = {
  title: 'Varni Holidays — Travel Companion',
  description: 'Your personalized luxury travel companion. Live itinerary, quotations, visas, and 24/7 concierge assistance.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Varni Companion',
  },
};

export const viewport: Viewport = {
  themeColor: '#0C2A47',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function CustomerPwaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PwaShell>
      <main className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-20">
        {children}
      </main>
      <PwaBottomNav />
    </PwaShell>
  );
}
