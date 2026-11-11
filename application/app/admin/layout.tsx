import React from 'react';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';

// Force dynamic rendering for all admin routes — prevents static prerender
// errors caused by useSearchParams() usage in AdminSidebar and page components.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Super Admin Portal | Varni Holidays',
  description: 'Executive Management, Rate Governance, Deduplication, and Operations Audit for Varni Holidays.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
