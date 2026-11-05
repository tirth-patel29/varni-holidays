'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCustomersAction, getPotentialDuplicatesAction } from '@/app/actions/crm';
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
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#153650] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Universal Traveler Registry
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Customer Directory & Profiles
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Centralized passenger records, normalized contact numbers, family dossiers, and identity resolution.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
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
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh Profiles</span>
            </button>
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
                placeholder="Search customers by name, phone, email, or city..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
              />
              <Search size={14} className="text-[#718096] absolute left-3 top-2.5" />
            </div>

            <span className="text-xs font-mono font-bold text-[#153650]">
              {filtered.length} Customer Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Traveler Name</th>
                  <th className="px-4 py-3">Phone / WhatsApp</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">City & State</th>
                  <th className="px-4 py-3">Registered On</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      Loading customer registry...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No travelers found matching filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-none bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#153650]">
                            {c.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#153650] block">{c.fullName}</span>
                            <span className="text-[10px] text-[#718096] font-mono">{c.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {c.phoneCountryCode} {c.phoneNumber}
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
                          href={`/employee/customers/${c.id}`}
                          className="text-xs font-bold text-[#24689B] hover:text-[#153650] hover:underline"
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

