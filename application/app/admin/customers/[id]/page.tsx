'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getCustomer360Action, updateCustomerPreferencesAction } from '@/app/actions/crm-unified';
import { sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  MessageSquare,
  FileText,
  BookmarkCheck,
  Send,
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  Compass,
  Plane,
  Stamp,
  Shield,
  ExternalLink,
  User,
  Plus,
  StickyNote,
  Download,
  Edit2,
  Save,
  RotateCw,
  Sliders,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export default function AdminCustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCrm();
  const customerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'PREFERENCES' | 'FLIGHT_HOLDS' | 'ENQUIRIES' | 'BOOKINGS' | 'TIMELINE' | 'NOTES'
  >('OVERVIEW');

  // Edit Preferences State
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [prefFormData, setPrefFormData] = useState({
    preferredChannel: 'WHATSAPP',
    preferredAirlines: '',
    preferredDestinations: '',
    preferredCabinClass: 'Economy',
    preferredSeat: 'Window',
    mealPreference: 'Vegetarian',
    budgetRange: '₹50,000 - ₹1,50,000',
    specialAssistance: '',
    internalRemarks: '',
  });

  // Notes state
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');

  // Quick message modal
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgChannel, setMsgChannel] = useState<'EMAIL' | 'WHATSAPP'>('WHATSAPP');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgStatus, setMsgStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomer360Action(customerId);
      if (!res.success || !res.data) {
        setError(res.error || 'Customer dossier not found');
        return;
      }
      setProfileData(res.data);
      const cust = res.data.customer;
      setPrefFormData({
        preferredChannel: cust.preferredChannel || 'WHATSAPP',
        preferredAirlines: Array.isArray(cust.preferredAirlines)
          ? cust.preferredAirlines.join(', ')
          : cust.preferredAirlines || '',
        preferredDestinations: Array.isArray(cust.preferredDestinations)
          ? cust.preferredDestinations.join(', ')
          : cust.preferredDestinations || '',
        preferredCabinClass: cust.preferredCabinClass || 'Economy',
        preferredSeat: cust.preferredSeat || 'Window',
        mealPreference: cust.mealPreference || 'Vegetarian',
        budgetRange: cust.budgetRange || '₹50,000 - ₹1,50,000',
        specialAssistance: cust.specialAssistance || '',
        internalRemarks: cust.internalRemarks || '',
      });
    } catch (err: any) {
      console.error('Failed to load customer profile:', err);
      setError(err.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) loadData();
  }, [customerId]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPreferences(true);
    try {
      const res = await updateCustomerPreferencesAction(customerId, {
        preferredChannel: prefFormData.preferredChannel,
        preferredAirlines: prefFormData.preferredAirlines.split(',').map((s) => s.trim()).filter(Boolean),
        preferredDestinations: prefFormData.preferredDestinations.split(',').map((s) => s.trim()).filter(Boolean),
        preferredCabinClass: prefFormData.preferredCabinClass,
        preferredSeat: prefFormData.preferredSeat,
        mealPreference: prefFormData.mealPreference,
        budgetRange: prefFormData.budgetRange,
        specialAssistance: prefFormData.specialAssistance,
        internalRemarks: prefFormData.internalRemarks,
      });

      if (res.success) {
        setEditingPreferences(false);
        await loadData();
      } else {
        alert(res.error || 'Failed to save preferences');
      }
    } catch (err: any) {
      alert(`Error saving preferences: ${err.message}`);
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteObj = {
      id: `note-${Date.now()}`,
      text: newNote.trim(),
      author: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [noteObj, ...prev]);
    setNewNote('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData?.customer || !msgContent.trim()) return;
    const customer = profileData.customer;
    setSendingMsg(true);
    try {
      const recipient =
        msgChannel === 'EMAIL'
          ? customer.email
          : `${customer.phoneCountryCode || '+91'}${customer.phoneNumber}`;
      await sendCustomerUpdateAction({
        customerId: customer.id,
        recipientContact: recipient,
        channel: msgChannel as any,
        category: 'CUSTOM_UPDATE' as any,
        templateTitle: 'Custom Travel Message',
        subject: msgSubject || 'Travel update from Varni Holidays',
        content: msgContent,
        senderUserId: currentUser.id,
        senderUserName: currentUser.fullName,
      });
      setMsgStatus('Message dispatched successfully!');
      setTimeout(() => {
        setShowMsgModal(false);
        setMsgContent('');
        setMsgStatus(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      setMsgStatus(`Error: ${err.message}`);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-[#F7F8FA]">
        <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#718096] uppercase font-mono">
          Loading 360° customer dossier...
        </p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertTriangle size={32} className="text-[#C58A27] mx-auto" />
        <h2 className="text-base font-bold text-[#153650]">Customer Dossier Unavailable</h2>
        <p className="text-xs text-[#718096]">{error || 'Unable to locate customer profile in Anand HQ database.'}</p>
        <Link
          href="/admin/customers"
          className="inline-block px-4 py-2 bg-[#153650] text-[#FFFFFF] text-xs font-bold rounded-none"
        >
          Return to Customer Directory
        </Link>
      </div>
    );
  }

  const { customer, stats, flightHolds, leads, bookings, quotations, timeline } = profileData;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title={customer.fullName}
        subtitle={`Client Dossier: ${customer.id} • Registered ${new Date(customer.createdAt).toLocaleDateString()} • Single Customer View`}
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'Directory', href: '/admin/customers' },
          { label: customer.fullName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMsgModal(true)}
              className="px-3.5 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send size={13} className="text-[#E9B95E]" />
              <span>Contact Client</span>
            </button>
            <button
              onClick={loadData}
              className="p-1.5 bg-[#FFFFFF] border border-[#E5E8ED] text-[#718096] hover:text-[#153650] rounded-none shadow-xs"
              title="Refresh Dossier"
            >
              <RotateCw size={14} />
            </button>
            <Link
              href="/admin/customers"
              className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs font-semibold text-[#667085] hover:bg-[#F9FAFB] rounded-none"
            >
              ← Back to Directory
            </Link>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* SUMMARY STATS BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Enquiries / Leads
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">
              {stats?.totalEnquiries || leads.length}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Travel briefs recorded</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Confirmed Bookings & Holds
            </span>
            <div className="text-xl font-bold text-[#168653] mt-1 font-headline">
              {stats?.confirmedBookings || bookings.length} <span className="text-xs text-[#718096]">({flightHolds.length} holds)</span>
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5">Tickets & files</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Lifetime Spend (₹)
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">
              ₹{(stats?.totalSpendInr || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Realized revenue</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Outstanding Due (₹)
            </span>
            <div className="text-xl font-bold text-[#D54747] mt-1 font-headline">
              ₹{(stats?.outstandingDueInr || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#D54747] mt-0.5">Pending collection</p>
          </div>
        </div>

        {/* 360° TAB NAVIGATOR */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xs">
          <div className="flex items-center border-b border-[#E5E8ED] px-3 overflow-x-auto crm-scrollbar">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'OVERVIEW'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              1. Profile & Channels
            </button>
            <button
              onClick={() => setActiveTab('PREFERENCES')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'PREFERENCES'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              2. Travel Preferences & CRM
            </button>
            <button
              onClick={() => setActiveTab('FLIGHT_HOLDS')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'FLIGHT_HOLDS'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              3. Flight Holds & PNRs ({flightHolds.length})
            </button>
            <button
              onClick={() => setActiveTab('ENQUIRIES')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'ENQUIRIES'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              4. Leads & Enquiries ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'BOOKINGS'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              5. Confirmed Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'TIMELINE'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              6. Unified Timeline ({timeline.length})
            </button>
            <button
              onClick={() => setActiveTab('NOTES')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'NOTES'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              7. Internal Notes
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-2">
                    Verified Contact Channels
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-32">Mobile Number:</span>
                      <span className="font-mono font-bold text-[#153650]">
                        {customer.phoneCountryCode || '+91'} {customer.phoneNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-32">Email Address:</span>
                      <span className="font-mono">{customer.email || 'None on record'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-32">Location:</span>
                      <span>{customer.city || 'Anand'}, Gujarat, India</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare size={14} className="text-[#168653]" />
                      <span className="font-semibold text-[#153650] w-32">Preferred Channel:</span>
                      <span className="font-bold text-[#168653] uppercase">{customer.preferredChannel || 'WHATSAPP'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-2">
                    Account Dossier & Staff Assignment
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <User size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-36">Assigned Manager:</span>
                      <span className="font-medium text-[#153650]">{customer.assignedStaff?.fullName || 'Neel Patel (Super Admin)'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-36">Client Since:</span>
                      <span className="font-mono">{new Date(customer.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-36">Last Activity:</span>
                      <span className="font-mono">{new Date(customer.updatedAt || customer.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-36">Record Integrity:</span>
                      <span className="text-[#168653] font-semibold">Verified Unique Profile (Deduplicated)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TRAVEL PREFERENCES & CRM */}
            {activeTab === 'PREFERENCES' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono">
                      Client Travel Preferences & Staff Intelligence
                    </h3>
                    <p className="text-xs text-[#718096] mt-0.5">
                      Tailor personalized holiday recommendations, seat assignments, and meal choices
                    </p>
                  </div>
                  {!editingPreferences ? (
                    <button
                      onClick={() => setEditingPreferences(true)}
                      className="px-3 py-1.5 bg-[#153650] text-[#FFFFFF] text-xs font-bold rounded-none flex items-center gap-1.5 hover:bg-[#24689B]"
                    >
                      <Edit2 size={13} />
                      <span>Edit Preferences</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingPreferences(false)}
                      className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs font-semibold text-[#718096] rounded-none hover:bg-[#F9FAFB]"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {editingPreferences ? (
                  <form onSubmit={handleSavePreferences} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Preferred Communication Channel
                        </label>
                        <select
                          value={prefFormData.preferredChannel}
                          onChange={(e) => setPrefFormData({ ...prefFormData, preferredChannel: e.target.value })}
                          className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs"
                        >
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="EMAIL">Email</option>
                          <option value="PHONE_CALL">Phone Call</option>
                          <option value="WEBSITE">Website Portal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Preferred Cabin Class
                        </label>
                        <select
                          value={prefFormData.preferredCabinClass}
                          onChange={(e) => setPrefFormData({ ...prefFormData, preferredCabinClass: e.target.value })}
                          className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs"
                        >
                          <option value="Economy">Economy</option>
                          <option value="Premium Economy">Premium Economy</option>
                          <option value="Business">Business</option>
                          <option value="First">First Class</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Preferred Seat
                        </label>
                        <select
                          value={prefFormData.preferredSeat}
                          onChange={(e) => setPrefFormData({ ...prefFormData, preferredSeat: e.target.value })}
                          className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs"
                        >
                          <option value="Window">Window</option>
                          <option value="Aisle">Aisle</option>
                          <option value="Extra Legroom">Extra Legroom</option>
                          <option value="Front Row">Front Row</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Meal Preference
                        </label>
                        <select
                          value={prefFormData.mealPreference}
                          onChange={(e) => setPrefFormData({ ...prefFormData, mealPreference: e.target.value })}
                          className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs"
                        >
                          <option value="Vegetarian">Vegetarian (AVML)</option>
                          <option value="Jain Meal">Jain Meal (VJML)</option>
                          <option value="Hindu Meal">Hindu Meal (HNML)</option>
                          <option value="Halal">Halal Meal (MOML)</option>
                          <option value="Non-Vegetarian">Non-Vegetarian (Standard)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Typical Budget Range
                        </label>
                        <input
                          type="text"
                          value={prefFormData.budgetRange}
                          onChange={(e) => setPrefFormData({ ...prefFormData, budgetRange: e.target.value })}
                          placeholder="e.g. ₹1,00,000 - ₹2,50,000"
                          className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Special Assistance Requirements
                        </label>
                        <input
                          type="text"
                          value={prefFormData.specialAssistance}
                          onChange={(e) => setPrefFormData({ ...prefFormData, specialAssistance: e.target.value })}
                          placeholder="e.g. Wheelchair assistance, bassinet"
                          className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Preferred Airlines (Comma separated)
                        </label>
                        <input
                          type="text"
                          value={prefFormData.preferredAirlines}
                          onChange={(e) => setPrefFormData({ ...prefFormData, preferredAirlines: e.target.value })}
                          placeholder="e.g. Emirates, Singapore Airlines, Air India, Qatar Airways"
                          className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Favorite / Dream Destinations (Comma separated)
                        </label>
                        <input
                          type="text"
                          value={prefFormData.preferredDestinations}
                          onChange={(e) => setPrefFormData({ ...prefFormData, preferredDestinations: e.target.value })}
                          placeholder="e.g. Dubai, Switzerland, Bali, London, Paris"
                          className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                          Internal Staff Remarks & Intelligence
                        </label>
                        <textarea
                          rows={3}
                          value={prefFormData.internalRemarks}
                          onChange={(e) => setPrefFormData({ ...prefFormData, internalRemarks: e.target.value })}
                          placeholder="Confidential remarks regarding traveler demeanor, payment promptness, negotiation habits..."
                          className="w-full p-2.5 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none text-xs resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E8ED]">
                      <button
                        type="button"
                        onClick={() => setEditingPreferences(false)}
                        className="px-4 py-1.5 border border-[#E5E8ED] text-xs font-semibold text-[#667085] rounded-none hover:bg-[#F9FAFB]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingPreferences}
                        className="px-5 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none flex items-center gap-1.5"
                      >
                        <Save size={13} />
                        <span>{savingPreferences ? 'Saving...' : 'Save Preferences'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E8ED]">
                      <span className="text-[10px] font-bold uppercase text-[#718096]">Preferred Cabin Class</span>
                      <div className="text-sm font-bold text-[#153650] mt-1">{customer.preferredCabinClass || 'Economy'}</div>
                    </div>

                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E8ED]">
                      <span className="text-[10px] font-bold uppercase text-[#718096]">Seat & Meal</span>
                      <div className="text-sm font-bold text-[#153650] mt-1">
                        {customer.preferredSeat || 'Window'} • {customer.mealPreference || 'Vegetarian'}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E8ED]">
                      <span className="text-[10px] font-bold uppercase text-[#718096]">Budget Range</span>
                      <div className="text-sm font-bold text-[#153650] mt-1 font-mono">
                        {customer.budgetRange || '₹50,000 - ₹1,50,000'}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E8ED] sm:col-span-2 lg:col-span-3">
                      <span className="text-[10px] font-bold uppercase text-[#718096]">Preferred Airlines</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {Array.isArray(customer.preferredAirlines) && customer.preferredAirlines.length > 0 ? (
                          customer.preferredAirlines.map((air: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E5E8ED] font-semibold text-[#153650]">
                              {air}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#718096]">No preferred carriers specified.</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E8ED] sm:col-span-2 lg:col-span-3">
                      <span className="text-[10px] font-bold uppercase text-[#718096]">Preferred Destinations</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {Array.isArray(customer.preferredDestinations) && customer.preferredDestinations.length > 0 ? (
                          customer.preferredDestinations.map((dest: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E5E8ED] font-semibold text-[#24689B]">
                              {dest}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#718096]">No preferred destinations specified.</span>
                        )}
                      </div>
                    </div>

                    {customer.specialAssistance && (
                      <div className="p-3.5 bg-[#FEF3C7] border border-[#FDE68A] sm:col-span-2 lg:col-span-3">
                        <span className="text-[10px] font-bold uppercase text-[#92400E]">Special Assistance Note</span>
                        <p className="text-xs text-[#92400E] font-medium mt-1">{customer.specialAssistance}</p>
                      </div>
                    )}

                    {customer.internalRemarks && (
                      <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E8ED] sm:col-span-2 lg:col-span-3">
                        <span className="text-[10px] font-bold uppercase text-[#718096]">Internal Consultant Remarks</span>
                        <p className="text-xs text-[#172B45] mt-1 whitespace-pre-wrap">{customer.internalRemarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FLIGHT HOLDS & PNRS */}
            {activeTab === 'FLIGHT_HOLDS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono">
                      Flight Hold & Ticket Issuance Records
                    </h3>
                    <p className="text-xs text-[#718096] mt-0.5">
                      Direct integration with FlightHoldPNR records and issued e-tickets
                    </p>
                  </div>
                  <Link
                    href="/admin/flight-holds"
                    className="px-3 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none"
                  >
                    + New Flight Hold
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                        <th className="py-2.5 px-3">PNR</th>
                        <th className="py-2.5 px-3">Airline & Flight</th>
                        <th className="py-2.5 px-3">Sector</th>
                        <th className="py-2.5 px-3">Departure</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Issuance Amount</th>
                        <th className="py-2.5 px-3 text-right">E-Ticket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8ED]">
                      {flightHolds.map((h: any) => (
                        <tr key={h.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3 font-mono font-bold text-[#153650]">
                            {h.pnr}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold">{h.airlineName || h.airlineCode}</span>
                            <span className="text-[11px] text-[#718096] ml-1.5 font-mono">({h.flightNumber})</span>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {h.originCity} → {h.destinationCity}
                          </td>
                          <td className="py-3 px-3 font-mono text-[#667085]">
                            {new Date(h.departureDate).toLocaleDateString()} {h.departureTime || ''}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-none ${
                                h.status === 'ISSUED'
                                  ? 'bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]'
                                  : h.status === 'HELD'
                                  ? 'bg-[#FEF08A] text-[#854D0E] border border-[#FDE047]'
                                  : 'bg-[#F3F4F6] text-[#6B7280]'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold">
                            {h.issuanceAmountInr ? `₹${Number(h.issuanceAmountInr).toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {h.ticketPdfUrl ? (
                              <a
                                href={h.ticketPdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-[#168653] hover:bg-[#136C43] text-[#FFFFFF] text-[11px] font-bold rounded-none inline-flex items-center gap-1"
                              >
                                <Download size={11} />
                                <span>Download PDF</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-[#9CA3AF] italic">No PDF uploaded</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {flightHolds.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#718096]">
                            No flight holds or ticket issuance records on file for this traveler.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ENQUIRIES & LEADS */}
            {activeTab === 'ENQUIRIES' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono">
                    All Enquiries & Pipeline Deals ({leads.length})
                  </h3>
                  <Link
                    href="/admin/leads"
                    className="px-3 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none"
                  >
                    Open Kanban Board →
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Service / Title</th>
                        <th className="py-2.5 px-3">Destination</th>
                        <th className="py-2.5 px-3">Stage</th>
                        <th className="py-2.5 px-3">Expected Value</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8ED]">
                      {leads.map((l: any) => (
                        <tr key={l.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3 font-mono font-bold text-[#153650]">{l.referenceId}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold block">{l.title || l.serviceType}</span>
                            <span className="text-[10px] text-[#718096]">{l.serviceType}</span>
                          </td>
                          <td className="py-3 px-3 text-[#667085]">{l.destination || 'Custom Journey'}</td>
                          <td className="py-3 px-3">
                            <StatusBadge status={l.stage} type="lead" size="sm" />
                            {l.lossReason && (
                              <span className="text-[10px] text-[#DC2626] block mt-0.5">
                                Reason: {l.lossReason}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold">
                            {l.expectedValueInr ? `₹${Number(l.expectedValueInr).toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link href={`/admin/leads/${l.id}`} className="text-[#24689B] font-bold hover:underline">
                              Inspect Deal →
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#718096]">
                            No enquiries or deals on record.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: BOOKINGS */}
            {activeTab === 'BOOKINGS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono">
                    Confirmed Holiday & Flight Bookings ({bookings.length})
                  </h3>
                  <Link
                    href="/admin/bookings"
                    className="px-3 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none"
                  >
                    View All Bookings
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                        <th className="py-2.5 px-3">Booking Ref</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3">Travel Dates</th>
                        <th className="py-2.5 px-3">Total Amount</th>
                        <th className="py-2.5 px-3">Paid Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8ED]">
                      {bookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3 font-mono font-bold text-[#153650]">
                            {b.bookingReference || b.id}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={b.serviceType} type="service" size="sm" />
                          </td>
                          <td className="py-3 px-3 text-[#667085]">{b.travelDates || 'Upcoming'}</td>
                          <td className="py-3 px-3 font-mono font-semibold">
                            ₹{Number(b.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-[#168653]">
                            ₹{Number(b.paidAmount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={b.status} type="booking" size="sm" />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link href={`/admin/bookings/${b.id}`} className="text-[#24689B] font-bold hover:underline">
                              Voucher File →
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#718096]">
                            No confirmed holiday files yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: UNIFIED TIMELINE */}
            {activeTab === 'TIMELINE' && (
              <div className="space-y-4">
                <div className="border-b border-[#E5E8ED] pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono">
                    Chronological Multi-Source Activity Timeline
                  </h3>
                  <p className="text-xs text-[#718096] mt-0.5">
                    Unified audit trail across website enquiries, leads, flight holds, bookings, follow-ups, and notifications
                  </p>
                </div>

                <div className="relative border-l-2 border-[#E5E8ED] ml-3 pl-5 space-y-5">
                  {timeline.map((item: any) => (
                    <div key={item.id} className="relative">
                      <div
                        className={`absolute -left-[27px] top-1 w-3.5 h-3.5 border-2 border-[#FFFFFF] ${
                          item.type === 'FLIGHT_HOLD'
                            ? 'bg-[#24689B]'
                            : item.type === 'BOOKING'
                            ? 'bg-[#168653]'
                            : item.type === 'FOLLOW_UP'
                            ? 'bg-[#D97706]'
                            : item.type === 'INBOX'
                            ? 'bg-[#0284C7]'
                            : 'bg-[#153650]'
                        }`}
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#718096]">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                              item.type === 'FLIGHT_HOLD'
                                ? 'bg-[#EBF5FB] text-[#24689B]'
                                : item.type === 'BOOKING'
                                ? 'bg-[#EAF7EE] text-[#168653]'
                                : item.type === 'FOLLOW_UP'
                                ? 'bg-[#FEF3C7] text-[#92400E]'
                                : item.type === 'INBOX'
                                ? 'bg-[#E0F2FE] text-[#0369A1]'
                                : 'bg-[#F3F4F6] text-[#374151]'
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <p className="font-bold text-[#153650] mt-1">{item.title}</p>
                        <p className="text-[#4B5563] mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                  {timeline.length === 0 && (
                    <p className="py-6 text-center text-[#718096] text-xs">No chronological events logged yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: INTERNAL NOTES */}
            {activeTab === 'NOTES' && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={3}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter confidential internal consultant note..."
                    className="w-full p-3 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#153650] text-[#FFFFFF] text-xs font-bold rounded-none"
                    >
                      Post Note
                    </button>
                  </div>
                </form>

                <div className="divide-y divide-[#E5E8ED]">
                  {notes.map((n) => (
                    <div key={n.id} className="py-2.5 text-xs flex items-start gap-2">
                      <StickyNote size={14} className="text-[#C05621] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#172B45] font-medium">{n.text}</p>
                        <span className="text-[10px] font-mono text-[#718096]">
                          Posted by {n.author} • {new Date(n.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <p className="py-6 text-center text-[#718096] text-xs">No internal notes posted yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QUICK MESSAGE MODAL */}
      {showMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#153650]/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] w-full max-w-lg shadow-2xl rounded-none flex flex-col overflow-hidden">
            <div className="h-12 px-4 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F8FAFC]">
              <span className="text-xs font-bold uppercase text-[#153650] font-mono">
                Message {customer.fullName}
              </span>
              <button onClick={() => setShowMsgModal(false)} className="text-[#718096] hover:text-[#153650]">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-4 space-y-3">
              {msgStatus && (
                <div className="p-2.5 text-xs bg-[#DEF7EC] border border-[#BCF0DA] text-[#03543F]">
                  {msgStatus}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMsgChannel('WHATSAPP')}
                  className={`py-2 text-xs font-semibold border ${
                    msgChannel === 'WHATSAPP' ? 'border-[#15803D] bg-[#F0FDF4] text-[#15803D]' : 'border-[#E5E8ED]'
                  }`}
                >
                  WhatsApp ({customer.phoneCountryCode || '+91'} {customer.phoneNumber})
                </button>
                <button
                  type="button"
                  onClick={() => setMsgChannel('EMAIL')}
                  className={`py-2 text-xs font-semibold border ${
                    msgChannel === 'EMAIL' ? 'border-[#24689B] bg-[#EFF6FF] text-[#1D4ED8]' : 'border-[#E5E8ED]'
                  }`}
                >
                  Resend Email ({customer.email || 'No email'})
                </button>
              </div>

              {msgChannel === 'EMAIL' && (
                <input
                  type="text"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full h-8 px-2.5 text-xs border border-[#E5E8ED]"
                />
              )}

              <textarea
                rows={4}
                required
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                placeholder="Type your message to the customer..."
                className="w-full p-2.5 text-xs border border-[#E5E8ED] resize-none"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={() => setShowMsgModal(false)}
                  className="px-3 py-1.5 text-xs border border-[#E5E8ED] text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-4 py-1.5 bg-[#153650] text-[#FFFFFF] text-xs font-bold"
                >
                  {sendingMsg ? 'Dispatching...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
