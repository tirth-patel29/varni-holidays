'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Briefcase, User } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/app', icon: Home, exact: true },
  { label: 'Explore', href: '/app/explore', icon: Compass },
  { label: 'Trips', href: '/app/trips', icon: Briefcase },
  { label: 'Profile', href: '/app/profile', icon: User },
];

export function PwaBottomNav() {
  const pathname = usePathname();

  // Hide on deep detail pages that have their own fixed bottom action bars
  const isDeepDetail = pathname.includes('/trips/') || pathname.includes('/quotations/');
  if (isDeepDetail) return null;

  return (
    <nav
      className="sticky bottom-0 inset-x-0 glass-nav px-7 pt-2.5 pb-6 sm:pb-5 flex justify-between items-center z-40 shrink-0"
      data-purpose="bottom-navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center space-y-1 transition active:scale-95 ${
              isActive
                ? 'text-blue-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                isActive ? 'stroke-[2.4] text-blue-600' : 'stroke-[2]'
              }`}
            />
            <span className="text-[11px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
