'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getLeadsAction, assignLeadAction, updateLeadPriorityAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Inbox,
  Search,
  Filter,
  RotateCw,
  Plane,
  Compass,
  Building2,
  Stamp,
  Shield,
  MessageSquare,
  Sparkles,
  User,
  ArrowRight,
  Flame,
  Clock,
} from 'lucide-react';

function AllEnquiriesContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const { allUsers } = useCrm();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getLeadsAction();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter leads based on inputs
  const filteredLeads = leads.filter((lead) => {
    // Type filter
    if (selectedType !== 'ALL') {
      if (selectedType === 'PACKAGE' && lead.serviceType !== 'PACKAGE') return false;
      if (selectedType === 'FLIGHT' && lead.serviceType !== 'FLIGHT') return false;
      if (selectedType === 'VISA' && lead.serviceType !== 'VISA') return false;
      if (selectedType === 'INSURANCE' && lead.serviceType !== 'TRAVEL_INSURANCE') return false;
      if (selectedType === 'HOTEL' && lead.serviceType !== 'HOTEL') return false;
      if (selectedType === 'CONTACT' && lead.serviceType !== 'GENERAL' && lead.serviceType !== 'CONTACT') return false;
    }

    // Stage filter
    if (selectedStage !== 'ALL' && lead.stage !== selectedStage) return false;

    // Priority filter
    if (selectedPriority !== 'ALL' && lead.priorityLevel !== selectedPriority) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = lead.customer?.fullName?.toLowerCase() || '';
      const phone = lead.customer?.phone || '';
      const email = lead.customer?.email?.toLowerCase() || '';
      const ref = lead.referenceId?.toLowerCase() || '';
      const dest = (lead.destination || lead.packageDetail?.packageName || lead.flightDetail?.destinationAirport || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q) || ref.includes(q) || dest.includes(q);
    }

    return true;
  });

  // Calculate counts per service
  const counts = {
    all: leads.length,
    flight: leads.filter((l) => l.serviceType === 'FLIGHT').length,
    package: leads.filter((l) => l.serviceType === 'PACKAGE').length,
    visa: leads.filter((l) => l.serviceType === 'VISA').length,
    insurance: leads.filter((l) => l.serviceType === 'TRAVEL_INSURANCE').length,
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Universal Enquiries Workspace"
        subtitle="Unified inbound intake across Flight, Tour Package, Visa, Hotel, Travel Insurance, and Custom Journeys"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'All Enquiries' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/leads"
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Kanban Pipeline</span>
              <ArrowRight size={13} />
            </Link>
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
        {/* SERVICE TYPE TAB PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto crm-scrollbar pb-1 select-none">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedType === 'ALL'
                ? 'bg-[#153650] text-[#FFFFFF] border-[#153650] shadow-xs'
                : 'bg-[#FFFFFF] text-[#667085] border-[#E5E8ED] hover:bg-[#F9FAFB]'
            }`}
          >
            All Enquiries ({counts.all})
          </button>
          <button
            onClick={() => setSelectedType('FLIGHT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedType === 'FLIGHT'
                ? 'bg-[#1D4ED8] text-[#FFFFFF] border-[#1D4ED8] shadow-xs'
                : 'bg-[#FFFFFF] text-[#1D4ED8] border-[#BFDBFE] hover:bg-[#EFF6FF]'
            }`}
          >
            <Plane size={13} />
            <span>Flights ({counts.flight})</span>
          </button>
          <button
            onClick={() => setSelectedType('PACKAGE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedType === 'PACKAGE'
                ? 'bg-[#7E22CE] text-[#FFFFFF] border-[#7E22CE] shadow-xs'
                : 'bg-[#FFFFFF] text-[#7E22CE] border-[#E9D5FF] hover:bg-[#FAF5FF]'
            }`}
          >
            <Compass size={13} />
            <span>Tour Packages ({counts.package})</span>
          </button>
          <button
            onClick={() => setSelectedType('VISA')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedType === 'VISA'
                ? 'bg-[#15803D] text-[#FFFFFF] border-[#15803D] shadow-xs'
                : 'bg-[#FFFFFF] text-[#15803D] border-[#BBF7D0] hover:bg-[#F0FDF4]'
            }`}
          >
            <Stamp size={13} />
            <span>Visa ({counts.visa})</span>
          </button>
          <button
            onClick={() => setSelectedType('INSURANCE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedType === 'INSURANCE'
                ? 'bg-[#047857] text-[#FFFFFF] border-[#047857] shadow-xs'
                : 'bg-[#FFFFFF] text-[#047857] border-[#A7F3D0] hover:bg-[#ECFDF5]'
            }`}
          >
            <Shield size={13} />
            <span>Insurance ({counts.insurance})</span>
          </button>
        </div>

        {/* FILTER TOOLBAR & SEARCH */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, email, reference ID, destination..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B] transition-colors"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto select-none">
            {/* Stage filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Stages</option>
              <option value="NEW">New Enquiries</option>
              <option value="CONTACTED">Contacted</option>
              <option value="REQUIREMENT_COLLECTED">Requirement Collected</option>
              <option value="QUOTATION_SENT">Quotation Sent</option>
              <option value="CONVERTED">Converted / Won</option>
              <option value="LOST">Lost</option>
            </select>

            {/* Priority filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <span className="text-xs font-mono text-[#718096] whitespace-nowrap pl-1">
              {filteredLeads.length} matched
            </span>
          </div>
        </div>

        {/* ENQUIRIES DATA TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Ref & Customer</th>
                  <th className="px-4 py-3 font-semibold">Service Type</th>
                  <th className="px-4 py-3 font-semibold">Destination / Route</th>
                  <th className="px-4 py-3 font-semibold">Travel Date & Pax</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Assigned Staff</th>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading enquiries workspace...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#718096]">
                      No travel enquiries match your active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const assignedUser = allUsers.find((u) => u.id === lead.assignedUserId);
                    return (
                      <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="font-bold text-[#153650] hover:text-[#24689B] block leading-tight"
                          >
                            {lead.customer?.fullName || 'Guest Traveler'}
                          </Link>
                          <span className="text-[10px] text-[#718096] font-mono mt-0.5 block">
                            {lead.referenceId} • {lead.customer?.phone}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={lead.serviceType} type="service" size="sm" />
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap max-w-[200px] truncate font-medium text-[#4A5568]">
                          {lead.serviceType === 'PACKAGE' && (lead.packageDetail?.packageName || lead.destination || 'Tour Package')}
                          {lead.serviceType === 'FLIGHT' && `${lead.flightDetail?.originAirport?.split('-')[0] || 'AMD'} → ${lead.flightDetail?.destinationAirport?.split('-')[0] || 'DXB'}`}
                          {lead.serviceType === 'VISA' && `${lead.visaDetail?.destinationCountry || lead.destination || 'International'} Visa`}
                          {lead.serviceType === 'TRAVEL_INSURANCE' && `${lead.insuranceDetail?.destinationCountry || 'Global'} Insurance`}
                          {lead.serviceType === 'GENERAL' && (lead.destination || 'General Enquiry')}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-[#718096] font-mono">
                          <div>
                            {lead.travelStartDate
                              ? new Date(lead.travelStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'Flexible'}
                          </div>
                          <span className="text-[10px] text-[#A0AEC0]">
                            {lead.passengersCount || 1} Traveler(s)
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={lead.priorityLevel} type="priority" size="sm" />
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#4A5568]">
                          {assignedUser ? (
                            <span className="font-semibold text-[#153650]">{assignedUser.fullName}</span>
                          ) : (
                            <span className="text-[#A0AEC0] italic">Unassigned</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={lead.stage} type="lead" size="sm" />
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED] inline-block"
                          >
                            Open Dossier →
                          </Link>
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
    </div>
  );
}

export default function AllEnquiriesPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center text-[#718096]">
        <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold tracking-wide uppercase font-mono">Loading enquiries...</p>
      </div>
    }>
      <AllEnquiriesContent />
    </Suspense>
  );
}

