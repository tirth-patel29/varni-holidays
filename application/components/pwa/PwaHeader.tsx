'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell } from 'lucide-react';

interface PwaHeaderProps {
  userName?: string;
  avatarUrl?: string;
  hasUnreadNotifications?: boolean;
}

export function PwaHeader({
  userName = 'Tirth',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  hasUnreadNotifications = true,
}: PwaHeaderProps) {
  return (
    <section className="flex justify-between items-center pt-2 px-5" data-purpose="user-greeting">
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <Link href="/app" aria-label="Varni Holidays Companion" className="inline-block">
            <Image
              src="/logo.webp"
              alt="Varni Holidays"
              width={120}
              height={65}
              priority
              className="h-6 w-auto object-contain"
            />
          </Link>
        </div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          Hello, {userName} <span className="text-xl">👋</span>
        </h1>
      </div>
      <div className="flex items-center space-x-2.5">
        {/* Frosted Notification Bell with Red Badge */}
        <Link
          href="/app/notifications"
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-full glass-pill flex items-center justify-center hover:bg-white/80 transition active:scale-95"
        >
          <Bell className="w-[19px] h-[19px] text-slate-800" />
          {hasUnreadNotifications && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </Link>

        {/* Frosted Border User Avatar */}
        <Link
          href="/app/profile"
          aria-label="Profile"
          className="w-10 h-10 rounded-full p-[2px] glass-pill shrink-0 overflow-hidden shadow-sm active:scale-95 transition"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${userName} Profile`}
            className="w-full h-full object-cover rounded-full"
            src={avatarUrl}
          />
        </Link>
      </div>
    </section>
  );
}
