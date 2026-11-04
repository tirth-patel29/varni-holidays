import React from 'react';
import CrmLayoutWrapper from '@/components/crm/CrmLayoutWrapper';

export const metadata = {
  title: 'Employee CRM | Varni Holidays',
  description: 'Internal Travel Management CRM, Lead Pipeline, and Customer Desk for Varni Holidays.',
};

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <CrmLayoutWrapper>{children}</CrmLayoutWrapper>;
}

