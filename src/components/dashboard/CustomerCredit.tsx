import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomerCredit({ data = {} }: { data?: any }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">MONEY OUT WITH CUSTOMERS</h2>
        <Button variant="link" className="text-sm p-0 h-auto font-medium flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="p-5 flex flex-col grow">
        <div className="mb-4">
          <div className="text-2xl font-bold tracking-tight tabular-nums">₹3,42,000</div>
          <div className="text-sm text-muted-foreground">Total outstanding</div>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium mb-5">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Overdue</span>
            <span className="text-red-500 tabular-nums">₹84K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Due soon</span>
            <span className="text-amber-500 tabular-nums">₹42K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Current</span>
            <span className="text-foreground tabular-nums">₹2.36L</span>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-auto">
          <div className="flex flex-col divide-y -my-2">
            <div className="py-2.5 flex justify-between items-center group cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded-md transition">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium">Rajesh Traders</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">₹72,000</div>
                <div className="text-[11px] text-muted-foreground">17 days overdue</div>
              </div>
            </div>
            
            <div className="py-2.5 flex justify-between items-center group cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded-md transition">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-medium">Amit Retail</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">₹43,000</div>
                <div className="text-[11px] text-muted-foreground">9 days overdue</div>
              </div>
            </div>
            
            <div className="py-2.5 flex justify-between items-center group cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded-md transition">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">Sharma Retail</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">₹31,000</div>
                <div className="text-[11px] text-muted-foreground">5 days overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
