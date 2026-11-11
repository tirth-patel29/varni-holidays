'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/admin/PageHeader';
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
    s.email?.toLowerCase().includes(search.toLowerCase().trim())
  );

  const exportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Email', 'Status', 'Subscribed At'];
    const rows = subscribers.map((s) => [s.email, s.status, s.createdAt]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `varni_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Newsletter Subscribers & Audience"
        subtitle="Manage opt-in subscriber lists, broadcast campaign eligibility, and transactional welcome email delivery"
        breadcrumbs={[
          { label: 'Communications', href: '/admin/communications' },
          { label: 'Newsletter Subscribers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download size={13} className="text-[#24689B]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh Audience</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
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
              <span>Delivery Engine</span>
              <Send size={16} className="text-[#24689B]" />
            </div>
            <div className="text-base font-bold font-headline text-[#153650] mt-1 truncate">
              Resend API Infrastructure
            </div>
            <div className="text-[11px] text-[#718096] mt-1 font-mono">
              noreply@varnitours.com
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscribers by email address..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              Showing {filtered.length} of {subscribers.length} subscribers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Subscriber Email</th>
                  <th className="px-4 py-3 font-semibold">Subscription Status</th>
                  <th className="px-4 py-3 font-semibold">Date Subscribed</th>
                  <th className="px-4 py-3 font-semibold text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading audience registry...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-[#718096]">
                      No subscribers found matching filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {s.email}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-none font-mono text-[10px] font-bold bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]">
                          {s.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {new Date(s.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="text-xs text-[#168653] font-semibold">Consent Confirmed</span>
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
