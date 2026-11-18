import React from 'react';
import { getCustomerBookings } from '@/lib/pwa/customer-data';
import { TripsListClient } from '@/components/pwa/TripsListClient';

export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  const data = await getCustomerBookings();

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Please sign in to view your bookings.
      </div>
    );
  }

  return (
    <TripsListClient
      counts={data.counts}
      upcoming={data.upcoming as any}
      ongoing={data.ongoing as any}
      completed={data.completed as any}
    />
  );
}
