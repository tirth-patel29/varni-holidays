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
    <header className="bg-white border-b border-slate-200 px-8 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {/* Anand Office Indicator Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold shadow-2xs">
          <span className="material-symbols-outlined text-[16px] text-amber-600">store</span>
          <span>Anand HQ Desk</span>
        </div>

        {/* Current Active Role Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-amber-400">account_circle</span>
          <span>{currentUser.fullName}</span>
        </div>
      </div>
    </header>
  );
}
