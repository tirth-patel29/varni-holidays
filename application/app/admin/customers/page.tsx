'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCustomersAction, getPotentialDuplicatesAction } from '@/app/actions/crm';
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
  GitMerge,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Plus,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const custs = await getCustomersAction();
      const dups = await getPotentialDuplicatesAction();
      setCustomers(custs || []);
      setDuplicates(dups || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber?.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Customer Directory & Profiles"
        subtitle="Centralized client profiles, booking history, normalized contact channels, and relationship dossiers"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'All Customers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {duplicates.length > 0 && (
              <Link
                href="/admin/deduplication"
                className="px-3 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#C58A27] border border-[#FCE8C3] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <AlertTriangle size={13} />
                <span>{duplicates.length} Merge Candidates</span>
              </Link>
            )}

            <button
              onClick={loadData}
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
              Total Registered Customers
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {customers.length}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Verified traveler records</p>
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
              {duplicates.length === 0 ? '100% Clean' : `${duplicates.length} Duplicates`}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">By phone & email matching</p>
          </div>
        </div>

        {/* Search Bar & Table Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, mobile, email or city..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B] transition-colors"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096] self-end sm:self-center">
              Showing {filtered.length} of {customers.length} records
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
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading customer registry...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No travelers found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
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
                          Customer Dossier →
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
    </div>
  );
}
