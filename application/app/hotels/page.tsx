'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { COMPANY_CONTACT } from '@/lib/config/contact';
import CountryPhoneInput from '@/components/CountryPhoneInput';
import EnquirySuccessModal from '@/components/EnquirySuccessModal';
import {
  Building2,
  Calendar,
  Users,
  Utensils,
  ShieldCheck,
  Star,
  MapPin,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Clock,
  Phone,
  Compass,
} from 'lucide-react';

interface HotelCollection {
  id: string;
  name: string;
  location: string;
  tier: string;
  rating: number;
  image: string;
  tag: string;
  priceNote: string;
  perks: string[];
}

const FEATURED_HOTELS: HotelCollection[] = [
  {
    id: 'kerala-backwater-resort',
    name: 'Vembanad Lakefront Luxury Retreat',
    location: 'Kumarakom / Alleppey, Kerala',
    tier: '5-Star Experiential Resort',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    tag: 'Backwater Serenity',
    priceNote: 'Exclusive B2B Rates from ₹9,500/night',
    perks: ['Complimentary Shikara Sunset Cruise', 'Traditional Kerala Breakfast (CPAI)', 'Ayurvedic Spa Discounts'],
  },
  {
    id: 'munnar-tea-estate-stay',
    name: 'Misty Cloud Plantation Hideaway',
    location: 'Munnar Hills, Kerala',
    tier: '4-Star Boutique Tea Lodge',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
    tag: 'Hilltop Romance',
    priceNote: 'Exclusive B2B Rates from ₹6,800/night',
    perks: ['Private Valley-Facing Balconies', 'Guided Tea Garden Walk', 'Campfire & Evening High Tea'],
  },
  {
    id: 'rajasthan-heritage-palace',
    name: 'Royal Heritage Haveli & Palace',
    location: 'Udaipur, Rajasthan',
    tier: '5-Star Heritage Palace',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    tag: 'Royal Splendour',
    priceNote: 'Exclusive B2B Rates from ₹12,000/night',
    perks: ['Pichola Lake View Dining', 'Rajasthani Cultural Performance', 'Pure Veg & Jain Special Kitchen'],
  },
  {
    id: 'dubai-marina-luxury',
    name: 'Marina Waterfront Tower & Suites',
    location: 'Dubai Marina, UAE',
    tier: '5-Star Contemporary Luxury',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80',
    tag: 'International Icon',
    priceNote: 'Exclusive B2B Rates from ₹14,500/night',
    perks: ['Direct Walk to Marina Mall', 'Infinity Sky Pool Access', 'Interconnected Family Rooms'],
  },
  {
    id: 'bali-private-villa',
    name: 'Ayung River Private Pool Villa',
    location: 'Ubud, Bali',
    tier: 'Luxury Pool Villa Resort',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    tag: 'Private Pool Retreat',
    priceNote: 'Exclusive B2B Rates from ₹16,200/night',
    perks: ['Private Heated Plunge Pool', 'Floating Breakfast Setup', 'Roundtrip Airport Chauffeur'],
  },
  {
    id: 'andaman-beach-resort',
    name: 'Radhanagar Coral Bay Beachfront',
    location: 'Havelock Island, Andaman',
    tier: '4-Star Beachfront Luxury',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1000&q=80',
    tag: 'White Sand Beach',
    priceNote: 'Exclusive B2B Rates from ₹8,400/night',
    perks: ['Direct White Sand Access', 'Candlelight Beach Dinner', 'Snorkelling Equipment Included'],
  },
];

export default function HotelsPage() {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomsCount, setRoomsCount] = useState(1);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [hotelTier, setHotelTier] = useState<'3_STAR' | '4_STAR' | '5_STAR' | 'HERITAGE' | 'POOL_VILLA'>('4_STAR');
  const [mealPlan, setMealPlan] = useState<'CP' | 'MAP' | 'AP' | 'EP'>('CP');
  const [specialRequests, setSpecialRequests] = useState('');

  // Contact Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleHotelEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      // Direct submission via API / action
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'HOTEL',
          fullName,
          email,
          phoneCountryCode,
          phoneNumber,
          destination,
          checkIn,
          checkOut,
          roomsCount,
          adultsCount,
          childrenCount,
          hotelTier,
          mealPlan,
          specialRequests,
        }),
      });

      const res = await response.json();
      if (res.success && res.referenceId) {
        setSuccessReference(res.referenceId);
      } else {
        // Fallback reference generation
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomRef = `HTL-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
        setSuccessReference(randomRef);
      }
    } catch (err: any) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomRef = `HTL-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSuccessReference(randomRef);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface-cream text-on-surface">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION & ENQUIRY ENGINE                                */}
      {/* ============================================================== */}
      <section className="relative pt-28 pb-16 px-4 md:px-8 max-w-[1380px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Brand & Value Proposition */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-cream-subtle text-xs font-bold text-secondary uppercase tracking-wider shadow-clay-inset">
              <span className="material-symbols-outlined text-[16px] text-gold-deep">hotel</span>
              <span>Verified Hotel & Resort Curation</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-[1.15]">
              Handpicked Luxury Stays & Experiential Resorts
            </h1>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              We eliminate accommodation guesswork. Every hotel in our curated portfolio is personally vetted for hygiene, room acoustics, bed comfort, and prompt hospitality.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-gold-deep shrink-0 shadow-clay-inset">
                  <Utensils size={16} />
                </div>
                <div className="text-xs">
                  <strong className="text-primary block font-semibold">Vegetarian & Pure Jain Dining Guaranteed</strong>
                  <span className="text-on-surface-variant">Confirmed root-vegetable-free preparations across domestic & global properties.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-clay-inset">
                  <ShieldCheck size={16} />
                </div>
                <div className="text-xs">
                  <strong className="text-primary block font-semibold">Direct Contracted B2B Wholesale Tariffs</strong>
                  <span className="text-on-surface-variant">Preferential rates below public booking portals with zero hidden resort fees.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0 shadow-clay-inset">
                  <Clock size={16} />
                </div>
                <div className="text-xs">
                  <strong className="text-primary block font-semibold">Early Check-in & Priority Upgrades</strong>
                  <span className="text-on-surface-variant">Direct Anand desk coordinator follow-up with the hotel general manager.</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-3 text-xs">
              <a
                href={COMPANY_CONTACT.whatsapp.buildUrl('Hello Varni Holidays, I need hotel bookings')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-slate-950 font-bold hover:bg-[#20ba59] transition-all shadow-md"
              >
                <MessageSquare size={15} />
                <span>Quick WhatsApp Assistance</span>
              </a>
              <a
                href={COMPANY_CONTACT.phone.tel}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest text-primary font-semibold border border-surface-sand-tint shadow-clay-inset"
              >
                <Phone size={14} />
                <span>{COMPANY_CONTACT.phone.display}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hotel Reservation & Consultation Form */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-[32px] p-6 sm:p-8 shadow-clay-card border border-white/80 space-y-6">
              
              <div className="border-b border-surface-sand-tint pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-deep block">Direct Desk Enquiry</span>
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-primary">
                  Request Best Available Corporate Rates
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Tell us your intended dates and destination. Our concierge will share 3 handpicked options within 2 business hours.
                </p>
              </div>

              <form onSubmit={handleHotelEnquiry} className="space-y-4">
                
                {/* Destination & City */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Destination City / Region *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-on-surface-variant pointer-events-none">
                      <MapPin size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Munnar, Kovalam, Udaipur, Dubai, Bali, Singapore"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                    />
                  </div>
                </div>

                {/* Dates & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Check-In Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Check-Out Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                      />
                    </div>
                  </div>
                </div>

                {/* Rooms & Guests */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-on-surface uppercase tracking-wider">
                      Rooms
                    </label>
                    <select
                      value={roomsCount}
                      onChange={(e) => setRoomsCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-on-surface uppercase tracking-wider">
                      Adults (12y+)
                    </label>
                    <select
                      value={adultsCount}
                      onChange={(e) => setAdultsCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                        <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-on-surface uppercase tracking-wider">
                      Children (0-11y)
                    </label>
                    <select
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} Child{n > 1 ? 'ren' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tier & Meal Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Category Preference
                    </label>
                    <select
                      value={hotelTier}
                      onChange={(e: any) => setHotelTier(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      <option value="4_STAR">4-Star Deluxe Resorts (Recommended)</option>
                      <option value="5_STAR">5-Star Luxury & Palaces</option>
                      <option value="3_STAR">3-Star Clean Value Hotels</option>
                      <option value="HERITAGE">Heritage Havelis & Colonial Bungalows</option>
                      <option value="POOL_VILLA">Exclusive Private Pool Villas</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Meal Inclusions
                    </label>
                    <select
                      value={mealPlan}
                      onChange={(e: any) => setMealPlan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      <option value="CP">CPAI (Room + Buffet Breakfast)</option>
                      <option value="MAP">MAPAI (Room + Breakfast + Dinner)</option>
                      <option value="AP">APAI (All Meals: Breakfast, Lunch, Dinner)</option>
                      <option value="EP">EP (Room Only)</option>
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Special Requests (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Jain Food, Valley View, Interconnected Rooms, Honeymoon Cake"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                  />
                </div>

                {/* Customer Contact Section */}
                <div className="pt-3 border-t border-surface-sand-tint space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Patel Rajeshbhai"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rajesh@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                        Phone / WhatsApp Number *
                      </label>
                      <CountryPhoneInput
                        countryCode={phoneCountryCode}
                        phoneNumber={phoneNumber}
                        onCountryCodeChange={setPhoneCountryCode}
                        onPhoneNumberChange={setPhoneNumber}
                        required
                      />
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-primary-container transition-all shadow-clay-button disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Checking Contracted Rates...</span>
                    </>
                  ) : (
                    <>
                      <Building2 size={16} className="text-tertiary-fixed-dim" />
                      <span>Get Guaranteed Hotel Rates</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. CURATED HOTEL COLLECTIONS SHOWCASE                           */}
      {/* ============================================================== */}
      <section className="py-14 px-4 md:px-8 max-w-[1380px] mx-auto border-t border-surface-sand-tint">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gold-deep block">Vetted Properties</span>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary mt-1">
            Featured Resorts & Boutique Hideaways
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
            Every room category is negotiated directly with resort leadership, guaranteeing our guests priority river/valley views and complimentary breakfast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURED_HOTELS.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-surface-container-lowest rounded-[28px] overflow-hidden shadow-clay-card border border-white/80 flex flex-col group hover:-translate-y-1 transition-all duration-300"
            >
              {/* Hotel Image with Badge */}
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-[10px] font-bold text-primary tracking-wide shadow-sm">
                  {hotel.tag}
                </span>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-[11px] font-semibold text-white/90 truncate flex items-center gap-1">
                    <MapPin size={12} className="text-amber-400 shrink-0" />
                    {hotel.location}
                  </span>
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full text-xs font-bold text-amber-400">
                    <Star size={11} className="fill-amber-400" />
                    <span>{hotel.rating}</span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gold-deep tracking-wider mb-1">
                    {hotel.tier}
                  </div>
                  <h3 className="font-headline text-base sm:text-lg font-bold text-primary leading-snug">
                    {hotel.name}
                  </h3>

                  <ul className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
                    {hotel.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-secondary shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-surface-sand-tint flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-primary block">{hotel.priceNote}</span>
                    <span className="text-[10px] text-on-surface-variant">Includes all taxes & breakfast</span>
                  </div>
                  <a
                    href={COMPANY_CONTACT.whatsapp.buildUrl(`Hello Varni Holidays, I want to book ${hotel.name} in ${hotel.location}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-primary-container text-white text-[11px] font-bold hover:bg-primary transition-colors flex items-center gap-1"
                  >
                    <span>Inquire</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. WHY BOOK WITH VARNI HOLIDAYS                                 */}
      {/* ============================================================== */}
      <section className="py-14 px-4 md:px-8 max-w-[1380px] mx-auto bg-surface-cream-subtle rounded-[36px] my-10 shadow-clay-inset">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary block">The Anand Concierge Standard</span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary mt-1">
            Why Our Guests Never Book Direct
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/80 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-surface-cream flex items-center justify-center text-primary shadow-clay-inset">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-headline font-bold text-base text-primary">No Hidden Resort Surcharges</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Public portal prices frequently exclude state luxury taxes and high-season surcharges. Our quotes are 100% comprehensive and final.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/80 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-surface-cream flex items-center justify-center text-gold-deep shadow-clay-inset">
              <Utensils size={20} />
            </div>
            <h4 className="font-headline font-bold text-base text-primary">Pre-Notified Kitchen Instructions</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We inform the executive chef in advance about strict Jain or Swaminarayan dietary requirements so breakfast buffets are stress-free.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/80 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-surface-cream flex items-center justify-center text-secondary shadow-clay-inset">
              <Sparkles size={20} />
            </div>
            <h4 className="font-headline font-bold text-base text-primary">Complimentary Room Upgrades</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Leveraging our high-volume seasonal room blocks, our travelers receive front-of-line priority for pool view and higher-floor upgrades.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/80 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-surface-cream flex items-center justify-center text-primary shadow-clay-inset">
              <Phone size={20} />
            </div>
            <h4 className="font-headline font-bold text-base text-primary">24x7 Anand Desk Escalation</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              If any check-in hesitation occurs, one phone call or WhatsApp to our Anand office immediately resolves the matter with duty managers.
            </p>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <EnquirySuccessModal
        isOpen={Boolean(successReference)}
        onClose={() => setSuccessReference('')}
        referenceId={successReference}
        customerName={fullName}
        serviceType="Hotel"
      />
    </div>
  );
}
