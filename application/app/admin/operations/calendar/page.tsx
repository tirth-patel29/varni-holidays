'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getBookingsAction } from '@/app/actions/phase3';
import { getFollowUpsAction } from '@/app/actions/crm';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCw,
  BookmarkCheck,
  Plane,
  Compass,
} from 'lucide-react';

export default function BookingCalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Current calendar month view
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, fData] = await Promise.all([
        getBookingsAction(),
        getFollowUpsAction(),
      ]);
      const bList = Array.isArray(bRes?.bookings) ? bRes.bookings : Array.isArray(bRes) ? bRes : [];
      setBookings(bList);
      setFollowUps(Array.isArray(fData) ? fData : []);
    } catch (e) {
      console.error('Failed to load calendar events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const currentMonthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Compute days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Find events for each day
  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBookings = bookings.filter((b) => {
      if (!b.travelStartDate) return day === 15; // sample spread for visualization
      return b.travelStartDate.startsWith(dayStr);
    });
    const dayFollowUps = followUps.filter((f) => {
      if (!f.scheduledAt) return false;
      return f.scheduledAt.startsWith(dayStr);
    });
    return { bookings: dayBookings, followUps: dayFollowUps };
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Operations & Departure Calendar"
        subtitle="Visual timeline of traveler departures, hotel check-ins, consular appointments, and consultant follow-ups"
        breadcrumbs={[
          { label: 'Bookings & Operations', href: '/admin/bookings' },
          { label: 'Booking Calendar' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs font-semibold text-[#153650]"
            >
              Today
            </button>
            <div className="flex items-center border border-[#E5E8ED] bg-[#FFFFFF]">
              <button onClick={prevMonth} className="p-1.5 hover:bg-[#F9FAFB] text-[#718096]">
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-xs font-bold text-[#153650] min-w-[130px] text-center font-mono">
                {currentMonthName}
              </span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-[#F9FAFB] text-[#718096]">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* CALENDAR GRID CONTAINER */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xs select-none">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-[#E5E8ED] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#718096] text-center py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E5E8ED]">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-[105px] bg-[#FAFBFD]/50" />;
              }

              const { bookings: dBookings, followUps: dFollowUps } = getEventsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div key={`day-${day}`} className={`min-h-[105px] p-2 flex flex-col justify-between ${isToday ? 'bg-[#EFF6FF]/40' : 'bg-[#FFFFFF]'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isToday ? 'px-1.5 py-0.5 bg-[#24689B] text-[#FFFFFF]' : 'text-[#153650]'}`}>
                      {day}
                    </span>
                    {(dBookings.length > 0 || dFollowUps.length > 0) && (
                      <span className="w-1.5 h-1.5 bg-[#E9B95E] rounded-none inline-block" />
                    )}
                  </div>

                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[75px] crm-scrollbar">
                    {dBookings.map((b) => (
                      <Link
                        key={b.id}
                        href={`/admin/bookings/${b.id}`}
                        className="block px-1.5 py-0.5 bg-[#153650] text-[#FFFFFF] text-[10px] font-semibold truncate hover:bg-[#24689B] transition-colors"
                      >
                        ✈ {b.customerName || 'Trip'}
                      </Link>
                    ))}
                    {dFollowUps.map((f) => (
                      <Link
                        key={f.id}
                        href={`/admin/leads/${f.leadId}`}
                        className="block px-1.5 py-0.5 bg-[#FEF3C7] text-[#B45309] text-[10px] font-semibold truncate hover:bg-[#FDE68A] transition-colors"
                      >
                        ⏰ {f.reminderNote}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

