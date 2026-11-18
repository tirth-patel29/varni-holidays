import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCustomerDashboard } from '@/lib/pwa/customer-data';
import { PwaHeader } from '@/components/pwa/PwaHeader';
import { UpcomingTripHero } from '@/components/pwa/UpcomingTripHero';
import { QuickActionGrid } from '@/components/pwa/QuickActionGrid';
import { PendingActionCard } from '@/components/pwa/PendingActionCard';
import { ExplorePreviewSection } from '@/components/pwa/DestinationCard';
import { Compass, MessageCircle, Calendar, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerDashboardPage() {
  const dashboardData = await getCustomerDashboard();

  if (!dashboardData?.customer) {
    redirect('/app/welcome');
  }

  const customer = dashboardData.customer;
  const displayName = customer?.fullName?.split(' ')[0] || 'Traveler';
  const displayAvatar =
    customer?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80';

  const upcomingBooking = dashboardData?.upcomingBooking || dashboardData?.activeBooking;
  const pendingQuotations = dashboardData?.pendingQuotations || [];
  const topQuotation = pendingQuotations[0] || null;

  // Format dates for display
  const formatDateRange = (start?: Date, end?: Date) => {
    if (!start || !end) return 'Dates confirmed';
    const s = new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const e = new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} – ${e}`;
  };

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Header Greeting & Status */}
      <PwaHeader
        userName={displayName}
        avatarUrl={displayAvatar}
        hasUnreadNotifications={dashboardData?.notifications && dashboardData.notifications.length > 0}
      />

      {/* 2. Hero Upcoming Trip or Empty State */}
      {upcomingBooking ? (
        <UpcomingTripHero
          tripId={upcomingBooking.id}
          destination={upcomingBooking.quotation?.destination || upcomingBooking.quotation?.title || 'Tour Package'}
          dates={formatDateRange(upcomingBooking.travelStartDate, upcomingBooking.travelEndDate)}
          badgeText={upcomingBooking.status === 'CONFIRMED' ? 'Confirmed Journey' : 'Booking Processing'}
          imageUrl={
            upcomingBooking.quotation?.destination?.toLowerCase().includes('switzerland')
              ? 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80'
              : upcomingBooking.quotation?.destination?.toLowerCase().includes('kerala')
              ? 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
          }
        />
      ) : (
        <section className="px-5 pt-1" data-purpose="empty-trips-card">
          <div className="glass-card rounded-[28px] p-5 shadow-sm border border-white/80 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <Compass className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-600 bg-blue-50/70 border border-blue-100/60">
                Ready for Discovery
              </span>
            </div>

            <div className="mt-3.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                Where will you travel next?
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Explore hand-crafted holiday departures or request a custom itinerary with pure vegetarian Gujarati meals tailored for your family.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center gap-2">
              <Link
                href="/app/explore"
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition"
              >
                <span>Explore Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://wa.me/916357050505?text=Hello%20Varni%20Holidays%2C%20I%20would%20like%20to%20plan%20a%20holiday."
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-white/80 border border-slate-200/80 hover:bg-white text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp HQ</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 3. Quick Actions Grid */}
      <QuickActionGrid />

      {/* 4. Real Pending Quotations Section */}
      {topQuotation ? (
        <PendingActionCard
          title="Review Official Quotation"
          subtitle={`${topQuotation.title || topQuotation.destination || 'Proposal'} • ₹${Number(topQuotation.totalAmountInr).toLocaleString('en-IN')}`}
          href={`/app/quotations/${topQuotation.id}`}
          actionCount={pendingQuotations.length}
        />
      ) : null}

      {/* 5. Live Notifications Feed */}
      {dashboardData?.notifications && dashboardData.notifications.length > 0 && (
        <section className="px-5 pt-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight font-sans">
              Travel Updates
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Real-Time</span>
          </div>

          <div className="space-y-2">
            {dashboardData.notifications.map((notif) => (
              <div
                key={notif.id}
                className="glass-card rounded-2xl p-3 flex items-start gap-3 shadow-xs border border-white/80"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'warning'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200/50'
                      : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                  }`}
                >
                  <Clock className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{notif.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{notif.message}</p>
                </div>
                {notif.href && (
                  <Link
                    href={notif.href}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Explore Curated Destinations Showcase */}
      <ExplorePreviewSection />
    </div>
  );
}
