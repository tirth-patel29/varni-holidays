'use client';

import React from 'react';
import Link from 'next/link';
import { FileCheck2, ChevronRight, AlertCircle } from 'lucide-react';

interface PendingActionCardProps {
  title?: string;
  subtitle?: string;
  href?: string;
  actionCount?: number;
}

export function PendingActionCard({
  title = 'Review Quotation',
  subtitle = 'Switzerland Family Tour',
  href = '/app/quotations',
  actionCount = 1,
}: PendingActionCardProps) {
  if (actionCount === 0) return null;

  return (
    <section className="px-5 pt-1" data-purpose="pending-actions">
      {/* Section Header */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
          !
        </div>
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight font-sans">
          Pending Actions
        </h3>
      </div>

      {/* Frosted Glass Pending Action Card */}
      <Link
        href={href}
        className="glass-card rounded-2xl p-3.5 flex items-center justify-between hover:bg-white/75 cursor-pointer transition active:scale-[0.99] block"
      >
        <div className="flex items-center space-x-3.5">
          {/* Icon Container */}
          <div className="w-10 h-10 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-sm">
            <FileCheck2 className="w-5 h-5 text-amber-500 stroke-[2.2]" />
          </div>
          {/* Text Content */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 leading-snug font-sans">
              {title}
            </h4>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Chevron Right */}
        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
      </Link>
    </section>
  );
}
