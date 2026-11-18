import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomerBookingDetail } from '@/lib/pwa/customer-data';
import {
  ArrowLeft,
  Share2,
  Calendar,
  Users,
  Compass,
  Plane,
  Hotel,
  FileText,
  PhoneCall,
  MessageCircle,
  Sun,
  Clock,
  Coins,
  ShieldCheck,
  ChevronRight,
  MapPin,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface TripDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  // STRICT DATA ISOLATION: Customer can only access their own booking
  const booking = await getCustomerBookingDetail(params.id);

  if (!booking) {
    notFound();
  }

  const destination = booking.quotation?.destination || booking.quotation?.title || 'Tour Package';
  const quotation = booking.quotation;
  const adults = quotation?.adultsCount || 2;
  const children = quotation?.childrenCount || 0;
  const totalTravelers = adults + children;

  // Calculate days away
  const now = new Date();
  const startDate = new Date(booking.travelStartDate);
  const endDate = new Date(booking.travelEndDate);
  const diffDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const departureStatusText =
    diffDays > 0
      ? `${diffDays} Days to Departure`
      : diffDays === 0
      ? 'Departing Today!'
      : now <= endDate
      ? 'Currently On Tour'
      : 'Journey Completed';

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // Extract itinerary days if available
  const itineraryDays = Array.isArray(quotation?.itineraryJson)
    ? (quotation.itineraryJson as any[])
    : [];

  const day1 = itineraryDays[0] || null;

  // Filter services
  const flightServices = booking.services.filter((s) => s.category === 'FLIGHTS');
  const hotelServices = booking.services.filter((s) => s.category === 'HOTELS');

  const getDestinationImage = (dest?: string) => {
    const d = (dest || '').toLowerCase();
    if (d.includes('switzerland')) return 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80';
    if (d.includes('kerala')) return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80';
    if (d.includes('dubai')) return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80';
    if (d.includes('kashmir')) return 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80';
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F8FC] pb-28 select-none">
      {/* Top Header Navigation */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-white/70 backdrop-blur-xl shadow-xs">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/app/trips"
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100/70 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-slate-900 text-base tracking-tight">Trip Overview</h1>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              #{booking.bookingReference}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        {/* Panoramic Atmospheric Hero */}
        <div className="relative w-full h-[360px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getDestinationImage(destination)}
            alt={destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80" />

          {/* Floating Days Away Badge */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-xl shadow-xs border border-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-800">{departureStatusText}</span>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900/60 text-white backdrop-blur-md border border-white/20">
              {booking.status}
            </span>
          </div>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-10 left-5 right-5 text-white z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
              Confirmed Grand Tour
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-white drop-shadow-sm font-sans">
              {destination}
            </h2>
            <div className="flex items-center gap-2 text-white/90 text-xs mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 opacity-80" />
                {formatDate(startDate)} – {formatDate(endDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 opacity-80" />
                {totalTravelers} Travelers
              </span>
            </div>
          </div>
        </div>

        {/* Organic Curved Glass Sheet Overlapping Hero */}
        <div className="relative -mt-6 z-20 rounded-t-[32px] bg-white/80 backdrop-blur-2xl px-5 pt-5 pb-8 flex flex-col gap-6 shadow-[0_-8px_32px_rgba(23,44,64,0.08)] border-t border-white/80">
          <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto -mt-2 mb-1" />

          {/* 1. Essential Access Hub Grid */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Essential Access</h3>
              <span className="text-[11px] font-semibold text-blue-600">Travel Desk</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              <Link
                href={`/app/trips/${booking.id}/itinerary`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-xs border border-slate-100 hover:border-blue-200 transition text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate w-full">Itinerary</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Timeline</span>
              </Link>

              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-xs border border-slate-100 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                  <Plane className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate w-full">Flights</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {flightServices.length > 0 ? `${flightServices.length} Flights` : 'Included'}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-xs border border-slate-100 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                  <Hotel className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate w-full">Hotels</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {hotelServices.length > 0 ? `${hotelServices.length} Stays` : 'Handpicked'}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-xs border border-slate-100 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate w-full">Docs</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Vouchers</span>
              </div>
            </div>
          </section>

          {/* 2. Destination Pulse (Weather, Time, Currency) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Destination Pulse</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Live Sync
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-white shadow-xs border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Climate</span>
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-slate-900">Comfortable</div>
                  <div className="text-[10px] text-slate-400 truncate">Daytime Sunshine</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white shadow-xs border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Local</span>
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-slate-900">Live Clock</div>
                  <div className="text-[10px] text-slate-400 truncate">Tour Timezone</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white shadow-xs border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Coins className="w-5 h-5 text-slate-600" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Currency</span>
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-slate-900">INR Base</div>
                  <div className="text-[10px] text-slate-400 truncate">Cards Accepted</div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Up First: Day 1 Preview */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Up First: Day 1</h3>
              <span className="text-xs font-semibold text-blue-600">{formatDate(startDate)}</span>
            </div>

            <div className="rounded-2xl bg-white shadow-xs border border-slate-100 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    Arrival & Welcome
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {day1?.title || `Welcome to ${destination}`}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {day1?.activities ||
                      'Private airport meet and greet, comfortable transfer to hotel, check-in and evening leisure.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 24/7 Dedicated Concierge & Emergency Dial */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">24/7 Dedicated Concierge</h3>
            <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Varni Operations Desk</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      24/7 Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Anand HQ Central Desk • +91 63570 50505</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="tel:+916357050505"
                  className="h-10 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition active:scale-[0.98]"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Desk</span>
                </a>
                <a
                  href={`https://wa.me/916357050505?text=Hello%20Varni%20Holidays%2C%20I%20am%20inquiring%20about%20my%20booking%20%23${booking.bookingReference}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-3 inset-x-0 px-4 z-40 max-w-md mx-auto">
        <div className="rounded-full bg-white/80 backdrop-blur-2xl p-1.5 shadow-[0_12px_36px_rgba(21,96,158,0.25)] border border-white/80">
          <Link
            href={`/app/trips/${booking.id}/itinerary`}
            className="w-full h-12 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer"
          >
            <span>View Full Day-by-Day Itinerary</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
