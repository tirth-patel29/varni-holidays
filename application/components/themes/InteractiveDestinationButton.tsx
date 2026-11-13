'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';

interface InteractiveDestinationButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp';
  className?: string;
  icon?: string;
  disabled?: boolean;
  target?: string;
  rel?: string;
}

export default function InteractiveDestinationButton({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  icon,
  disabled = false,
  target,
  rel,
}: InteractiveDestinationButtonProps) {
  const theme = useDestinationTheme();
  const isKashmir = theme.id === 'kashmir';
  const isKerala = theme.id === 'kerala';

  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const handleClick = (e: React.MouseEvent<any>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClickRipple({ x, y, id: Date.now() });

    setTimeout(() => {
      setClickRipple(null);
    }, 450);

    if (onClick) {
      onClick(e);
    }
  };

  // Base styling per destination & variant
  let baseClasses =
    'relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer select-none group ';

  if (variant === 'primary') {
    if (isKashmir) {
      baseClasses +=
        'bg-[#0B2545] text-white border border-[#38BDF8]/60 shadow-[0_4px_18px_rgba(11,37,69,0.3)] hover:shadow-[0_0_24px_rgba(56,189,248,0.55)] hover:border-[#38BDF8] ';
    } else if (isKerala) {
      baseClasses +=
        'bg-[#0D4A36] text-white border border-[#168653]/60 shadow-[0_4px_18px_rgba(13,74,54,0.3)] hover:shadow-[0_0_24px_rgba(22,134,83,0.55)] hover:border-[#22C55E] ';
    } else {
      baseClasses +=
        'bg-[#002037] text-white border border-white/20 hover:border-gold-deep shadow-md ';
    }
  } else if (variant === 'secondary') {
    if (isKashmir) {
      baseClasses +=
        'bg-[#E0F2FE]/90 backdrop-blur-md text-[#0369A1] border border-[#BAE6FD] hover:bg-[#BAE6FD] hover:text-[#0B2545] shadow-xs hover:shadow-[0_0_16px_rgba(186,230,253,0.6)] ';
    } else if (isKerala) {
      baseClasses +=
        'bg-[#E7F2EB]/90 backdrop-blur-md text-[#0D4A36] border border-[#D5DFD8] hover:bg-[#D5DFD8] hover:text-[#0A3325] shadow-xs hover:shadow-[0_0_16px_rgba(22,134,83,0.35)] ';
    } else {
      baseClasses +=
        'bg-surface-cream text-primary border border-surface-sand-tint hover:bg-surface-container ';
    }
  } else if (variant === 'whatsapp') {
    baseClasses +=
      'bg-[#25D366] text-slate-950 hover:bg-[#20ba59] border border-[#25D366] shadow-sm hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] ';
  }

  const content = (
    <>
      {/* 1. Destination Hover Frost / Leaf Unfurl Overlay */}
      {isKashmir && (
        <span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
          aria-hidden="true"
        />
      )}
      {isKerala && (
        <span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22C55E]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* 2. Click Shockwave (Crystalline Ice Crack for Kashmir / Emerald Leaf Ripple for Kerala) */}
      {clickRipple && (
        <span
          key={clickRipple.id}
          className={`absolute pointer-events-none rounded-full animate-ping-fast ${
            isKashmir
              ? 'bg-[#38BDF8]/40 border-2 border-white'
              : isKerala
              ? 'bg-[#22C55E]/40 border-2 border-[#168653]'
              : 'bg-white/40'
          }`}
          style={{
            left: clickRipple.x - 20,
            top: clickRipple.y - 20,
            width: 40,
            height: 40,
            animationDuration: '400ms',
          }}
          aria-hidden="true"
        />
      )}

      {/* 3. Button Label & Optional Icon */}
      {icon && (
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110">
          {icon}
        </span>
      )}
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    if (href.startsWith('http') || target === '_blank') {
      return (
        <a
          href={href}
          target={target}
          rel={rel || 'noopener noreferrer'}
          onClick={handleClick}
          className={`${baseClasses} ${className}`}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} onClick={handleClick} className={`${baseClasses} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {content}
    </button>
  );
}
