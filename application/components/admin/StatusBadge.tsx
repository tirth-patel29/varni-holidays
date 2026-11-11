import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lead' | 'booking' | 'payment' | 'priority' | 'service';
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, type = 'lead', size = 'sm' }: StatusBadgeProps) {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  let colorClasses = 'bg-[#F4F6F9] text-[#172B45] border-[#E5E8ED]';

  // Lead / General Stages
  if (norm === 'NEW' || norm === 'IN_PROGRESS' || norm === 'ACTIVE') {
    colorClasses = 'bg-[#EBF8FF] text-[#2B6CB0] border-[#BEE3F8]';
  } else if (norm === 'CONTACTED' || norm === 'REQUIREMENT_COLLECTED') {
    colorClasses = 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
  } else if (norm === 'QUOTATION_SENT' || norm === 'NEGOTIATION' || norm === 'PENDING') {
    colorClasses = 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
  } else if (norm === 'CONVERTED' || norm === 'WON' || norm === 'CONFIRMED' || norm === 'COMPLETED' || norm === 'PAID') {
    colorClasses = 'bg-[#DEF7EC] text-[#03543F] border-[#BCF0DA]';
  } else if (norm === 'LOST' || norm === 'CANCELLED' || norm === 'FAILED' || norm === 'OVERDUE') {
    colorClasses = 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
  } else if (norm === 'URGENT' || norm === 'HIGH') {
    colorClasses = 'bg-[#FEF2F2] text-[#B91C1C] border-[#F87171] font-bold';
  } else if (norm === 'MEDIUM' || norm === 'NORMAL') {
    colorClasses = 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]';
  } else if (norm === 'LOW') {
    colorClasses = 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]';
  }

  // Service indicator badges
  if (type === 'service') {
    if (norm === 'FLIGHT') colorClasses = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
    if (norm === 'PACKAGE' || norm === 'TOUR') colorClasses = 'bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]';
    if (norm === 'HOTEL') colorClasses = 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
    if (norm === 'VISA') colorClasses = 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
    if (norm === 'INSURANCE' || norm === 'TRAVEL_INSURANCE') colorClasses = 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-semibold border rounded-none select-none ${padding} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-none bg-current opacity-70 shrink-0" />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
}

