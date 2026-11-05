'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { COMPANY_CONTACT } from '@/lib/config/contact';
import CountryPhoneInput from '@/components/CountryPhoneInput';
import EnquirySuccessModal from '@/components/EnquirySuccessModal';
import PackageEnquiryModal, { PackageModalInfo } from '@/components/PackageEnquiryModal';
import { submitCustomHolidayEnquiryAction } from '@/app/actions/enquiries';
import {
  Compass,
  Calendar,
  Users,
  Utensils,
  Car,
  Hotel,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageSquare,
  ArrowRight,
  MapPin,
  Clock,
  Filter,
} from 'lucide-react';

interface DiscoveryItem {
  id: string;
  slug?: string;
  title: string;
  destination: string;
  category: 'domestic' | 'international';
  theme: 'hills' | 'beach' | 'culture' | 'popular' | 'wildlife';
  duration: string;
  price: string;
  priceSubtext?: string;
  highlights: string[];
  image: string;
  badge?: string;
  isFlagship?: boolean;
}

const ALL_DISCOVERY_ITEMS: DiscoveryItem[] = [
  {
    id: 'kerala-signature',
    slug: 'kerala-6n7d-winter',
    title: 'Scenic Kerala & Backwaters Grand Tour',
    destination: 'Kerala, India',
    category: 'domestic',
    theme: 'popular',
    duration: '6N / 7D',
    price: 'From ₹18,200',
    priceSubtext: 'Live Pricing Engine (5 Hotel Tiers)',
    highlights: ['Munnar Tea Hills', 'Thekkady Periyar Wildlife', 'Alleppey Backwaters Houseboat', 'Kovalam Beach'],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    badge: 'Flagship Winter CPAI',
    isFlagship: true,
  },
  {
    id: 'kashmir-valley',
    slug: 'kashmir-valley-5n6d',
    title: 'Kashmir Paradise: Shikaras & Snow Valleys',
    destination: 'Kashmir, India',
    category: 'domestic',
    theme: 'hills',
    duration: '5N / 6D',
    price: 'From ₹24,500',
    priceSubtext: 'per person twin sharing',
    highlights: ['Dal Lake Houseboat Stay', 'Gulmarg Gondola Rides', 'Pahalgam Betaab Valley', 'Mughal Gardens Srinagar'],
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1000&q=80',
    badge: 'Popular Group Tour',
  },
  {
    id: 'rajasthan-heritage',
    slug: 'rajasthan-royal-7n8d',
    title: 'Royal Rajasthan: Forts, Palaces & Sand Dunes',
    destination: 'Rajasthan, India',
    category: 'domestic',
    theme: 'culture',
    duration: '7N / 8D',
    price: 'From ₹29,800',
    priceSubtext: 'per person twin sharing',
    highlights: ['Amber Fort & Hawa Mahal', 'Lake Pichola Boat Cruise', 'Sam Desert Safari & Camp', 'Mehrangarh Fort'],
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80',
    badge: 'Heritage Circuit',
  },
  {
    id: 'karnataka-wayanad',
    slug: 'karnataka-wayanad-6n7d',
    title: 'Karnataka & Wayanad Hill Escapes',
    destination: 'South India',
    category: 'domestic',
    theme: 'hills',
    duration: '6N / 7D',
    price: 'From ₹23,400',
    priceSubtext: 'per person twin sharing',
    highlights: ['Bangalore Palace', 'Mysore Royal Heritage', 'Coorg Coffee Estates', 'Wayanad Rainforests'],
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'tamil-nadu-temple',
    slug: 'tamil-nadu-temple-5n6d',
    title: 'Tamil Nadu Divya Desam Temple Odyssey',
    destination: 'South India',
    category: 'domestic',
    theme: 'culture',
    duration: '5N / 6D',
    price: 'From ₹19,800',
    priceSubtext: 'per person twin sharing',
    highlights: ['Madurai Meenakshi Temple', 'Rameshwaram Ramanathaswamy', 'Kanyakumari Sunrise', 'Trivandrum Padmanabhaswamy'],
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'andaman-island',
    slug: 'andaman-white-sand-5n6d',
    title: 'Andaman White Sand & Coral Odyssey',
    destination: 'Andaman & Nicobar, India',
    category: 'domestic',
    theme: 'beach',
    duration: '5N / 6D',
    price: 'From ₹28,500',
    priceSubtext: 'per person twin sharing',
    highlights: ['Radhanagar White Beach', 'Elephant Beach Snorkelling', 'Cellular Jail Memorial', 'Havelock Luxury Stays'],
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1000&q=80',
    badge: 'Beach Favorite',
  },
  {
    id: 'dubai-abu-dhabi',
    slug: 'dubai-abu-dhabi-5n6d',
    title: 'Dubai & Abu Dhabi Futuristic Extravaganza',
    destination: 'UAE',
    category: 'international',
    theme: 'popular',
    duration: '5N / 6D',
    price: 'From ₹42,000',
    priceSubtext: 'per person + airfare',
    highlights: ['Burj Khalifa 124th Level', 'Desert Dune 4x4 Safari', 'Sheikh Zayed Grand Mosque', 'Marina Luxury Dinner Cruise'],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80',
    badge: 'Express Visa Available',
  },
  {
    id: 'bali-luxury',
    slug: 'bali-luxury-pool-villa-6n7d',
    title: 'Bali Luxury Pool Villa & Temple Retreat',
    destination: 'Indonesia',
    category: 'international',
    theme: 'beach',
    duration: '6N / 7D',
    price: 'From ₹48,000',
    priceSubtext: 'per person + airfare',
    highlights: ['Ubud Private Pool Villa', 'Tegalalang Rice Terraces', 'Uluwatu Sunset Kecak Dance', 'Nusa Penida Kelingking'],
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    badge: 'Honeymoon Favorite',
  },
  {
    id: 'swiss-alps-paris',
    slug: 'swiss-alps-paris-8n9d',
    title: 'Swiss Alps & Romantic Paris Grand Tour',
    destination: 'Switzerland & France',
    category: 'international',
    theme: 'hills',
    duration: '8N / 9D',
    price: 'From ₹1,65,000',
    priceSubtext: 'per person twin sharing',
    highlights: ['Jungfraujoch Top of Europe', 'Mount Titlis Cableway', 'Eiffel Tower & Seine Cruise', 'Scenic Swiss Train Passes'],
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
    badge: 'Schengen Assistance',
  },
  {
    id: 'vietnam-odyssey',
    slug: 'vietnam-heritage-6n7d',
    title: 'Vietnam Dragons: Hanoi, Halong Bay & Da Nang',
    destination: 'Vietnam',
    category: 'international',
    theme: 'culture',
    duration: '6N / 7D',
    price: 'From ₹36,500',
    priceSubtext: 'per person + airfare',
    highlights: ['Halong Bay 5-Star Overnight Cruise', 'Bana Hills Golden Bridge', 'Hoi An Lantern Town', 'Hanoi Street Food Tour'],
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80',
    badge: 'E-Visa Ready',
  },
];

type CategoryFilter = 'ALL' | 'DOMESTIC' | 'INTERNATIONAL' | 'HILLS' | 'BEACH' | 'CULTURE';

export default function PackagesPage() {
  // Custom Holiday Planner Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [destinations, setDestinations] = useState('');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);
  const [mealPlan, setMealPlan] = useState<'CPAI' | 'MAP' | 'APAI' | 'EP'>('CPAI');
  const [hotelCategory, setHotelCategory] = useState<'THREE_STAR' | 'FOUR_STAR' | 'FIVE_STAR' | 'FLEXIBLE'>('FOUR_STAR');
  const [transferPreference, setTransferPreference] = useState<'SHARING' | 'PRIVATE' | 'RECOMMEND'>('PRIVATE');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [needVisa, setNeedVisa] = useState(false);
  const [needFlights, setNeedFlights] = useState(false);
  const [needInsurance, setNeedInsurance] = useState(false);

  // Form Submitting & UI States
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReference, setSuccessReference] = useState('');

  // Destination Filtering State
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('ALL');

  // Modal State for Package Inquiries
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageModalInfo | null>(null);

  const handleCustomHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    if (departureDate && returnDate && new Date(returnDate) < new Date(departureDate)) {
      setErrorMessage('Return date must be on or after departure date.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await submitCustomHolidayEnquiryAction({
        fullName,
        email,
        phoneCountryCode,
        phoneNumber,
        departureDate,
        returnDate,
        destinations,
        adultsCount,
        childrenCount,
        infantsCount,
        mealPlan,
        hotelCategory,
        transferPreference,
        specialRequirements,
        needVisa,
        needFlights,
        needInsurance,
      });

      if (res.success && res.referenceId) {
        setSuccessReference(res.referenceId);
      } else {
        setErrorMessage(res.error || 'Failed to submit enquiry. Please check your contact details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPackageModal = (item: DiscoveryItem) => {
    setSelectedPackage({
      slug: item.slug || item.id,
      title: item.title,
      duration: item.duration,
      price: item.price,
      route: item.highlights.join(' • '),
    });
    setModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    if (activeFilter === 'ALL') return ALL_DISCOVERY_ITEMS;
    if (activeFilter === 'DOMESTIC') return ALL_DISCOVERY_ITEMS.filter((i) => i.category === 'domestic');
    if (activeFilter === 'INTERNATIONAL') return ALL_DISCOVERY_ITEMS.filter((i) => i.category === 'international');
    if (activeFilter === 'HILLS') return ALL_DISCOVERY_ITEMS.filter((i) => i.theme === 'hills');
    if (activeFilter === 'BEACH') return ALL_DISCOVERY_ITEMS.filter((i) => i.theme === 'beach');
    if (activeFilter === 'CULTURE') return ALL_DISCOVERY_ITEMS.filter((i) => i.theme === 'culture');
    return ALL_DISCOVERY_ITEMS;
  }, [activeFilter]);

  return (
    <div className="w-full min-h-screen bg-surface-cream text-on-surface">
      
      {/* ============================================================== */}
      {/* 1. TWO-COLUMN HERO: LEFT HEADLINE + RIGHT CUSTOM PLANNER        */}
      {/* ============================================================== */}
      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 md:px-8 max-w-[1380px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Thoughtfully Crafted Holiday Packages */}
          <div className="lg:col-span-5 space-y-5 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-cream-subtle text-xs font-bold text-secondary uppercase tracking-wider shadow-clay-inset">
              <span className="material-symbols-outlined text-[16px] text-gold-deep">luggage</span>
              <span>Verified Holiday Packages</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-[1.15]">
              Thoughtfully Crafted Holiday Packages
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              From tranquil Kerala backwaters and alpine peaks to sacred temple corridors. All packages include pre-inspected accommodations, private sanitized vehicles, and 24x7 Anand tour support.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-gold-deep shrink-0 shadow-clay-inset">
                  <CheckCircle2 size={16} />
                </div>
                <div className="text-xs">
                  <strong className="text-primary block font-semibold">100% Tailored Private Vehicles</strong>
                  <span className="text-on-surface-variant">Dedicated AC Sedan, Innova Crysta, or Tempo Traveller with courteous English/Hindi speaking chauffeurs.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-clay-inset">
                  <Utensils size={16} />
                </div>
                <div className="text-xs">
                  <strong className="text-primary block font-semibold">CPAI & MAPAI Gujarati Food Assurance</strong>
                  <span className="text-on-surface-variant">Pre-vetted resort dining ensuring pure vegetarian and Jain preparations throughout your travels.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0 shadow-clay-inset">
                  <ShieldCheck size={16} />
                </div>
                <div className="text-xs">
                  <strong className="text-primary block font-semibold">24x7 Anand HQ Ground Assistance</strong>
                  <span className="text-on-surface-variant">Live phone and WhatsApp coordination from start to finish. Zero stranded travelers.</span>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="pt-4 flex flex-wrap items-center gap-3 text-xs">
              <a
                href={COMPANY_CONTACT.whatsapp.buildUrl('Hello Varni Holidays, I want to discuss a customized holiday package')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-slate-950 font-bold hover:bg-[#20ba59] transition-all shadow-md"
              >
                <MessageSquare size={15} />
                <span>Chat with Tour Planner</span>
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

          {/* RIGHT COLUMN: Plan Your Custom Journey (Custom Trip Enquiry Form) */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-[32px] p-5 sm:p-8 shadow-clay-card border border-white/80 space-y-5">
              
              <div className="border-b border-surface-sand-tint pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-deep block">Tailor-Made Tour Desk</span>
                    <h2 className="font-headline text-xl sm:text-2xl font-bold text-primary">
                      Plan Your Custom Journey
                    </h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-cream text-[10px] font-bold text-secondary uppercase shadow-clay-inset">
                    <Sparkles size={12} className="text-gold-deep" />
                    <span>Free Custom Quote</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Tell us your dream holiday parameters. Our senior destination specialist (Harshil Desai) will prepare an itemized route and quote.
                </p>
              </div>

              <form onSubmit={handleCustomHolidaySubmit} className="space-y-4">
                
                {/* 1. Destination & Dates */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Desired Destination(s) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-on-surface-variant pointer-events-none">
                      <Compass size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kerala (Munnar + Alleppey), Kashmir, Rajasthan, Dubai, Bali"
                      value={destinations}
                      onChange={(e) => setDestinations(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Return Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      min={departureDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                    />
                  </div>
                </div>

                {/* 2. Pax Counts */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Adults (12y+) *
                    </label>
                    <select
                      value={adultsCount}
                      onChange={(e) => setAdultsCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((n) => (
                        <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Children (2-11y)
                    </label>
                    <select
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} Child{n > 1 ? 'ren' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Infants (0-2y)
                    </label>
                    <select
                      value={infantsCount}
                      onChange={(e) => setInfantsCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n} Infant{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Meal Plan, Hotel Category, Transfer Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Meal Plan
                    </label>
                    <select
                      value={mealPlan}
                      onChange={(e: any) => setMealPlan(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      <option value="CPAI">CPAI (Breakfast)</option>
                      <option value="MAP">MAP (Breakfast + Dinner)</option>
                      <option value="APAI">APAI (All Meals)</option>
                      <option value="EP">EP (Room Only)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Hotel Category
                    </label>
                    <select
                      value={hotelCategory}
                      onChange={(e: any) => setHotelCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      <option value="FOUR_STAR">4-Star Deluxe</option>
                      <option value="FIVE_STAR">5-Star Luxury</option>
                      <option value="THREE_STAR">3-Star Standard</option>
                      <option value="FLEXIBLE">Flexible / Best Value</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Transfer Type
                    </label>
                    <select
                      value={transferPreference}
                      onChange={(e: any) => setTransferPreference(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-cream text-xs font-semibold text-primary border border-surface-sand-tint focus:outline-none shadow-clay-inset"
                    >
                      <option value="PRIVATE">Private Dedicated Car</option>
                      <option value="SHARING">Sharing / SIC Coach</option>
                      <option value="RECOMMEND">Recommend Best Option</option>
                    </select>
                  </div>
                </div>

                {/* 4. Special Requirements */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    Special Requirements (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Jain Food, Houseboat upgrade, Wheelchair elder, Honeymoon decor"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-surface-cream text-xs font-medium text-primary border border-surface-sand-tint focus:outline-none focus:border-gold-deep transition-all shadow-clay-inset"
                  />
                </div>

                {/* 5. Additional Services Checkboxes */}
                <div className="p-3 bg-surface-cream rounded-2xl border border-surface-sand-tint shadow-clay-inset">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                    Optional Travel Add-ons (One-Window Anand Concierge)
                  </span>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-primary">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needFlights}
                        onChange={(e) => setNeedFlights(e.target.checked)}
                        className="rounded text-primary focus:ring-gold-deep"
                      />
                      <span>✈ Flight Tickets</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needVisa}
                        onChange={(e) => setNeedVisa(e.target.checked)}
                        className="rounded text-primary focus:ring-gold-deep"
                      />
                      <span>🛂 Visa Assistance</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needInsurance}
                        onChange={(e) => setNeedInsurance(e.target.checked)}
                        className="rounded text-primary focus:ring-gold-deep"
                      />
                      <span>🛡 Travel Insurance</span>
                    </label>
                  </div>
                </div>

                {/* 6. Customer Contact Details */}
                <div className="pt-3 border-t border-surface-sand-tint space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chirag Patel"
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
                        placeholder="chirag@gmail.com"
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
                      <span>Transmitting Custom Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <span>Request My Custom Itinerary</span>
                      <ArrowRight size={16} className="text-tertiary-fixed-dim" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. FLAGSHIP KERALA WINTER TOUR FEATURE CARD                     */}
      {/* ============================================================== */}
      <section className="px-4 md:px-8 max-w-[1380px] mx-auto mb-14">
        <div className="bg-surface-container-lowest rounded-[36px] p-6 sm:p-8 shadow-clay-card border border-white/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-clay-card">
              <Image
                src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
                alt="Kerala Houseboat Backwaters"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-gold-deep text-white text-xs font-bold shadow-sm z-10">
                Flagship Winter Tour (1 Oct 2026 – 31 Mar 2027)
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md z-10">
                <span className="text-xs font-semibold">Ex-Cochin • Munnar (2N) + Thekkady (1N) + Alleppey (1N) + Kovalam (2N)</span>
                <span className="text-xs font-bold bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full">
                  6N / 7D
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block">
                  South India Signature Experience
                </span>
                <h3 className="font-headline text-2xl sm:text-3xl font-bold text-primary mt-1">
                  Scenic Kerala & Backwaters Grand Tour
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Traverse misty tea hills in Munnar, encounter Periyar wildlife in Thekkady, relax on serene Alleppey backwaters with authentic CPAI meals, and explore golden sands in Kovalam.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 bg-surface-cream-subtle rounded-xl shadow-clay-inset">
                    <span className="text-[10px] text-on-surface-variant block font-bold">Starting Tariff</span>
                    <span className="font-bold text-primary">₹20,700 / Person</span>
                  </div>
                  <div className="p-2.5 bg-surface-cream-subtle rounded-xl shadow-clay-inset">
                    <span className="text-[10px] text-on-surface-variant block font-bold">Accommodation</span>
                    <span className="font-bold text-primary">5 Tiers (Standard to Luxury)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/packages/kerala-6n7d-winter"
                  className="flex-1 py-3 rounded-full bg-primary text-white text-xs font-bold clay-pill-button flex items-center justify-center gap-2 text-center"
                >
                  <span>View Full Itinerary & Pricing</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenPackageModal({
                      id: 'kerala-signature',
                      slug: 'kerala-6n7d-winter',
                      title: 'Scenic Kerala & Backwaters Grand Tour',
                      destination: 'Kerala, India',
                      category: 'domestic',
                      theme: 'popular',
                      duration: '6N / 7D',
                      price: '₹20,700 / Person',
                      highlights: ['Munnar', 'Thekkady', 'Alleppey Houseboat', 'Kovalam'],
                      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
                    })
                  }
                  className="py-3 px-6 rounded-full bg-gold-deep hover:bg-gold-deep/90 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Request Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. MERGED DESTINATION DISCOVERY & FILTERING SECTION             */}
      {/* ============================================================== */}
      <section className="py-10 px-4 md:px-8 max-w-[1380px] mx-auto border-t border-surface-sand-tint">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-cream-subtle text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
              <Compass size={13} className="text-gold-deep" />
              <span>Explore All Destinations & Tours</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
              Curated Holidays & Popular Destinations
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-xl">
              Browse our complete catalog of pre-planned domestic tours and international gateways with transparent starting rates and verified inclusions.
            </p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {(
              [
                { label: 'All Itineraries', key: 'ALL' },
                { label: 'Domestic India', key: 'DOMESTIC' },
                { label: 'International', key: 'INTERNATIONAL' },
                { label: 'Hill Escapes', key: 'HILLS' },
                { label: 'Beaches & Islands', key: 'BEACH' },
                { label: 'Heritage & Pilgrimage', key: 'CULTURE' },
              ] as const
            ).map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-clay-button'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-cream-subtle border border-surface-sand-tint'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Discovery Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-[32px] overflow-hidden shadow-clay-card border border-white/80 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Image & Top Badges */}
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {item.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gold-deep text-white text-[10px] font-bold tracking-wide shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-[10px] font-bold text-primary shadow-sm">
                    {item.duration}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1">
                      <MapPin size={12} className="text-amber-400 shrink-0" />
                      {item.destination}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-3">
                  <h3 className="font-headline text-lg font-bold text-primary leading-snug">
                    {item.title}
                  </h3>

                  {/* Highlights */}
                  <div className="space-y-1 text-xs text-on-surface-variant">
                    {item.highlights.slice(0, 3).map((h, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 size={12} className="text-secondary shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-primary block">
                      {item.price}
                    </span>
                    {item.priceSubtext && (
                      <span className="text-[10px] text-on-surface-variant block">
                        {item.priceSubtext}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2">
                {item.slug === 'kerala-6n7d-winter' ? (
                  <Link
                    href={`/packages/${item.slug}`}
                    className="flex-1 py-2.5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary-container transition-colors text-center"
                  >
                    <span>View Itinerary</span>
                    <ArrowRight size={13} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPackageModal(item)}
                    className="flex-1 py-2.5 rounded-full bg-surface-cream-subtle text-primary text-xs font-bold clay-pill-secondary flex items-center justify-center gap-1 hover:bg-surface-container transition-colors"
                  >
                    <span>Request Itinerary</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                <a
                  href={COMPANY_CONTACT.whatsapp.buildUrl(`Hello Varni Holidays, I am interested in ${item.title}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#25D366] text-slate-950 flex items-center justify-center hover:bg-[#20ba59] transition-colors shrink-0 shadow-sm"
                  title="Inquire via WhatsApp"
                >
                  <MessageSquare size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Modal */}
      <EnquirySuccessModal
        isOpen={Boolean(successReference)}
        onClose={() => setSuccessReference('')}
        referenceId={successReference}
        customerName={fullName}
        serviceType="Custom Holiday"
      />

      {/* Package Enquiry Modal */}
      <PackageEnquiryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPackage(null);
        }}
        packageInfo={selectedPackage}
      />
    </div>
  );
}
