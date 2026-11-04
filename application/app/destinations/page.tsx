'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Destination {
  id: string;
  name: string;
  tagline: string;
  category: 'domestic' | 'international';
  duration: string;
  highlights: string[];
  image: string;
  badge?: string;
  hasCalculator?: boolean;
  packageSlug?: string;
  startingPrice?: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: 'kerala',
    name: 'Kerala, India',
    tagline: "God's Own Country – Mist-kissed Hills & Serene Backwaters",
    category: 'domestic',
    duration: '6 Nights / 7 Days',
    highlights: ['Eravikulam Tahr Sanctuary', 'Periyar Wildlife Boating', 'Alleppey Backwaters Houseboat', 'Kovalam Lighthouse Beach'],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    badge: 'Live Pricing Engine',
    hasCalculator: true,
    packageSlug: '/packages/kerala-6n7d-winter',
    startingPrice: '₹18,200',
  },
  {
    id: 'kashmir',
    name: 'Kashmir Valley, India',
    tagline: 'Paradise on Earth – Shikaras, Snow Peaks & Valley of Shepherds',
    category: 'domestic',
    duration: '5 Nights / 6 Days',
    highlights: ['Dal Lake Houseboat Stay', 'Gulmarg Gondola Phase 1 & 2', 'Pahalgam Betaab Valley', 'Mughal Gardens Srinagar'],
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
    badge: 'Popular Group Tour',
    startingPrice: 'Custom Quote',
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan, India',
    tagline: 'Land of Maharajas – Forts, Palaces & Desert Sunsets',
    category: 'domestic',
    duration: '7 Nights / 8 Days',
    highlights: ['Amber Fort & Hawa Mahal', 'Lake Pichola Udaipur Boat Ride', 'Sam Sand Dunes Desert Safari', 'Mehrangarh Fort Jodhpur'],
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    startingPrice: 'Custom Quote',
  },
  {
    id: 'andaman',
    name: 'Andaman & Nicobar, India',
    tagline: 'Turquoise Waters & Pristine Coral Reefs',
    category: 'domestic',
    duration: '5 Nights / 6 Days',
    highlights: ['Radhanagar Beach Sunset', 'Elephant Beach Coral Snorkelling', 'Cellular Jail Light & Sound', 'Ross Island Colonial Heritage'],
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    startingPrice: 'Custom Quote',
  },
  {
    id: 'dubai',
    name: 'Dubai & Abu Dhabi, UAE',
    tagline: 'Futuristic Architecture, Desert Dynasties & Luxury Shopping',
    category: 'international',
    duration: '4 Nights / 5 Days',
    highlights: ['Burj Khalifa 124th Floor Observation', 'Desert 4x4 Dune Bashing & BBQ', 'Sheikh Zayed Grand Mosque', 'Marina Luxury Dhow Dinner Cruise'],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    badge: 'Express Visa Available',
    startingPrice: 'Custom Quote',
  },
  {
    id: 'bali',
    name: 'Bali, Indonesia',
    tagline: 'Island of the Gods – Sacred Temples, Terraces & Beach Clubs',
    category: 'international',
    duration: '5 Nights / 6 Days',
    highlights: ['Tegalalang Rice Terraces Ubud', 'Uluwatu Sunset Kecak Fire Dance', 'Nusa Penida Kelingking T-Rex Cliff', 'Seminyak Beachfront Sunset Dinners'],
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    badge: 'Trending International',
    startingPrice: 'Custom Quote',
  },
  {
    id: 'switzerland',
    name: 'Switzerland & Paris, Europe',
    tagline: 'Alpine Dreams & Romantic Boulevards',
    category: 'international',
    duration: '7 Nights / 8 Days',
    highlights: ['Jungfraujoch Top of Europe', 'Lake Lucerne Cruise & Mount Titlis', 'Eiffel Tower & Seine River Cruise', 'Scenic Swiss GoldenPass Train'],
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    badge: 'Schengen Assistance',
    startingPrice: 'Custom Quote',
  },
  {
    id: 'vietnam',
    name: 'Vietnam (Hanoi & Da Nang)',
    tagline: 'Limestone Karsts, Lantern Towns & Timeless Culture',
    category: 'international',
    duration: '6 Nights / 7 Days',
    highlights: ['Ha Long Bay Luxury Overnight Cruise', 'Ba Na Hills Golden Bridge', 'Hoi An Ancient Lantern Town', 'Hanoi Old Quarter Street Food Tour'],
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    badge: 'Popular for Couples',
    startingPrice: 'Custom Quote',
  },
];

export default function DestinationsPage() {
  const [filter, setFilter] = useState<'all' | 'domestic' | 'international'>('all');

  const filtered = filter === 'all' ? DESTINATIONS : DESTINATIONS.filter((d) => d.category === filter);

  return (
    <div className="min-h-screen bg-sand pb-24">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-ocean via-ocean-dark to-slate-900 text-sand-light pt-36 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(233,185,94,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand-light/10 text-gold font-medium text-xs tracking-wider uppercase backdrop-blur-md mb-4 border border-sand-light/10">
            Handcrafted Journeys
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-6 font-semibold tracking-tight">
            Curated Destinations for <br className="hidden sm:block" />
            <span className="italic font-normal text-gold">Joyful Holidays</span>
          </h1>
          <p className="text-sand/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            From the tranquil emerald backwaters of Kerala to the glittering skylines of Dubai and snow-draped Swiss peaks. Every itinerary is tailored by travel specialists in Anand, Gujarat.
          </p>

          {/* Category Tabs */}
          <div className="flex justify-center gap-3 mt-10">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                filter === 'all'
                  ? 'bg-gold text-ocean-dark shadow-gold/30'
                  : 'bg-white/10 text-sand hover:bg-white/20'
              }`}
            >
              All Destinations ({DESTINATIONS.length})
            </button>
            <button
              onClick={() => setFilter('domestic')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                filter === 'domestic'
                  ? 'bg-gold text-ocean-dark shadow-gold/30'
                  : 'bg-white/10 text-sand hover:bg-white/20'
              }`}
            >
              Domestic ({DESTINATIONS.filter((d) => d.category === 'domestic').length})
            </button>
            <button
              onClick={() => setFilter('international')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                filter === 'international'
                  ? 'bg-gold text-ocean-dark shadow-gold/30'
                  : 'bg-white/10 text-sand hover:bg-white/20'
              }`}
            >
              International ({DESTINATIONS.filter((d) => d.category === 'international').length})
            </button>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dest) => (
            <div
              key={dest.id}
              className="clay-card rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
            >
              {/* Image & Badges */}
              <div className="relative h-60 w-full overflow-hidden bg-sand-dark">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/80 via-transparent to-black/20" />

                <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ocean/90 text-white backdrop-blur-md shadow-sm">
                    {dest.category}
                  </span>
                  {dest.badge && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold text-ocean-dark backdrop-blur-md shadow-sm">
                      {dest.badge}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-sand/90 font-medium mb-1">
                    <span className="material-symbols-outlined text-[16px] text-gold">schedule</span>
                    {dest.duration}
                  </div>
                  <h3 className="font-serif text-2xl font-bold leading-snug drop-shadow-sm">{dest.name}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium italic mb-4">{dest.tagline}</p>

                  <h4 className="text-xs font-bold text-ocean uppercase tracking-wider mb-2">Key Highlights</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                    {dest.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[15px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-sand-dark/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Starting From</span>
                    <span className="text-base font-bold text-ocean font-serif">{dest.startingPrice}</span>
                  </div>

                  {dest.hasCalculator ? (
                    <Link
                      href={dest.packageSlug || '/packages'}
                      className="clay-pill-button inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:bg-ocean-dark"
                    >
                      <span>Explore Rates</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/contact?destination=${encodeURIComponent(dest.name)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-ocean bg-sand hover:bg-gold/20 transition-colors"
                    >
                      <span>Custom Enquiry</span>
                      <span className="material-symbols-outlined text-[14px]">send</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Tailored Trip Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20">
        <div className="clay-card rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-br from-sand-light via-sand to-sand-dark border border-gold/30">
          <span className="material-symbols-outlined text-4xl text-gold mb-3">travel_explore</span>
          <h2 className="font-serif text-2xl sm:text-3xl text-ocean font-bold mb-3">
            Don't See Your Dream Destination Listed?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-6">
            We handle custom domestic and international group itineraries, senior citizen tours, corporate retreats, and luxury private getaways across 40+ countries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="clay-pill-button px-6 py-3 rounded-full text-white text-sm font-bold shadow-md hover:bg-ocean-dark"
            >
              Speak with a Travel Specialist
            </Link>
            <a
              href="https://wa.me/919924111111?text=Hello%20Varni%20Holidays%2C%20I%20am%20looking%20for%20a%20custom%20holiday%20itinerary."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-sm transition-colors border border-emerald-200"
            >
              <span className="material-symbols-outlined text-emerald-600">chat</span>
              WhatsApp Us in Anand
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

