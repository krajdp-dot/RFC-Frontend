import { AlertCircle, AlertTriangle, Package, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActionCenter({ data = {} }: { data?: any }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground grow">NEEDS ATTENTION</h2>
        <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">3</span>
      </div>
      
      <div className="flex flex-col divide-y grow">
        <div className="p-4 flex items-center gap-3 group hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <p className="font-medium text-sm truncate">Rajesh Traders</p>
            <p className="text-xs text-muted-foreground truncate">₹72K overdue · 17 days</p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0 text-xs px-3 h-auto py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            Receive Payment
          </Button>
        </div>
        
        <div className="p-4 flex items-center gap-3 group hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <p className="font-medium text-sm truncate">Merchant A</p>
            <p className="text-xs text-muted-foreground truncate">₹50K payable due tomorrow</p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0 text-xs px-3 h-auto py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            Pay Supplier
          </Button>
        </div>
        
        <div className="p-4 flex items-center gap-3 group hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <Package className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <p className="font-medium text-sm truncate">Banana Stock</p>
            <p className="text-xs text-muted-foreground truncate">18% below preferred level</p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0 text-xs px-3 h-auto py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            New Purchase
          </Button>
        </div>
        
        <div className="p-4 flex items-center gap-3 group hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <p className="font-medium text-sm truncate">Collections</p>
            <p className="text-xs text-muted-foreground truncate">₹84K behind target this week</p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0 text-xs px-3 h-auto py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            Review
          </Button>
        </div>
      </div>
    </div>
  );
}
