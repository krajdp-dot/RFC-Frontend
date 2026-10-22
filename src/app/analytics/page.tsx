"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/fetchApi";

function formatPercent(value: number | undefined | null) {
  if (value === undefined || value === null) return "Not available";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatCurrency(value: number | undefined | null) {
  if (value === undefined || value === null) return "Not available";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashboard, sales, margins, wastage] = await Promise.allSettled([
          fetchApi('/dashboard'),
          fetchApi('/reports/sales'),
          fetchApi('/reports/margins'),
          fetchApi('/reports/wastage'),
        ]);
        
        setData({
          dashboard: dashboard.status === 'fulfilled' ? dashboard.value : null,
          sales: sales.status === 'fulfilled' ? sales.value : null,
          margins: margins.status === 'fulfilled' ? margins.value : null,
          wastage: wastage.status === 'fulfilled' ? wastage.value : null,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5 pb-8">
        <PageHeader title="Business Analytics" description="Advanced insights into business performance." />
        <div className="p-12 text-center text-muted-foreground">Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5 pb-12">
        <PageHeader title="Business Analytics" description="Advanced insights into business performance." />
        <div className="p-12 text-center text-destructive rounded-xl border border-border bg-white shadow-sm">{error}</div>
      </div>
    );
  }

  // Fields this page genuinely has no correct source for (period-over-period
  // growth needs two date ranges; inventory turnover and average payment
  // days need their own dedicated calculations that don't exist yet) stay
  // "Not available" rather than guessing. What follows is only derived from
  // real report/dashboard fields — no re-derived financial logic, just
  // reading and (for "best"/"highest") picking the max of an already
  // backend-computed list.
  const salesGrowth = undefined;
  const collectionRate = data?.dashboard?.sales?.total && Number(data.dashboard.sales.total) > 0
    ? (Number(data.dashboard.sales.collections) / Number(data.dashboard.sales.total)) * 100
    : null;
  const invTurnover = undefined;
  const grossMargin = data?.margins?.avgMargin !== undefined ? Number(data.margins.avgMargin) : undefined;
  const totalSalesValue = data?.sales?.totalSales ? Number(data.sales.totalSales) : 0;
  const totalWastageValue = data?.wastage?.totalWastageValue ? Number(data.wastage.totalWastageValue) : 0;
  const wastageRate = totalSalesValue > 0 ? (totalWastageValue / totalSalesValue) * 100 : undefined;
  const avgPaymentDays = undefined;

  const marginRows: any[] = Array.isArray(data?.margins?.data) ? data.margins.data : [];
  const bestSelling = marginRows.length > 0
    ? marginRows.reduce((best, r) => (Number(r.unitsSold) > Number(best.unitsSold) ? r : best))
    : null;
  const highestMarginProduct = marginRows.length > 0
    ? marginRows.reduce((best, r) => (Number(r.marginPct) > Number(best.marginPct) ? r : best))
    : null;

  const wastageRows: any[] = Array.isArray(data?.wastage?.data) ? data.wastage.data : [];
  const wastageByProduct = new Map<string, number>();
  for (const w of wastageRows) {
    wastageByProduct.set(w.productName, (wastageByProduct.get(w.productName) || 0) + Number(w.totalCost || 0));
  }
  let highestWastageProduct: { name: string; value: number } | null = null;
  for (const [name, value] of wastageByProduct.entries()) {
    if (!highestWastageProduct || value > highestWastageProduct.value) highestWastageProduct = { name, value };
  }

  const metrics = [
    { name: "Sales Growth", value: salesGrowth !== undefined ? formatPercent(salesGrowth) : "Not available", trend: salesGrowth && salesGrowth > 0 ? "up" : salesGrowth && salesGrowth < 0 ? "down" : "neutral", context: salesGrowth !== undefined ? "vs last period" : "Insufficient data" },
    { name: "Collection Efficiency", value: collectionRate !== null && !isNaN(collectionRate) ? `${collectionRate.toFixed(1)}%` : "Not available", trend: "neutral", context: "Based on today's collections" },
    { name: "Credit Growth", value: "Not available", trend: "neutral", context: "Insufficient data" },
    { name: "Inventory Turnover", value: invTurnover !== undefined ? `${invTurnover}x` : "Not available", trend: "neutral", context: "Insufficient data" },
    { name: "Wastage Rate", value: wastageRate !== undefined ? `${wastageRate}%` : "Not available", trend: "neutral", context: "Insufficient data" },
    { name: "Expense Ratio", value: "Not available", trend: "neutral", context: "Insufficient data" },
    { name: "Purchasing Efficiency", value: "Not available", trend: "neutral", context: "Insufficient data" },
    { name: "Customer Concentration", value: "Not available", trend: "neutral", context: "Insufficient data" },
    { name: "Supplier Concentration", value: "Not available", trend: "neutral", context: "Insufficient data" },
  ];

  const fruitIntel = [
    { label: "Best Selling", value: bestSelling?.productName || "Not available", sub: bestSelling ? `${bestSelling.unitsSold} sold` : "", type: "neutral" },
    { label: "Highest Margin", value: highestMarginProduct?.productName || "Not available", sub: highestMarginProduct ? `${highestMarginProduct.marginPct}%` : "", type: "neutral" },
    { label: "Highest Wastage", value: highestWastageProduct?.name || "Not available", sub: highestWastageProduct ? formatCurrency(highestWastageProduct.value) : "", type: "neutral" },
    { label: "Fastest Moving", value: "Not available", sub: "", type: "neutral" },
    { label: "Slowest Moving", value: "Not available", sub: "", type: "neutral" },
    { label: "Most Price Volatile", value: "Not available", sub: "", type: "neutral" },
  ];

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        title="Business Analytics"
        description="Advanced insights into business performance."
      />

      <MetricStrip
        metrics={[
          { label: "Sales Growth", value: salesGrowth !== undefined ? formatPercent(salesGrowth) : "N/A" },
          { label: "Collection Rate", value: collectionRate !== null && !isNaN(collectionRate) ? `${collectionRate.toFixed(1)}%` : "N/A" },
          { label: "Inventory Turnover", value: invTurnover !== undefined ? `${invTurnover}x` : "N/A" },
          { label: "Gross Margin", value: grossMargin !== undefined ? `${grossMargin}%` : "N/A" },
          { label: "Wastage Rate", value: wastageRate !== undefined ? `${wastageRate}%` : "N/A" },
          { label: "Avg Payment Days", value: avgPaymentDays !== undefined ? avgPaymentDays : "N/A" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="rounded-xl border border-border bg-white shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{metric.name}</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold tabular-nums">{metric.value}</span>
              {metric.trend === "up" && <ArrowUpRight className="h-5 w-5 text-emerald-500" />}
              {metric.trend === "down" && <ArrowDownRight className="h-5 w-5 text-red-500" />}
              {metric.trend === "neutral" && <ArrowRight className="h-5 w-5 text-gray-400" />}
            </div>
            <p className="text-sm text-muted-foreground">{metric.context}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-white shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Fruit Intelligence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b last:border-b-0 flex-wrap">
          {fruitIntel.map((intel, idx) => (
            <div key={intel.label} className={cn(
              "p-5",
              idx > 2 && "lg:border-t"
            )}>
              <p className="text-sm text-muted-foreground mb-1">{intel.label}</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-semibold">{intel.value}</span>
                {intel.sub && (
                  <span className={cn(
                    "text-sm font-medium",
                    intel.type === "positive" ? "text-emerald-600" : intel.type === "negative" ? "text-red-600" : "text-muted-foreground"
                  )}>
                    ({intel.sub})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
