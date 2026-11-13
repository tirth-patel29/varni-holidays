'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { useCrm } from '@/components/crm/CrmContext';
import {
  getQuotationDetailsAction,
  updateQuotationStatusAction,
  createQuotationRevisionAction,
  duplicateQuotationAction,
  sendQuotationEmailAction,
} from '@/app/actions/quotations';
import {
  FileText,
  Printer,
  Download,
  Send,
  Copy,
  GitBranch,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Building2,
  Compass,
  AlertCircle,
  History,
  Mail,
  ShieldCheck,
  CreditCard,
  User,
  Phone,
  Calendar,
  X,
  RotateCw,
} from 'lucide-react';

export default function QuotationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id as string;
  const { currentUser, isSuperAdmin } = useCrm();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PDF Preview Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);

  const loadData = async () => {
    if (!quotationId) return;
    setLoading(true);
    try {
      const res = await getQuotationDetailsAction(quotationId);
      if (res.success && res.quotation) {
        setData(res);
        const q = res.quotation;
        const c = res.customer;
        setEmailRecipient(c?.email || q.customerEmail || '');
        setEmailSubject(`Official Travel Proposal (${q.quotationNumber}) – ${q.title} | Varni Holidays`);
        setEmailMessage(
          `Namaste ${c?.fullName || 'Valued Guest'} Ji,\n\nPlease find attached your official quotation for "${q.title}". Kindly review the day-by-day itinerary, inclusions, and payment schedule. Feel free to reply here to confirm your reservation or request any adjustments!`
        );
      } else {
        setError(res.error || 'Failed to load quotation');
      }
    } catch (err: any) {
      setError(err.message || 'Server error loading quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [quotationId]);

  const handleStatusChange = async (newStatus: any) => {
    await updateQuotationStatusAction(quotationId, newStatus, currentUser.id);
    await loadData();
  };

  const handleCreateRevision = async () => {
    if (!confirm('Create a new revision from this quotation? This will preserve the current version intact.')) return;
    const res = await createQuotationRevisionAction(quotationId, currentUser.id);
    if (res.success && res.quotation) {
      router.push(`/admin/quotations/${res.quotation.id}`);
    }
  };

  const handleDuplicate = async () => {
    if (!confirm('Duplicate this proposal as a brand new draft?')) return;
    const res = await duplicateQuotationAction(quotationId, currentUser.id);
    if (res.success && res.quotation) {
      router.push(`/admin/quotations/${res.quotation.id}`);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRecipient.trim()) {
      setEmailFeedback({ type: 'error', text: 'Recipient email address is required.' });
      return;
    }

    setEmailSending(true);
    setEmailFeedback(null);
    try {
      const res = await sendQuotationEmailAction({
        quotationId,
        recipientEmail: emailRecipient.trim(),
        subject: emailSubject.trim(),
        customMessage: emailMessage.trim(),
        actorId: currentUser.id,
      });

      if (res.success) {
        setEmailFeedback({
          type: 'success',
          text: `Quotation email successfully dispatched [${res.providerStatus}] with official PDF attached.`,
        });
        await loadData();
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailFeedback(null);
        }, 1800);
      } else {
        setEmailFeedback({ type: 'error', text: res.error || 'Failed to dispatch email' });
      }
    } catch (err: any) {
      setEmailFeedback({ type: 'error', text: err.message || 'Error sending email' });
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#F7F8FA]">
        <div className="flex items-center gap-2.5 text-xs text-[#718096]">
          <div className="w-4 h-4 border-2 border-[#153650] border-t-transparent rounded-full animate-spin" />
          <span>Loading quotation dossier...</span>
        </div>
      </div>
    );
  }

  if (error || !data?.quotation) {
    return (
      <div className="flex-1 p-8 bg-[#F7F8FA]">
        <div className="max-w-md mx-auto bg-white border border-[#E5E8ED] p-6 text-center space-y-3">
          <XCircle size={32} className="text-[#D54747] mx-auto" />
          <h2 className="text-sm font-bold text-[#153650]">Quotation Not Found</h2>
          <p className="text-xs text-[#718096]">{error || 'Requested quotation record could not be retrieved.'}</p>
          <Link
            href="/admin/quotations"
            className="inline-block px-3.5 py-1.5 bg-[#002037] text-white text-xs font-bold"
          >
            Back to Quotations
          </Link>
        </div>
      </div>
    );
  }

  const q = data.quotation;
  const c = data.customer;
  const lead = data.lead;
  const snapshots = data.snapshots || [];
  const emailLogs = data.emailLogs || [];
  const isHotel = q.quotationType === 'HOTEL';
  const revText = q.revisionNumber && q.revisionNumber > 0 ? ` (Revision ${q.revisionNumber})` : '';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      {/* Top Breadcrumb & PageHeader */}
      <PageHeader
        title={`${q.quotationNumber}${revText}`}
        subtitle={`Official proposal for ${c.fullName || 'Valued Guest'} • Created on ${new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} by ${q.createdByName || 'Neel Patel'}`}
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Quotations', href: '/admin/quotations' },
          { label: q.quotationNumber },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] inline-flex items-center gap-1.5 shadow-xs"
            >
              <Printer size={13} className="text-[#24689B]" />
              <span>Preview PDF</span>
            </button>

            <a
              href={`/api/quotations/${q.id}/pdf?download=1`}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#168653] inline-flex items-center gap-1.5 shadow-xs"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </a>

            <button
              onClick={() => setShowEmailModal(true)}
              className="px-3.5 py-1.5 bg-[#002037] hover:bg-[#153650] text-[#FFFFFF] text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Send size={13} className="text-[#E9B95E]" />
              <span>Send via Email</span>
            </button>

            {q.status !== 'DRAFT' && (
              <button
                onClick={handleCreateRevision}
                className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#CBD5E1] text-xs font-bold text-[#24689B] inline-flex items-center gap-1.5 shadow-xs"
                title="Create a new revision version"
              >
                <GitBranch size={13} />
                <span>Create Revision</span>
              </button>
            )}

            <button
              onClick={handleDuplicate}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#CBD5E1] text-xs font-bold text-[#718096] inline-flex items-center gap-1.5 shadow-xs"
              title="Duplicate as new draft"
            >
              <Copy size={13} />
              <span>Duplicate</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* BANNER STATUS CARD */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#718096]">STATUS:</span>
              <select
                value={q.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-8 px-2.5 text-xs font-mono font-bold uppercase bg-[#F8FAFC] border border-[#CBD5E1] rounded-none focus:outline-none"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT TO CUSTOMER</option>
                <option value="ACCEPTED">ACCEPTED / WON</option>
                <option value="REJECTED">DECLINED / LOST</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

            <span className="text-xs text-[#718096] font-mono">
              Valid until: {new Date(q.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#718096]">Total Investment:</span>
            <span className="font-mono text-xl font-extrabold text-[#168653]">
              ₹{Number(q.totalAmountInr || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#718096] font-mono">(Incl. {q.taxPercent || 5}% GST)</span>
          </div>
        </div>

        {/* 2-COLUMN DOSSIER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: PROPOSAL DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Overview */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096]">
                  {isHotel ? 'HOTEL STAY PROPOSAL' : 'TOUR PACKAGE PROPOSAL'}
                </span>
                <span className="text-xs font-mono text-[#24689B] font-semibold">
                  {q.destination || 'Kerala / India'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#153650]">{q.title}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#718096] uppercase block">Travelers</span>
                  <span className="font-semibold text-[#153650]">
                    {q.adultsCount} Adults{q.childrenCount > 0 ? `, ${q.childrenCount} Children` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718096] uppercase block">Rooms</span>
                  <span className="font-semibold text-[#153650]">{q.roomsCount} Room(s)</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718096] uppercase block">Duration</span>
                  <span className="font-semibold text-[#153650]">
                    {q.durationNights ? `${q.durationNights}N / ${(q.durationNights || 0) + 1}D` : 'Complete Tour'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718096] uppercase block">Travel Dates</span>
                  <span className="font-semibold text-[#153650]">
                    {q.travelStartDate ? new Date(q.travelStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Flexible'}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Pricing Breakdown Table */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block border-b border-[#E5E8ED] pb-2">
                ITEMIZED FINANCIAL BREAKDOWN (INR)
              </span>

              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Item / Service Description</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Rate</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8ED]">
                  {q.lineItems && q.lineItems.length > 0 ? (
                    q.lineItems.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-[#718096] font-mono">{item.itemOrder || idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-[#153650]">{item.description}</td>
                        <td className="px-3 py-2 text-center font-mono">{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-mono">₹{Number(item.unitPriceInr).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">₹{Number(item.totalAmountInr).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-2 text-[#718096] font-mono">1</td>
                      <td className="px-3 py-2 font-medium text-[#153650]">Base Accommodation & Tour Plan</td>
                      <td className="px-3 py-2 text-center font-mono">1</td>
                      <td className="px-3 py-2 text-right font-mono">₹{Number(q.basePriceInr || q.subtotalInr).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">₹{Number(q.basePriceInr || q.subtotalInr).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Financial Totals */}
              <div className="pt-3 border-t border-[#E5E8ED] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#718096]">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono">₹{Number(q.subtotalInr || 0).toLocaleString('en-IN')}</span>
                </div>
                {q.discountInr > 0 && (
                  <div className="flex justify-between text-[#D54747]">
                    <span>Discount Applied:</span>
                    <span className="font-mono">- ₹{Number(q.discountInr).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#718096]">
                  <span>Goods & Services Tax (GST @ {q.taxPercent || 5}%):</span>
                  <span className="font-mono">+ ₹{Number(q.taxesInr || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#153650] pt-2 border-t border-[#E5E8ED]">
                  <span>Total Amount Payable:</span>
                  <span className="font-mono text-base text-[#168653]">₹{Number(q.totalAmountInr || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Day-by-Day Itinerary (for Package) or Hotel Details */}
            {isHotel ? (
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block border-b border-[#E5E8ED] pb-2">
                  HOTEL STAY & ROOM SPECIFICATIONS
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#718096] block">Resort / Property:</span>
                    <span className="font-bold text-[#153650]">{q.hotelDetails?.hotelName || q.title}</span>
                  </div>
                  <div>
                    <span className="text-[#718096] block">Location:</span>
                    <span className="font-semibold text-[#153650]">{q.hotelDetails?.location || q.destination}</span>
                  </div>
                  <div>
                    <span className="text-[#718096] block">Room Category:</span>
                    <span className="font-semibold text-[#153650]">{q.hotelDetails?.roomType || 'Standard Deluxe'}</span>
                  </div>
                  <div>
                    <span className="text-[#718096] block">Meal Plan:</span>
                    <span className="font-semibold text-[#153650]">{q.hotelDetails?.mealPlan || q.mealPlan || 'CPAI'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block border-b border-[#E5E8ED] pb-2">
                  TOUR ITINERARY ({q.itineraryDays?.length || 0} DAYS)
                </span>
                <div className="space-y-3">
                  {q.itineraryDays && q.itineraryDays.length > 0 ? (
                    q.itineraryDays.map((day: any) => (
                      <div key={day.dayNumber} className="p-3 bg-[#F8FAFC] border border-[#E5E8ED]">
                        <span className="font-mono font-bold text-xs text-[#002037] block mb-0.5">
                          Day {day.dayNumber}: {day.title}
                        </span>
                        <p className="text-xs text-[#4A5568] leading-relaxed">{day.description}</p>
                        {day.meals && (
                          <span className="text-[10px] text-[#718096] mt-1 block">Meals: {day.meals}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#718096]">Standard flexible tour itinerary configured.</p>
                  )}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#168653] block border-b border-[#E5E8ED] pb-1.5">
                  WHAT IS INCLUDED
                </span>
                <ul className="text-xs space-y-1.5 text-[#334155]">
                  {(q.inclusions || []).map((inc: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#168653] font-bold">✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D54747] block border-b border-[#E5E8ED] pb-1.5">
                  WHAT IS EXCLUDED
                </span>
                <ul className="text-xs space-y-1.5 text-[#64748B]">
                  {(q.exclusions || []).map((exc: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#D54747] font-bold">✕</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Revision Snapshots History */}
            {snapshots.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block border-b border-[#E5E8ED] pb-2">
                  IMMUTABLE SENT SNAPSHOTS ({snapshots.length})
                </span>
                <div className="space-y-2">
                  {snapshots.map((snap: any) => (
                    <div key={snap.id} className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-[#153650]">Version {snap.version}</span>
                        <span className="text-[#718096] ml-2">Sent to {snap.sentToEmail}</span>
                        <span className="text-[10px] text-[#718096] block">
                          Dispatched: {new Date(snap.sentAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#168653]">
                        ₹{Number(snap.totalAmountInr).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1 COL: CLIENT & ACTIONS */}
          <div className="space-y-6">
            {/* Customer Dossier Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block border-b border-[#E5E8ED] pb-2">
                CLIENT DOSSIER
              </span>

              <div>
                <span className="text-sm font-bold text-[#153650] block">{c.fullName || 'Valued Guest'}</span>
                <span className="text-xs text-[#718096] block font-mono">{c.phoneNumber || 'N/A'}</span>
                {c.email && <span className="text-xs text-[#24689B] block">{c.email}</span>}
                <span className="text-xs text-[#718096] block mt-1">{c.city || 'Gujarat, India'}</span>
              </div>

              {lead && (
                <div className="pt-3 border-t border-[#E5E8ED]">
                  <span className="text-[10px] font-mono text-[#718096] block">LINKED CRM ENQUIRY</span>
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-xs font-bold text-[#24689B] hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>{lead.referenceId}</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              )}
            </div>

            {/* Resend Email Logs Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block border-b border-[#E5E8ED] pb-2">
                RESEND EMAIL DISPATCH LOGS
              </span>

              {emailLogs.length === 0 ? (
                <p className="text-xs text-[#718096]">No emails dispatched yet for this quotation.</p>
              ) : (
                <div className="space-y-2.5">
                  {emailLogs.map((log: any) => (
                    <div key={log.id} className="p-2.5 bg-[#F8FAFC] border border-[#E5E8ED] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 ${
                          log.status === 'SENT' || log.status === 'PROVIDER_ACCEPTED'
                            ? 'bg-[#DEF7EC] text-[#03543F]'
                            : log.status === 'SIMULATED'
                            ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                            : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-[10px] text-[#718096]">
                          {new Date(log.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#153650] block truncate">To: {log.recipientEmail}</span>
                      {log.errorMessage && (
                        <span className="text-[10px] text-[#D54747] block">{log.errorMessage}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full py-2 bg-[#002037] hover:bg-[#153650] text-white text-xs font-bold rounded-none inline-flex items-center justify-center gap-1.5"
              >
                <Send size={13} className="text-[#E9B95E]" />
                <span>Send Quotation Email</span>
              </button>
            </div>

            {/* Payment & Bank Remittance Instructions */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-2 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096] block border-b border-[#E5E8ED] pb-2">
                OFFICIAL BANK DETAILS
              </span>
              <div className="space-y-1 text-[#334155] font-mono text-[11px]">
                <p><strong>Bank:</strong> ICICI Bank (Anand Station Rd)</p>
                <p><strong>A/C Name:</strong> Varni Holidays Pvt. Ltd.</p>
                <p><strong>A/C No:</strong> 025605009876</p>
                <p><strong>IFSC:</strong> ICIC0000256</p>
                <p><strong>UPI ID:</strong> varniinternational7@okicici</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================= */}
      {/* SEND EMAIL MODAL */}
      {/* ========================================= */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD5E1] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#718096]">
                  DISPATCH OFFICIAL PROPOSAL
                </span>
                <h3 className="text-sm font-bold text-[#153650]">Send Quotation via Resend</h3>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-[#718096] hover:text-[#153650]">
                <X size={16} />
              </button>
            </div>

            {emailFeedback && (
              <div className={`p-3 text-xs font-semibold rounded-none ${
                emailFeedback.type === 'success'
                  ? 'bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]'
                  : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
              }`}>
                {emailFeedback.text}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Recipient Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] font-semibold rounded-none focus:outline-none focus:border-[#24689B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Personalized Message to Client
                </label>
                <textarea
                  rows={4}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
                />
              </div>

              <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-2 text-[11px] text-[#15803D]">
                <CheckCircle2 size={15} />
                <span>Verified PDF attachment (<strong>{q.quotationNumber}.pdf</strong>) will be generated and attached automatically.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] text-xs font-semibold text-[#718096] hover:text-[#153650]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  className="px-5 py-2 bg-[#002037] hover:bg-[#153650] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {emailSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} className="text-[#E9B95E]" />
                      <span>Confirm & Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* PDF PREVIEW MODAL */}
      {/* ========================================= */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col p-4 sm:p-6">
          <div className="bg-white border border-[#CBD5E1] shadow-2xl flex-1 flex flex-col max-w-5xl mx-auto w-full overflow-hidden">
            <div className="p-3 bg-[#002037] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer size={15} className="text-[#E9B95E]" />
                <span className="font-mono font-bold text-xs">PDF Preview: {q.quotationNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/quotations/${q.id}/pdf?download=1`}
                  className="px-3 py-1 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#153650] text-xs font-bold inline-flex items-center gap-1"
                >
                  <Download size={12} />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1 hover:bg-white/10 text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#525659] p-2">
              <iframe
                src={`/api/quotations/${q.id}/pdf`}
                className="w-full h-full border-0 bg-white"
                title="Quotation PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

