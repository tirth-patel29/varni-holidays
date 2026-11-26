'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import VarniLoader from './VarniLoader';
import WebsiteChatbot from './chatbot/WebsiteChatbot';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isDedicatedShell = Boolean(
    pathname.startsWith('/employee') ||
    pathname.startsWith('/admin')
  );

  if (isDedicatedShell) {
    return <main className="flex-1 w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      <VarniLoader />
      <Header />
      <main className="flex-1 w-full min-w-0 overflow-x-clip pt-20 sm:pt-24">{children}</main>
      <Footer />
      <WebsiteChatbot />
    </>
  );
}

