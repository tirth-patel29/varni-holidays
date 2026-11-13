'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  customItems?: { label: string; href?: string }[];
  items?: { label: string; href?: string }[];
}

export function Breadcrumbs({ customItems, items }: BreadcrumbsProps) {
  const activeItems = items || customItems;
  const pathname = usePathname() || '';

  if (activeItems && activeItems.length > 0) {
    return (
      <nav className="flex items-center gap-1.5 text-xs text-[#718096] select-none" aria-label="Breadcrumb">
        <Link href="/admin" className="hover:text-[#153650] flex items-center gap-1">
          <Home size={12} className="text-[#24689B]" />
          <span>Admin</span>
        </Link>
        {activeItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight size={11} className="text-[#A0AEC0]" />
            {item.href ? (
              <Link href={item.href} className="hover:text-[#153650]">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-[#153650]">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // Derive automatically from pathname
  const segments = pathname.split('/').filter(Boolean);
  const derivedItems = segments.map((seg, idx) => {
    const url = '/' + segments.slice(0, idx + 1).join('/');
    const formatted = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { label: formatted, href: idx === segments.length - 1 ? undefined : url };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#718096] select-none" aria-label="Breadcrumb">
      {derivedItems.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight size={11} className="text-[#A0AEC0]" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#153650]">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-[#153650]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumbs;

