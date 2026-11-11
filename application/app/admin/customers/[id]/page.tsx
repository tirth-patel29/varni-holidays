'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getCustomerByIdAction, getLeadsAction, getFollowUpsAction, addGeneralNoteAction, getQuotationsAction } from '@/app/actions/crm';
import { getCustomerTimelineAction, getBookingsAction, sendCustomerUpdateAction } from '@/app/actions/phase3';
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
} from 'lucide-react';

export default function AdminCustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCrm();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  // Tab navigation across the 10 sections
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'ENQUIRIES' | 'BOOKINGS' | 'QUOTATIONS' | 'FINANCE' | 'COMMUNICATIONS' | 'TIMELINE' | 'NOTES'
  >('OVERVIEW');

  // Quick message modal
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgChannel, setMsgChannel] = useState<'EMAIL' | 'WHATSAPP'>('WHATSAPP');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgStatus, setMsgStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cust, allLeads, allBookings, allQuotes, allFollowUps, tl] = await Promise.all([
        getCustomerByIdAction(customerId),
        getLeadsAction(),
        getBookingsAction(customerId),
        getQuotationsAction(),
        getFollowUpsAction(),
        getCustomerTimelineAction(customerId),
      ]);

      if (!cust) {
        router.push('/admin/customers');
        return;
      }

      setCustomer(cust);
      const cLeads = (allLeads || []).filter((l: any) => l.customerId === customerId);
      setLeads(cLeads);

      const bList = Array.isArray(allBookings?.bookings)
        ? allBookings.bookings
        : Array.isArray(allBookings)
        ? allBookings
        : [];
      setBookings(bList.filter((b: any) => b.customerId === customerId));

      const qList = Array.isArray(allQuotes) ? allQuotes : [];
      setQuotations(qList.filter((q: any) => q.customerId === customerId));

      setFollowUps((allFollowUps || []).filter((f: any) => cLeads.some((l: any) => l.id === f.leadId)));
      setTimeline(tl?.timeline || []);
    } catch (err) {
      console.error('Failed to load customer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) loadData();
  }, [customerId]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes((prev) => [newNote.trim(), ...prev]);
    setNewNote('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !msgContent.trim()) return;
    setSendingMsg(true);
    try {
      const recipient = msgChannel === 'EMAIL' ? customer.email : `${customer.phoneCountryCode || '+91'}${customer.phoneNumber}`;
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

  if (loading || !customer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-[#F7F8FA]">
        <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#718096] uppercase font-mono">
          Loading customer dossier...
        </p>
      </div>
    );
  }

  const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const outstanding = bookings.reduce((sum, b) => sum + Math.max(0, (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0)), 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title={customer.fullName}
        subtitle={`Customer Reference: ${customer.id} • Registered ${new Date(customer.createdAt).toLocaleDateString()}`}
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'All Customers', href: '/admin/customers' },
          { label: customer.fullName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMsgModal(true)}
              className="px-3.5 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send size={13} className="text-[#E9B95E]" />
              <span>Contact Customer</span>
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
        {/* SUMMARY CARDS BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Enquiries
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">
              {leads.length}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Travel briefs logged</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Confirmed Bookings
            </span>
            <div className="text-xl font-bold text-[#168653] mt-1 font-headline">
              {bookings.length}
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5">Voucher-ready files</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Lifetime Paid (₹)
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">
              ₹{totalSpent.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Financial realized value</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Outstanding Due (₹)
            </span>
            <div className="text-xl font-bold text-[#D54747] mt-1 font-headline">
              ₹{outstanding.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#D54747] mt-0.5">Pending collection</p>
          </div>
        </div>

        {/* 10-SECTION TAB NAVIGATOR */}
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
              1. Profile & Contact
            </button>
            <button
              onClick={() => setActiveTab('ENQUIRIES')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'ENQUIRIES'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              2. Enquiries ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'BOOKINGS'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              3. Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('QUOTATIONS')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'QUOTATIONS'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              4. Quotations ({quotations.length})
            </button>
            <button
              onClick={() => setActiveTab('FINANCE')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'FINANCE'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              5. Invoices & Payments
            </button>
            <button
              onClick={() => setActiveTab('COMMUNICATIONS')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'COMMUNICATIONS'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              6. Comms Log
            </button>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'TIMELINE'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              7. Follow-up Timeline
            </button>
            <button
              onClick={() => setActiveTab('NOTES')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'NOTES'
                  ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                  : 'border-transparent text-[#667085] hover:text-[#153650]'
              }`}
            >
              8. Internal Notes
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {/* TAB 1: OVERVIEW & CONTACT */}
            {activeTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-2">
                    Primary Contact Channels
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-28">Mobile Number:</span>
                      <span className="font-mono">{customer.phoneCountryCode || '+91'} {customer.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-28">Email Address:</span>
                      <span className="font-mono">{customer.email || 'None on record'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-28">City & State:</span>
                      <span>{customer.city || 'Anand'}, Gujarat, India</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-2">
                    Account Metadata & Assignments
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <User size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-32">Assigned Specialist:</span>
                      <span>{currentUser.fullName} (Super Admin)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-32">Client Since:</span>
                      <span className="font-mono">{new Date(customer.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-[#24689B]" />
                      <span className="font-semibold text-[#153650] w-32">Last Interaction:</span>
                      <span className="font-mono">{new Date(customer.updatedAt || customer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ENQUIRIES */}
            {activeTab === 'ENQUIRIES' && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3">Destination</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Stage</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8ED]">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3 font-mono font-bold text-[#153650]">{l.referenceId}</td>
                          <td className="py-3 px-3"><StatusBadge status={l.serviceType} type="service" size="sm" /></td>
                          <td className="py-3 px-3 text-[#667085]">{l.destination || 'Custom Journey'}</td>
                          <td className="py-3 px-3"><StatusBadge status={l.priorityLevel} type="priority" size="sm" /></td>
                          <td className="py-3 px-3"><StatusBadge status={l.stage} type="lead" size="sm" /></td>
                          <td className="py-3 px-3 text-right">
                            <Link href={`/admin/leads/${l.id}`} className="text-[#24689B] font-bold hover:underline">
                              Inspect Lead →
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-[#718096]">No enquiries on record.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: BOOKINGS */}
            {activeTab === 'BOOKINGS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                      <th className="py-2.5 px-3">Booking Ref</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3">Travel Dates</th>
                      <th className="py-2.5 px-3">Total Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E8ED]">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-3 font-mono font-bold text-[#153650]">{b.bookingReference || b.id}</td>
                        <td className="py-3 px-3"><StatusBadge status={b.serviceType} type="service" size="sm" /></td>
                        <td className="py-3 px-3 text-[#667085]">{b.travelDates || 'Upcoming'}</td>
                        <td className="py-3 px-3 font-mono font-semibold">₹{Number(b.totalAmount || 0).toLocaleString()}</td>
                        <td className="py-3 px-3"><StatusBadge status={b.status} type="booking" size="sm" /></td>
                        <td className="py-3 px-3 text-right">
                          <Link href={`/admin/bookings/${b.id}`} className="text-[#24689B] font-bold hover:underline">
                            Voucher Dossier →
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-[#718096]">No confirmed bookings yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: QUOTATIONS */}
            {activeTab === 'QUOTATIONS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                      <th className="py-2.5 px-3">Quotation ID</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3">Amount (₹)</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E8ED]">
                    {quotations.map((q) => (
                      <tr key={q.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-3 font-mono font-bold text-[#153650]">{q.id}</td>
                        <td className="py-3 px-3 text-[#667085]">{q.destination || 'Travel Package'}</td>
                        <td className="py-3 px-3 font-mono font-semibold">₹{Number(q.totalAmount || 0).toLocaleString()}</td>
                        <td className="py-3 px-3"><StatusBadge status={q.status} size="sm" /></td>
                        <td className="py-3 px-3 text-right">
                          <Link href="/admin/quotations" className="text-[#24689B] font-bold hover:underline">
                            View Quote →
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {quotations.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-[#718096]">No formal proposals sent yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 5: FINANCE & INVOICES */}
            {activeTab === 'FINANCE' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F8FAFC] border border-[#E5E8ED]">
                    <span className="text-[10px] font-bold uppercase text-[#718096]">Total Billed</span>
                    <div className="text-xl font-bold text-[#153650] mt-1">₹{(totalSpent + outstanding).toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] border border-[#E5E8ED]">
                    <span className="text-[10px] font-bold uppercase text-[#718096]">Payment Balance Due</span>
                    <div className="text-xl font-bold text-[#D54747] mt-1">₹{outstanding.toLocaleString()}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase text-[#153650] mb-2 font-mono">Invoice Records</h4>
                  <p className="text-xs text-[#718096]">
                    Tax invoices automatically reconcile with verified bookings in Anand HQ ledger.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 6: COMMUNICATIONS */}
            {activeTab === 'COMMUNICATIONS' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#153650] uppercase font-mono">Omnichannel Records</span>
                  <button
                    onClick={() => setShowMsgModal(true)}
                    className="px-3 py-1 bg-[#153650] text-[#FFFFFF] text-xs font-semibold rounded-none"
                  >
                    + Compose Message
                  </button>
                </div>
                <div className="divide-y divide-[#E5E8ED]">
                  {timeline.filter((t) => t.type === 'COMMUNICATION').map((c, idx) => (
                    <div key={idx} className="py-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#153650]">{c.title}</span>
                        <span className="text-[10px] font-mono text-[#718096]">{new Date(c.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[#667085] mt-0.5">{c.details}</p>
                    </div>
                  ))}
                  {timeline.filter((t) => t.type === 'COMMUNICATION').length === 0 && (
                    <p className="py-6 text-center text-[#718096] text-xs">No customer communications logged yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: TIMELINE */}
            {activeTab === 'TIMELINE' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#153650] mb-3 font-mono">Chronological Audit Trail</h4>
                <div className="relative border-l-2 border-[#E5E8ED] ml-3 pl-4 space-y-4">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#24689B] border border-[#FFFFFF]" />
                      <div className="text-xs">
                        <span className="font-mono text-[10px] text-[#718096]">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <p className="font-semibold text-[#153650] mt-0.5">{item.title}</p>
                        <p className="text-[#667085]">{item.details}</p>
                      </div>
                    </div>
                  ))}
                  {timeline.length === 0 && (
                    <p className="py-6 text-center text-[#718096] text-xs">No chronological events logged.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 8: INTERNAL NOTES */}
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
                  {notes.map((n, idx) => (
                    <div key={idx} className="py-2.5 text-xs flex items-start gap-2">
                      <StickyNote size={14} className="text-[#C05621] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#172B45] font-medium">{n}</p>
                        <span className="text-[10px] font-mono text-[#718096]">
                          Posted by {currentUser.fullName} • Just now
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

