'use client';

import React from 'react';
import { CrmProvider } from './CrmContext';
import CrmSidebar from './CrmSidebar';

export default function CrmLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CrmProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
        <CrmSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </CrmProvider>
  );
}

