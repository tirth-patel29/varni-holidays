import React from 'react';
import { getCustomerQuotations } from '@/lib/pwa/customer-data';
import { QuotationsListClient } from '@/components/pwa/QuotationsListClient';

export const dynamic = 'force-dynamic';

export default async function CustomerQuotationsPage() {
  const data = await getCustomerQuotations('all');

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Please sign in to view your quotations.
      </div>
    );
  }

  return (
    <QuotationsListClient
      counts={data.counts}
      quotations={data.quotations as any}
    />
  );
}
