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
          startDate.setHours(0, 0, 0, 0);
        } else if (period === "This Week") {
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
        } else if (period === "This Month") {
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
        }
        
        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
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
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
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
        <div className="p-8 text-center text-destructive bg-card border rounded-xl">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Money Flow Waterfall */}
          <div className="bg-card border rounded-xl p-6 lg:p-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-8">Cash Flow Statement ({period})</h2>
            
            <div className="space-y-4 text-lg">
              {/* Opening Balance */}
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium">Opening Balance</span>
                <span className="font-semibold tabular-nums">{formatCurrency(data.openingBalance || 0)}</span>
              </div>
              
              {/* Receipts (Inflows) */}
              <div className="pl-4 space-y-3 py-2">
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-base">+ Cash Sales Collections</span>
                  <span className="tabular-nums font-medium">+{formatCurrency(data.salesCash || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-base">+ Customer Receivables Received</span>
                  <span className="tabular-nums font-medium">+{formatCurrency(data.customerPayments || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-base">+ Other Receipts</span>
                  <span className="tabular-nums font-medium">+{formatCurrency(data.otherReceipts || 0)}</span>
                </div>
              </div>
              
              {/* Payments (Outflows) */}
              <div className="pl-4 space-y-3 py-2">
                <div className="flex justify-between items-center text-red-600">
                  <span className="text-base">− Cash Purchases Paid</span>
                  <span className="tabular-nums font-medium">−{formatCurrency(data.purchasesCash || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span className="text-base">− Supplier Payables Paid</span>
                  <span className="tabular-nums font-medium">−{formatCurrency(data.supplierPayments || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span className="text-base">− Expenses</span>
                  <span className="tabular-nums font-medium">−{formatCurrency(data.expenses || 0)}</span>
                </div>
              </div>
              
              {/* Transfers */}
              <div className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-lg text-blue-600 mt-2">
                <span className="text-base">↔ Internal Transfers</span>
                <span className="tabular-nums font-medium">{formatCurrency(data.transfers || 0)}</span>
              </div>
              
              <div className="border-t-2 border-dashed my-4"></div>
              
              {/* Closing Balance */}
              <div className="flex justify-between items-center py-4">
                <span className="font-bold text-xl">Closing Balance</span>
                <span className="font-bold text-2xl tabular-nums">{formatCurrency(data.closingBalance || 0)}</span>
              </div>
            </div>
          </div>

          {/* Summary Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6">
              <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2">Total Money In</h3>
              <p className="text-3xl font-bold text-emerald-600 tabular-nums">
                {formatCurrency(
                  (Number(data.salesCash) || 0) + 
                  (Number(data.customerPayments) || 0) + 
                  (Number(data.otherReceipts) || 0)
                )}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-6">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">Total Money Out</h3>
              <p className="text-3xl font-bold text-red-600 tabular-nums">
                {formatCurrency(
                  (Number(data.purchasesCash) || 0) + 
                  (Number(data.supplierPayments) || 0) + 
                  (Number(data.expenses) || 0)
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
