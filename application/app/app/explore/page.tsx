'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

interface DestinationCardData {
  id: string;
  name: string;
  category: 'Domestic' | 'International' | 'Beaches';
  tags: string;
  imageUrl: string;
  packageSlug?: string;
  price?: string;
}

const DESTINATIONS: DestinationCardData[] = [
  {
    id: 'switzerland',
    name: 'Switzerland',
    category: 'International',
    tags: 'Alps · Lakes · Scenic',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    packageSlug: 'switzerland-alpine-escape',
    price: '₹1,45,000',
  },
  {
    id: 'maldives',
    name: 'Maldives',
    category: 'Beaches',
    tags: 'Beaches · Resorts · Luxury',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
    packageSlug: 'maldives-island-luxury',
    price: '₹85,000',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    category: 'International',
    tags: 'Skyline · Desert · Shopping',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    packageSlug: 'dubai-5n6d',
    price: '₹62,000',
  },
  {
    id: 'kerala',
    name: 'Kerala',
    category: 'Domestic',
    tags: 'Backwaters · Hills · Tea Gardens',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    packageSlug: 'kerala-6n7d-winter',
    price: '₹24,500',
  },
  {
    id: 'kashmir',
    name: 'Kashmir',
    category: 'Domestic',
    tags: 'Snow Peaks · Dal Lake · Valleys',
    imageUrl: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    packageSlug: 'kashmir-valley-5n6d',
    price: '₹28,900',
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    category: 'Domestic',
    tags: 'Royal Palaces · Heritage · Forts',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    packageSlug: 'rajasthan-royal-7n8d',
    price: '₹34,000',
  },
];

const CATEGORIES = ['All', 'Domestic', 'International', 'Beaches'] as const;

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDestinations = DESTINATIONS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-3.5 pt-2">
      {/* Top Sticky Header */}
      <div className="px-5">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 leading-tight font-sans">
          Explore
        </h1>

        {/* Search Bar */}
        <div className="mt-3 relative flex items-center glass-card px-4 py-2.5 rounded-full shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0 stroke-[2.2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Where do you want to go?"
            className="w-full bg-transparent placeholder-slate-400 text-slate-800 text-[14px] p-0 border-none focus:outline-none focus:ring-0 leading-tight"
          />
        </div>

        {/* Filter Categories Row */}
        <div className="mt-3 flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 text-[13px] font-medium">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full shrink-0 transition-all font-medium text-[13px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-white/30'
                    : 'glass-pill text-slate-700 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Destination Feed */}
      <div className="px-5 space-y-3.5">
        {filteredDestinations.map((dest) => (
          <Link
            key={dest.id}
            href={`/packages/${dest.packageSlug || dest.id}`}
            className="relative w-full h-[184px] rounded-[26px] overflow-hidden shadow-[0_10px_24px_rgba(20,50,90,0.1)] group active:scale-[0.99] transition-transform cursor-pointer border border-white/70 block"
          >
            {/* Background Scenic Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={dest.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={dest.imageUrl}
            />

            {/* Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

            {/* Destination Details */}
            <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between">
              <div className="text-white drop-shadow-sm">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-normal leading-tight font-sans">
                    {dest.name}
                  </h2>
                  {dest.price && (
                    <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-white/95 border border-white/30">
                      from {dest.price}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-white/90 font-normal mt-0.5 tracking-wide">
                  {dest.tags}
                </p>
              </div>

              {/* Frosted Glass Arrow Button */}
              <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white flex items-center justify-center text-slate-800 shadow-md group-hover:bg-white transition-colors shrink-0">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>
        ))}

        {filteredDestinations.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center my-6">
            <p className="text-sm font-semibold text-slate-700">No destinations found</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for a different country, city or theme.</p>
          </div>
        )}
      </div>
    </div>
  );
}
