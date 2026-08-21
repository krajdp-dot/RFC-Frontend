import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const metrics = [
    { name: "Sales Growth", value: "+12.4%", trend: "up", context: "↑ vs last month" },
    { name: "Collection Efficiency", value: "82%", trend: "down", context: "₹84K still outstanding" },
    { name: "Credit Growth", value: "+8.2%", trend: "down", context: "Watch - growing faster than sales" },
    { name: "Inventory Turnover", value: "4.2x", trend: "up", context: "Healthy for perishables" },
    { name: "Wastage Rate", value: "2.1%", trend: "up", context: "Below 3% target" },
    { name: "Expense Ratio", value: "4.2%", trend: "neutral", context: "Stable" },
    { name: "Purchasing Efficiency", value: "92%", trend: "up", context: "Good supplier pricing" },
    { name: "Customer Concentration", value: "35%", trend: "neutral", context: "Top 3 customers = 35% of sales" },
    { name: "Supplier Concentration", value: "42%", trend: "neutral", context: "Top 2 suppliers = 42% of purchases" },
  ];

  const fruitIntel = [
    { label: "Best Selling", value: "Mango", sub: "65 kg/day", type: "positive" },
    { label: "Highest Margin", value: "Pomegranate", sub: "28%", type: "positive" },
    { label: "Highest Wastage", value: "Guava", sub: "₹4.2K", type: "negative" },
    { label: "Fastest Moving", value: "Banana", sub: "80 kg/day", type: "positive" },
    { label: "Slowest Moving", value: "Lemon", sub: "8 kg/day", type: "negative" },
    { label: "Most Price Volatile", value: "Mango", sub: "±15%", type: "neutral" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Business Analytics"
        description="Advanced insights into business performance."
      />

      <MetricStrip
        metrics={[
          { label: "Sales Growth", value: "+12.4%" },
          { label: "Collection Rate", value: "82%" },
          { label: "Inventory Turnover", value: "4.2x" },
          { label: "Gross Margin", value: "25.3%" },
          { label: "Wastage Rate", value: "2.1%" },
          { label: "Avg Payment Days", value: "14" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-card border rounded-xl p-5 space-y-3">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">{metric.name}</h3>
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

      <section className="bg-card border rounded-xl overflow-hidden mt-6">
        <div className="p-5 border-b">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Fruit Intelligence</h2>
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
                <span className={cn(
                  "text-sm font-medium",
                  intel.type === "positive" ? "text-emerald-600" : intel.type === "negative" ? "text-red-600" : "text-muted-foreground"
                )}>
                  ({intel.sub})
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
