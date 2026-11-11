'use client';

import React from 'react';
import Breadcrumbs from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div className="bg-[#FFFFFF] border-b border-[#E5E8ED] px-4 sm:px-6 py-4 select-none shrink-0">
      <div className="mb-2">
        <Breadcrumbs customItems={breadcrumbs} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#153650] tracking-tight font-headline">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

