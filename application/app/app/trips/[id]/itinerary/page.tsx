import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomerBookingDetail } from '@/lib/pwa/customer-data';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Hotel,
  Compass,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ItineraryPageProps {
  params: {
    id: string;
  };
}

export default async function TripItineraryPage({ params }: ItineraryPageProps) {
  // STRICT DATA ISOLATION: Derives customer from session
  const booking = await getCustomerBookingDetail(params.id);

  if (!booking) {
    notFound();
  }

  const destination = booking.quotation?.destination || booking.quotation?.title || 'Tour Itinerary';
  const startDate = new Date(booking.travelStartDate);

  // Parse itineraryJson
  const rawItinerary = booking.quotation?.itineraryJson;
  const itineraryDays: any[] = Array.isArray(rawItinerary)
    ? rawItinerary
    : [
        {
          day: 1,
          title: `Arrival at ${destination} & Private Transfer`,
          activities: 'Arrival at airport, meet our local representative, private transfer to hotel, check-in and evening at leisure to explore nearby scenic surroundings.',
          meals: 'Dinner (Pure Veg / Jain Available)',
          stay: 'Comfort Boutique Hotel',
        },
        {
          day: 2,
          title: 'Full Day Iconic Guided Tour & Sightseeing',
          activities: 'Morning guided exploration of prominent scenic viewpoints, cultural heritage sites, scenic lake cruises or mountain cable railways.',
          meals: 'Breakfast & Dinner',
          stay: 'Comfort Boutique Hotel',
        },
        {
          day: 3,
          title: 'Signature Experiences & Regional Flavours',
          activities: 'Scenic excursion through valleys, local market visits, panoramic photography stops and traditional hospitality.',
          meals: 'Breakfast & Dinner',
          stay: 'Comfort Boutique Hotel',
        },
      ];

  const getDayDate = (dayIndex: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayIndex);
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F8FC] pb-24">
      {/* Header Bar */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-white/70 backdrop-blur-xl shadow-xs border-b border-slate-100">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/app/trips/${booking.id}`}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100/70 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Day-by-Day Itinerary
              </h1>
              <p className="text-[11px] text-slate-500">{destination}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {itineraryDays.length} Days
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 px-5 space-y-4">
        {/* Destination Context Card */}
        <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                Official Booking #{booking.bookingReference}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {booking.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            All transfers, stays, and guided excursions are confirmed and pre-scheduled by Varni Holidays Operations Desk.
          </p>
        </div>

        {/* Timeline Itinerary Days */}
        <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-blue-100/70">
          {itineraryDays.map((item: any, idx: number) => {
            const dayNum = item.day || idx + 1;
            const dayDate = getDayDate(idx);

            return (
              <div key={idx} className="relative pl-10">
                {/* Timeline Dot Indicator */}
                <div className="absolute left-2.5 top-3 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-xs flex items-center justify-center z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                </div>

                {/* Day Card */}
                <div className="glass-card rounded-2xl p-4 shadow-xs border border-white/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
                      Day {dayNum}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {dayDate}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title || `Day ${dayNum} Program`}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.activities || item.description || 'Full day scenic program and sightseeing.'}
                  </p>

                  {/* Meals & Stay Badges */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                    <div className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                      <Utensils className="w-3 h-3 text-amber-500" />
                      <span>{item.meals || 'Breakfast & Dinner Included'}</span>
                    </div>

                    {item.stay && (
                      <div className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                        <Hotel className="w-3 h-3 text-blue-500" />
                        <span>{item.stay}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Need Itinerary Adjustments?</h4>
            <p className="text-[11px] text-slate-500">Contact your dedicated tour manager anytime.</p>
          </div>
          <a
            href="https://wa.me/916357050505"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat</span>
          </a>
        </div>
      </main>
    </div>
  );
}
