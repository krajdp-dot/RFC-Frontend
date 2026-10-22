"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { fetchApi } from "@/lib/fetchApi";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function MoneyFlowPage() {
  const [period, setPeriod] = useState("This Month")
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        
        const now = new Date();
        let startDate = new Date();
        
        if (period === "Today") {
          // no adjustment — startDate stays as today
        } else if (period === "This Week") {
          startDate.setDate(now.getDate() - now.getDay());
        } else if (period === "This Month") {
          startDate.setDate(1);
        }

        // Date-only (YYYY-MM-DD), matching every other date-range endpoint
        // in this app — a full ISO timestamp here was being parsed as a
        // business-date string one component down, which is not what it is.
        const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
        const params = new URLSearchParams({
          startDate: toDateStr(startDate),
          endDate: toDateStr(now),
        });

        const response = await fetchApi(`/reports/money-flow?${params.toString()}`);
        setData(response);
      } catch (err: any) {
        console.error("Failed to load money flow:", err);
        setError(err.message || "Failed to load money flow");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [period]);
  
  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      <PageHeader
        title="Money Flow"
        subtitle="See how money moves through your business."
      />

      {/* Period Selector */}
      <div className="flex bg-muted/50 p-1 rounded-lg w-fit">
        {["Today", "This Week", "This Month"].map((p) => (
          <Button
            key={p}
            variant="ghost"
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-1.5 h-auto text-sm font-medium rounded-md transition-colors hover:bg-transparent",
              period === p ? "bg-background shadow-sm text-foreground hover:bg-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="p-12 text-center text-muted-foreground">Loading money flow...</div>
      )}

      {!loading && error && (
        <div className="p-8 text-center text-destructive rounded-xl border border-border bg-white shadow-sm">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Money Flow Waterfall */}
          <div className="rounded-xl border border-border bg-white shadow-sm p-6 lg:p-8">
            <h2 className="text-sm font-semibold tracking-tight text-foreground mb-8">Cash Flow Statement ({period})</h2>
            
            <div className="space-y-4 text-lg">
              {/* Opening Balance */}
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium">Opening Balance</span>
                <span className="font-semibold tabular-nums">{formatCurrency(data.opening || 0)}</span>
              </div>
              
              {/* Receipts (Inflows) */}
              <div className="pl-4 space-y-3 py-2">
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-base">+ Received from Customers</span>
                  <span className="tabular-nums font-medium">+{formatCurrency(data.collections || 0)}</span>
                </div>
              </div>
              
              {/* Payments (Outflows) */}
              <div className="pl-4 space-y-3 py-2">
                <div className="flex justify-between items-center text-red-600">
                  <span className="text-base">− Paid to Suppliers</span>
                  <span className="tabular-nums font-medium">−{formatCurrency(data.purchases || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span className="text-base">− Expenses</span>
                  <span className="tabular-nums font-medium">−{formatCurrency(data.expenses || 0)}</span>
                </div>
              </div>
              
              {/* Transfers — informational only; doesn't affect the totals
                  above since cash/bank/digital are pooled together. */}
              <div className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-lg text-blue-600 mt-2">
                <span className="text-base">↔ Internal Transfers (volume)</span>
                <span className="tabular-nums font-medium">{formatCurrency(data.transfers || 0)}</span>
              </div>
              
              <div className="border-t-2 border-dashed my-4"></div>
              
              {/* Closing Balance */}
              <div className="flex justify-between items-center py-4">
                <span className="font-bold text-xl">Closing Balance</span>
                <span className="font-bold text-2xl tabular-nums">{formatCurrency(data.closing || 0)}</span>
              </div>
            </div>
          </div>

          {/* Summary Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6">
              <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2">Total Money In</h3>
              <p className="text-3xl font-bold text-emerald-600 tabular-nums">
                {formatCurrency(Number(data.collections) || 0)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-6">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">Total Money Out</h3>
              <p className="text-3xl font-bold text-red-600 tabular-nums">
                {formatCurrency((Number(data.purchases) || 0) + (Number(data.expenses) || 0))}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
