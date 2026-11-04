'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getPackageCostsAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Lock,
  CheckCircle2,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export default function PackageCostGovernancePage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPackageCostsAction();
      setCosts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Package Rate & Cost Governance"
        subtitle="Confidential supplier net costs, source printed rack rates, and verified B2C selling margins."
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-[#DF7373]/10 text-[#DF7373] text-xs font-medium border border-[#DF7373]/20 inline-flex items-center gap-1.5">
              <Lock size={12} />
              <span>Confidential Supplier Rates (Super Admin / Manager Only)</span>
            </span>
          </div>
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        {/* Governance Notice */}
        <div className="rounded-lg p-4 bg-[#17191D] border border-[#2A2E34] text-xs text-[#969CA5] space-y-1.5">
          <div className="flex items-center gap-2 font-medium text-[#F4F4F2]">
            <ShieldCheck size={16} className="text-[#E9B95E]" />
            <span>Contracted B2B Rate Integrity & Unpublished Destinations</span>
          </div>
          <div className="space-y-1 text-[11px] leading-relaxed">
            <p>
              • <strong>Kerala 6N/7D Winter CPAI:</strong> Authenticated from original supplier matrix. Preserves both 6-pax vehicle variants (Innova ₹20,700 vs Tempo Traveller ₹21,400).
            </p>
            <p>
              • <strong>Rajasthan & Hyderabad:</strong> Retained as <em>UNPUBLISHED / QUOTATION REQUIRED</em> in accordance with Phase 0 audit until updated seasonal contracts are executed.
            </p>
          </div>
        </div>

        {/* Cost & Margin Table */}
        <div className="rounded-lg overflow-hidden border border-[#2A2E34] bg-[#17191D]">
          <div className="p-4 border-b border-[#2A2E34] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F4F4F2]">Kerala 6N/7D Rate Card Breakdown</h2>
              <p className="text-xs text-[#969CA5]">
                Per person twin-sharing breakdown comparing supplier net with published selling prices
              </p>
            </div>
            <span className="text-xs font-mono text-[#55B98A] bg-[#1D2025] border border-[#2A2E34] px-2.5 py-1 rounded">
              Season: Winter 2026–2027
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101113] text-[#666E79] uppercase text-[10px] font-medium tracking-wider border-b border-[#2A2E34]">
                <tr>
                  <th className="px-4 py-3">Package / Code</th>
                  <th className="px-4 py-3">Hotel Tier</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3 text-center">Pax</th>
                  <th className="px-4 py-3 font-mono text-[#DF7373]">Supplier Net Cost</th>
                  <th className="px-4 py-3 font-mono">Source Rack Rate</th>
                  <th className="px-4 py-3 font-mono text-[#55B98A]">Varni Selling Price</th>
                  <th className="px-4 py-3 font-mono text-[#E9B95E]">Gross Margin</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2329] text-[#969CA5]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-[#666E79]">
                      Loading rate matrices...
                    </td>
                  </tr>
                ) : (
                  costs.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1D2025]/60 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-[#F4F4F2]">{item.packageName}</div>
                        <span className="font-mono text-[10px] text-[#666E79]">{item.packageCode}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#F4F4F2] font-medium">
                        {item.hotelTier}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#969CA5]">
                        {item.vehicleAssigned}
                      </td>

                      <td className="px-4 py-3 text-center font-mono tabular-nums text-[#F4F4F2]">
                        {item.paxCount}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono tabular-nums text-[#DF7373]">
                        {currentUser.canViewSupplierCosts
                          ? `₹${(item?.supplierCostInr ?? 0).toLocaleString('en-IN')}`
                          : '••••••'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono tabular-nums text-[#969CA5]">
                        ₹{(item?.sourceRackRateInr ?? 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono tabular-nums font-semibold text-[#55B98A]">
                        ₹{(item?.varniSellingPriceInr ?? 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono tabular-nums text-[#E9B95E]">
                        {currentUser.canViewSupplierCosts
                          ? `₹${(item?.marginAmountInr ?? 0).toLocaleString('en-IN')} (${item.marginPercent}%)`
                          : '••••••'}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#55B98A]/10 text-[#55B98A] border border-[#55B98A]/20">
                          {item.approvalStatus}
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
