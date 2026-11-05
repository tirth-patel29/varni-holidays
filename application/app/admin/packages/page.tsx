'use client';

import React, { useState, useEffect } from 'react';
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
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#C58A27] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Tour Package Commercials
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Rate Card & Profitability Governance
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Confidential contracted supplier net costs, printed rack rates, and verified B2C selling margins.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <span className="px-3 py-1.5 bg-[#FEF2F2] text-[#D54747] text-xs font-bold border border-[#FCDAD7] rounded-none inline-flex items-center gap-2 shadow-xs">
              <Lock size={13} />
              <span>Super Admin / Manager Confidential</span>
            </span>
          </div>
        </div>

        {/* Governance Notice Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 sm:p-5 shadow-xs text-xs text-[#718096] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#153650]">
            <ShieldCheck size={16} className="text-[#24689B]" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Contracted B2B Rate Integrity & Unpublished Destinations
            </span>
          </div>
          <div className="space-y-1 text-xs leading-relaxed text-[#172B45]">
            <p>
              • <strong className="text-[#153650]">Kerala 6N/7D Winter CPAI:</strong> Authenticated from original supplier matrix. Preserves vehicle tier variants (Innova ₹20,700 vs Tempo Traveller ₹21,400 for 6 Pax).
            </p>
            <p>
              • <strong className="text-[#153650]">Rajasthan & Hyderabad:</strong> Retained as <span className="font-semibold text-[#C58A27]">UNPUBLISHED / CUSTOM QUOTATION REQUIRED</span> in accordance with contract execution schedules.
            </p>
          </div>
        </div>

        {/* Cost & Margin Table Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF]">
            <div>
              <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                Kerala 6N/7D Rate Card Breakdown
              </h2>
              <p className="text-xs text-[#718096] mt-0.5">
                Per person twin-sharing breakdown comparing supplier net with published selling prices
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#168653] bg-[#F0FDF4] border border-[#D1F0E0] px-3 py-1 rounded-none self-start sm:self-auto">
              Season: Winter 2026–2027
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Package / Code</th>
                  <th className="px-4 py-3">Hotel Tier</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3 text-center">Pax</th>
                  <th className="px-4 py-3 font-mono text-[#D54747]">Supplier Net</th>
                  <th className="px-4 py-3 font-mono">Rack Rate</th>
                  <th className="px-4 py-3 font-mono text-[#168653]">Selling Price</th>
                  <th className="px-4 py-3 font-mono text-[#24689B]">Gross Margin</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-[#718096]">
                      Loading rate matrices...
                    </td>
                  </tr>
                ) : (
                  costs.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#153650]">{item.packageName}</div>
                        <span className="font-mono text-[10px] text-[#718096]">{item.packageCode}</span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-[#153650] font-semibold">
                        {item.hotelTier}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-[#718096]">
                        {item.vehicleAssigned}
                      </td>

                      <td className="px-4 py-3.5 text-center font-mono tabular-nums font-bold text-[#153650]">
                        {item.paxCount}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums font-bold text-[#D54747]">
                        {currentUser.canViewSupplierCosts
                          ? `₹${(item?.supplierCostInr ?? 0).toLocaleString('en-IN')}`
                          : '••••••'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums text-[#718096]">
                        ₹{(item?.rackRateInr ?? 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums font-bold text-[#168653]">
                        ₹{(item?.sellingPriceInr ?? 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums font-bold text-[#24689B]">
                        {currentUser.canViewSupplierCosts
                          ? `₹${((item?.sellingPriceInr ?? 0) - (item?.supplierCostInr ?? 0)).toLocaleString('en-IN')}`
                          : '••••••'}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#168653] border border-[#D1F0E0]">
                          <CheckCircle2 size={11} />
                          <span>Approved</span>
                        </span>
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
