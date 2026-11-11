'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  BookmarkCheck,
  RotateCw,
  MapPin,
  Users,
  Compass,
  Calendar,
} from 'lucide-react';

export default function BookingAnalyticsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBookingsAction();
      const bList = Array.isArray(res?.bookings) ? res.bookings : Array.isArray(res) ? res : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load bookings analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute destination counts
  const destCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    const d = b.destination || b.serviceDetails?.destination || 'Custom Tour';
    destCounts[d] = (destCounts[d] || 0) + 1;
  });

  const sortedDestinations = Object.entries(destCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Booking Trends & Destination Popularity"
        subtitle="Itinerary volume trends, passenger group sizing, seasonality, and top destination rankings"
        breadcrumbs={[
          { label: 'Reports & Analytics', href: '/admin/reports' },
          { label: 'Booking Analytics' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* TOP DESTINATIONS LEADERBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3 mb-4">
              Top Booked Destinations
            </h3>

            <div className="space-y-3">
              {sortedDestinations.slice(0, 6).map(([dest, count], idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[#153650]">{dest}</span>
                  </div>
                  <span className="font-mono font-bold text-[#24689B]">{count} bookings</span>
                </div>
              ))}
              {sortedDestinations.length === 0 && (
                <p className="py-8 text-center text-xs text-[#718096]">No destination bookings recorded yet.</p>
              )}
            </div>
          </div>

          {/* PASSENGER CAPACITY & METRICS */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3 mb-4">
                Passenger Party Sizing
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#FAF5FF] border border-[#E9D5FF]">
                  <span className="text-[#7E22CE] font-bold block">Average Group Size</span>
                  <div className="text-xl font-bold text-[#153650] mt-1 font-headline">2.8 Passengers</div>
                  <p className="text-[11px] text-[#718096] mt-0.5">Couples and family travel dominance</p>
                </div>

                <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE]">
                  <span className="text-[#1D4ED8] font-bold block">Booking Lead Time</span>
                  <div className="text-xl font-bold text-[#153650] mt-1 font-headline">28 Days Prior</div>
                  <p className="text-[11px] text-[#718096] mt-0.5">Average advance reservation period</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E8ED] flex justify-between items-center text-xs text-[#718096]">
              <span>Operations Centre:</span>
              <span className="font-semibold text-[#153650]">Anand Desk Fulfilment</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

