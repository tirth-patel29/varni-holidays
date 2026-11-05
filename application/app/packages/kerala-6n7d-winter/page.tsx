"use client";

import React, { useState } from "react";
import Link from "next/link";
import DynamicPricingCalculator from "@/components/DynamicPricingCalculator";
import { COMPANY_CONTACT } from "@/lib/config/contact";
import {
  KERALA_ITINERARIES,
  KeralaDuration,
  KERALA_DURATION_OPTIONS,
} from "@/lib/pricing/kerala";

export default function KeralaPackageDetailPage() {
  const [currentDuration, setCurrentDuration] = useState<KeralaDuration>("6N7D");

  const itineraryDays = KERALA_ITINERARIES[currentDuration];
  const durationInfo = KERALA_DURATION_OPTIONS.find((d) => d.code === currentDuration) || KERALA_DURATION_OPTIONS[1];

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-6">
      
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/packages" className="hover:text-primary transition-colors">Packages</Link>
        <span>/</span>
        <span className="font-bold text-primary">
          Kerala {currentDuration === "5N6D" ? "5N/6D Ex-Cochin" : "6N/7D Grand Tour"}
        </span>
      </div>

      {/* Hero Showcase Card */}
      <section className="relative bg-surface-container p-4 md:p-6 rounded-[2.5rem] shadow-clay-hero border border-white/80 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Main Hero Artwork Frame */}
          <div className="lg:col-span-8 relative min-h-[480px] md:min-h-[540px] rounded-[2rem] overflow-hidden shadow-clay-card flex flex-col justify-between p-6 md:p-10 text-white">
            <div
              className="absolute inset-0 bg-cover bg-center -z-10 transition-all duration-700"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85')",
              }}
            />
            {/* Optimized readable overlay for mobile & desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#153650]/95 via-[#153650]/65 to-black/30 -z-10" />

            {/* Top Badges & Duration Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-primary/85 backdrop-blur-md text-tertiary-fixed text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">star</span>
                  Winter Season 2026–2027
                </span>

                {/* Duration Pills */}
                <div className="inline-flex items-center bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20">
                  <button
                    type="button"
                    onClick={() => setCurrentDuration("5N6D")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      currentDuration === "5N6D"
                        ? "bg-white text-primary shadow-sm"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    5N / 6D
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentDuration("6N7D")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      currentDuration === "6N7D"
                        ? "bg-white text-primary shadow-sm"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    6N / 7D
                  </button>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-surface-cream-subtle/95 text-primary text-xs font-bold flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                Private Vehicle at Disposal
              </span>
            </div>

            {/* Bottom Title & Specs */}
            <div className="mt-auto pt-16">
              <span className="text-xs uppercase tracking-widest text-[#E9B95E] font-bold block mb-1">
                South India Flagship Itinerary • {durationInfo.routeStays}
              </span>
              <h1 className="font-headline text-3xl sm:text-5xl font-bold leading-tight mb-3 drop-shadow-sm">
                {currentDuration === "5N6D"
                  ? "Cochin, Munnar & Alleppey Backwaters Escape"
                  : "Scenic Kerala & Backwaters Grand Tour"}
              </h1>
              <p className="text-xs sm:text-sm text-surface-cream-subtle max-w-xl mb-6 leading-relaxed">
                {currentDuration === "5N6D"
                  ? "Experience historic Fort Kochi, mist-covered Munnar tea plantations, Thekkady wildlife spice hills, and romantic Alleppey backwaters."
                  : "Munnar misty tea plantations, Thekkady wildlife sanctuary, Alleppey backwaters, and Kovalam sun-kissed beaches with authentic Gujarati meal guidance."}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#calculator"
                  className="px-6 py-3.5 rounded-full bg-secondary text-white text-xs font-bold clay-pill-button flex items-center gap-2 hover:brightness-110 shadow-lg"
                >
                  <span>Configure Live Price</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </a>
                <a
                  href={COMPANY_CONTACT.whatsapp.buildUrl(
                    `Hi Varni Holidays, please send Kerala ${currentDuration === "5N6D" ? "5N6D" : "6N7D"} Itinerary and rates`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold hover:bg-white/30 transition-all flex items-center gap-1.5 border border-white/30"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>WhatsApp Brochure</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column Highlights Widgets */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            
            {/* Climate & Best Time Widget */}
            <div className="bg-surface-container-lowest p-5 rounded-[2rem] shadow-clay-card border border-white/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Climate & Seasonality
                </span>
                <span className="w-8 h-8 rounded-full bg-surface-cream-subtle flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">sunny</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-headline text-2xl font-bold text-primary">21°C - 27°C</span>
                <span className="text-xs text-secondary font-semibold">Winter Peak Season</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Rates valid 1 Oct 2026 to 31 Mar 2027. Surcharge applies during holiday peak 20 Dec 2026 to 10 Jan 2027.
              </p>
            </div>

            {/* Quick Price Matrix Glance based on selected duration */}
            <div className="bg-surface-cream-subtle p-5 rounded-[2rem] shadow-clay-inset space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                  {currentDuration === "5N6D" ? "5N/6D Source Rates" : "6N/7D Source Rates"}
                </span>
                <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                  {currentDuration === "5N6D" ? "5 Nights" : "6 Nights"}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span>2 Pax (AC Sedan):</span>
                  <span className="font-bold text-primary">
                    From {currentDuration === "5N6D" ? "₹19,300" : "₹27,400"} / person
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>4 Pax (Innova Crysta):</span>
                  <span className="font-bold text-primary">
                    From {currentDuration === "5N6D" ? "₹17,300" : "₹24,500"} / person
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>6 Pax (Innova Crysta):</span>
                  <span className="font-bold text-primary">
                    From {currentDuration === "5N6D" ? "₹14,700" : "₹20,700"} / person
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>6 Pax (AC Traveller):</span>
                  <span className="font-bold text-primary">
                    From {currentDuration === "5N6D" ? "₹15,400" : "₹21,400"} / person
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>8 Pax (AC Traveller):</span>
                  <span className="font-bold text-primary">
                    From {currentDuration === "5N6D" ? "₹13,900" : "₹19,400"} / person
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>10 Pax (AC Traveller):</span>
                  <span className="font-bold text-primary">
                    From {currentDuration === "5N6D" ? "₹13,100" : "₹18,200"} / person
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant block pt-1 border-t border-surface-sand-tint">
                Includes AC vehicle 8am–8pm, chauffeur, tolls, parking & taxes.
              </span>
            </div>

            {/* Gujarati Hospitality Trust Badge */}
            <div className="bg-surface-container-lowest p-4 rounded-[2rem] shadow-clay-card flex items-center gap-3 border border-white/80">
              <div className="w-10 h-10 rounded-xl bg-primary text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">restaurant</span>
              </div>
              <div>
                <span className="text-xs font-bold text-primary block">Jain & Swaminarayan Food</span>
                <span className="text-[11px] text-on-surface-variant">Coordinated at all hotel stops</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Highlights Bento */}
      <section className="mb-12">
        <h3 className="font-headline text-2xl font-bold text-primary mb-6">
          Curated Tour Highlights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "landscape",
              title: "Munnar Tea Trails",
              desc: "Visit Mattupetty Dam, Echo Point, Kundala Lake, and Eravikulam National Park.",
            },
            {
              icon: "forest",
              title: "Periyar Wildlife",
              desc: "Spice plantation walk in Thekkady with optional Periyar boat safari and martial arts.",
            },
            {
              icon: "directions_boat",
              title: "Alleppey Backwaters",
              desc: "Tranquil lagoon cruise past coconut groves and village canals with traditional meals.",
            },
            {
              icon: currentDuration === "5N6D" ? "location_city" : "beach_access",
              title: currentDuration === "5N6D" ? "Cochin Heritage" : "Kovalam & Poovar",
              desc:
                currentDuration === "5N6D"
                  ? "Fort Kochi Chinese fishing nets, Dutch Palace, and Marine Drive harbor sunset."
                  : "Golden sand beaches, Poovar Island sea confluence, and Padmanabhaswamy temple darshan.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest p-5 rounded-3xl shadow-clay-card border border-white/80"
            >
              <div className="w-10 h-10 rounded-2xl bg-surface-cream-subtle flex items-center justify-center text-secondary mb-3 shadow-clay-inset">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <h4 className="font-headline text-base font-bold text-primary mb-1">{item.title}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Day-Wise Itinerary Accordion / List */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
              {currentDuration === "5N6D" ? "5 Nights / 6 Days Itinerary" : "6 Nights / 7 Days Itinerary"}
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
              Complete Day-Wise Itinerary
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Dedicated private vehicle at your disposal daily from 8:00 AM to 8:00 PM
          </span>
        </div>

        <div className="space-y-4">
          {itineraryDays.map((item) => (
            <div
              key={item.day}
              className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/80 flex flex-col md:flex-row gap-6"
            >
              <div className="md:w-36 shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                <span className="px-3.5 py-1 rounded-full bg-primary text-white font-mono text-xs font-bold shadow-sm">
                  {item.day}
                </span>
                <span className="text-xs font-bold text-secondary">{item.stay}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-headline text-lg font-bold text-primary">{item.title}</h4>
                  <span className="text-[11px] font-semibold text-secondary bg-surface-cream-subtle px-2.5 py-0.5 rounded-full w-fit">
                    {item.meals}
                  </span>
                </div>
                <span className="text-xs font-semibold text-secondary block">{item.route}</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Package Inclusions & Exclusions */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Inclusions */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[32px] shadow-clay-card border border-white/80">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <h4 className="font-headline text-xl font-bold text-primary">Package Inclusions</h4>
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>
                  {currentDuration === "5N6D" ? "5 Nights" : "6 Nights"} accommodation on twin sharing basis in selected hotel category.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Continental Plan (Daily breakfast included at all hotels - CPAI).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>All transfers and sightseeing by dedicated private vehicle as per itinerary.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Chauffeur allowance, fuel charges, tolls, parking fees, and interstate permits.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>All applicable government service taxes and GST.</span>
              </li>
            </ul>
          </div>

          {/* Exclusions */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[32px] shadow-clay-card border border-white/80">
            <div className="flex items-center gap-2 mb-4 text-rose-700">
              <span className="material-symbols-outlined text-[22px]">cancel</span>
              <h4 className="font-headline text-xl font-bold text-primary">Package Exclusions</h4>
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Airfare or train tickets from your originating city to/from Cochin/Trivandrum.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Monument entry tickets, boating tickets, and National Park fees.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Personal expenses (room service, laundry, telephone calls, tips).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Vehicle usage beyond 8:00 PM (driver night bata applicable extra).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Hill station AC charges (Munnar/Thekkady hotels are non-AC by default).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Live Calculator Anchor */}
      <section id="calculator" className="scroll-mt-24">
        <div className="mb-6">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
            Package Cost Calculator
          </span>
          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
            Instant Estimate & Direct Consultation Request
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Choose your duration, hotel category, group size, and custom supplements below to generate your authoritative pricing snapshot.
          </p>
        </div>

        <DynamicPricingCalculator
          initialDuration={currentDuration}
          onDurationChange={setCurrentDuration}
        />
      </section>
    </div>
  );
}
