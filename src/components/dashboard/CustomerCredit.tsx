import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CustomerCredit({ data = {} }: { data?: any }) {
  const receivables = data?.receivables || {};

  const formatCurrency = (val: any) => {
    if (!val) return "₹0";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));
  };

  const formatCompact = (val: any) => {
    if (!val) return "₹0";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 }).format(Number(val));
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">MONEY OUT WITH CUSTOMERS</h2>
        <Link href="/receivables" className="text-sm p-0 h-auto font-medium flex items-center gap-1 text-primary hover:underline">View All <ArrowRight className="w-3 h-3" /></Link>
      </div>
      
      <div className="p-5 flex flex-col grow justify-between">
        <div className="mb-4">
          <div className="text-2xl font-bold tracking-tight tabular-nums">{formatCurrency(receivables.total)}</div>
          <div className="text-sm text-muted-foreground">Total outstanding</div>
        </div>
        
        <div className="flex items-center justify-between text-sm font-medium mt-auto border-t pt-5">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal mb-1">Overdue</span>
            <span className="text-red-500 tabular-nums">{formatCompact(receivables.overdue)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal mb-1">Due soon</span>
            <span className="text-amber-500 tabular-nums">{formatCompact(receivables.dueSoon)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal mb-1">Current</span>
            <span className="text-foreground tabular-nums">{formatCompact(receivables.current)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
