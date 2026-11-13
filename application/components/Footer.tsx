'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY_CONTACT } from "@/lib/config/contact";
import { Palmtree, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { subscribeNewsletterAction } from "@/app/actions/newsletter";
import { useDestinationThemeSafe } from "@/lib/themes/DestinationThemeProvider";
import { resolveDestinationTheme } from "@/lib/themes/registry";
import { getDestinationAssets } from "@/lib/themes/destination-assets";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const pathname = usePathname() || '';

  // 1. Resolve destination theme from context OR from URL slug for package pages
  let destinationTheme = useDestinationThemeSafe();
  if (!destinationTheme && pathname.startsWith('/packages/')) {
    const slug = pathname.replace('/packages/', '').split('/')[0];
    if (slug) {
      destinationTheme = resolveDestinationTheme(slug);
    }
  }

  const destinationAssets = destinationTheme ? getDestinationAssets(destinationTheme.id) : null;

  // 2. High-resolution background photography: Destination atmosphere on package pages, or luxury global landscape
  const footerBgImage =
    destinationAssets?.bannerImage ||
    destinationAssets?.fullPageBackground ||
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!email || !email.includes("@")) {
      setStatusMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }

    setLoading(true);
    const res = await subscribeNewsletterAction(email);
    setLoading(false);

    if (res.success) {
      setStatusMessage({ text: res.message, type: "success" });
      setEmail("");
    } else {
      setStatusMessage({ text: res.message || res.error || "Failed to subscribe.", type: "error" });
    }
  };

  return (
    <footer
      className="relative z-30 w-full text-white mt-20 pt-16 pb-10 overflow-hidden shadow-2xl border-t border-white/20"
      style={{ isolation: 'isolate' }}
    >
      {/* LAYER 1: High-Resolution Landscape Background Photo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src={footerBgImage}
          alt={destinationTheme ? `${destinationTheme.name} Landscape` : 'Varni Holidays Destination Atmosphere'}
          fill
          sizes="100vw"
          className="object-cover object-center scale-105 transition-all duration-1000"
        />

        {/* LAYER 2: Luxury Dark Navy Contrast Scrim — Guarantees 100% Readable Text & Icons without White Fog */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 20, 36, 0.82) 0%, rgba(0, 32, 55, 0.90) 35%, rgba(0, 18, 32, 0.96) 100%)',
          }}
        />

        {/* Subtle Destination Accent Tint Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{
            background: destinationTheme
              ? `linear-gradient(90deg, transparent, ${destinationTheme.colors.primary}, ${destinationTheme.colors.secondary}, transparent)`
              : 'linear-gradient(90deg, transparent, #E9B95E, transparent)',
          }}
        />
      </div>

      {/* LAYER 6: Footer Content & Interactive Elements (Above all background layers and particles) */}
      <div className="relative z-10 max-w-[1380px] mx-auto px-4 md:px-8">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Brand & Accreditation Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
                <span className="material-symbols-outlined text-[22px]">travel_explore</span>
              </div>
              <span className="font-headline text-2xl font-extrabold tracking-wide text-white drop-shadow-md">
                VARNI HOLIDAYS
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed max-w-sm drop-shadow-xs font-normal">
              Bespoke holiday curation, domestic and international journeys, and unforgettable leisure designed with genuine Gujarat hospitality. Your Gateway to Joyful Holidays.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-md text-amber-300 border border-white/20">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider drop-shadow-xs">
                Recognised Gujarat Tour Partner
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="font-headline text-lg font-bold text-white flex items-center gap-1.5 pb-1 border-b border-white/15 w-fit">
              <span>Quick Links</span>
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-200 font-medium">
              <li>
                <Link href="/" className="hover:text-amber-300 hover:translate-x-1 transition-all inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#flights" className="hover:text-amber-300 hover:translate-x-1 transition-all inline-block">
                  Flight Consultation
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-amber-300 hover:translate-x-1 transition-all inline-block">
                  Hotel Reservations
                </Link>
              </li>
              <li>
                <Link href="/visa" className="hover:text-amber-300 hover:translate-x-1 transition-all inline-block">
                  Visa Assistance
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-amber-300 hover:translate-x-1 transition-all inline-block">
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/travel-insurance" className="hover:text-amber-300 hover:translate-x-1 transition-all inline-block">
                  Travel Insurance
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-300 hover:translate-x-1 transition-all inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-300 hover:translate-x-1 transition-all inline-block">
                  Contact Office
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-headline text-lg font-bold text-white flex items-center gap-1.5 pb-1 border-b border-white/15 w-fit">
              <span>Our Core Services</span>
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-200 font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-sky-400 shrink-0">flight</span>
                <span>Domestic & Global Flight Routing</span>
              </li>
              <li className="flex items-center gap-2">
                <Palmtree size={17} className="text-emerald-400 shrink-0" />
                <span>Kerala Backwaters & Hill Stations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-300 shrink-0">ac_unit</span>
                <span>Kashmir Snow Valleys & Houseboats</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-300 shrink-0">assignment_ind</span>
                <span>Visa Documentation Guidance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-400 shrink-0">temple_hindu</span>
                <span>South India Temple Pilgrimages</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-sky-400 shrink-0">family_restroom</span>
                <span>Custom Family Vacation Curations</span>
              </li>
            </ul>
          </div>

          {/* Anand Office Details */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-headline text-lg font-bold text-white flex items-center gap-1.5 pb-1 border-b border-white/15 w-fit">
              <span>Anand Headquarters</span>
            </h4>
            <div className="flex flex-col gap-2.5 text-sm text-slate-200">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-300 text-[18px] shrink-0 mt-0.5">
                  location_on
                </span>
                <span className="leading-snug text-slate-200">{COMPANY_CONTACT.address.full}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-300 text-[18px] shrink-0">call</span>
                <a
                  href={COMPANY_CONTACT.phone.tel}
                  className="hover:text-amber-300 transition-colors font-semibold text-white"
                >
                  {COMPANY_CONTACT.phone.display}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0">chat</span>
                <a
                  href={COMPANY_CONTACT.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors font-semibold text-white"
                >
                  WhatsApp: {COMPANY_CONTACT.whatsapp.display}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-sky-400 text-[18px] shrink-0">mail</span>
                <a
                  href={COMPANY_CONTACT.email.mailto}
                  className="hover:text-amber-300 transition-colors font-semibold text-white truncate"
                >
                  {COMPANY_CONTACT.email.primary}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 pt-1.5 border-t border-white/15">
                <span className="material-symbols-outlined text-[16px] text-amber-300 shrink-0">schedule</span>
                <span>{COMPANY_CONTACT.hours.display}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Gazette Newsletter Banner */}
        <div className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl mb-12 shadow-2xl border border-white/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col max-w-xl">
              <h4 className="font-headline text-xl font-bold text-white drop-shadow-sm">
                Subscribe to Varni Travel Gazette
              </h4>
              <p className="text-sm text-slate-200 mt-1 drop-shadow-xs font-normal">
                Receive handpicked seasonal flight offers, bespoke destination packages, and visa advisory alerts directly in your inbox.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1 sm:w-80">
                  <div className="absolute left-3.5 top-3.5 text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (statusMessage) setStatusMessage(null);
                    }}
                    placeholder="Enter your email address *"
                    className="w-full pl-10 pr-4 py-3 rounded-full bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-sm font-extrabold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </form>

              {statusMessage && (
                <div
                  className={`mt-2.5 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 shadow-sm ${
                    statusMessage.type === "success"
                      ? "bg-emerald-950/80 text-emerald-200 border border-emerald-500/50"
                      : "bg-rose-950/80 text-rose-200 border border-rose-500/50"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="text-rose-400 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-6 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <p>© {new Date().getFullYear()} Varni Holidays Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">
              Legal Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
