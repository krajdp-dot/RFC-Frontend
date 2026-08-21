"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function MoneyFlowPage() {
  const [period, setPeriod] = useState("Today")
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Money Flow"
        subtitle="See how money moves through your business."
      />

      {/* Period Selector */}
      <div className="flex bg-muted/50 p-1 rounded-lg w-fit">
        {["Today", "This Week", "This Month"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              period === p ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Money Flow Waterfall */}
      <div className="bg-card border rounded-xl p-6 lg:p-8">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-8">Cash Flow Statement ({period})</h2>
        
        <div className="space-y-4 text-lg">
          {/* Opening Balance */}
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-medium">Opening Balance</span>
            <span className="font-semibold tabular-nums">₹2,85,000</span>
          </div>
          
          {/* Receipts (Inflows) */}
          <div className="pl-4 space-y-3 py-2">
            <div className="flex justify-between items-center text-emerald-600">
              <span className="text-base">+ Sales Collections</span>
              <span className="tabular-nums font-medium">+₹2,45,000</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600">
              <span className="text-base">+ Customer Collections</span>
              <span className="tabular-nums font-medium">+₹38,000</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600">
              <span className="text-base">+ Other Receipts</span>
              <span className="tabular-nums font-medium">+₹5,000</span>
            </div>
          </div>
          
          {/* Payments (Outflows) */}
          <div className="pl-4 space-y-3 py-2">
            <div className="flex justify-between items-center text-red-600">
              <span className="text-base">− Purchases Paid</span>
              <span className="tabular-nums font-medium">−₹1,20,000</span>
            </div>
            <div className="flex justify-between items-center text-red-600">
              <span className="text-base">− Supplier Payments</span>
              <span className="tabular-nums font-medium">−₹45,000</span>
            </div>
            <div className="flex justify-between items-center text-red-600">
              <span className="text-base">− Expenses</span>
              <span className="tabular-nums font-medium">−₹8,500</span>
            </div>
          </div>
          
          {/* Transfers */}
          <div className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-lg text-blue-600">
            <span className="text-base">↔ Internal Transfers</span>
            <span className="tabular-nums font-medium">₹25,000</span>
          </div>
          
          <div className="border-t-2 border-dashed my-4"></div>
          
          {/* Closing Balance */}
          <div className="flex justify-between items-center py-4">
            <span className="font-bold text-xl">Closing Balance</span>
            <span className="font-bold text-2xl tabular-nums">₹3,99,500</span>
          </div>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6">
          <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2">Total Money In</h3>
          <p className="text-3xl font-bold text-emerald-600 tabular-nums">₹2,88,000</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-6">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">Total Money Out</h3>
          <p className="text-3xl font-bold text-red-600 tabular-nums">₹1,73,500</p>
        </div>
      </div>
    </div>
  )
}
