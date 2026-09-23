"use client";

import { useEffect, useState } from "react";
import { PageHeader } from '@/components/shared/PageHeader'
import { MetricStrip } from '@/components/shared/MetricStrip'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { fetchApi } from "@/lib/fetchApi";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function FreshnessPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetchApi('/reports/freshness');
      setData(response);
    } catch (err: any) {
      console.error("Failed to load freshness data:", err);
      setError(err.message || "Failed to load freshness data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <PageHeader title="Freshness Control" description="Monitor stock quality, plan markdowns and prevent waste." />
        <div className="p-8 text-center text-muted-foreground">Loading freshness data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 pb-10">
        <PageHeader title="Freshness Control" description="Monitor stock quality, plan markdowns and prevent waste." />
        <div className="p-8 text-center text-destructive bg-card border rounded-xl">
          <p>{error || "No data available."}</p>
          <button type="button" onClick={loadData} className="mt-3 underline">Try again</button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Freshness Control"
        description="Monitor stock quality, plan markdowns and prevent waste."
      />
      
      <MetricStrip
        metrics={[
          { label: "Fresh Stock", value: formatCurrency(data.summary?.freshStockValue || 0) },
          { label: "Needs Attention", value: formatCurrency(data.summary?.attentionValue || 0) },
          { label: "Markdown Recommended", value: formatCurrency(data.summary?.markdownValue || 0) },
          { label: "High Risk", value: formatCurrency(data.summary?.highRiskValue || 0) },
          { label: "Expected Waste", value: formatCurrency(data.summary?.expectedWasteValue || 0) }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive"></div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">STOCK AT RISK</h3>
            </div>
            
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No stock at risk items found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-[13px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Age</th>
                      <th className="px-4 py-3 text-center">Quality</th>
                      <th className="px-4 py-3 text-right">Value</th>
                      <th className="px-4 py-3 text-right">At Risk</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{item.productName}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.ageDays} days</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${item.qualityPct < 50 ? 'bg-destructive' : 'bg-amber-500'}`} style={{ width: `${item.qualityPct || 0}%` }} />
                            </div>
                            <span className="tabular-nums text-xs">{item.qualityPct || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(item.value)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-destructive">{formatCurrency(item.riskValue)}</td>
                        <td className="px-4 py-3"><StatusBadge status={item.status?.toLowerCase() || 'urgent'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">VALUE AT RISK</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current inventory value</span>
                <span className="font-medium tabular-nums">{formatCurrency(data.summary?.totalValue || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Potential value erosion</span>
                <span className="font-bold tabular-nums text-destructive">{formatCurrency(data.summary?.erosionValue || 0)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic mt-4">Management estimate based on configured freshness rules</p>
          </div>
        </div>
      </div>
    </div>
  )
}
