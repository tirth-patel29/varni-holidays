import React from 'react';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';

export const metadata = {
  title: 'Super Admin Portal | Varni Holidays',
  description: 'Executive Management, Rate Governance, Deduplication, and Operations Audit for Varni Holidays.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
