'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface UpcomingTripHeroProps {
  tripId?: string;
  destination: string;
  dates: string;
  imageUrl?: string;
  badgeText?: string;
}

export function UpcomingTripHero({
  tripId = 'switzerland-may-2026',
  destination = 'Switzerland',
  dates = '12 May – 21 May',
  imageUrl = 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
  badgeText = 'Upcoming Trip',
}: UpcomingTripHeroProps) {
  return (
    <section className="px-5 pt-1" data-purpose="upcoming-trip-card">
      <div className="relative rounded-[28px] overflow-hidden shadow-lg h-[210px] select-none border border-white/60 group">
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${destination} preview`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={imageUrl}
        />

        {/* Subtle Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-black/30 pointer-events-none" />

        {/* Card Content Container */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          {/* Top Frosted Pill Tag */}
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white/95 bg-white/20 backdrop-blur-[8px] border border-white/30 shadow-sm">
              {badgeText}
            </span>
          </div>

          {/* Bottom Details & Navigation Button */}
          <div className="flex items-end justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm font-sans">
                {destination}
              </h2>
              <p className="text-[13px] font-normal text-white/90 mt-0.5">{dates}</p>
            </div>

            {/* Frosted Glass Forward Action Button */}
            <Link
              href={`/app/trips/${tripId}`}
              aria-label={`View ${destination} trip details`}
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-[8px] border border-white flex items-center justify-center text-slate-900 shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <ArrowRight className="w-5 h-5 text-slate-900" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
