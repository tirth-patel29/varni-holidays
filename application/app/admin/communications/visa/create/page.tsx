'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
import { createVisaApplicationAction, searchCustomersForVisaAction, sendVisaEmailAction } from '@/app/actions/visa';
import { VISA_COUNTRIES, VISA_CATEGORIES } from '@/lib/config/visa-options';
import { DEFAULT_USERS } from '@/lib/auth/session';
import {
  FileText,
  User,
  MapPin,
  Calendar,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  RotateCw,
} from 'lucide-react';

export default function CreateVisaApplicationPage() {
  const router = useRouter();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('Canada');
  const [visaType, setVisaType] = useState('Tourist / Visitor Visa (10-Year Multiple Entry)');
  const [visaCategory, setVisaCategory] = useState('TOURIST');
  const [applicantCount, setApplicantCount] = useState(1);
  const [travelPlannedDate, setTravelPlannedDate] = useState('');
  const [stayDurationDays, setStayDurationDays] = useState(15);
  const [officialReferenceNo, setOfficialReferenceNo] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('usr-ananya-joshi-visa');
  const [internalNotes, setInternalNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [sendInquiryEmail, setSendInquiryEmail] = useState(true);

  // Customer Search Autocomplete State
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Submitting State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCustomerSearch = async (val: string) => {
    setCustomerSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await searchCustomersForVisaAction(val);
      if (res.success) {
        setSearchResults(res.customers || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCustomer = (c: any) => {
    setSelectedCustomerId(c.id);
    setCustomerName(c.fullName);
    setCustomerEmail(c.email || '');
    setCustomerPhone(c.phone || '');
    setSearchResults([]);
    setCustomerSearchQuery('');
  };

  const handleCountryChange = (countryName: string) => {
    setDestinationCountry(countryName);
    const countryObj = VISA_COUNTRIES.find((c) => c.country === countryName);
    if (countryObj && countryObj.subtypes && countryObj.subtypes.length > 0) {
      setVisaType(countryObj.subtypes[0].label);
      setVisaCategory(countryObj.subtypes[0].defaultCategory);
    }
  };

  const currentCountryConfig = VISA_COUNTRIES.find((c) => c.country === destinationCountry);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide applicant full name and contact number.');
      return;
    }

    setLoading(true);
    try {
      const res = await createVisaApplicationAction(
        {
          customerId: selectedCustomerId || undefined,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || undefined,
          customerPhone: customerPhone.trim(),
          destinationCountry,
          visaType,
          visaCategory,
          applicantCount: Number(applicantCount),
          travelPlannedDate: travelPlannedDate || undefined,
          stayDurationDays: stayDurationDays ? Number(stayDurationDays) : undefined,
          officialReferenceNo: officialReferenceNo.trim() || undefined,
          assignedUserId,
          internalNotes: internalNotes.trim() || undefined,
          specialInstructions: specialInstructions.trim() || undefined,
        },
        assignedUserId
      );

      if (!res.success || !res.application) {
        setErrorMessage(res.error || 'Failed to register visa inquiry.');
        setLoading(false);
        return;
      }

      const createdApp = res.application;

      // Automatically dispatch Email 1 if checked and email is provided
      if (sendInquiryEmail && customerEmail.trim()) {
        try {
          await sendVisaEmailAction({
            applicationId: createdApp.id,
            templateCode: 'INQUIRY_RECEIVED',
            recipientEmail: customerEmail.trim(),
            subject: 'Your Visa Assistance Journey Has Started – Varni Holidays',
            actorId: assignedUserId,
          });
        } catch (emailErr) {
          console.warn('Inquiry confirmation email dispatch notice:', emailErr);
        }
      }

      router.push(`/admin/communications/visa/${createdApp.id}`);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-5xl mx-auto w-full">
        <Breadcrumbs
          items={[
            { label: 'Communications', href: '/admin/communications' },
            { label: 'Visa Management', href: '/admin/communications/visa' },
            { label: 'Register Visa Inquiry' },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#E9B95E] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                New Application Dossier
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650]">
              Register Visa Inquiry
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Create an official visa file, assign dedicated consular counselor, and initiate customer communication.
            </p>
          </div>

          <Link
            href="/admin/communications/visa"
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#153650] border border-[#E5E8ED] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-[#FEF2F2] border border-[#FCDAD7] text-[#D54747] text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Customer & Applicant Information */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 rounded-none shadow-xs space-y-4">
            <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={15} className="text-[#24689B]" />
                <h2 className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                  1. Applicant & Customer Contact
                </h2>
              </div>
              <span className="text-[11px] text-[#718096]">
                Syncs with unified CRM customer profile
              </span>
            </div>

            {/* Quick Customer Search Autocomplete */}
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                Search Existing Customer (Optional)
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                <input
                  type="text"
                  placeholder="Type name, phone, or email to auto-fill..."
                  value={customerSearchQuery}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-[#FFFFFF] border border-[#E5E8ED] shadow-md max-h-48 overflow-y-auto crm-scrollbar">
                  {searchResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c)}
                      className="w-full text-left p-2.5 hover:bg-[#F8FAFC] border-b border-[#F1F3F5] text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#153650]">{c.fullName}</div>
                        <div className="text-[11px] text-[#718096]">{c.phone} • {c.email || 'No email'}</div>
                      </div>
                      <span className="text-[10px] text-[#24689B] font-bold">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Primary Applicant Full Name <span className="text-[#D54747]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshchandra Patel"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-semibold rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Mobile Number (WhatsApp) <span className="text-[#D54747]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98250 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-mono rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Email Address (For Official Updates)
                </label>
                <input
                  type="email"
                  placeholder="e.g. applicant@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Visa Requirements & Travel Details */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 rounded-none shadow-xs space-y-4">
            <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#E9B95E]" />
                <h2 className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                  2. Destination & Consular Category
                </h2>
              </div>
              <span className="text-[11px] text-[#718096]">
                Select destination consulate guidelines
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Destination Country <span className="text-[#D54747]">*</span>
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-bold rounded-none focus:outline-none focus:border-[#24689B]"
                >
                  {VISA_COUNTRIES.map((c) => (
                    <option key={c.country} value={c.country}>
                      {c.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Visa Category <span className="text-[#D54747]">*</span>
                </label>
                <select
                  value={visaCategory}
                  onChange={(e) => setVisaCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-semibold rounded-none focus:outline-none focus:border-[#24689B]"
                >
                  {VISA_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Specific Visa Product / Type <span className="text-[#D54747]">*</span>
                </label>
                {currentCountryConfig && currentCountryConfig.subtypes && currentCountryConfig.subtypes.length > 0 ? (
                  <select
                    value={visaType}
                    onChange={(e) => setVisaType(e.target.value)}
                    className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  >
                    {currentCountryConfig.subtypes.map((opt) => (
                      <option key={opt.code} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={visaType}
                    onChange={(e) => setVisaType(e.target.value)}
                    className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Number of Applicants
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={applicantCount}
                  onChange={(e) => setApplicantCount(parseInt(e.target.value) || 1)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-mono rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Intended Travel Date
                </label>
                <input
                  type="date"
                  value={travelPlannedDate}
                  onChange={(e) => setTravelPlannedDate(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-mono rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Intended Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={stayDurationDays}
                  onChange={(e) => setStayDurationDays(parseInt(e.target.value) || 15)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-mono rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operations & Assignment */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 rounded-none shadow-xs space-y-4">
            <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-[#168653]" />
                <h2 className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                  3. Assignment & Operational Notes
                </h2>
              </div>
              <span className="text-[11px] text-[#718096]">
                Internal staff assignment
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Assigned Visa Counselor
                </label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-semibold rounded-none focus:outline-none focus:border-[#24689B]"
                >
                  {DEFAULT_USERS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Official Portal / VFS Reference (If Known)
                </label>
                <input
                  type="text"
                  placeholder="e.g. VFS-CAN-2026-9812 / IRCC App #"
                  value={officialReferenceNo}
                  onChange={(e) => setOfficialReferenceNo(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-mono rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                Internal Counselor Notes & Checklist Instructions
              </label>
              <textarea
                rows={3}
                placeholder="Mention customer requirements, prior travel history, sponsors, or specific consular guidance..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full p-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
              />
            </div>

            {/* Email 1 Auto-Dispatch Trigger */}
            <div className="pt-2 border-t border-[#E5E8ED]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendInquiryEmail}
                  onChange={(e) => setSendInquiryEmail(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-none border-[#CBD5E1] text-[#153650] focus:ring-[#24689B]"
                />
                <div>
                  <span className="text-xs font-bold text-[#153650] block">
                    Automatically dispatch Email 1 (Inquiry Received) upon registration
                  </span>
                  <span className="text-[11px] text-[#718096] block">
                    Sends official confirmation with reference ID, assigned officer contact, and document checklist roadmap via Resend.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/admin/communications/visa"
              className="text-xs font-bold text-[#718096] hover:text-[#153650]"
            >
              Cancel and Return
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              {loading ? (
                <>
                  <RotateCw size={13} className="animate-spin text-[#E9B95E]" />
                  <span>Registering Dossier...</span>
                </>
              ) : (
                <>
                  <Check size={14} className="text-[#E9B95E]" />
                  <span>Register Application Dossier</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
