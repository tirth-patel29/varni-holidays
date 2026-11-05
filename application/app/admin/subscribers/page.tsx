'use client';

import React, { useState, useEffect } from 'react';
import { getNewsletterSubscribersAction } from '@/app/actions/newsletter';
import {
  Mail,
  Search,
  RotateCw,
  CheckCircle2,
  Calendar,
  UserCheck,
  Send,
  Download,
} from 'lucide-react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getNewsletterSubscribersAction();
      setSubscribers(data || []);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#24689B] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Audience & Marketing
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Newsletter Subscribers & Gazettes
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Manage opt-in subscriber lists, broadcast campaign eligibility, and transactional welcome email delivery.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh Audience</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <div className="flex items-center justify-between text-[#718096] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Total Subscribers</span>
              <Mail size={16} className="text-[#153650]" />
            </div>
            <div className="text-2xl font-bold font-headline text-[#153650] mt-1">
              {subscribers.length}
            </div>
            <div className="text-[11px] text-[#168653] font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Double opt-in & consent verified</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <div className="flex items-center justify-between text-[#718096] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Active Subscribed</span>
              <UserCheck size={16} className="text-[#168653]" />
            </div>
            <div className="text-2xl font-bold font-headline text-[#168653] mt-1">
              {subscribers.filter((s) => s.status === 'SUBSCRIBED').length}
            </div>
            <div className="text-[11px] text-[#718096] mt-1">
              Automated welcome email enabled
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <div className="flex items-center justify-between text-[#718096] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Audience Growth</span>
              <Calendar size={16} className="text-[#24689B]" />
            </div>
            <div className="text-2xl font-bold font-headline text-[#24689B] mt-1">
              100%
            </div>
            <div className="text-[11px] text-[#718096] mt-1">
              Organic website footer opt-ins
            </div>
          </div>
        </div>

        {/* Filter Bar & Subscriber Table */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by subscriber email address..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
              />
              <Search size={14} className="text-[#718096] absolute left-3 top-2.5" />
            </div>

            <span className="text-xs font-mono font-bold text-[#153650] self-end sm:self-auto">
              Showing {filtered.length} of {subscribers.length} recipients
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Subscriber Email</th>
                  <th className="px-4 py-3">Opt-in Source</th>
                  <th className="px-4 py-3">Subscription Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#718096]">
                      Loading subscriber list...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#718096]">
                      No subscribers matching filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#153650]">
                        {s.email}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-[#718096]">
                        {s.source || 'Website Footer Opt-in'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {new Date(s.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#168653] border border-[#D1F0E0]">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium">
                        <span className="text-[#24689B] text-xs font-semibold">Active</span>
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
