'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { getPackageCostsAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Lock,
  CheckCircle2,
  ShieldCheck,
  Compass,
  FileSpreadsheet,
  Tag,
  AlertCircle,
} from 'lucide-react';

export default function PackageCostGovernancePage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPackageCostsAction();
        setCosts(data || []);
      } catch (err) {
        console.error('Failed to load package costs:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Tour Packages & Rate Card Governance"
        subtitle="Confidential supplier net pricing, retail selling rate cards, Kerala flexible duration formulas, and profitability margins"
        breadcrumbs={[
          { label: 'Settings & Team', href: '/admin/users' },
          { label: 'Service Configuration' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 shadow-xs">
              <ShieldCheck size={14} className="text-[#168653]" />
              <span>Rate Governance Active</span>
            </span>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* Package Cost Governance Table */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF]">
            <div>
              <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                Standard Itinerary Rate Breakdown
              </h2>
              <p className="text-xs text-[#718096] mt-0.5">
                B2B ground operator costs vs authorized published retail prices
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#153650] bg-[#F1F5F9] px-3 py-1 rounded-none border border-[#CBD5E1] self-start sm:self-auto">
              {costs.length} Configured Packages
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Package Name</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3 text-right">Published Retail (INR)</th>
                  <th className="px-4 py-3 text-right">B2B Net Cost (INR)</th>
                  <th className="px-4 py-3 text-right">Gross Margin (INR)</th>
                  <th className="px-4 py-3 text-center">Profitability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading package rate cards...
                    </td>
                  </tr>
                ) : (
                  costs.map((pkg) => {
                    const retail = pkg.publishedPriceInr || 0;
                    const net = pkg.b2bCostInr || 0;
                    const margin = retail - net;
                    const marginPct = retail > 0 ? Math.round((margin / retail) * 100) : 0;
                    const canViewNet = currentUser.canViewSupplierCosts || isSuperAdmin;

                    return (
                      <tr key={pkg.packageId} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <Compass size={15} className="text-[#C58A27] shrink-0" />
                            <span className="font-bold text-[#153650]">{pkg.name}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                          {pkg.durationNights}N / {pkg.durationNights + 1}D
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold text-[#153650]">
                          ₹{retail.toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono">
                          {canViewNet ? (
                            <span className="font-semibold text-[#718096]">
                              ₹{net.toLocaleString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#A0AEC0] italic">
                              <Lock size={11} /> Redacted
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold">
                          {canViewNet ? (
                            <span className="text-[#168653]">₹{margin.toLocaleString()}</span>
                          ) : (
                            <span className="text-[#A0AEC0] italic text-[11px]">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {canViewNet ? (
                            <span className="px-2 py-0.5 rounded-none font-mono text-[10px] font-bold bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]">
                              +{marginPct}% Margin
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-[#A0AEC0]">Restricted</span>
                          )}
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
