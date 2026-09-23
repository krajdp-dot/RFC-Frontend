import { cn } from "@/lib/utils";

export function BusinessPerformance({ data = {} }: { data?: any }) {
  const performance = data?.performance;

  const formatCurrency = (val: any) => {
    if (val == null) return "Not available";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));
  };

  const formatPct = (val: any) => {
    if (val == null) return "N/A";
    return `${val}%`;
  };

  if (!performance) {
    return (
      <div className="bg-card border rounded-xl overflow-hidden p-5 flex flex-col h-full">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">BUSINESS PERFORMANCE</h2>
          <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md">This Month</span>
        </div>
        <div className="grow flex items-center justify-center text-sm text-muted-foreground">
          Performance data unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl overflow-hidden p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">BUSINESS PERFORMANCE</h2>
        <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md">This Month</span>
      </div>
      
      <div className="space-y-2 text-sm grow flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Gross Revenue</span>
          <span className="tabular-nums font-medium">{formatCurrency(performance.grossRevenue)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Cost of Goods Sold (COGS)</span>
          <span className="tabular-nums font-medium">{formatCurrency(performance.cogs)}</span>
        </div>
        
        <div className="border-t pt-2 mt-2" />
        
        <div className="flex justify-between items-center text-base">
          <span className="font-medium">Gross Profit</span>
          <span className="font-semibold tabular-nums text-emerald-600">{formatCurrency(performance.grossProfit)}</span>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6">
        <div className="flex-1 bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Gross Margin</div>
          <div className="font-semibold tabular-nums">{formatPct(performance.marginPct)}</div>
        </div>
      </div>
    </div>
  );
}
