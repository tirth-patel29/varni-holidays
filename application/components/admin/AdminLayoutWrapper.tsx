'use client';

import React, { useState } from 'react';
import { CrmProvider } from '@/components/crm/CrmContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CrmProvider>
      <div className="flex h-screen max-h-screen bg-[#F7F8FA] text-[#172B45] font-sans antialiased selection:bg-[#E9B95E]/30 selection:text-[#153650] overflow-hidden">
        {/* Sharp Light Theme Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden bg-[#F7F8FA] crm-scrollbar">
          <AdminHeader onToggleMobileMenu={() => setMobileOpen(true)} />
          <div className="flex-1 flex flex-col min-w-0">{children}</div>
        </div>
      </div>
    </CrmProvider>
  );
}

