import React from 'react';
import Link from 'next/link';
import { COMPANY_CONTACT } from '@/lib/config/contact';

export const metadata = {
  title: 'About Us | Varni Holidays – Your Gateway to Joyful Holidays',
  description: 'Learn about Varni Holidays, premier travel consultancy headquartered in Anand, Gujarat. Discover our story, values, and personalized travel management.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-sand pb-24">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-ocean via-ocean-dark to-slate-900 text-sand-light pt-36 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(233,185,94,0.18),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand-light/10 text-gold font-medium text-xs tracking-wider uppercase backdrop-blur-md mb-4 border border-sand-light/10">
            About Varni Holidays
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-6 font-semibold tracking-tight">
            Crafting Journeys That Feel Like <br className="hidden sm:block" />
            <span className="italic font-normal text-gold">Homecoming & Discovery</span>
          </h1>
          <p className="text-sand/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Headquartered in Anand — the heart of Charotar, Gujarat — Varni Holidays is built on timeless Gujarati hospitality, meticulous itinerary planning, and uncompromised traveller safety.
          </p>
        </div>
      </section>

      {/* Main Story & Values */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="clay-card rounded-3xl p-8 sm:p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold text-ocean-light uppercase tracking-wider block mb-2">Our Story</span>
              <h2 className="font-serif text-3xl text-ocean font-bold mb-4 leading-tight">
                From Anand to the World: Travel Built on Trust
              </h2>
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>
                  Varni Holidays was founded with a singular conviction: travel should be an effortless, joy-filled celebration, free of opaque markups, chaotic itineraries, and unexpected on-ground surprises.
                </p>
                <p>
                  For the families, students, entrepreneurs, and NRI visitors of Anand and greater Gujarat, travel planning has often meant navigating either faceless online booking aggregators or traditional agents with outdated supplier rates.
                </p>
                <p>
                  We bridged that gap. By combining modern digital precision with warm, proactive consultation, Varni Holidays ensures every flight enquiry, holiday package, and visa submission receives genuine human attention and honest price clarity.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="clay-card rounded-2xl overflow-hidden aspect-[4/3] shadow-lg border border-gold/20">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
                  alt="Varni Holidays Travel Vision"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 clay-card rounded-2xl p-4 bg-sand-light shadow-md border border-gold/30 max-w-xs">
                <p className="font-serif text-base font-bold text-ocean italic">
                  "Your Gateway to Joyful Holidays"
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Trusted by 5,000+ happy travellers across India and abroad.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Varni Standard */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-1">Our Guarantees</span>
            <h3 className="font-serif text-3xl text-ocean font-bold">The Varni Standard</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="clay-card rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-ocean/10 text-ocean flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-ocean mb-2">Verified Pricing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic price matrices directly synced with supplier contracts. No hidden baggage or resort surcharges.
              </p>
            </div>

            <div className="clay-card rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/20 text-ocean-dark flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-ocean mb-2">Dedicated Specialist</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                One dedicated executive from quotation to return flight check-in. Real human support on WhatsApp & call.
              </p>
            </div>

            <div className="clay-card rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">directions_car</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-ocean mb-2">Private Fleets</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verified air-conditioned vehicles (Sedan, Innova, Tempo Traveller) with experienced commercial chauffeurs.
              </p>
            </div>

            <div className="clay-card rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">hotel</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-ocean mb-2">Audited Stays</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Properties inspected for hygiene, family-safe surroundings, and authentic culinary dining options.
              </p>
            </div>
          </div>
        </div>

        {/* Leadership & Office */}
        <div className="clay-card rounded-3xl p-8 sm:p-12 mb-12 bg-sand-light border border-gold/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-bold text-ocean uppercase tracking-wider block">Office Headquarters</span>
              <h3 className="font-serif text-2xl text-ocean font-bold">Visit Us in Anand, Gujarat</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We welcome travellers and families to visit our office for in-person holiday planning, visa document verification, and group tour discussions.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold">location_on</span>
                  <span>{COMPANY_CONTACT.address.full}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold">schedule</span>
                  <span>{COMPANY_CONTACT.hours.detailed}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/contact"
                className="clay-pill-button text-center px-6 py-3 rounded-full text-white text-xs font-bold shadow-md hover:bg-ocean-dark"
              >
                Schedule an In-Person Consultation
              </Link>
              <a
                href={COMPANY_CONTACT.phone.tel}
                className="text-center px-6 py-3 rounded-full text-ocean bg-sand hover:bg-gold/20 text-xs font-bold transition-colors"
              >
                Call: {COMPANY_CONTACT.phone.display}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

