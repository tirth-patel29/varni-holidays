'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getQuotationDetailsAction, convertQuotationToBookingAction, sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';

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
      content: `Dear ${data.customer.fullName},\n\nPlease review your customized travel quotation (${data.quotation.quotationNumber}) for "${data.quotation.title}".\n\nTotal Quoted Amount: ₹${data.quotation.totalAmountInr.toLocaleString('en-IN')}.\nValid Until: ${new Date(data.quotation.validUntil).toLocaleDateString('en-IN')}.\n\nTerms: ${data.quotation.terms}\n\nWarm regards,\nVarni Holidays Anand`,
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
      content: `Namaste ${data.customer.fullName}! Greetings from Varni Holidays Anand.\n\nYour travel quotation (${data.quotation.quotationNumber}) for "${data.quotation.title}" is ready.\nTotal: ₹${data.quotation.totalAmountInr.toLocaleString('en-IN')}.\nValid until: ${new Date(data.quotation.validUntil).toLocaleDateString('en-IN')}.\n\nPlease review and let us know if you wish to confirm!`,
    });

    if (res.clickToChatUrl) {
      window.open(res.clickToChatUrl, '_blank');
    }
    setActionMsg({ text: 'WhatsApp message prepared & click-to-chat triggered', type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Generating Branded Quotation PDF Document...</span>
        </div>
      </div>
    );
  }

  if (!data?.quotation) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
          <h2 className="text-lg font-bold text-slate-800">Quotation Not Found</h2>
          <p className="text-sm text-slate-600 mt-1 mb-4">The quotation identifier does not exist or has been archived.</p>
          <Link href="/employee/quotations" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
            Back to Quotations Desk
          </Link>
        </div>
      </div>
    );
  }

  const { quotation, customer, lead } = data;

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 pb-12">
      {/* Top Action Bar (Hidden during window.print()) */}
      <div className="print:hidden sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/employee/quotations"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Quotations Desk</span>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono font-bold text-amber-400">{quotation.quotationNumber}</span>
          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
            quotation.status === 'ACCEPTED'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : quotation.status === 'SENT'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'bg-slate-700 text-slate-300'
          }`}>
            {quotation.status}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">mail</span>
            <span>Email Client</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700/60 hover:bg-emerald-600 text-white border border-emerald-600/50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Print / Save PDF</span>
          </button>
          {quotation.status !== 'ACCEPTED' && (
            <button
              onClick={handleConvertBooking}
              disabled={converting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">task_alt</span>
              <span>{converting ? 'Converting...' : 'Accept & Create Booking'}</span>
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className={`print:hidden max-w-4xl mx-auto mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
          actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-500 hover:text-slate-800">×</button>
        </div>
      )}

      {/* Main Printable Quotation Document */}
      <div className="max-w-4xl mx-auto mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:m-0 print:max-w-full p-8 sm:p-12 font-sans">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-serif font-black text-2xl">
                V
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 leading-none">
                  VARNI HOLIDAYS
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mt-1">
                  Private Travel Desk & Luxury Tour Operator
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-4 leading-relaxed">
              <p className="font-semibold text-slate-800">Varni Holidays Head Office</p>
              <p>Station Road, Anand, Gujarat 388001</p>
              <p>Tel: +91 98250 12345 | Email: info@varniholidays.com</p>
              <p className="font-mono text-[11px] text-slate-500">GSTIN: 24AAACV1234F1Z8</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 mb-2">
              Formal Quotation
            </span>
            <div className="text-xl font-mono font-bold text-slate-900">{quotation.quotationNumber}</div>
            <div className="text-xs text-slate-500 mt-1">
              Date: <span className="font-semibold text-slate-700">{new Date(quotation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Valid Until: <span className="font-bold text-rose-700">{new Date(quotation.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Prepared by: <span className="font-medium text-slate-700">{quotation.createdByName}</span>
            </div>
          </div>
        </div>

        {/* Client & Proposal Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 p-6 bg-slate-50/70 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Quotation Presented To
            </span>
            <div className="text-base font-bold text-slate-900">{customer?.fullName || 'Valued Customer'}</div>
            <div className="text-xs text-slate-600 mt-1 leading-relaxed">
              <p>{customer?.city || 'Anand, Gujarat'}</p>
              <p>Phone: {customer?.phoneCountryCode} {customer?.phoneNumber}</p>
              <p>Email: {customer?.email || 'N/A'}</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Proposal Overview
            </span>
            <div className="text-sm font-bold text-slate-900">{quotation.title}</div>
            {lead && (
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <p>Enquiry Reference: <span className="font-mono font-semibold">{lead.referenceId}</span></p>
                <p>Service Type: <span className="font-semibold">{lead.serviceType}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="my-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
            Itemized Schedule of Services
          </h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-700 uppercase text-[10px] font-bold">
                <th className="py-2.5 pr-2 w-10">#</th>
                <th className="py-2.5 px-3">Service Description</th>
                <th className="py-2.5 px-3 w-24">Category</th>
                <th className="py-2.5 px-3 text-center w-16">Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Unit Price</th>
                <th className="py-2.5 pl-3 text-right w-32">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotation.lineItems?.map((item: any) => (
                <tr key={item.itemOrder} className="text-slate-800">
                  <td className="py-3 pr-2 font-mono text-slate-400">{item.itemOrder}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.serviceCategory}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{item.unitPriceInr.toLocaleString('en-IN')}</td>
                  <td className="py-3 pl-3 text-right font-mono font-bold text-slate-900">
                    ₹{item.totalAmountInr.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Financial Summary */}
        <div className="flex flex-col sm:flex-row justify-end border-t border-slate-200 pt-6">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">₹{quotation.subtotalInr.toLocaleString('en-IN')}</span>
            </div>
            {quotation.discountInr > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Special Courtesy Discount:</span>
                <span className="font-mono">- ₹{quotation.discountInr.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Taxes & GST (0% / Included):</span>
              <span className="font-mono font-medium">₹{quotation.taxesInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900 pt-2">
              <span>Total Payable:</span>
              <span className="font-mono text-emerald-800">₹{quotation.totalAmountInr.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Inclusions & Terms */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 pt-8 text-xs text-slate-600">
          <div>
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Key Terms & Conditions
            </h3>
            <p className="leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {quotation.terms}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Payment & Bank Remittance Details
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed space-y-1">
              <p><strong className="text-slate-800">Account Name:</strong> Varni Holidays Private Limited</p>
              <p><strong className="text-slate-800">Bank:</strong> HDFC Bank Ltd, Anand Main Branch</p>
              <p><strong className="text-slate-800">Account No:</strong> 50200088992211</p>
              <p><strong className="text-slate-800">IFSC Code:</strong> HDFC0000241</p>
              <p><strong className="text-slate-800">UPI ID:</strong> varniholidays@hdfcbank</p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-800">Authorized Signatory</p>
            <p>Varni Holidays (Anand Desk)</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800">Client Acceptance Signature</p>
            <p>Date: ________________________</p>
          </div>
        </div>
      </div>
    </div>
  );
}

