'use client';

import React from 'react';

interface PwaShellProps {
  children: React.ReactNode;
  showStatusBar?: boolean;
  className?: string;
}

export function PwaShell({
  children,
  showStatusBar = true,
  className = '',
}: PwaShellProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-0 sm:p-4 bg-[#dce7f3] text-slate-900 font-sans antialiased selection:bg-blue-100">
      {/* Mobile Device Viewport / Responsive Frame */}
      <div
        className={`relative w-full max-w-[430px] h-screen sm:h-[880px] sm:max-h-[92vh] bg-[#eaf3fa] overflow-hidden rounded-none sm:rounded-[48px] shadow-2xl flex flex-col border-0 sm:border-[8px] sm:border-slate-800 transition-all ${className}`}
        data-purpose="mobile-viewport"
      >
        {/* Ambient background glow elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Status Bar (Simulated in desktop wrapper, hidden on real standalone PWA) */}
        {showStatusBar && (
          <header className="hidden sm:flex pt-3 px-7 justify-between items-center z-30 select-none text-slate-900 shrink-0">
            <span className="text-[14px] font-semibold tracking-tight">9:41</span>
            <div className="flex items-center space-x-1.5 text-xs">
              {/* Cellular Signal Icon */}
              <svg className="w-4 h-3.5 fill-current" viewBox="0 0 17 12">
                <rect height="4" rx="0.8" width="3" x="0" y="8" />
                <rect height="6.5" rx="0.8" width="3" x="4.5" y="5.5" />
                <rect height="9" rx="0.8" width="3" x="9" y="3" />
                <rect height="11.5" rx="0.8" width="3" x="13.5" y="0.5" />
              </svg>
              {/* Wi-Fi Icon */}
              <svg className="w-4 h-3.5 fill-current" viewBox="0 0 16 12">
                <path d="M8 2.5C10.7 2.5 13.1 3.6 14.9 5.3L16 4.1C13.9 2.1 11.1 0.8 8 0.8C4.9 0.8 2.1 2.1 0 4.1L1.1 5.3C2.9 3.6 5.3 2.5 8 2.5ZM8 6C9.8 6 11.4 6.7 12.6 7.9L13.7 6.8C12.2 5.3 10.2 4.3 8 4.3C5.8 4.3 3.8 5.3 2.3 6.8L3.4 7.9C4.6 6.7 6.2 6 8 6ZM8 9.5C8.9 9.5 9.7 9.8 10.4 10.4L8 12.8L5.6 10.4C6.3 9.8 7.1 9.5 8 9.5Z" />
              </svg>
              {/* Battery Icon */}
              <div className="w-6 h-3 border border-slate-900 rounded-[4px] p-0.5 flex items-center">
                <div className="h-full w-4 bg-slate-900 rounded-[1.5px]" />
              </div>
            </div>
          </header>
        )}

        {/* Scrollable Main Children Viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 flex flex-col">
          {children}
        </div>

        {/* Desktop Virtual Home Indicator */}
        <div className="hidden sm:flex absolute bottom-1.5 inset-x-0 justify-center pointer-events-none z-50">
          <div className="w-32 h-1 bg-slate-900/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}
