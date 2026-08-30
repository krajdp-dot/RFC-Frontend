import { cn } from "@/lib/utils";

export function BusinessPerformance({ data = {} }: { data?: any }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">BUSINESS PERFORMANCE</h2>
        <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md">This Month</span>
      </div>
      
      <div className="space-y-2 text-sm grow flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Revenue</span>
          <span className="tabular-nums font-medium">₹28,40,000</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Cost of Goods Sold</span>
          <span className="tabular-nums font-medium">₹21,20,000</span>
        </div>
        
        <div className="border-t pt-2 mt-2" />
        
        <div className="flex justify-between items-center text-base">
          <span className="font-medium">Gross Profit</span>
          <span className="font-semibold tabular-nums">₹7,20,000</span>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-muted-foreground">Operating Expenses</span>
          <span className="tabular-nums font-medium">₹2,10,000</span>
        </div>
        
        <div className="border-t pt-3 mt-3" />
        
        <div className="flex justify-between items-center text-lg">
          <span className="font-bold">Net Profit</span>
          <span className="font-bold tabular-nums text-emerald-600">₹5,10,000</span>
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-1">Profit after all operating expenses</p>
      </div>
      
      <div className="flex gap-4 mt-6">
        <div className="flex-1 bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Gross Margin</div>
          <div className="font-semibold tabular-nums">25.3%</div>
        </div>
        <div className="flex-1 bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10">
          <div className="text-xs text-emerald-700/80 mb-1">Net Margin</div>
          <div className="font-semibold tabular-nums text-emerald-600">17.9%</div>
        </div>
      </div>
    </div>
  );
}
