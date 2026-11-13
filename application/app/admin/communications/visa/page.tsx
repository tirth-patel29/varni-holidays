'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
import { getVisaDashboardAction } from '@/app/actions/visa';
import { VisaApplicationRecord, VisaApplicationStatusCode } from '@/lib/crm/types';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  Mail,
  User,
  MapPin,
  Calendar,
  XCircle,
  Sparkles,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  VisaApplicationStatusCode,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  INQUIRY_RECEIVED: {
    label: 'Inquiry Received',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1E40AF]',
    border: 'border-[#BFDBFE]',
    dot: 'bg-[#2563EB]',
  },
  DOCUMENTS_RECEIVED: {
    label: 'Docs Received',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#166534]',
    border: 'border-[#BBF7D0]',
    dot: 'bg-[#16A34A]',
  },
  DOCUMENTS_UNDER_REVIEW: {
    label: 'Reviewing Docs',
    bg: 'bg-[#FEFCE8]',
    text: 'text-[#854D0E]',
    border: 'border-[#FEF08A]',
    dot: 'bg-[#CA8A04]',
  },
  FILE_SUBMITTED: {
    label: 'File Submitted',
    bg: 'bg-[#F5F3FF]',
    text: 'text-[#5B21B6]',
    border: 'border-[#DDD6FE]',
    dot: 'bg-[#7C3AED]',
  },
  UNDER_PROCESSING: {
    label: 'Under Processing',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#93C5FD]',
    dot: 'bg-[#3B82F6]',
  },
  ADDITIONAL_INFORMATION_REQUIRED: {
    label: 'Action Required',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#D97706]',
  },
  VISA_APPROVED: {
    label: 'Visa Approved',
    bg: 'bg-[#ECFDF5]',
    text: 'text-[#065F46]',
    border: 'border-[#A7F3D0]',
    dot: 'bg-[#059669]',
  },
  VISA_REJECTED: {
    label: 'Visa Rejected',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#991B1B]',
    border: 'border-[#FECACA]',
    dot: 'bg-[#DC2626]',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-[#F8FAFC]',
    text: 'text-[#334155]',
    border: 'border-[#CBD5E1]',
    dot: 'bg-[#64748B]',
  },
};

export default function VisaDashboardPage() {
  const [applications, setApplications] = useState<VisaApplicationRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<VisaApplicationStatusCode | 'ALL'>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getVisaDashboardAction({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        country: selectedCountry === 'ALL' ? undefined : selectedCountry,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setApplications(res.applications || []);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load visa dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedCountry]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const countries = Array.from(
    new Set(applications.map((a) => a.destinationCountry).filter(Boolean))
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <Breadcrumbs
          items={[
            { label: 'Communications', href: '/admin/communications' },
            { label: 'Visa Management' },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#E9B95E] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Consular Operations & Automation
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Visa Applications & Client Communication
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              End-to-end dossier lifecycle, official milestone tracking, and automated branded client communication.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/admin/communications/visa/templates"
              className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#153650] border border-[#E5E8ED] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Mail size={13} className="text-[#24689B]" />
              <span>Email Templates</span>
            </Link>

            <Link
              href="/admin/communications/visa/create"
              className="px-3.5 py-2 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus size={13} className="text-[#E9B95E]" />
              <span>Register Visa Inquiry</span>
            </Link>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#718096] border border-[#E5E8ED] rounded-none transition-colors"
              title="Refresh"
            >
              <RotateCw size={14} className={loading ? 'animate-spin text-[#24689B]' : ''} />
            </button>
          </div>
        </div>

        {/* 9 Status Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {(
            [
              'INQUIRY_RECEIVED',
              'DOCUMENTS_RECEIVED',
              'DOCUMENTS_UNDER_REVIEW',
              'FILE_SUBMITTED',
              'UNDER_PROCESSING',
              'ADDITIONAL_INFORMATION_REQUIRED',
              'VISA_APPROVED',
              'VISA_REJECTED',
              'COMPLETED',
            ] as VisaApplicationStatusCode[]
          ).map((code) => {
            const count = stats?.counts?.[code] ?? 0;
            const cfg = STATUS_CONFIG[code];
            const isSelected = selectedStatus === code;

            return (
              <button
                key={code}
                onClick={() => setSelectedStatus(isSelected ? 'ALL' : code)}
                className={`p-3 text-left border rounded-none transition-all shadow-xs ${
                  isSelected
                    ? 'border-[#153650] bg-[#FFFFFF] ring-1 ring-[#153650]'
                    : 'border-[#E5E8ED] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-[10px] font-mono font-bold text-[#718096]">
                    {count}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-[#153650] truncate" title={cfg.label}>
                  {cfg.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
              <input
                type="text"
                placeholder="Search applicant name, email, phone, reference (e.g. VH-VIS...)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-4 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-medium rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              {Object.entries(STATUS_CONFIG).map(([val, c]) => (
                <option key={val} value={val}>
                  {c.label}
                </option>
              ))}
            </select>

            {countries.length > 0 && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-medium rounded-none focus:outline-none focus:border-[#24689B]"
              >
                <option value="ALL">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {(selectedStatus !== 'ALL' || selectedCountry !== 'ALL' || search) && (
              <button
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSelectedCountry('ALL');
                  setSearch('');
                }}
                className="h-9 px-2.5 text-xs text-[#718096] hover:text-[#D54747] font-semibold underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Applications Dossier Table */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E8ED] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-[#24689B]" />
              <span className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                Registered Visa Dossiers ({applications.length})
              </span>
            </div>
            <span className="text-[11px] text-[#718096]">
              Showing real-time applications
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#718096]">
              <RotateCw size={20} className="animate-spin mx-auto text-[#24689B] mb-2" />
              <span>Loading visa applications...</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-[#F8F6F0] border border-[#E5E8ED] text-[#E9B95E] flex items-center justify-center mx-auto">
                <FileText size={20} />
              </div>
              <h3 className="text-sm font-bold text-[#153650]">No Visa Applications Found</h3>
              <p className="text-xs text-[#718096] max-w-md mx-auto">
                {search || selectedStatus !== 'ALL'
                  ? 'No applications match your active filters. Try clearing your search parameters.'
                  : 'No visa dossiers have been registered yet. Click below to create your first application.'}
              </p>
              <Link
                href="/admin/communications/visa/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors"
              >
                <Plus size={13} className="text-[#E9B95E]" />
                <span>Register Visa Inquiry</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto crm-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#002037] text-[#FFFFFF] font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-semibold">Reference</th>
                    <th className="py-3 px-4 font-semibold">Applicant</th>
                    <th className="py-3 px-4 font-semibold">Destination & Category</th>
                    <th className="py-3 px-4 font-semibold">Current Status</th>
                    <th className="py-3 px-4 font-semibold">Assigned Officer</th>
                    <th className="py-3 px-4 font-semibold">Date Registered</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                  {applications.map((app) => {
                    const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.INQUIRY_RECEIVED;

                    return (
                      <tr key={app.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/communications/visa/${app.id}`}
                            className="font-mono font-bold text-[#153650] hover:text-[#24689B] hover:underline block"
                          >
                            {app.applicationReference}
                          </Link>
                          {app.officialReferenceNo && (
                            <span className="text-[10px] font-mono text-[#718096] block">
                              Portal: {app.officialReferenceNo}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-[#153650]">{app.customerName}</div>
                          <div className="text-[11px] text-[#718096] flex items-center gap-2">
                            <span>{app.customerPhone}</span>
                            {app.customerEmail && <span>• {app.customerEmail}</span>}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#153650] flex items-center gap-1.5">
                            <MapPin size={12} className="text-[#E9B95E]" />
                            <span>{app.destinationCountry}</span>
                          </div>
                          <div className="text-[11px] text-[#718096]">
                            {app.visaType} ({app.applicantCount} {app.applicantCount === 1 ? 'Applicant' : 'Applicants'})
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border rounded-none ${st.bg} ${st.text} ${st.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            <span>{st.label}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-[#153650] flex items-center gap-1">
                            <User size={12} className="text-[#A0AEC0]" />
                            <span>{app.assignedUserName || 'Ananya Joshi'}</span>
                          </div>
                          <div className="text-[10px] text-[#718096]">{app.assignedUserPhone}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-[#718096]">
                          {new Date(app.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/admin/communications/visa/${app.id}`}
                              className="px-2.5 py-1 bg-[#F4F6F9] hover:bg-[#E5E8ED] text-[#153650] font-bold text-[11px] rounded-none inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye size={12} />
                              <span>Dossier</span>
                            </Link>

                            <Link
                              href={`/admin/communications/visa/${app.id}?tab=email`}
                              className="px-2.5 py-1 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] font-bold text-[11px] rounded-none inline-flex items-center gap-1 transition-colors"
                            >
                              <Mail size={12} className="text-[#E9B95E]" />
                              <span>Email</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

