"use client";

import { useEffect, useState } from "react";
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { fetchApi } from "@/lib/fetchApi";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function PriceBoardPage() {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetchApi('/pricing/board');
      setBoard(Array.isArray(response) ? response : (response.data || []));
    } catch (err: any) {
      console.error("Failed to load price board:", err);
      setError(err.message || "Failed to load price board");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const topItems = board.slice(0, 3);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Price Board"
        description="Daily reference for fruit pricing and margins."
        secondaryActions={[{ label: "Update Prices" }]}
      />
      
      {loading && (
        <div className="p-8 text-center text-muted-foreground">Loading price board...</div>
      )}

      {!loading && error && (
        <div className="p-8 text-center text-destructive bg-card border rounded-xl">
          <p>{error}</p>
          <button type="button" onClick={loadData} className="mt-3 underline">Try again</button>
        </div>
      )}

      {!loading && !error && board.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">Automated Pricing Intelligence</p>

          <div className="bg-card border rounded-xl overflow-hidden p-6 space-y-4 mb-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">TODAY'S RECOMMENDED PRICES</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topItems.map((item: any) => (
                <div key={item.productId} className="border rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-lg">{item.productName}</h4>
                    <span className="text-xl font-bold tabular-nums text-primary">
                      {formatCurrency(item.recommendedPrice)}
                      <span className="text-sm font-normal text-muted-foreground">/{item.unit?.toLowerCase() || 'kg'}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex flex-col"><span>Avg Cost</span><span className="font-medium text-foreground tabular-nums">{formatCurrency(item.avgCost)}</span></div>
                    <div className="flex flex-col"><span>Market</span><span className="font-medium text-foreground tabular-nums">{formatCurrency(item.marketPrice)}</span></div>
                    <div className="flex flex-col col-span-2">
                      <span>Recent Sales Price</span>
                      <span className="font-medium text-foreground tabular-nums">{formatCurrency(item.recentAvgSalePrice)}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t text-sm flex justify-between">
                    <span className="text-muted-foreground">Est. Margin <span className="font-medium text-emerald-600 tabular-nums">
                      {formatCurrency(item.recommendedPrice - item.avgCost)}
                    </span></span>
                    <span className="text-muted-foreground">Markup <span className="font-medium text-foreground tabular-nums">
                      {item.avgCost ? ((item.recommendedPrice - item.avgCost) / item.avgCost * 100).toFixed(1) : 0}%
                    </span></span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic mt-2">Recommendations based on recent costs, market rates, and rules</p>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-[13px] font-semibold uppercase tracking-wider text-muted-foreground text-left bg-muted/30">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 text-right font-semibold">Avg Cost</th>
                    <th className="px-4 py-3 text-right font-semibold">Market Price</th>
                    <th className="px-4 py-3 text-right font-semibold">Recent Sale</th>
                    <th className="px-4 py-3 text-right font-semibold">Recommended</th>
                    <th className="px-4 py-3 text-right font-semibold">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {board.map((item) => {
                    const margin = item.recommendedPrice - item.avgCost;
                    const marginPct = item.avgCost ? (margin / item.avgCost) * 100 : 0;
                    
                    return (
                      <tr key={item.productId} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {item.productName}
                          <span className="text-xs text-muted-foreground ml-1">({item.unit})</span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(item.avgCost)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(item.marketPrice)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(item.recentAvgSalePrice)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-primary">{formatCurrency(item.recommendedPrice)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className="text-emerald-600 font-medium">{formatCurrency(margin)}</span>
                          <span className="text-muted-foreground text-xs ml-2">({marginPct.toFixed(1)}%)</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && !error && board.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No pricing data available. Add inventory to see recommendations.
        </div>
      )}
    </div>
  )
}
