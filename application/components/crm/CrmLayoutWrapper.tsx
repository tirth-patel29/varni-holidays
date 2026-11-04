'use client';

import React from 'react';
import { CrmProvider } from './CrmContext';
import CrmSidebar from './CrmSidebar';

export default function CrmLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CrmProvider>
      <div className="flex min-h-screen bg-[#101113] text-[#F4F4F2] font-sans antialiased selection:bg-[#E9B95E]/30 selection:text-[#F4F4F2] overflow-x-hidden">
        <CrmSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#101113]">
          {children}
        </div>
      </div>
    </CrmProvider>
  );
}

