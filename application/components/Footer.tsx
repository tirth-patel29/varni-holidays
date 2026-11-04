import React from "react";
import Link from "next/link";
import { COMPANY_CONTACT } from "@/lib/config/contact";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface mt-20 pt-16 pb-10 border-t border-surface-sand-tint">
      <div className="max-w-[1380px] mx-auto px-4 md:px-8">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Brand & Accreditation Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-gold-deep shadow-sm">
                <span className="material-symbols-outlined text-[20px]">travel_explore</span>
              </div>
              <span className="font-headline text-2xl font-bold text-primary">
                VARNI HOLIDAYS
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">
              Bespoke holiday curation, domestic and international journeys, and unforgettable leisure designed with genuine Gujarat hospitality. Your Gateway to Joyful Holidays.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center shadow-clay-inset text-primary">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Recognised Gujarat Tour Partner
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="font-headline text-lg font-bold text-primary">Quick Links</h4>
            <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#flights" className="hover:text-primary transition-colors">
                  Flight Consultation
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-primary transition-colors">
                  Holiday Packages
                </Link>
              </li>
              <li>
                <Link href="/visa" className="hover:text-primary transition-colors">
                  Visa Assistance
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-primary transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Office
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-headline text-lg font-bold text-primary">Our Core Services</h4>
            <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">flight</span>
                <span>Domestic & Global Flight Routing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-gold-deep">palm_tree</span>
                <span>Kerala Backwaters & Hill Stations</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">assignment_ind</span>
                <span>Visa Documentation Guidance</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-gold-deep">temple_hindu</span>
                <span>South India Temple Pilgrimages</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">family_restroom</span>
                <span>Custom Family Vacation Curations</span>
              </li>
            </ul>
          </div>

          {/* Anand Office Details */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-headline text-lg font-bold text-primary">Anand Headquarters</h4>
            <div className="flex flex-col gap-2.5 text-sm text-on-surface-variant">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  location_on
                </span>
                <span className="leading-snug">
                  {COMPANY_CONTACT.address.full}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">
                  call
                </span>
                <a href={COMPANY_CONTACT.phone.tel} className="hover:text-primary transition-colors">
                  {COMPANY_CONTACT.phone.display}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-gold-deep text-[18px] shrink-0">
                  chat
                </span>
                <a
                  href={COMPANY_CONTACT.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors font-medium text-primary"
                >
                  {COMPANY_CONTACT.whatsapp.display} (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">
                  mail
                </span>
                <a href={COMPANY_CONTACT.email.mailto} className="hover:text-primary transition-colors">
                  {COMPANY_CONTACT.email.primary}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">
                  schedule
                </span>
                <span>{COMPANY_CONTACT.hours.display}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Gazette Newsletter Banner */}
        <div className="bg-surface-container p-6 sm:p-8 rounded-2xl mb-12 shadow-clay-card border border-white/60">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col">
              <h4 className="font-headline text-xl font-bold text-primary">
                Subscribe to Varni Travel Gazettes
              </h4>
              <p className="text-sm text-on-surface-variant mt-1">
                Receive handpicked seasonal flight offers, bespoke Kerala packages, and visa advisory alerts.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-5 py-3 rounded-full bg-surface-cream-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary min-w-[280px] shadow-clay-inset"
              />
              <button
                type="button"
                className="px-6 py-3 rounded-full bg-primary text-white text-sm font-bold clay-pill-button hover:bg-primary-container"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-6 border-t border-surface-sand-tint flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>© {new Date().getFullYear()} Varni Holidays Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="hover:text-primary transition-colors">
              Legal Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

