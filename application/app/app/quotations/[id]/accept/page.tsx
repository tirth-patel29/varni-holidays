import React from 'react';
import { notFound } from 'next/navigation';
import { getCustomerQuotationDetail } from '@/lib/pwa/customer-data';
import { QuotationAcceptClient } from '@/components/pwa/QuotationAcceptClient';

export const dynamic = 'force-dynamic';

interface QuotationAcceptPageProps {
  params: {
    id: string;
  };
}

export default async function CustomerQuotationAcceptPage({ params }: QuotationAcceptPageProps) {
  // STRICT DATA ISOLATION: Customer can only accept their own quotation
  const quotation = await getCustomerQuotationDetail(params.id);

  if (!quotation) {
    notFound();
  }

  return <QuotationAcceptClient quotation={quotation} />;
}
