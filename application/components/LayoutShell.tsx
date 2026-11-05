'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCrmRoute = pathname.startsWith('/employee') || pathname.startsWith('/admin');

  if (isCrmRoute) {
    return <main className="flex-1 w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 w-full min-w-0 overflow-x-clip pt-20 sm:pt-24">{children}</main>
      <Footer />
    </>
  );
}

