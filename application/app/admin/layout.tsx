import React from 'react';
import CrmLayoutWrapper from '@/components/crm/CrmLayoutWrapper';

export const metadata = {
  title: 'Super Admin Portal | Varni Holidays',
  description: 'Super Admin Management, Deduplication, Audit Trail, and Rate Governance for Varni Holidays.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <CrmLayoutWrapper>{children}</CrmLayoutWrapper>;
}

