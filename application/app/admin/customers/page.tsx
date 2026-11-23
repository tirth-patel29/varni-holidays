'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  searchCustomersAction,
  createCustomerAction,
  findCustomerDuplicatesAction,
} from '@/app/actions/crm-unified';
import { getPotentialDuplicatesAction } from '@/app/actions/crm';
import PageHeader from '@/components/admin/PageHeader';
import {
  Users,
  Search,
  AlertTriangle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RotateCw,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [duplicatesCount, setDuplicatesCount] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingCustomer, setSubmittingCustomer] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [newCustForm, setNewCustForm] = useState({
    fullName: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    email: '',
    city: 'Anand',
    preferredChannel: 'WHATSAPP',
    budgetRange: '₹50,000 - ₹1,50,000',
    preferredCabinClass: 'Economy',
    internalRemarks: '',
  });

  const loadData = async (query = '') => {
    setLoading(true);
    try {
      const [res, dups] = await Promise.all([
        searchCustomersAction(query),
        getPotentialDuplicatesAction(),
      ]);
      if (res.success && Array.isArray(res.data)) {
        setCustomers(res.data);
      }
      setDuplicatesCount(Array.isArray(dups) ? dups.length : 0);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    const timeout = setTimeout(() => {
      loadData(val);
    }, 300);
    return () => clearTimeout(timeout);
  };

  // Check duplicate when typing phone or email in modal
  useEffect(() => {
    if (!showAddModal) return;
    if (newCustForm.phoneNumber.length >= 7 || (newCustForm.email && newCustForm.email.includes('@'))) {
      const timeout = setTimeout(async () => {
        const dupRes = await findCustomerDuplicatesAction(
          newCustForm.phoneNumber,
          newCustForm.email || undefined
        );
        if (dupRes.success && dupRes.data) {
          setDuplicateMatches(dupRes.data);
        } else {
          setDuplicateMatches([]);
        }
      }, 400);
      return () => clearTimeout(timeout);
    } else {
      setDuplicateMatches([]);
    }
  }, [newCustForm.phoneNumber, newCustForm.email, showAddModal]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustForm.fullName.trim() || !newCustForm.phoneNumber.trim()) {
      alert('Customer name and mobile number are required.');
      return;
    }
    setSubmittingCustomer(true);
    try {
      const res = await createCustomerAction({
        fullName: newCustForm.fullName.trim(),
        phoneCountryCode: newCustForm.phoneCountryCode,
        phoneNumber: newCustForm.phoneNumber.trim(),
        email: newCustForm.email.trim() || undefined,
        city: newCustForm.city.trim(),
        preferredChannel: newCustForm.preferredChannel,
        preferredCabinClass: newCustForm.preferredCabinClass,
        budgetRange: newCustForm.budgetRange,
        internalRemarks: newCustForm.internalRemarks.trim() || undefined,
      });

      if (res.success) {
        setShowAddModal(false);
        setNewCustForm({
          fullName: '',
          phoneCountryCode: '+91',
          phoneNumber: '',
          email: '',
          city: 'Anand',
          preferredChannel: 'WHATSAPP',
          budgetRange: '₹50,000 - ₹1,50,000',
          preferredCabinClass: 'Economy',
          internalRemarks: '',
        });
        setDuplicateMatches([]);
        await loadData();
      } else {
        alert(res.error || 'Failed to create customer');
      }
    } catch (err: any) {
      alert(`Error creating customer: ${err.message}`);
    } finally {
      setSubmittingCustomer(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Customer Directory & Profiles"
        subtitle="Centralized client profiles, booking history, normalized contact channels, and 360° dossiers"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'All Customers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {duplicatesCount > 0 && (
              <Link
                href="/admin/deduplication"
                className="px-3 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#C58A27] border border-[#FCE8C3] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <AlertTriangle size={13} />
                <span>{duplicatesCount} Merge Candidates</span>
              </Link>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus size={13} className="text-[#E9B95E]" />
              <span>+ Add Customer</span>
            </button>

            <button
              onClick={() => loadData(search)}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* Customer Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Verified Customers
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {customers.length}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Single customer view</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Customer Segments
            </span>
            <div className="text-2xl font-bold text-[#24689B] mt-1 font-headline">
              <Link href="/admin/customers/segments" className="hover:underline">
                Cohort Analytics →
              </Link>
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">High-Value, Frequent, Tour</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Identity Deduplication
            </span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-headline">
              {duplicatesCount === 0 ? '100% Clean' : `${duplicatesCount} Duplicates`}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Normalized phone matching</p>
          </div>
        </div>

        {/* Search Bar & Table Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by customer name, mobile, email or city..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B] transition-colors"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096] self-end sm:self-center">
              Showing {customers.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Customer Dossier</th>
                  <th className="px-4 py-3 font-semibold">Contact Mobile</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Linked Records</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading customer registry...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      No travelers found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-none bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#153650]">
                            {c.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <Link
                              href={`/admin/customers/${c.id}`}
                              className="font-bold text-[#153650] hover:text-[#24689B] block"
                            >
                              {c.fullName}
                            </Link>
                            <span className="text-[10px] text-[#718096] font-mono">{c.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {c.phoneCountryCode || '+91'} {c.phoneNumber}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-[#718096] font-mono">
                        {c.email || '—'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-[#718096] font-medium">
                        {c.city || 'Anand'}, Gujarat
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] text-[#153650] font-medium">
                          {c._count?.leads || 0} Leads • {c._count?.flightHolds || 0} Holds
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED] inline-block"
                        >
                          Customer 360° →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#153650]/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] w-full max-w-xl shadow-2xl rounded-none flex flex-col overflow-hidden max-h-[90vh]">
            <div className="h-12 px-4 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F8FAFC]">
              <span className="text-xs font-bold uppercase text-[#153650] font-mono">
                Add New Customer Record
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-[#718096] hover:text-[#153650]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* DUPLICATE WARNING BOX */}
              {duplicateMatches.length > 0 && (
                <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} />
                    <span>Existing Customer Match Found!</span>
                  </div>
                  <p className="text-[11px]">
                    A customer already exists with this phone or email:
                  </p>
                  <ul className="text-[11px] list-disc list-inside font-semibold">
                    {duplicateMatches.map((m) => (
                      <li key={m.id}>
                        {m.fullName} ({m.phoneCountryCode || '+91'} {m.phoneNumber})
                        <Link href={`/admin/customers/${m.id}`} className="ml-2 text-[#1D4ED8] underline" target="_blank">
                          View Dossier
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-[#78350F] italic">
                    Tip: Submitting will link or update rather than create duplicate traveler entities.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                    Full Traveler Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustForm.fullName}
                    onChange={(e) => setNewCustForm({ ...newCustForm, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                    Phone Country Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustForm.phoneCountryCode}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phoneCountryCode: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs rounded-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCustForm.phoneNumber}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phoneNumber: e.target.value })}
                    placeholder="9876543210"
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs rounded-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={newCustForm.email}
                    onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                    placeholder="ramesh@example.com"
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={newCustForm.city}
                    onChange={(e) => setNewCustForm({ ...newCustForm, city: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                    Preferred Channel
                  </label>
                  <select
                    value={newCustForm.preferredChannel}
                    onChange={(e) => setNewCustForm({ ...newCustForm, preferredChannel: e.target.value })}
                    className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#E5E8ED] text-xs rounded-none"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="PHONE_CALL">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                    Cabin Preference
                  </label>
                  <select
                    value={newCustForm.preferredCabinClass}
                    onChange={(e) => setNewCustForm({ ...newCustForm, preferredCabinClass: e.target.value })}
                    className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#E5E8ED] text-xs rounded-none"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#153650] mb-1">
                    Internal Staff Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={newCustForm.internalRemarks}
                    onChange={(e) => setNewCustForm({ ...newCustForm, internalRemarks: e.target.value })}
                    placeholder="Client requirements, background, or VIP notes..."
                    className="w-full p-2 bg-[#FFFFFF] border border-[#E5E8ED] text-xs rounded-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-[#E5E8ED] text-xs text-[#667085] rounded-none hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCustomer}
                  className="px-4 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none"
                >
                  {submittingCustomer ? 'Saving...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
