'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CrmHeader from '@/components/crm/CrmHeader';
import { getQuotationsAction, getLeadsAction, getCustomersAction } from '@/app/actions/crm';
import { createQuotationAction, convertQuotationToBookingAction, updateQuotationStatusAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import { COMPANY_CONTACT } from '@/lib/config/contact';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  X,
  CreditCard,
  Trash2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
export default function QuotationsPage() {
  const router = useRouter();
  const { currentUser, isSuperAdmin } = useCrm();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  // New Quotation Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [quoteTitle, setQuoteTitle] = useState('');
  const [lineItems, setLineItems] = useState<Array<{ description: string; serviceCategory: string; quantity: number; unitPriceInr: number; supplierCostInr: number }>>([
    { description: 'Package / Flight / Hotel Service', serviceCategory: 'PACKAGE', quantity: 2, unitPriceInr: 25000, supplierCostInr: 20000 },
  ]);
  const [validDays, setValidDays] = useState(7);
  const [termsText, setTermsText] = useState('50% advance deposit required upon acceptance. Balance due 7 days prior to departure.');
  const [creating, setCreating] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const loadData = async () => {
    setLoading(true);
    const [quotesData, leadsData, custsData] = await Promise.all([
      getQuotationsAction(),
      getLeadsAction(),
      getCustomersAction(),
    ]);
    setQuotations(quotesData || []);
    setLeads(leadsData || []);
    setCustomers(custsData || []);
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleStatusChange = async (quotationId: string, newStatus: any) => {
    const res = await updateQuotationStatusAction(quotationId, newStatus, currentUser.id);
    if (res.success) {
      await loadData();
    }
  };
  const handleConvertBooking = async (quotationId: string) => {
    const res = await convertQuotationToBookingAction(quotationId, currentUser.id);
    if (res.success && res.booking) {
      router.push(`/employee/bookings/${res.booking.id}`);
    } else {
      setActionMsg({ text: res.error || 'Failed to convert to booking', type: 'error' });
    }
  };
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: 'Additional Tour Service / Addon', serviceCategory: 'HOTEL', quantity: 1, unitPriceInr: 5000, supplierCostInr: 4000 },
    ]);
  };
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };
  const updateLineItem = (index: number, field: string, val: any) => {
    const copy = [...lineItems];
    (copy[index] as any)[field] = val;
    setLineItems(copy);
  };
  const calculateTotals = () => {
    let subtotal = 0;
    let netCost = 0;
    lineItems.forEach((item) => {
      subtotal += (item.unitPriceInr || 0) * (item.quantity || 1);
      netCost += (item.supplierCostInr || 0) * (item.quantity || 1);
    });
    return { subtotal, netCost, total: subtotal };
  };
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !quoteTitle) {
      setActionMsg({ text: 'Please select a lead and provide a quotation title', type: 'error' });
      return;
    }
    setCreating(true);
    const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString();
    const totals = calculateTotals();
    const targetLead = leads.find((l) => l.id === selectedLeadId);
    const customerId = targetLead?.customerId || 'cust-101-chirag-patel';
    const res = await createQuotationAction({
      leadId: selectedLeadId,
      customerId,
      title: quoteTitle,
      subtotalInr: totals.subtotal,
      taxesInr: 0,
      discountInr: 0,
      supplierNetCostInr: totals.netCost,
      totalAmountInr: totals.total,
      terms: termsText,
      validUntil,
      createdByUserId: currentUser.id,
      createdByName: currentUser.fullName,
      lineItems: lineItems.map((li, idx) => ({
        itemOrder: idx + 1,
        description: li.description,
        serviceCategory: li.serviceCategory,
        quantity: Number(li.quantity),
        unitPriceInr: Number(li.unitPriceInr),
        supplierCostInr: Number(li.supplierCostInr),
        totalAmountInr: Number(li.unitPriceInr) * Number(li.quantity),
      })),
    });
    setCreating(false);
    if (res.success && res.quotation) {
      setShowModal(false);
      setActionMsg({ text: `Quotation ${res.quotation.quotationNumber} created with immutable pricing snapshot!`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to create quotation', type: 'error' });
    }
  };
  const handleQuickWhatsApp = (q: any) => {
    const cust = customers.find((c) => c.id === q.customerId);
    const phone = `${cust?.phoneCountryCode || '+91'}${cust?.phoneNumber || ''}`.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://varni-holidays.vercel.app';
    const publicUrl = `${origin}/quotation/${q.quotationReference || q.quotationNumber || q.id}`;
    const msg = `*VARNI HOLIDAYS - OFFICIAL TRAVEL QUOTATION*
Namaste ${cust?.fullName || q.customerName || 'Travel Guest'}! 🙏

Greetings from Varni Holidays Anand! Your customized proposal (${q.quotationReference || q.quotationNumber}) is ready:
✈️ *Package:* ${q.title}
💰 *Total Amount:* ₹${(q.totalAmountInr ?? q.finalPayableAmountInr ?? 0).toLocaleString('en-IN')} (All Taxes Included)
⏳ *Valid Until:* ${new Date(q.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}

📄 *View & Download Official Quotation:*
${publicUrl}

Please reply to this message to confirm your reservation!

Warm regards,
*Varni Holidays Anand*
📞 ${COMPANY_CONTACT.phone.display}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredQuotes = quotations.filter((q) => {
    if (filterStatus === 'ALL') return true;
    return q.status === filterStatus;
  });
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Quotations Desk"
        subtitle="Multi-service quotation builder, immutable pricing snapshots, and customer acceptance."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 rounded-md bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle size={14} />
            <span>New Quotation</span>
          </button>
        }
      />
      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        {actionMsg && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
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
        {/* Filter Bar */}
        <div className="bg-[#17191D] rounded-lg p-3 flex items-center justify-between gap-3 border border-[#2A2E34]">
          <div className="flex items-center gap-2">
            {(['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-[#1D2025] text-[#F4F4F2] border border-[#2A2E34]'
                    : 'text-[#969CA5] hover:text-[#F4F4F2]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-[#969CA5] px-2 py-0.5 rounded bg-[#1D2025] border border-[#2A2E34]">
            {filteredQuotes.length} Records
          </span>
        </div>
        {/* Quotations Data Table */}
        <div className="bg-[#17191D] rounded-lg overflow-hidden border border-[#2A2E34]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101113] text-[#666E79] uppercase text-[10px] font-medium tracking-wider border-b border-[#2A2E34]">
                <tr>
                  <th className="px-4 py-3">Quote Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Title / Service</th>
                  <th className="px-4 py-3">Quoted Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2329] text-[#969CA5]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#666E79]">
                      Loading quotation records...
                    </td>
                  </tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#666E79]">
                      No quotation records found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-[#1D2025]/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-[#F4F4F2] whitespace-nowrap">
                        <Link href={`/employee/quotations/${q.id}`} className="hover:text-[#E9B95E] transition-colors">
                          {q.quotationReference || q.quotationNumber || q.id}
                        </Link>
                        <span className="block text-[10px] text-[#666E79] font-sans">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-[#F4F4F2] block">{q.customerName || (q.customer?.fullName) || 'Customer'}</span>
                        <span className="text-[10px] text-[#666E79] font-mono">{q.leadReference || (q.lead?.referenceId) || q.leadId}</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-[#F4F4F2]">
                        {q.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono tabular-nums font-semibold text-[#55B98A]">
                        ₹{(q.totalAmountInr ?? q.finalPayableAmountInr ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={q.status}
                          onChange={(e) => handleStatusChange(q.id, e.target.value)}
                          className="text-[11px] bg-[#1D2025] text-[#F4F4F2] rounded px-2 py-1 border border-[#2A2E34] focus:outline-none cursor-pointer"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="SENT">SENT</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="EXPIRED">EXPIRED</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[#666E79] font-mono text-[11px]">
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '7 days'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {q.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleConvertBooking(q.id)}
                              className="px-2 py-0.5 rounded bg-[#55B98A]/15 text-[#55B98A] border border-[#55B98A]/30 text-[11px] font-medium hover:bg-[#55B98A]/25 transition-colors"
                            >
                              Convert to Booking
                            </button>
                          )}
                          <button
                            onClick={() => handleQuickWhatsApp(q)}
                            className="p-1 px-2 rounded bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
                            title="Send Quotation to Client via WhatsApp"
                          >
                            <MessageSquare size={12} />
                            <span>WhatsApp</span>
                          </button>
                          <Link
                            href={`/employee/quotations/${q.id}`}
                            className="inline-flex items-center gap-1 text-xs text-[#E9B95E] hover:underline"
                          >
                            <span>Preview</span>
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {/* New Quotation Builder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] p-5 w-full max-w-2xl space-y-4 my-8 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F2]">Create Multi-Service Quotation</h3>
                <p className="text-xs text-[#969CA5]">Build line items with immutable pricing snapshot verification</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#969CA5] hover:text-[#F4F4F2]">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Target Lead</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                    required
                  >
                    <option value="">Select customer enquiry...</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.customer?.fullName} — {l.referenceId} ({l.serviceType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Quotation Title</label>
                  <input
                    type="text"
                    value={quoteTitle}
                    onChange={(e) => setQuoteTitle(e.target.value)}
                    placeholder="e.g. Kerala 6N/7D Winter Luxury Tour"
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                    required
                  />
                </div>
              </div>
              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#666E79] uppercase">Line Items</span>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs text-[#E9B95E] hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34] space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                          placeholder="Description..."
                          className="w-full p-1.5 rounded bg-[#17191D] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          className="w-full p-1.5 rounded bg-[#17191D] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                          min="1"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.unitPriceInr}
                          onChange={(e) => updateLineItem(idx, 'unitPriceInr', Number(e.target.value))}
                          placeholder="Unit Price (₹)"
                          className="w-full p-1.5 rounded bg-[#17191D] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                          min="0"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="text-[#666E79] hover:text-[#DF7373]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Totals Preview */}
              <div className="p-3 rounded bg-[#1D2025] border border-[#2A2E34] flex items-center justify-between text-xs">
                <span className="text-[#969CA5]">Quoted Customer Total:</span>
                <span className="text-base font-semibold text-[#55B98A] font-mono tabular-nums">
                  ₹{calculateTotals().total.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E34]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-[#969CA5] hover:text-[#F4F4F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#E9B95E] text-[#101113] hover:bg-[#F0C878] transition-colors"
                >
                  {creating ? 'Creating Snapshot...' : 'Issue Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
