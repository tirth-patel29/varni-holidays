'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';
import { getDestinationAssets, GalleryPhoto } from '@/lib/themes/destination-assets';

export default function DestinationGallerySection() {
  const theme = useDestinationTheme();
  const assets = getDestinationAssets(theme.id);
  const photos = assets.gallery;

  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  if (!photos || photos.length === 0) return null;

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest block mb-1"
            style={{ color: theme.colors.primary }}
          >
            Visual Atmosphere & Storytelling
          </span>
          <h2
            className="font-headline text-2xl sm:text-3xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            {theme.name} Through the Lens
          </h2>
        </div>
        <span className="text-xs font-medium" style={{ color: theme.colors.textMuted }}>
          Authentic photography from verified itinerary destinations
        </span>
      </div>

      {/* Gallery Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setActivePhoto(photo)}
            className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 border border-white/60"
            style={{ borderColor: theme.colors.borderSubtle }}
          >
            {/* Image */}
            <Image
              src={photo.url}
              alt={photo.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-108 transition-transform duration-700"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Top Location Pill */}
            <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold tracking-wide flex items-center gap-1 border border-white/20">
              <span className="material-symbols-outlined text-[13px] text-amber-300">location_on</span>
              <span>{photo.location}</span>
            </span>

            {/* Bottom Content */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-headline text-base font-bold leading-snug drop-shadow-sm group-hover:text-amber-200 transition-colors">
                {photo.title}
              </h3>
              <p className="text-[11px] text-white/80 line-clamp-2 mt-1 leading-relaxed">
                {photo.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
          >
            <div className="relative h-96 sm:h-[480px] w-full">
              <Image
                src={activePhoto.url}
                alt={activePhoto.title}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-white bg-slate-950">
              <span className="text-xs uppercase font-bold text-amber-400 block mb-1">
                {activePhoto.location}
              </span>
              <h3 className="text-xl font-bold font-headline">{activePhoto.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
