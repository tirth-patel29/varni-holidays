'use client';

import React from 'react';
import { useCrm } from './CrmContext';

interface CrmHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function CrmHeader({ title, subtitle, actions }: CrmHeaderProps) {
  const { currentUser } = useCrm();

  return (
    <header className="bg-[#101113]/95 backdrop-blur-sm border-b border-[#2A2E34] px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-[#F4F4F2] leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#969CA5] mt-0.5 font-normal tracking-wide">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {actions}

        {/* Anand HQ Desk indicator */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#17191D] border border-[#2A2E34] text-xs text-[#969CA5] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E9B95E]" />
          <span>Anand HQ</span>
        </div>

        {/* Active User Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1D2025] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2]">
          <span className="w-5 h-5 rounded-full bg-[#2A2E34] text-[#E9B95E] flex items-center justify-center text-[10px] font-bold">
            {currentUser.fullName.charAt(0)}
          </span>
          <span className="truncate max-w-[140px]">{currentUser.fullName}</span>
        </div>
      </div>
    </header>
  );
}
