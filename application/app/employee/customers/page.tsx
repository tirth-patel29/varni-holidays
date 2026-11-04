'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
import { getCustomersAction, getPotentialDuplicatesAction } from '@/app/actions/crm';
import {
  Users,
  Search,
  AlertTriangle,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const custs = await getCustomersAction();
    const dups = await getPotentialDuplicatesAction();
    setCustomers(custs || []);
    setDuplicates(dups || []);
    setLoading(false);
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Customer Directory"
        subtitle="Universal traveler profiles, normalized contact records, and duplicate prevention."
        actions={
          duplicates.length > 0 ? (
            <Link
              href="/admin/deduplication"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E8B65E]/10 text-[#E8B65E] border border-[#E8B65E]/20 text-xs font-medium hover:bg-[#E8B65E]/20 transition-colors"
            >
              <AlertTriangle size={13} />
              <span>{duplicates.length} Duplicate Warnings</span>
            </Link>
          ) : undefined
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        {/* Search Bar */}
        <div className="bg-[#17191D] rounded-lg p-3 flex items-center justify-between gap-3 border border-[#2A2E34]">
          <div className="flex-1 relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone (+91...), email, city..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#2A2E34] bg-[#1D2025] text-xs text-[#F4F4F2] placeholder-[#666E79] focus:outline-none focus:border-[#E9B95E] transition-colors"
            />
            <Search size={14} className="text-[#666E79] absolute left-2.5 top-2.5" />
          </div>
          <span className="text-xs font-mono text-[#969CA5] px-2.5 py-1 rounded bg-[#1D2025] border border-[#2A2E34]">
            {filtered.length} Customers
          </span>
        </div>

        {/* Customers Data Table */}
        <div className="bg-[#17191D] rounded-lg overflow-hidden border border-[#2A2E34]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101113] text-[#666E79] uppercase text-[10px] font-medium tracking-wider border-b border-[#2A2E34]">
                <tr>
                  <th className="px-4 py-3">Traveler</th>
                  <th className="px-4 py-3">Phone (Normalized)</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Account Flags</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2329] text-[#969CA5]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#666E79]">
                      Loading customer directory...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#666E79]">
                      No matching customer records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#1D2025]/60 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/employee/customers/${c.id}`}
                          className="font-medium text-[#F4F4F2] hover:text-[#E9B95E] transition-colors block"
                        >
                          {c.fullName}
                        </Link>
                        <span className="text-[10px] text-[#666E79] font-mono">{c.id}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[#F4F4F2]">
                        {c.phoneCountryCode} {c.phoneNumber}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#969CA5]">
                        {c.email || '—'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#969CA5]">
                        {c.city || 'Gujarat'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {c.duplicateWarning ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#E8B65E] bg-[#E8B65E]/10 px-1.5 py-0.5 rounded border border-[#E8B65E]/20">
                            <AlertTriangle size={11} />
                            Duplicate Flag
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#55B98A] bg-[#55B98A]/10 px-1.5 py-0.5 rounded border border-[#55B98A]/20">
                            Verified
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#666E79] font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Link
                          href={`/employee/customers/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#E9B95E] hover:underline"
                        >
                          <span>360 Profile</span>
                          <ArrowUpRight size={13} />
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
