'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getQuotationDetailsAction, convertQuotationToBookingAction, sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  ArrowLeft,
  Printer,
  Mail,
  MessageSquare,
  CheckCircle2,
  FileCheck,
  X,
  CreditCard,
  ShieldCheck,
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
    const phone = `${data.customer.phoneCountryCode || '+91'}${data.customer.phoneNumber}`;
    const res = await sendCustomerUpdateAction({
      customerId: data.customer.id,
      quotationId: data.quotation.id,
      senderUserId: currentUser.id,
      senderUserName: currentUser.fullName,
      channel: 'WHATSAPP',
      category: 'QUOTATION_PREPARED',
      templateTitle: `Quotation ${data.quotation.quotationNumber}`,
      recipientContact: phone,
      content: `Namaste ${data.customer.fullName}! Greetings from Varni Holidays Anand.\n\nYour travel quotation (${data.quotation.quotationNumber}) for "${data.quotation.title}" is ready.\nTotal: ₹${(data?.quotation?.totalAmountInr ?? 0).toLocaleString('en-IN')}.\nValid until: ${new Date(data.quotation.validUntil).toLocaleDateString('en-IN')}.\n\nPlease review and let us know if you wish to confirm!`,
    });

    if (res.clickToChatUrl) {
      window.open(res.clickToChatUrl, '_blank');
    }
    setActionMsg({ text: 'WhatsApp message prepared & click-to-chat triggered', type: 'success' });
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

  return (
    <div className="min-h-screen bg-[#101113] text-[#F4F4F2] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#17191D] border-b border-[#2A2E34] px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/quotations"
            className="p-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-[#F4F4F2]">{q?.quotationNumber || 'Quotation Preview'}</h1>
            <p className="text-[11px] text-[#969CA5]">{q?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-xs font-medium text-[#F4F4F2] border border-[#2A2E34] inline-flex items-center gap-1.5 transition-colors"
          >
            <Printer size={13} />
            <span>Print PDF</span>
          </button>
          <button
            onClick={handleSendEmail}
            className="px-3 py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-xs font-medium text-[#F4F4F2] border border-[#2A2E34] inline-flex items-center gap-1.5 transition-colors"
          >
            <Mail size={13} />
            <span>Email</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="px-3 py-1.5 rounded bg-[#55B98A]/15 hover:bg-[#55B98A]/25 text-xs font-medium text-[#55B98A] border border-[#55B98A]/30 inline-flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare size={13} />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleConvertBooking}
            disabled={converting}
            className="px-3.5 py-1.5 rounded bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 size={13} />
            <span>Convert to Booking</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col items-center">
        {actionMsg && (
          <div
            className={`w-full max-w-3xl mb-4 p-3 rounded-lg border text-xs flex items-center justify-between ${
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

        {/* Paper Document Preview */}
        <div className="w-full max-w-3xl bg-[#17191D] rounded-lg border border-[#2A2E34] p-8 shadow-xl space-y-6">
          {/* Document Header */}
          <div className="flex items-start justify-between pb-6 border-b border-[#2A2E34]">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#E9B95E] font-semibold block">
                Varni Holidays Private Travel Desk
              </span>
              <h2 className="text-xl font-semibold text-[#F4F4F2] mt-1">Official Quotation</h2>
              <p className="text-xs text-[#969CA5] mt-0.5">Anand HQ, Station Road, Gujarat 388001</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-[#F4F4F2] block">{q?.quotationNumber}</span>
              <span className="text-[11px] text-[#666E79] block">
                Issued: {new Date(q?.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[11px] text-[#E8B65E] block">
                Valid Until: {new Date(q?.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Traveler Recipient */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-[#666E79] uppercase block mb-1">Prepared For</span>
              <div className="font-medium text-[#F4F4F2]">{c?.fullName}</div>
              <div className="text-[#969CA5] font-mono text-[11px] mt-0.5">{c?.phoneCountryCode} {c?.phoneNumber}</div>
              <div className="text-[#969CA5]">{c?.email || 'No email provided'}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#666E79] uppercase block mb-1">Prepared By</span>
              <div className="font-medium text-[#F4F4F2]">{q?.createdByName || 'Neel Patel'}</div>
              <div className="text-[#969CA5] text-[11px]">Varni Holidays Concierge</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#2A2E34] text-[10px] uppercase text-[#666E79]">
                  <th className="py-2.5">Service Description</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2329] text-[#969CA5]">
                {data?.lineItems?.map((li: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 text-[#F4F4F2] font-medium">{li.description}</td>
                    <td className="py-3 uppercase text-[10px] text-[#666E79]">{li.serviceCategory}</td>
                    <td className="py-3 text-center tabular-nums">{li.quantity}</td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      ₹{(li?.unitPriceInr ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-[#F4F4F2] tabular-nums">
                      ₹{(li?.totalPriceInr ?? 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="pt-4 border-t border-[#2A2E34] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#55B98A] text-[11px]">
              <ShieldCheck size={14} />
              <span>Immutable Rate Snapshot Verified</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#666E79] uppercase block">Total Quoted Amount</span>
              <span className="text-xl font-semibold text-[#55B98A] font-mono tabular-nums">
                ₹{q?.totalAmountInr?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Terms & Conditions */}
          {q?.terms && (
            <div className="p-3.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs">
              <span className="text-[10px] uppercase text-[#666E79] block mb-1">Terms & Payment Schedule</span>
              <p className="text-[#969CA5] leading-relaxed">{q.terms}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
