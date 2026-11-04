'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getPackageCostsAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';

export default function PackageCostGovernancePage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPackageCostsAction();
      setCosts(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <CrmHeader
        title="Package Rate & Cost Governance"
        subtitle="Confidential supplier net costs, source printed rack rates, and verified B2C selling margins."
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Confidential Supplier Rates (Super Admin / Manager Only)</span>
            </span>
          </div>
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {/* Governance Notice */}
        <div className="clay-card rounded-2xl p-5 bg-[#FBF9F5] border border-[#C29033]/40 text-xs text-slate-700 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#153650]">
            <span className="material-symbols-outlined text-[#C29033]">verified</span>
            <span>Contracted B2B Rate Integrity & Unpublished Destinations</span>
          </div>
          <div className="space-y-1 leading-relaxed text-slate-600">
            <p>
              • <strong>Kerala 6N/7D Winter CPAI:</strong> Authenticated from original supplier matrix. Preserves both 6-pax vehicle variants (Innova ₹20,700 vs Tempo Traveller ₹21,400).
            </p>
            <p>
              • <strong>Rajasthan & Hyderabad:</strong> Retained as <em>UNPUBLISHED / QUOTATION REQUIRED</em> in accordance with Phase 0 audit until updated seasonal contracts are executed.
            </p>
          </div>
        </div>

        {/* Cost & Margin Table */}
        <div className="clay-card rounded-3xl overflow-hidden border border-[#E3DCCB] bg-white">
          <div className="p-6 border-b border-[#E3DCCB] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-[#153650] text-lg">Kerala 6N/7D Rate Card Breakdown</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Per person twin-sharing breakdown comparing supplier net with published selling prices.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              Season: Winter 2026–2027
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E5DEC9]/80 text-[#153650] uppercase text-[10px] font-black tracking-wider border-b border-[#E3DCCB]">
                <tr>
                  <th className="px-6 py-4">Package Code & Description</th>
                  <th className="px-5 py-4">Hotel Tier</th>
                  <th className="px-5 py-4">Vehicle Config</th>
                  <th className="px-5 py-4">Pax</th>
                  <th className="px-5 py-4 font-mono text-rose-800">Supplier Net Cost</th>
                  <th className="px-5 py-4 font-mono text-[#153650]">Source Rack Rate</th>
                  <th className="px-5 py-4 font-serif font-bold text-emerald-800">Varni Selling Price</th>
                  <th className="px-5 py-4 font-bold text-emerald-700">Gross Margin</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCB]/60 bg-[#FBF9F5]/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      Loading rate matrices...
                    </td>
                  </tr>
                ) : (
                  costs.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F5F2EB] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#153650]">
                        <div>{item.packageName}</div>
                        <span className="font-mono text-[10px] text-slate-500 font-normal">{item.packageCode}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800">{item.hotelTier}</span>
                      </td>

                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {item.vehicleOption}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {item.paxCount} Adults
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-rose-800">
                        ₹{item.supplierCostInr.toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-slate-700">
                        ₹{item.sourceRackRateInr.toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4 font-serif font-bold text-emerald-800 text-sm">
                        ₹{item.varniSellingPriceInr.toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4 font-bold text-emerald-700">
                        ₹{item.marginAmountInr.toLocaleString('en-IN')} ({item.marginPercent}%)
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="material-symbols-outlined text-[12px]">check</span>
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

        {/* Unpublished Status Audit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-[#153650] text-sm">Rajasthan Tour Package</h4>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 uppercase">
                Unpublished
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Status: <strong>Quotation Required Only</strong>. Awaiting official supplier contract before publishing dynamic pricing.
            </p>
          </div>

          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-[#153650] text-sm">Hyderabad Heritage Package</h4>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 uppercase">
                Unpublished
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Status: <strong>Quotation Required Only</strong>. Pending current-season printed rack rates.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

