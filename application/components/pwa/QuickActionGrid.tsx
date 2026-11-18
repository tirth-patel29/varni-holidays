'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShoppingBag, Globe, Folder } from 'lucide-react';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Quotes', href: '/app/quotations', icon: FileText },
  { label: 'Bookings', href: '/app/trips', icon: ShoppingBag },
  { label: 'Visa', href: '/app/visa', icon: Globe },
  { label: 'Documents', href: '/app/wallet', icon: Folder },
];

export function QuickActionGrid() {
  return (
    <section className="grid grid-cols-4 gap-3 px-5 pt-1" data-purpose="quick-actions">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <div key={action.label} className="flex flex-col items-center">
            <Link
              href={action.href}
              className="quick-action-tile w-[72px] h-[72px] flex items-center justify-center transition active:scale-95 hover:bg-white/80"
              aria-label={action.label}
            >
              <Icon className="w-[26px] h-[26px] text-blue-600 stroke-[2.2]" />
            </Link>
            <span className="text-xs font-semibold text-slate-700 mt-2">{action.label}</span>
          </div>
        );
      })}
    </section>
  );
}
