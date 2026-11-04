'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CrmHeader from '@/components/crm/CrmHeader';
import { getQuotationsAction, getLeadsAction, getCustomersAction } from '@/app/actions/crm';
import { createQuotationAction, convertQuotationToBookingAction, updateQuotationStatusAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';

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

    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead) return;

    setCreating(true);
    const { subtotal, netCost, total } = calculateTotals();

    const formattedItems = lineItems.map((item, idx) => ({
      itemOrder: idx + 1,
      description: item.description,
      serviceCategory: item.serviceCategory,
      quantity: Number(item.quantity) || 1,
      unitPriceInr: Number(item.unitPriceInr) || 0,
      supplierCostInr: Number(item.supplierCostInr) || 0,
      totalAmountInr: (Number(item.unitPriceInr) || 0) * (Number(item.quantity) || 1),
    }));

    const validUntilDate = new Date(Date.now() + validDays * 86400000).toISOString();

    const res = await createQuotationAction({
      leadId: lead.id,
      customerId: lead.customerId,
      createdByUserId: currentUser.id,
      createdByName: currentUser.fullName,
      title: quoteTitle,
      subtotalInr: subtotal,
      taxesInr: 0,
      discountInr: 0,
      totalAmountInr: total,
      supplierNetCostInr: netCost,
      validUntil: validUntilDate,
      terms: termsText,
      lineItems: formattedItems,
    });

    setCreating(false);

    if (res.success && res.quotation) {
      setShowModal(false);
      setActionMsg({ text: `Quotation ${res.quotation.quotationNumber} created successfully!`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to create quotation', type: 'error' });
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    if (filterStatus === 'ALL') return true;
    return q.status === filterStatus;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900 font-sans">
      <CrmHeader
        title="Quotations & Client Proposals"
        subtitle="Itemized multi-service travel proposals, branded PDF generation, and customer acceptance."
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {actionMsg && (
          <div className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-slate-500 hover:text-slate-800">×</button>
          </div>
        )}

        {/* Filter Bar & Create Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Create New Quotation</span>
          </button>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Quote Ref</th>
                  <th className="px-5 py-3.5">Proposal Title</th>
                  <th className="px-5 py-3.5">Customer / Lead</th>
                  <th className="px-5 py-3.5">Quoted Total</th>
                  {currentUser.canViewSupplierCosts && (
                    <th className="px-5 py-3.5 text-rose-700">Net Cost</th>
                  )}
                  {currentUser.canViewSupplierCosts && (
                    <th className="px-5 py-3.5 text-emerald-700">Margin</th>
                  )}
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Valid Until</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={currentUser.canViewSupplierCosts ? 9 : 7} className="px-6 py-12 text-center text-slate-500">
                      Loading quotations...
                    </td>
                  </tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={currentUser.canViewSupplierCosts ? 9 : 7} className="px-6 py-12 text-center text-slate-500">
                      No quotations found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => {
                    const margin = q.supplierNetCostInr ? q.totalAmountInr - q.supplierNetCostInr : null;
                    const customer = customers.find((c) => c.id === q.customerId);

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          <Link href={`/employee/quotations/${q.id}`} className="hover:text-indigo-600 hover:underline">
                            {q.quotationNumber}
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 block">{q.title}</span>
                          <span className="text-[11px] text-slate-500">
                            {q.lineItems?.length || 0} line items • By {q.createdByName}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-800 block">
                            {customer ? customer.fullName : 'Customer'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {customer?.phoneNumber}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-mono font-bold text-slate-900 text-sm">
                          ₹{q.totalAmountInr.toLocaleString('en-IN')}
                        </td>

                        {currentUser.canViewSupplierCosts && (
                          <td className="px-5 py-4 font-mono text-slate-600 font-medium">
                            {q.supplierNetCostInr ? `₹${q.supplierNetCostInr.toLocaleString('en-IN')}` : '—'}
                          </td>
                        )}

                        {currentUser.canViewSupplierCosts && (
                          <td className="px-5 py-4 font-bold text-emerald-700">
                            {margin !== null ? `₹${margin.toLocaleString('en-IN')}` : '—'}
                          </td>
                        )}

                        <td className="px-5 py-4">
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            q.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : q.status === 'SENT'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : q.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {q.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-600 text-[11px]">
                          {new Date(q.validUntil).toLocaleDateString('en-IN')}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/employee/quotations/${q.id}`}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                            >
                              View PDF
                            </Link>

                            {q.status !== 'ACCEPTED' && (
                              <button
                                onClick={() => handleConvertBooking(q.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors"
                                title="Accept and generate booking in PENDING status"
                              >
                                Accept & Book
                              </button>
                            )}

                            <select
                              value={q.status}
                              onChange={(e) => handleStatusChange(q.id, e.target.value)}
                              className="text-[11px] bg-white border border-slate-200 rounded-lg p-1 text-slate-700 focus:outline-none"
                            >
                              <option value="DRAFT">DRAFT</option>
                              <option value="SENT">SENT</option>
                              <option value="ACCEPTED">ACCEPTED</option>
                              <option value="REJECTED">REJECTED</option>
                              <option value="EXPIRED">EXPIRED</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Formal Travel Proposal</h3>
                <p className="text-xs text-slate-500">Draft an itemized quotation for an active lead.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Lead / Customer</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => {
                    setSelectedLeadId(e.target.value);
                    const sel = leads.find((l) => l.id === e.target.value);
                    if (sel && !quoteTitle) {
                      setQuoteTitle(`Travel Proposal: ${sel.referenceId} - ${sel.serviceType}`);
                    }
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                >
                  <option value="">-- Choose Lead --</option>
                  {leads.map((l) => {
                    const c = customers.find((cust) => cust.id === l.customerId);
                    return (
                      <option key={l.id} value={l.id}>
                        {l.referenceId} • {c ? c.fullName : 'Customer'} ({l.serviceType} - {l.stage})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  placeholder="e.g. Kerala 6N/7D Deluxe Family Vacation"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">Line Items & Services</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={item.serviceCategory}
                          onChange={(e) => updateLineItem(idx, 'serviceCategory', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                        >
                          <option value="PACKAGE">Package</option>
                          <option value="FLIGHT">Flight</option>
                          <option value="HOTEL">Hotel</option>
                          <option value="VISA">Visa</option>
                          <option value="TRANSFER">Transfer</option>
                          <option value="CRUISE">Cruise</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Selling Price"
                          value={item.unitPriceInr}
                          onChange={(e) => updateLineItem(idx, 'unitPriceInr', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                          required
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <input
                          type="number"
                          placeholder="Net Cost"
                          value={item.supplierCostInr}
                          onChange={(e) => updateLineItem(idx, 'supplierCostInr', Number(e.target.value))}
                          className="w-20 bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono text-slate-500"
                          title="Confidential supplier net cost"
                        />
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(idx)}
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Preview */}
              <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Validity:</span>{' '}
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-14 bg-white border border-slate-300 rounded p-1 text-center"
                  />{' '}
                  days
                </div>
                <div className="text-right">
                  <span className="text-slate-500 mr-2">Total Quoted:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{calculateTotals().total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs disabled:opacity-50"
                >
                  {creating ? 'Creating Proposal...' : 'Generate Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
