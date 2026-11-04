'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
import { getCustomersAction, getPotentialDuplicatesAction } from '@/app/actions/crm';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const custs = await getCustomersAction();
    const dups = await getPotentialDuplicatesAction();
    setCustomers(custs);
    setDuplicates(dups);
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#FBF9F5]">
      <CrmHeader
        title="Customer Directory & Profiles"
        subtitle="Universal customer identity, phone normalization, and duplicate detection."
        actions={
          duplicates.length > 0 ? (
            <Link
              href="/admin/deduplication"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs shadow-sm hover:bg-amber-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-700">warning</span>
              <span>{duplicates.length} Potential Duplicates Flagged</span>
            </Link>
          ) : undefined
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-[#E3DCCB] shadow-sm">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name, phone (+91...), email, or city..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB]/50 text-xs text-slate-800 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-[#153650]/20 focus:bg-white"
            />
            <span className="material-symbols-outlined text-[18px] text-slate-500 absolute left-3 top-2.5">
              search
            </span>
          </div>
          <span className="text-xs font-bold text-[#153650] whitespace-nowrap bg-[#F5F2EB] px-3 py-1.5 rounded-xl border border-[#E3DCCB]">
            {filtered.length} Customers Found
          </span>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E3DCCB] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E5DEC9]/70 text-[#153650] uppercase text-[10px] font-black tracking-wider border-b border-[#E3DCCB]">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-5 py-4">Contact Phone (E.164 Normalized)</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">City / Region</th>
                  <th className="px-5 py-4">Status & Flags</th>
                  <th className="px-5 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCB]/60 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-semibold">
                      Loading Customer Database...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-semibold">
                      No matching customers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F5F2EB]/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#153650]">
                        <Link href={`/employee/customers/${c.id}`} className="hover:text-[#24689B] hover:underline">
                          {c.fullName}
                        </Link>
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                        {c.normalizedPhone || `${c.phoneCountryCode} ${c.phoneNumber}`}
                      </td>

                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {c.email || <span className="text-slate-400 italic">None</span>}
                      </td>

                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {c.city || 'Anand / Gujarat'}
                      </td>

                      <td className="px-5 py-4">
                        {c.duplicateWarning ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="material-symbols-outlined text-[12px] text-amber-700">warning</span>
                            Duplicate Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <span className="material-symbols-outlined text-[12px] text-emerald-700">verified_user</span>
                            Verified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-[11px] font-semibold">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/employee/customers/${c.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#153650] text-white hover:bg-[#24689B] transition-colors text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>360 Profile</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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
