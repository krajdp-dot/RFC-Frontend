import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export function HeroSummary() {
  return (
    <div className="bg-card border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="w-full md:w-auto">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">TODAY</h2>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-bold tracking-tight tabular-nums">₹1,80,000</span>
          <span className="text-muted-foreground font-medium">Sales</span>
        </div>
        
        {/* Proportion Bar */}
        <div className="w-full max-w-sm h-1.5 rounded-full overflow-hidden flex mb-2">
          <div className="bg-emerald-500" style={{ width: '33.33%' }} />
          <div className="bg-blue-500" style={{ width: '22.22%' }} />
          <div className="bg-amber-500" style={{ width: '44.45%' }} />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cash <span className="tabular-nums">₹60K</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Digital <span className="tabular-nums">₹40K</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Credit <span className="tabular-nums">₹80K</span></span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium self-start md:self-auto shrink-0">
        <TrendingUp className="w-4 h-4" />
        <span>12.4% vs yesterday</span>
      </div>
    </div>
  );
}
