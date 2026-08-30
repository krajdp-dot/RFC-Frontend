import { TrendingDown } from "lucide-react";

export function WastageSummary({ data = {} }: { data?: any }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Wastage This Month</h2>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold tabular-nums tracking-tight">₹18,500</div>
          <div className="flex items-center justify-center space-x-1 mt-2 text-emerald-600 font-medium text-sm">
            <TrendingDown className="h-4 w-4" />
            <span>12% vs last month</span>
          </div>
        </div>
        
        <div className="w-full space-y-2 pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Spoilage</span>
            <span className="font-medium tabular-nums">₹10.2K</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "55%" }}></div>
          </div>
          
          <div className="flex justify-between items-center text-sm pt-2">
            <span className="text-muted-foreground">Damage</span>
            <span className="font-medium tabular-nums">₹5.1K</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "27%" }}></div>
          </div>
          
          <div className="flex justify-between items-center text-sm pt-2">
            <span className="text-muted-foreground">Other</span>
            <span className="font-medium tabular-nums">₹3.2K</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: "18%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
