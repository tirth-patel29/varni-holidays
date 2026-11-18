'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Plane,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  MapPin,
  FileText,
} from 'lucide-react';

interface BookingRecord {
  id: string;
  bookingReference: string;
  status: string;
  travelStartDate: string | Date;
  travelEndDate: string | Date;
  totalAmountInr: any;
  paidAmountInr: any;
  balanceAmountInr: any;
  quotation?: {
    title?: string;
    destination?: string;
    adultsCount?: number;
    childrenCount?: number;
  } | null;
  services?: any[];
}

interface TripsListClientProps {
  counts: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  upcoming: BookingRecord[];
  ongoing: BookingRecord[];
  completed: BookingRecord[];
}

type Tab = 'upcoming' | 'ongoing' | 'completed';

export function TripsListClient({ counts, upcoming, ongoing, completed }: TripsListClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const currentList =
    activeTab === 'upcoming' ? upcoming : activeTab === 'ongoing' ? ongoing : completed;

  const formatDate = (dateVal: string | Date) => {
    return new Date(dateVal).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDestinationImage = (dest?: string) => {
    const d = (dest || '').toLowerCase();
    if (d.includes('switzerland')) return 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80';
    if (d.includes('kerala')) return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80';
    if (d.includes('dubai')) return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80';
    if (d.includes('kashmir')) return 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="space-y-4 pt-2 px-5">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Confirmed Journeys
        </div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight font-sans">
          My Bookings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track confirmed tours, live flight schedules, and trip vouchers.
        </p>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="w-full p-1 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-between shadow-sm border border-white/80">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Upcoming</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            {counts.upcoming}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ongoing')}
          className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'ongoing'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Ongoing</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'ongoing' ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            {counts.ongoing}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Completed</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            {counts.completed}
          </span>
        </button>
      </div>

      {/* Bookings List or Empty State */}
      {currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((booking) => {
            const destination = booking.quotation?.destination || booking.quotation?.title || 'Custom Tour';
            const adults = booking.quotation?.adultsCount || 2;
            const children = booking.quotation?.childrenCount || 0;
            const totalTravelers = adults + children;
            const isFullyPaid = Number(booking.balanceAmountInr) <= 0;

            return (
              <div
                key={booking.id}
                className="glass-card rounded-[28px] p-4 shadow-sm flex flex-col space-y-3.5 border border-white/80"
              >
                {/* Media Banner */}
                <div className="relative rounded-2xl overflow-hidden h-[150px] shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getDestinationImage(destination)}
                    alt={destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Top Status & Reference Pill */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                      #{booking.bookingReference}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Bottom Destination Title */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <h2 className="text-xl font-bold tracking-tight">{destination}</h2>
                    <p className="text-[11px] text-white/90 font-medium">
                      {formatDate(booking.travelStartDate)} – {formatDate(booking.travelEndDate)}
                    </p>
                  </div>
                </div>

                {/* Booking Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/60">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Travelers
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{totalTravelers} Guests</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/60">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Payment Status
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                      {isFullyPaid ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid in Full</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Bal: ₹{Number(booking.balanceAmountInr).toLocaleString('en-IN')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Details Action Link */}
                <Link
                  href={`/app/trips/${booking.id}`}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition cursor-pointer"
                >
                  <span>View Trip Overview & Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        /* Crisp Glass Empty State */
        <div className="glass-card rounded-[28px] p-8 text-center space-y-3.5 border border-white/80 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
            <Calendar className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            No {activeTab} bookings found
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {activeTab === 'upcoming'
              ? 'You do not have any upcoming holiday departures scheduled. Explore our hand-crafted departures or approve an official quotation.'
              : `You have no ${activeTab} journeys on record with Varni Holidays.`}
          </p>
          <div className="pt-2">
            <Link
              href="/app/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.98] transition"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
