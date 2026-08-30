import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupplierPayables({ data = {} }: { data?: any }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">MONEY COMMITTED TO SUPPLIERS</h2>
        <Button variant="link" className="text-sm p-0 h-auto font-medium flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="p-5 flex flex-col grow">
        <div className="mb-4">
          <div className="text-2xl font-bold tracking-tight tabular-nums">₹2,18,000</div>
          <div className="text-sm text-muted-foreground">Total payable</div>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium mb-5">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Overdue</span>
            <span className="text-red-500 tabular-nums">₹12K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Due today</span>
            <span className="text-amber-500 tabular-nums">₹40K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Due this week</span>
            <span className="text-foreground tabular-nums">₹75K</span>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-auto">
          <div className="flex flex-col divide-y -my-2">
            <div className="py-2.5 flex justify-between items-center group cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded-md transition">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-medium">Merchant A</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">₹50,000</div>
                <div className="text-[11px] text-muted-foreground">Due tomorrow</div>
              </div>
            </div>
            
            <div className="py-2.5 flex justify-between items-center group cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded-md transition">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">Merchant B</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">₹38,000</div>
                <div className="text-[11px] text-muted-foreground">Due in 3 days</div>
              </div>
            </div>
            
            <div className="py-2.5 flex justify-between items-center group cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded-md transition">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium">Merchant C</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">₹12,000</div>
                <div className="text-[11px] text-muted-foreground">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
