"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { PageHeader } from "@/components/shared/PageHeader"
import { MetricStrip } from "@/components/shared/MetricStrip"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { fetchApi } from "@/lib/fetchApi";
import Link from "next/link";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function PayablesPage() {
  const [summary, setSummary] = useState<any>(null);
  const [aging, setAging] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      
      const [summaryData, agingData] = await Promise.all([
        fetchApi('/payables'),
        fetchApi('/payables/aging')
      ]);
      
      setSummary(summaryData);
      setAging(Array.isArray(agingData) ? agingData : (agingData.data || []));
    } catch (err: any) {
      console.error("Failed to load payables:", err);
      setError(err.message || "Failed to load payables");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const metrics = [
    { label: "Total Payables", value: formatCurrency(summary?.totalPayables || 0) },
    { label: "Overdue", value: formatCurrency(summary?.totalOverdue || 0) },
    { label: "Due Soon (0-15d)", value: formatCurrency(summary?.due0To15 || 0) },
    { label: "Current", value: formatCurrency(summary?.current || 0) },
    { label: "Paid This Month", value: formatCurrency(summary?.paidThisMonth || 0) },
  ];

  const total = Number(summary?.totalPayables) || 1;
  const bucket0to15Pct = ((Number(summary?.due0To15) || 0) / total) * 100;
  const bucket16to30Pct = ((Number(summary?.due16To30) || 0) / total) * 100;
  const bucket31to45Pct = ((Number(summary?.due31To45) || 0) / total) * 100;
  const bucketOver45Pct = ((Number(summary?.dueOver45) || 0) / total) * 100;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Payables"
        subtitle="Money you owe to suppliers."
        primaryAction={{ label: "Make Payment" }}
      />

      <MetricStrip metrics={metrics} />

      {/* Ageing Breakdown */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Ageing Breakdown</h2>
        <div className="flex h-8 rounded-md overflow-hidden mb-4 bg-muted">
          <div className="bg-emerald-500" style={{ width: `${bucket0to15Pct}%` }} title={`0-15 days: ${formatCurrency(summary?.due0To15)}`}></div>
          <div className="bg-amber-500" style={{ width: `${bucket16to30Pct}%` }} title={`16-30 days: ${formatCurrency(summary?.due16To30)}`}></div>
          <div className="bg-orange-500" style={{ width: `${bucket31to45Pct}%` }} title={`31-45 days: ${formatCurrency(summary?.due31To45)}`}></div>
          <div className="bg-red-500" style={{ width: `${bucketOver45Pct}%` }} title={`45+ days: ${formatCurrency(summary?.dueOver45)}`}></div>
        </div>
        <div className="grid grid-cols-4 text-sm text-center">
          <div>
            <p className="text-muted-foreground mb-1">0-15 days</p>
            <p className="font-semibold tabular-nums">{formatCurrency(summary?.due0To15 || 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">16-30 days</p>
            <p className="font-semibold tabular-nums">{formatCurrency(summary?.due16To30 || 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">31-45 days</p>
            <p className="font-semibold tabular-nums">{formatCurrency(summary?.due31To45 || 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">45+ days</p>
            <p className="font-semibold tabular-nums text-red-600">{formatCurrency(summary?.dueOver45 || 0)}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Supplier Payables</h2>
          <Button variant="outline" size="sm" onClick={loadData}>Refresh</Button>
        </div>
        
        {loading && (
          <div className="p-8 text-center text-muted-foreground">Loading payables...</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
            <button type="button" onClick={loadData} className="mt-3 underline">Try again</button>
          </div>
        )}

        {!loading && !error && aging.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No suppliers with outstanding balances.
          </div>
        )}

        {!loading && !error && aging.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground text-left">
                  <th className="px-6 py-3 font-medium">Supplier</th>
                  <th className="px-6 py-3 font-medium text-right">Outstanding</th>
                  <th className="px-6 py-3 font-medium text-right">0-15d</th>
                  <th className="px-6 py-3 font-medium text-right">16-30d</th>
                  <th className="px-6 py-3 font-medium text-right">31-45d</th>
                  <th className="px-6 py-3 font-medium text-right">45d+</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {aging.map((r) => (
                  <tr key={r.supplierId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <Link href={`/suppliers/${r.supplierId}`} className="hover:underline">
                        {r.supplierName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-bold text-amber-600">{formatCurrency(r.totalOutstanding)}</td>
                    <td className="px-6 py-4 text-right tabular-nums">{formatCurrency(r.due0To15)}</td>
                    <td className="px-6 py-4 text-right tabular-nums">{formatCurrency(r.due16To30)}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-orange-600">{formatCurrency(r.due31To45)}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-red-600 font-medium">{formatCurrency(r.dueOver45)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm">Pay Now</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
