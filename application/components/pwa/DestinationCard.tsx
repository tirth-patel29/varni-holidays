'use client';

import React from 'react';
import Link from 'next/link';

interface DestinationItem {
  id: string;
  name: string;
  imageUrl: string;
  tag?: string;
}

const FEATURED_DESTINATIONS: DestinationItem[] = [
  {
    id: 'switzerland',
    name: 'Switzerland',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80',
    tag: 'Alpine',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80',
    tag: 'Luxury',
  },
  {
    id: 'japan',
    name: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
    tag: 'Cultural',
  },
];

export function ExplorePreviewSection() {
  return (
    <section className="px-5 pt-1 pb-4" data-purpose="explore-destinations">
      {/* Section Title Bar */}
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight font-sans">
          Explore Destinations
        </h3>
        <Link
          href="/app/explore"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          See All
        </Link>
      </div>

      {/* Horizontal Thumbnail Cards with glass rounded style */}
      <div className="grid grid-cols-3 gap-3">
        {FEATURED_DESTINATIONS.map((dest) => (
          <Link
            key={dest.id}
            href={`/app/explore?destination=${dest.id}`}
            className="h-24 rounded-2xl overflow-hidden shadow-sm border border-white/80 relative group cursor-pointer block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={dest.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              src={dest.imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-1.5">
              <span className="text-[11px] font-semibold text-white drop-shadow-sm truncate">
                {dest.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
