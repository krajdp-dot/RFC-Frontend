import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info } from "lucide-react";

export function StockAtRisk({ data = {} }: { data?: any }) {
  const freshness = data?.freshness || {};
  const atRiskLots = Number(freshness.atRiskLots || 0);
  const atRiskValue = Number(freshness.atRiskValue || 0);
  const clearTodayCount = Number(freshness.clearTodayCount || 0);

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {atRiskLots > 0 && <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Stock At Risk</h2>
        </div>
        {atRiskValue > 0 && (
           <span className="text-xs text-muted-foreground font-medium">{formatCurrency(atRiskValue)} Total</span>
        )}
      </div>
      <div className="p-0 flex-1 flex flex-col justify-center">
        {atRiskLots === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
             <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No stock at risk</p>
            <p className="text-xs mt-1">Your inventory is currently within the configured freshness thresholds.</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
             <div className="flex justify-between items-center text-sm border-b pb-3">
                <span className="font-medium text-muted-foreground">At-Risk Lots</span>
                <span className="font-semibold">{atRiskLots}</span>
             </div>
             <div className="flex justify-between items-center text-sm border-b pb-3">
                <span className="font-medium text-muted-foreground">Needs Clearing Today</span>
                <span className="font-semibold text-red-500">{clearTodayCount}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">Total Value at Risk</span>
                <span className="font-semibold">{formatCurrency(atRiskValue)}</span>
             </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t bg-muted/10 text-center mt-auto">
        <Link href="/inventory" className="text-sm p-0 h-auto font-medium text-primary hover:underline">View All</Link>
      </div>
    </div>
  );
}
