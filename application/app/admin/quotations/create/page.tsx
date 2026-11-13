'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import { useCrm } from '@/components/crm/CrmContext';
import {
  createQuotationAction,
  searchCrmCustomersAndLeadsAction,
  getPackageCatalogueAction,
  getHotelCatalogueAction,
} from '@/app/actions/quotations';
import { calculateQuotationPricing, QuotationPricingInput } from '@/lib/quotations/pricing';
import {
  Compass,
  Building2,
  Users,
  Search,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag,
  CreditCard,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

export default function CreateQuotationPage() {
  const router = useRouter();
  const { currentUser } = useCrm();

  // Step 1: Quotation Type
  const [quotationType, setQuotationType] = useState<'PACKAGE' | 'HOTEL'>('PACKAGE');

  // Step 2: CRM & Customer Link
  const [customerMode, setCustomerMode] = useState<'ENQUIRY' | 'EXISTING_CUSTOMER' | 'MANUAL'>('ENQUIRY');
  const [crmSearch, setCrmSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ customers: any[]; leads: any[] }>({ customers: [], leads: [] });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('');

  // Step 3: Catalogues
  const [packages, setPackages] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedPackageSlug, setSelectedPackageSlug] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState('');

  // Proposal Meta
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [durationNights, setDurationNights] = useState<number>(6);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [travelStartDate, setTravelStartDate] = useState('');
  const [travelEndDate, setTravelEndDate] = useState('');
  const [hotelCategory, setHotelCategory] = useState('Deluxe (3-Star Premium)');
  const [mealPlan, setMealPlan] = useState('CPAI (Breakfast Included)');
  const [transportType, setTransportType] = useState('AC Sedan (Etios / Dzire)');

  // Itinerary (for Package)
  const [itineraryDays, setItineraryDays] = useState<
    Array<{ dayNumber: number; title: string; description: string; meals: string; stayDestination: string }>
  >([]);

  // Hotel Details (for Hotel)
  const [hotelName, setHotelName] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [roomType, setRoomType] = useState('');
  const [hotelMealPlan, setHotelMealPlan] = useState('CP');
  const [checkInTime, setCheckInTime] = useState('02:00 PM');
  const [checkOutTime, setCheckOutTime] = useState('11:00 AM');
  const [hotelPerks, setHotelPerks] = useState<string[]>([]);

  // Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  // Step 4: Editable Pricing Engine
  const [basePrice, setBasePrice] = useState<number>(24500);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [transportCharges, setTransportCharges] = useState<number>(0);
  const [extraCharges, setExtraCharges] = useState<number>(0);
  const [additionalServices, setAdditionalServices] = useState<
    Array<{ id: string; title: string; quantity: number; unitPriceInr: number }>
  >([]);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(5);

  // Terms & Validity
  const [terms, setTerms] = useState(
    '1. 25% booking advance required to confirm reservation.\n2. 50% payable upon voucher issuance.\n3. Balance 25% payable 7 days prior to travel.\n4. Standard airline and hotel cancellation terms apply.\n5. Quotation valid for 7 days from issue date.'
  );
  const [customerNotes, setCustomerNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Catalogues on Mount
  useEffect(() => {
    async function loadCatalogues() {
      const [pkgRes, hotelRes] = await Promise.all([
        getPackageCatalogueAction(),
        getHotelCatalogueAction(),
      ]);
      if (pkgRes.success) setPackages(pkgRes.packages || []);
      if (hotelRes.success) setHotels(hotelRes.hotels || []);
    }
    loadCatalogues();
  }, []);

  // Real-time Pricing Preview
  const pricingPreview = calculateQuotationPricing({
    basePriceInr: basePrice,
    adultsCount,
    childrenCount,
    roomsCount,
    transportChargesInr: transportCharges,
    additionalServices,
    extraChargesInr: extraCharges,
    discountType,
    discountValue,
    taxPercent,
  });

  // Handle CRM Search
  useEffect(() => {
    if (!crmSearch.trim()) {
      setSearchResults({ customers: [], leads: [] });
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchCrmCustomersAndLeadsAction(crmSearch);
      if (res.success) {
        setSearchResults({ customers: res.customers, leads: res.leads });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [crmSearch]);

  // Handle selecting a Lead from CRM
  const handleSelectLead = (lead: any) => {
    setSelectedLeadId(lead.id);
    setSelectedCustomerId(null);
    setCustomerName(lead.customerName || '');
    setCustomerPhone(lead.customerPhone || '');
    setCustomerEmail(lead.customerEmail || '');

    // Auto-populate from lead details if available
    if (lead.packageDetail) {
      const p = lead.packageDetail;
      if (p.packageName) setTitle(p.packageName);
      if (p.packageSlug) {
        handleSelectPackage(p.packageSlug);
      }
      if (p.adultsCount) setAdultsCount(p.adultsCount);
      if (p.childrenWithBedCount || p.childrenNoBedCount) {
        setChildrenCount((p.childrenWithBedCount || 0) + (p.childrenNoBedCount || 0));
      }
      if (p.roomsCount) setRoomsCount(p.roomsCount);
      if (p.preferredTravelDate) setTravelStartDate(p.preferredTravelDate.slice(0, 10));
    }
    setCrmSearch('');
  };

  // Handle selecting a Customer from CRM
  const handleSelectCustomer = (cust: any) => {
    setSelectedCustomerId(cust.id);
    setSelectedLeadId(null);
    setCustomerName(cust.fullName || '');
    setCustomerPhone(cust.phoneNumber || '');
    setCustomerEmail(cust.email || '');
    setCustomerCity(cust.city || '');
    setCrmSearch('');
  };

  // Handle Selecting a Tour Package from Catalogue
  const handleSelectPackage = (slug: string) => {
    setSelectedPackageSlug(slug);
    if (!slug) return;
    const pkg = packages.find((p) => p.slug === slug || p.id === slug);
    if (pkg) {
      setTitle(pkg.title);
      setDestination(pkg.destination);
      setDurationNights(pkg.durationNights);
      setDurationDays(pkg.durationDays);
      setBasePrice(pkg.defaultPriceInr);
      setInclusions([...pkg.inclusions]);
      setExclusions([...pkg.exclusions]);
      setItineraryDays(
        pkg.itineraryDays.map((d: any) => ({
          dayNumber: d.dayNumber,
          title: d.title,
          description: d.description,
          meals: d.meals,
          stayDestination: d.stayDestination,
        }))
      );
      setTaxPercent(5); // 5% GST standard for tour packages
    }
  };

  // Handle Selecting a Hotel from Catalogue
  const handleSelectHotel = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    if (!hotelId) return;
    const h = hotels.find((item) => item.id === hotelId);
    if (h) {
      setTitle(`${h.name} Luxury Stay Proposal`);
      setDestination(h.location);
      setHotelName(h.name);
      setHotelLocation(h.location);
      setHotelPerks([...h.perks]);
      setCheckInTime(h.checkInTime);
      setCheckOutTime(h.checkOutTime);
      if (h.roomTypes && h.roomTypes.length > 0) {
        setRoomType(h.roomTypes[0].name);
        setBasePrice(h.roomTypes[0].basePricePerNightInr);
      }
      setInclusions([
        `Accommodation in ${h.roomTypes?.[0]?.name || 'Standard Room'}`,
        'Daily breakfast (Continental Plan)',
        ...h.perks,
      ]);
      setExclusions([
        'Airfare / train transfers to hotel',
        'Personal laundry, beverages, and tips',
        '18% GST applicable on standalone hotel accommodation',
      ]);
      setTaxPercent(18); // 18% GST standard for standalone hotels
    }
  };

  // Itinerary Manipulation
  const handleAddItineraryDay = () => {
    const nextNum = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextNum,
        title: `Day ${nextNum}: Local Sightseeing & Leisure`,
        description: 'Guided sightseeing and leisurely local discoveries.',
        meals: 'Breakfast at hotel',
        stayDestination: destination || 'Hotel',
      },
    ]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    const updated = itineraryDays.filter((_, i) => i !== index);
    // Renumber days
    const renumbered = updated.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setItineraryDays(renumbered);
  };

  // Additional Services
  const handleAddService = () => {
    setAdditionalServices([
      ...additionalServices,
      {
        id: `srv-${Date.now()}`,
        title: 'Airport Private Transfer / Houseboat Upgrade',
        quantity: 1,
        unitPriceInr: 2500,
      },
    ]);
  };

  const handleRemoveService = (id: string) => {
    setAdditionalServices(additionalServices.filter((s) => s.id !== id));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Customer / Guest name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Customer mobile number is required.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Proposal Title is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        quotationType,
        leadId: selectedLeadId || undefined,
        customerId: selectedCustomerId || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        city: customerCity.trim(),
        actorId: currentUser.id,

        title: title.trim(),
        destination: destination.trim(),
        durationNights,
        durationDays,
        travelStartDate: travelStartDate || undefined,
        travelEndDate: travelEndDate || undefined,
        adultsCount,
        childrenCount,
        roomsCount,
        hotelCategory,
        mealPlan,
        transportType,
        sourcePackageSlug: selectedPackageSlug || undefined,
        sourceHotelId: selectedHotelId || undefined,

        pricing: {
          basePriceInr: basePrice,
          adultsCount,
          childrenCount,
          roomsCount,
          transportChargesInr: transportCharges,
          additionalServices,
          extraChargesInr: extraCharges,
          discountType,
          discountValue,
          taxPercent,
        },

        inclusions,
        exclusions,
        itineraryDays: quotationType === 'PACKAGE' ? itineraryDays : undefined,
        hotelDetails:
          quotationType === 'HOTEL'
            ? {
                hotelName,
                location: hotelLocation,
                roomType,
                mealPlan: hotelMealPlan,
                checkInTime,
                checkOutTime,
                perks: hotelPerks,
              }
            : undefined,
        terms,
        internalNotes,
        customerNotes,
        validUntil,
      };

      const res = await createQuotationAction(payload);
      if (res.success && res.quotation) {
        router.push(`/admin/quotations/${res.quotation.id}`);
      } else {
        setErrorMsg(res.error || 'Failed to create quotation');
      }
    } catch (err: any) {
      console.error('Error creating quotation:', err);
      setErrorMsg(err.message || 'Server error creating proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Create New Quotation"
        subtitle="Generate itemized travel proposals with editable pricing, automated catalogue fetching, and verifiable PDF exports"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Quotations', href: '/admin/quotations' },
          { label: 'Create Quotation' },
        ]}
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 max-w-6xl mx-auto w-full">
        {errorMsg && (
          <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCDAD7] text-[#D54747] text-xs font-semibold rounded-none flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========================================= */}
          {/* STEP 1: SELECT QUOTATION TYPE */}
          {/* ========================================= */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block mb-2">
              STEP 1 • QUOTATION TYPE
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => {
                  setQuotationType('PACKAGE');
                  if (packages.length > 0 && !selectedPackageSlug) {
                    handleSelectPackage(packages[0].slug);
                  }
                }}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-3.5 ${
                  quotationType === 'PACKAGE'
                    ? 'border-[#002037] bg-[#F0F5FA] ring-1 ring-[#002037]'
                    : 'border-[#E5E8ED] bg-[#FFFFFF] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="p-2 bg-[#002037] text-white">
                  <Compass size={20} className="text-[#E9B95E]" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#153650] block">Tour Package Quotation</span>
                  <p className="text-xs text-[#718096] mt-0.5">
                    Multi-day itineraries, sightseeing transfers, hotel tiers, inclusions & exclusions.
                  </p>
                </div>
              </label>

              <label
                onClick={() => {
                  setQuotationType('HOTEL');
                  if (hotels.length > 0 && !selectedHotelId) {
                    handleSelectHotel(hotels[0].id);
                  }
                }}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-3.5 ${
                  quotationType === 'HOTEL'
                    ? 'border-[#002037] bg-[#F0F5FA] ring-1 ring-[#002037]'
                    : 'border-[#E5E8ED] bg-[#FFFFFF] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="p-2 bg-[#B45309] text-white">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#153650] block">Hotel Stay Quotation</span>
                  <p className="text-xs text-[#718096] mt-0.5">
                    Resort & hotel stays, room categories, meal plans (EP/CP/MAP/AP), and confirmed perks.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ========================================= */}
          {/* STEP 2: CUSTOMER & CRM INTEGRATION */}
          {/* ========================================= */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-4">
            <div className="border-b border-[#E5E8ED] pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block">
                  STEP 2 • CUSTOMER & CRM INTEGRATION
                </span>
                <h3 className="text-sm font-bold text-[#153650]">Client Identification</h3>
              </div>
              <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 border border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={() => setCustomerMode('ENQUIRY')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-none ${
                    customerMode === 'ENQUIRY' ? 'bg-[#153650] text-white' : 'text-[#718096] hover:text-[#153650]'
                  }`}
                >
                  From Enquiry
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('EXISTING_CUSTOMER')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-none ${
                    customerMode === 'EXISTING_CUSTOMER' ? 'bg-[#153650] text-white' : 'text-[#718096] hover:text-[#153650]'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('MANUAL');
                    setSelectedLeadId(null);
                    setSelectedCustomerId(null);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-none ${
                    customerMode === 'MANUAL' ? 'bg-[#153650] text-white' : 'text-[#718096] hover:text-[#153650]'
                  }`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            {/* CRM Search Autocomplete */}
            {customerMode !== 'MANUAL' && (
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  {customerMode === 'ENQUIRY' ? 'Search CRM Enquiries (Ref / Customer Name)' : 'Search Customer Directory'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={crmSearch}
                    onChange={(e) => setCrmSearch(e.target.value)}
                    placeholder="Type to search existing leads or customers..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] focus:bg-white"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                </div>

                {/* Dropdown Results */}
                {crmSearch.trim() && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#CBD5E1] shadow-lg max-h-48 overflow-y-auto">
                    {customerMode === 'ENQUIRY' &&
                      searchResults.leads.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => handleSelectLead(l)}
                          className="w-full px-3 py-2 text-left hover:bg-[#F0F5FA] border-b border-[#F1F5F9] text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-bold text-[#153650]">{l.referenceId}</span>
                            <span className="text-[#4A5568] ml-2 font-medium">{l.customerName}</span>
                          </div>
                          <span className="text-[10px] text-[#718096] font-mono">{l.customerPhone}</span>
                        </button>
                      ))}

                    {customerMode === 'EXISTING_CUSTOMER' &&
                      searchResults.customers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full px-3 py-2 text-left hover:bg-[#F0F5FA] border-b border-[#F1F5F9] text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-[#153650]">{c.fullName}</span>
                            <span className="text-[#718096] ml-2 text-[11px]">{c.city || 'Gujarat'}</span>
                          </div>
                          <span className="text-[10px] text-[#718096] font-mono">{c.phoneNumber}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Customer Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] focus:bg-white"
                  placeholder="e.g. Chirag Patel"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono rounded-none focus:outline-none focus:border-[#24689B] focus:bg-white"
                  placeholder="+91 98250 12345"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] focus:bg-white"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] focus:bg-white"
                  placeholder="Anand, Gujarat"
                />
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* STEP 3: TOUR PACKAGE OR HOTEL SELECTION */}
          {/* ========================================= */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-4">
            <div className="border-b border-[#E5E8ED] pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block">
                  STEP 3 • {quotationType === 'PACKAGE' ? 'TOUR PACKAGE' : 'HOTEL STAY'} SPECIFICATIONS
                </span>
                <h3 className="text-sm font-bold text-[#153650]">
                  {quotationType === 'PACKAGE' ? 'Itinerary & Destination Details' : 'Hotel & Room Configurations'}
                </h3>
              </div>

              {/* Catalogue Dropdown */}
              <div className="w-64">
                {quotationType === 'PACKAGE' ? (
                  <select
                    value={selectedPackageSlug}
                    onChange={(e) => handleSelectPackage(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#153650] font-semibold rounded-none"
                  >
                    <option value="">-- Choose Catalogue Package --</option>
                    {packages.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedHotelId}
                    onChange={(e) => handleSelectHotel(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#153650] font-semibold rounded-none"
                  >
                    <option value="">-- Choose Catalogue Hotel --</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* General Meta Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-semibold rounded-none focus:outline-none focus:border-[#24689B] focus:bg-white"
                  placeholder="e.g. Scenic Kerala & Backwaters Grand Tour"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Destination / Region
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B] focus:bg-white"
                  placeholder="e.g. Munnar, Thekkady, Alleppey"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Travel Start Date
                </label>
                <input
                  type="date"
                  value={travelStartDate}
                  onChange={(e) => setTravelStartDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Travel End Date
                </label>
                <input
                  type="date"
                  value={travelEndDate}
                  onChange={(e) => setTravelEndDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                />
              </div>

              {quotationType === 'PACKAGE' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                      Nights
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={durationNights}
                      onChange={(e) => setDurationNights(Number(e.target.value))}
                      className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                      Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono rounded-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                    Room Category
                  </label>
                  <input
                    type="text"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none"
                    placeholder="e.g. Heritage Lake View Villa"
                  />
                </div>
              )}
            </div>

            {/* Package Itinerary Editor */}
            {quotationType === 'PACKAGE' && (
              <div className="mt-4 pt-3 border-t border-[#E5E8ED]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#153650]">Day-by-Day Tour Itinerary ({itineraryDays.length} Days)</span>
                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="px-2.5 py-1 bg-[#F4F6F9] hover:bg-[#E5E8ED] border border-[#CBD5E1] text-xs font-semibold text-[#153650] inline-flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Day
                  </button>
                </div>

                <div className="space-y-3">
                  {itineraryDays.map((day, idx) => (
                    <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-xs font-bold text-[#002037] shrink-0">Day {day.dayNumber}</span>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const updated = [...itineraryDays];
                            updated[idx].title = e.target.value;
                            setItineraryDays(updated);
                          }}
                          className="flex-1 h-7 px-2 text-xs font-semibold bg-white border border-[#CBD5E1]"
                          placeholder="Day Title (e.g. Arrival in Cochin & Transfer to Munnar)"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItineraryDay(idx)}
                          className="text-[#D54747] hover:opacity-75 p-1"
                          title="Remove Day"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={day.description}
                        onChange={(e) => {
                          const updated = [...itineraryDays];
                          updated[idx].description = e.target.value;
                          setItineraryDays(updated);
                        }}
                        className="w-full p-2 text-xs bg-white border border-[#CBD5E1]"
                        placeholder="Sightseeing highlights and details..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================= */}
          {/* STEP 4: EDITABLE PRICING ENGINE */}
          {/* ========================================= */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-4">
            <div className="border-b border-[#E5E8ED] pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block">
                STEP 4 • EDITABLE PRICING ENGINE
              </span>
              <h3 className="text-sm font-bold text-[#153650]">Live Financial Breakdown & GST Configuration</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Base Package / Room Price (INR) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#153650] font-mono font-bold rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Adults Count
                </label>
                <input
                  type="number"
                  min={1}
                  value={adultsCount}
                  onChange={(e) => setAdultsCount(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Children Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Rooms Count
                </label>
                <input
                  type="number"
                  min={1}
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Transportation / Transfers (INR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={transportCharges}
                  onChange={(e) => setTransportCharges(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Peak / Extra Surcharge (INR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={extraCharges}
                  onChange={(e) => setExtraCharges(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Discount Type & Value
                </label>
                <div className="flex items-center gap-1">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="h-9 px-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-semibold"
                  >
                    <option value="FIXED">₹ (Fixed)</option>
                    <option value="PERCENTAGE">% (Pct)</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full h-9 px-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  GST Rate Configuration
                </label>
                <select
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-full h-9 px-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#153650] font-semibold"
                >
                  <option value={5}>5% GST (Tour Package)</option>
                  <option value={18}>18% GST (Hotel / Standard Service)</option>
                  <option value={0}>0% GST (Exempt / SEZ)</option>
                  <option value={12}>12% GST (Custom Rate)</option>
                </select>
              </div>
            </div>

            {/* Additional Services Table */}
            <div className="pt-3 border-t border-[#E5E8ED]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#153650]">Additional Services & Upgrades</span>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-2.5 py-1 bg-[#F4F6F9] hover:bg-[#E5E8ED] border border-[#CBD5E1] text-xs font-semibold text-[#153650] inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              {additionalServices.map((srv, idx) => (
                <div key={srv.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={srv.title}
                    onChange={(e) => {
                      const updated = [...additionalServices];
                      updated[idx].title = e.target.value;
                      setAdditionalServices(updated);
                    }}
                    className="flex-1 h-8 px-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1]"
                    placeholder="Service title (e.g. Candlelight Dinner)"
                  />
                  <input
                    type="number"
                    min={1}
                    value={srv.quantity}
                    onChange={(e) => {
                      const updated = [...additionalServices];
                      updated[idx].quantity = Number(e.target.value);
                      setAdditionalServices(updated);
                    }}
                    className="w-16 h-8 px-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] font-mono text-center"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    min={0}
                    value={srv.unitPriceInr}
                    onChange={(e) => {
                      const updated = [...additionalServices];
                      updated[idx].unitPriceInr = Number(e.target.value);
                      setAdditionalServices(updated);
                    }}
                    className="w-28 h-8 px-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] font-mono text-right"
                    placeholder="Rate"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveService(srv.id)}
                    className="text-[#D54747] p-1.5"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* REAL-TIME CALCULATION SUMMARY CARD */}
            <div className="p-4 bg-[#F0F5FA] border border-[#BFDBFE] mt-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#24689B] block mb-2">
                CALCULATION VERIFICATION (INR)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#718096] block">Gross Subtotal:</span>
                  <span className="font-mono font-bold text-[#153650]">
                    ₹{pricingPreview.grossSubtotalInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[#718096] block">Discount:</span>
                  <span className="font-mono font-bold text-[#D54747]">
                    - ₹{pricingPreview.discountAmountInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[#718096] block">GST ({taxPercent}%):</span>
                  <span className="font-mono font-bold text-[#153650]">
                    + ₹{pricingPreview.taxAmountInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[#718096] block">Total Payable:</span>
                  <span className="font-mono font-extrabold text-[#168653] text-base">
                    ₹{pricingPreview.totalPayableAmountInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* STEP 5: TERMS & INCLUSIONS */}
          {/* ========================================= */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-4">
            <div className="border-b border-[#E5E8ED] pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block">
                STEP 5 • TERMS, VALIDITY & REMARKS
              </span>
              <h3 className="text-sm font-bold text-[#153650]">Policy and Notes</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={4}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Quotation Validity Date
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none mb-3"
                />

                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Internal Notes (Confidential)
                </label>
                <input
                  type="text"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none"
                  placeholder="e.g. Rate negotiated with Las Palms Resort Munnar"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E8ED]">
            <Link
              href="/admin/quotations"
              className="px-4 py-2 border border-[#CBD5E1] text-xs font-semibold text-[#718096] hover:text-[#153650] hover:bg-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#002037] hover:bg-[#153650] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Quotation...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} className="text-[#E9B95E]" />
                  <span>Create Quotation & View Dossier</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

