import React, { Suspense } from 'react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getAuthenticatedCustomer } from '@/lib/auth/customer-auth';
import { SocialAuthSheet } from '@/components/pwa/SocialAuthSheet';

export const metadata = {
  title: 'Welcome — Varni Holidays Companion',
  description: 'Sign in to access your itinerary, visa documents, and travel concierge.',
};

export default async function WelcomePage() {
  const customer = await getAuthenticatedCustomer();
  if (customer) {
    redirect('/app');
  }
  return (
    <div className="relative min-h-[820px] flex flex-col justify-between p-0 overflow-hidden select-none">
      {/* Alpine Mountain Background Image - Full-Bleed Atmospheric Landscape */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Alpine mountain landscape with snow peaks and vivid blue sky"
          className="w-full h-full object-cover object-[center_28%]"
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"
        />
        {/* Subtle atmospheric soft light reflections */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-sky-950/25 pointer-events-none" />
      </div>

      {/* Brand Header */}
      <section className="relative z-10 w-full flex flex-col items-center pt-12" data-purpose="status-and-branding">
        <div className="flex flex-col items-center">
          {/* Official Varni Holidays Logo Card */}
          <div className="bg-white/92 backdrop-blur-xl rounded-[24px] px-6 py-3 shadow-xl border border-white/90 mb-2 flex items-center justify-center">
            <Image
              src="/logo.webp"
              alt="Varni Holidays"
              width={220}
              height={120}
              priority
              className="h-12 w-auto object-contain drop-shadow-xs"
            />
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-[#0D2B45] shadow-xs border border-white/60">
            Travel Companion
          </span>
        </div>
      </section>

      {/* Glassmorphic Bottom Sheet */}
      <section className="relative z-10 w-full px-3.5 pb-5" data-purpose="auth-card-container">
        <div className="organic-glass-sheet px-6 pt-7 pb-6 flex flex-col items-start text-left rounded-[42px] shadow-2xl">
          {/* Header Text */}
          <h2 className="text-[26px] font-bold text-[#0C2740] leading-[1.18] tracking-tight font-sans">
            Welcome to<br />Varni Holidays
          </h2>
          <p className="text-[14px] text-slate-600 mt-2 font-normal">
            Your trips, all in one place.
          </p>

          {/* Social Authentication Buttons Component */}
          <div className="w-full mt-6">
            <Suspense fallback={<div className="h-28 flex items-center justify-center text-xs text-slate-400">Loading sign-in...</div>}>
              <SocialAuthSheet />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
