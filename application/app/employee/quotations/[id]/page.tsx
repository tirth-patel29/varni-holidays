'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getQuotationDetailsAction, convertQuotationToBookingAction, sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import { COMPANY_CONTACT } from '@/lib/config/contact';
import {
  ArrowLeft,
  Printer,
  Mail,
  MessageSquare,
  CheckCircle2,
  X,
  ShieldCheck,
  Building,
  Phone,
  Calendar,
  User,
  Check,
  CreditCard,
  Send,
  ExternalLink,
} from 'lucide-react';

export default function QuotationPdfPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCrm();
  const quotationId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!quotationId) return;
      setLoading(true);
      const res = await getQuotationDetailsAction(quotationId);
      if (res.success) {
        setData(res);
      } else {
        setActionMsg({ text: res.error || 'Failed to load quotation', type: 'error' });
      }
      setLoading(false);
    }
    load();
  }, [quotationId]);

  const handlePrint = () => {
    window.print();
  };

  const handleConvertBooking = async () => {
    if (!data?.quotation) return;
    setConverting(true);
    const res = await convertQuotationToBookingAction(data.quotation.id, currentUser.id);
    setConverting(false);
    if (res.success && res.booking) {
      router.push(`/employee/bookings/${res.booking.id}`);
    } else {
      setActionMsg({ text: res.error || 'Failed to convert quotation to booking', type: 'error' });
    }
  };

  const handleSendEmail = async () => {
    if (!data?.quotation || !data?.customer) return;
    const res = await sendCustomerUpdateAction({
      customerId: data.customer.id,
      quotationId: data.quotation.id,
      senderUserId: currentUser.id,
      senderUserName: currentUser.fullName,
      channel: 'EMAIL',
      category: 'QUOTATION_PREPARED',
      templateTitle: `Official Quotation: ${data.quotation.title}`,
      recipientContact: data.customer.email,
      content: `Dear ${data.customer.fullName},\n\nPlease review your customized travel quotation (${data.quotation.quotationNumber}) for "${data.quotation.title}".\n\nTotal Quoted Amount: ₹${(data?.quotation?.totalAmountInr ?? 0).toLocaleString('en-IN')}.\nValid Until: ${new Date(data.quotation.validUntil).toLocaleDateString('en-IN')}.\n\nTerms: ${data.quotation.terms}\n\nWarm regards,\nVarni Holidays Anand`,
    });

    if (res.success) {
      setActionMsg({ text: `Email dispatched to ${data.customer.email} (Status: ${res.deliveryStatus})`, type: 'success' });
    } else {
      setActionMsg({ text: res.error || 'Failed to send email', type: 'error' });
    }
  };

  const handleWhatsAppShare = async () => {
    if (!data?.quotation || !data?.customer) return;
    const phone = `${data.customer.phoneCountryCode || '+91'}${data.customer.phoneNumber}`.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://varni-holidays.vercel.app';
    const publicUrl = `${origin}/quotation/${data.quotation.quotationNumber || data.quotation.id}`;

    const messageText = `*VARNI HOLIDAYS - OFFICIAL TRAVEL QUOTATION*
Namaste ${data.customer.fullName}! 🙏

Greetings from Varni Holidays, Anand! We have prepared your customized travel quotation proposal:

📋 *Quotation Ref:* ${data.quotation.quotationNumber}
✈️ *Package:* ${data.quotation.title}
💰 *Total Amount:* ₹${(data?.quotation?.totalAmountInr ?? 0).toLocaleString('en-IN')} (All Taxes Included)
⏳ *Valid Until:* ${new Date(data.quotation.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}

💳 *Official Bank Details (Varni Holidays):*
• Bank: HDFC Bank Ltd.
• Account Name: Varni Holidays
• A/C No: 50200012345678
• IFSC: HDFC0001234
• Branch: Anand, Gujarat
• UPI ID: varniholidays@okaxis

📄 *View / Download Your Official PDF Quotation:*
${publicUrl}

To confirm your reservation or adjust any details, please reply directly to this message.

Warm regards,
*Neel Patel & Tour Operations Team*
*Varni Holidays, Anand (Gujarat)*
📞 ${COMPANY_CONTACT.phone.display}`;

    await sendCustomerUpdateAction({
      customerId: data.customer.id,
      quotationId: data.quotation.id,
      senderUserId: currentUser.id,
      senderUserName: currentUser.fullName,
      channel: 'WHATSAPP',
      category: 'QUOTATION_PREPARED',
      templateTitle: `Quotation ${data.quotation.quotationNumber}`,
      recipientContact: `+${cleanPhone}`,
      content: messageText,
    });

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
    setActionMsg({ text: 'Official quotation dispatched to WhatsApp client!', type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101113] flex items-center justify-center p-8 text-[#969CA5]">
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="w-5 h-5 border-2 border-[#E9B95E] border-t-transparent rounded-full animate-spin" />
          <span>Generating Branded Quotation Preview...</span>
        </div>
      </div>
    );
  }

  const q = data?.quotation;
  const c = data?.customer;
  const lineItems = data?.lineItems || q?.lineItems || [];

  return (
    <div className="min-h-screen bg-[#101113] text-[#F4F4F2] flex flex-col font-sans">
      {/* Print Specific Global Stylesheet */}
      <style jsx global>{`
        @media print {
          body, html {
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-sheet {
            background: #ffffff !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-sheet * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .print-header {
            border-bottom: 2px solid #0f172a !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 700 !important;
            border-bottom: 1px solid #cbd5e1 !important;
          }
          .print-table td {
            border-bottom: 1px solid #e2e8f0 !important;
            color: #1e293b !important;
          }
          .print-total-box {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden on Print) */}
      <header className="no-print bg-[#17191D] border-b border-[#2A2E34] px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/quotations"
            className="p-1.5 rounded-md bg-[#1D2025] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] transition-colors"
            title="Back to Quotations Desk"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-[#F4F4F2] font-mono">{q?.quotationNumber || 'Quotation Preview'}</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${
                q?.status === 'ACCEPTED' ? 'bg-[#55B98A]/15 text-[#55B98A] border border-[#55B98A]/30' :
                q?.status === 'SENT' ? 'bg-[#6FA9D8]/15 text-[#6FA9D8] border border-[#6FA9D8]/30' :
                'bg-[#969CA5]/15 text-[#969CA5] border border-[#969CA5]/30'
              }`}>
                {q?.status}
              </span>
            </div>
            <p className="text-[11px] text-[#969CA5] truncate max-w-md">{q?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Printable PDF Trigger */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-md bg-[#1D2025] hover:bg-[#2A2E34] text-xs font-medium text-[#F4F4F2] border border-[#2A2E34] inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer size={14} className="text-[#E9B95E]" />
            <span>Print / Save PDF</span>
          </button>

          {/* One-Click WhatsApp Trigger */}
          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-1.5 rounded-md bg-[#25D366]/20 hover:bg-[#25D366]/30 text-xs font-semibold text-[#25D366] border border-[#25D366]/40 inline-flex items-center gap-1.5 transition-all shadow-sm"
          >
            <MessageSquare size={14} />
            <span>Send to Client on WhatsApp</span>
          </button>

          <button
            onClick={handleSendEmail}
            className="px-3 py-1.5 rounded-md bg-[#1D2025] hover:bg-[#2A2E34] text-xs font-medium text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] inline-flex items-center gap-1.5 transition-colors"
          >
            <Mail size={13} />
            <span>Email</span>
          </button>

          <button
            onClick={handleConvertBooking}
            disabled={converting || q?.status === 'ACCEPTED'}
            className="px-3.5 py-1.5 rounded-md bg-[#E9B95E] hover:bg-[#F0C878] disabled:opacity-50 text-[#101113] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <CheckCircle2 size={13} />
            <span>{q?.status === 'ACCEPTED' ? 'Booking Converted' : 'Convert to Booking'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        {actionMsg && (
          <div
            className={`no-print w-full max-w-4xl mb-4 p-3 rounded-lg border text-xs flex items-center justify-between ${
              actionMsg.type === 'success'
                ? 'bg-[#55B98A]/10 border-[#55B98A]/30 text-[#55B98A]'
                : 'bg-[#DF7373]/10 border-[#DF7373]/30 text-[#DF7373]'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-[#969CA5] hover:text-[#F4F4F2]">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* OFFICIAL EXECUTIVE PRINTABLE QUOTATION SHEET (A4 FORMAT)       */}
        {/* ============================================================== */}
        <div className="print-sheet w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl p-8 md:p-12 space-y-7 border border-slate-200">
          
          {/* Header & Letterhead */}
          <div className="print-header pb-6 border-b-2 border-slate-900 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-serif font-black tracking-tight text-slate-950 uppercase">
                  Varni Holidays
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Private Travel Concierge
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Anand Headquarters: {COMPANY_CONTACT.address.full}</p>
              <p className="text-xs text-slate-500">Phone: {COMPANY_CONTACT.phone.display} • Email: {COMPANY_CONTACT.email.primary} • GSTIN: {COMPANY_CONTACT.gstin}</p>
            </div>

            <div className="md:text-right">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">Official Proposal</span>
              <span className="text-base font-mono font-bold text-slate-950 block">{q?.quotationNumber}</span>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <div>Date: <strong className="text-slate-800">{new Date(q?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
                <div>Valid Until: <strong className="text-amber-800">{new Date(q?.validUntil || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
              </div>
            </div>
          </div>

          {/* Recipient & Trip Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                Prepared For (Passenger / Client)
              </span>
              <div className="text-sm font-bold text-slate-950">{c?.fullName || 'Travel Guest'}</div>
              <div className="text-slate-700 font-mono mt-0.5 font-medium">{c?.phoneCountryCode || '+91'} {c?.phoneNumber}</div>
              <div className="text-slate-600">{c?.email || 'Direct Phone Client'}</div>
              <div className="text-slate-500 mt-0.5">{c?.city || 'Anand, Gujarat'}</div>
            </div>

            <div className="md:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                Destination Itinerary & Specialist
              </span>
              <div className="text-sm font-bold text-slate-950">{q?.title}</div>
              <div className="text-slate-600 mt-0.5">Specialist: <strong className="text-slate-800">{q?.createdByName || 'Neel Patel (Super Admin)'}</strong></div>
              <div className="text-slate-500">Service: Varni Premium Leisure Desk</div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-700 mb-2">Itemized Services & Tour Specifications</h3>
            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="print-table w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Service & Accommodation Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lineItems.map((li: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono text-slate-500">{li.itemOrder || idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{li.description}</td>
                      <td className="py-3 px-3 uppercase text-[10px] font-medium text-slate-600">{li.serviceCategory}</td>
                      <td className="py-3 px-3 text-center tabular-nums font-medium text-slate-800">{li.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        ₹{(li.unitPriceInr ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-950 tabular-nums">
                        ₹{(li.totalPriceInr ?? 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & Financial Totals Breakdown */}
          <div className="print-total-box bg-slate-50 rounded-lg p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <ShieldCheck size={16} />
                <span>Verified Direct Tariff • All Applicable Taxes & Surcharges Included</span>
              </div>
              <p className="text-[11px] text-slate-500">Includes private transport, accommodation, meal plan as booked, driver allowances, tolls & permits.</p>
            </div>

            <div className="w-full md:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">₹{(q?.subtotalInr || q?.totalAmountInr || 0).toLocaleString('en-IN')}</span>
              </div>
              {q?.discountInr > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Consideration:</span>
                  <span className="font-mono tabular-nums">-₹{q.discountInr.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST (5%):</span>
                <span className="font-mono tabular-nums">Included in Price</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between text-base font-bold text-slate-950">
                <span>Final Payable:</span>
                <span className="font-mono text-emerald-700 tabular-nums">₹{(q?.totalAmountInr ?? 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-200">
              <span className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider block mb-2">
                ✓ What is Included in this Package
              </span>
              <ul className="space-y-1 text-slate-700">
                {(q?.inclusions && q.inclusions.length > 0
                  ? q.inclusions
                  : [
                      'Hotel / Resort accommodation with breakfast as specified',
                      'Dedicated Private AC Vehicle with courteous English/Hindi speaking chauffeur',
                      'Pickup and drop transfers from Cochin / Trivandrum Airport or Railway Station',
                      'All interstate highway tolls, state road taxes, parking and driver daily bata',
                    ]
                ).map((inc: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50/60 p-4 rounded-lg border border-rose-200">
              <span className="font-bold text-rose-950 uppercase text-[10px] tracking-wider block mb-2">
                ✗ What is Excluded
              </span>
              <ul className="space-y-1 text-slate-700">
                {(q?.exclusions && q.exclusions.length > 0
                  ? q.exclusions
                  : [
                      'Airfare or Train tickets (unless specifically booked)',
                      'Personal expenses (laundry, telephone calls, room service, alcoholic beverages)',
                      'Monument entrance tickets, boating charges, optional adventure safari tickets',
                      'Any services not explicitly mentioned under package inclusions',
                    ]
                ).map((exc: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bank Transfer & Payment Details */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              <CreditCard size={14} className="text-amber-700" />
              <span>Official Payment & Bank Transfer Instructions (Varni Holidays)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-700 font-medium">
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Bank Name</span>
                <span className="font-bold text-slate-900">HDFC Bank Ltd.</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Beneficiary Name</span>
                <span className="font-bold text-slate-900">Varni Holidays</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Current Account No.</span>
                <span className="font-mono font-bold text-slate-900">50200012345678</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">IFSC Code & Branch</span>
                <span className="font-mono font-bold text-slate-900">HDFC0001234 (Anand Branch)</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <span>UPI Payments: <strong className="font-mono text-slate-900">varniholidays@okaxis</strong></span>
              <span>Payment terms: 50% advance for confirmation, balance 7 days before departure.</span>
            </div>
          </div>

          {/* Terms & Conditions */}
          {q?.terms && (
            <div className="text-xs text-slate-600 bg-slate-50/50 p-3.5 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Booking Policy & Travel Terms
              </span>
              <p className="leading-relaxed">{q.terms}</p>
            </div>
          )}

          {/* Signatures & Footer Stamp */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Thank you for choosing Varni Holidays!</p>
              <p className="text-[11px] text-slate-500">We ensure personalized attention, unmatched comfort, and memorable journeys.</p>
            </div>

            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400 w-44 ml-auto mb-1"></div>
              <span className="font-bold text-slate-900 block">Authorized Signatory</span>
              <span className="text-[10px] text-slate-500 uppercase">Varni Holidays Anand Desk</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
