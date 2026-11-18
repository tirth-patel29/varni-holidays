import React from 'react';
import { notFound } from 'next/navigation';
import { getCustomerQuotationDetail } from '@/lib/pwa/customer-data';
import { QuotationDetailView } from '@/components/pwa/QuotationDetailView';

export const dynamic = 'force-dynamic';

interface QuotationDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CustomerQuotationDetailPage({ params }: QuotationDetailPageProps) {
  // STRICT DATA ISOLATION: Derives customer from session
  const quotation = await getCustomerQuotationDetail(params.id);

  if (!quotation) {
    notFound();
  }

  return <QuotationDetailView quotation={quotation} />;
}
