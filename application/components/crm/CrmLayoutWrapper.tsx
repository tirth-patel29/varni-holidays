'use client';

import React, { Suspense } from 'react';
import { CrmProvider } from './CrmContext';
import CrmSidebar from './CrmSidebar';

export default function CrmLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CrmProvider>
      <div className="flex h-screen max-h-screen bg-[#101113] text-[#F4F4F2] font-sans antialiased selection:bg-[#E9B95E]/30 selection:text-[#F4F4F2] overflow-hidden">
        <Suspense fallback={<aside className="w-64 bg-[#0B0D0F] border-r border-[#2A2E34]" />}>
          <CrmSidebar />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden bg-[#101113] crm-scrollbar">
          {children}
        </div>
      </div>
    </CrmProvider>
  );
}
