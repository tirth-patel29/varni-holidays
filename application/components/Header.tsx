"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Flights", href: "/#flights" },
    { label: "Tour Packages", href: "/packages" },
    { label: "Visa Assistance", href: "/visa" },
    { label: "Destinations", href: "/destinations" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 px-4 md:px-8 pointer-events-none">
      <div className="max-w-[1380px] mx-auto">
        <div className="pointer-events-auto h-20 bg-surface-container-lowest/95 backdrop-blur-xl rounded-full px-4 sm:px-6 md:px-8 flex items-center justify-between shadow-clay-card border border-white/60">
          
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-gold-deep shadow-sm">
              <span className="material-symbols-outlined text-[24px]">travel_explore</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-lg sm:text-xl font-bold text-primary leading-none tracking-tight">
                VARNI HOLIDAYS
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-gold-deep tracking-wider uppercase mt-1">
                Your Gateway to Joyful Holidays
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pills */}
          <nav className="hidden xl:flex items-center gap-1 bg-surface-cream-subtle/80 p-1.5 rounded-full shadow-clay-inset">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary-container text-white shadow-sm"
                      : "text-on-surface-variant hover:text-primary hover:bg-white/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919898000000?text=Hello%20Varni%20Holidays,%20I%20want%20to%20plan%20a%20holiday"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-xs font-bold clay-pill-button hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">chat</span>
              <span>Plan Your Trip</span>
            </a>

            <Link
              href="/employee/login"
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-surface-cream-subtle text-primary shadow-clay-inset hover:bg-surface-container transition-colors"
              title="Employee & Admin Portal (Anand Desk)"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </Link>

            <a
              href="tel:+912692245890"
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-surface-cream-subtle text-primary shadow-clay-inset hover:bg-surface-container transition-colors"
              title="Call Anand Office: +91 (02692) 245-890"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-10 h-10 rounded-full bg-surface-cream-subtle flex items-center justify-center text-primary shadow-clay-inset"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto mt-2 xl:hidden bg-surface-container-lowest/98 backdrop-blur-2xl rounded-3xl p-6 shadow-clay-floating border border-white/80 animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-2xl text-sm font-semibold text-primary hover:bg-surface-cream-subtle transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    chevron_right
                  </span>
                </Link>
              ))}
              <div className="pt-4 border-t border-surface-sand-tint flex flex-col gap-3">
                <a
                  href="https://wa.me/919898000000?text=Hello%20Varni%20Holidays"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-full text-sm font-bold shadow-clay-button"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">chat</span>
                  <span>Connect on WhatsApp</span>
                </a>
                <a
                  href="tel:+912692245890"
                  className="w-full flex items-center justify-center gap-2 bg-surface-cream-subtle text-primary py-2.5 rounded-full text-xs font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>Anand Office: +91 (02692) 245-890</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

