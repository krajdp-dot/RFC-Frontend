import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InventorySnapshot({ data = {} }: { data?: any }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">STOCK AT A GLANCE</h2>
        <Button variant="link" className="text-sm p-0 h-auto font-medium flex items-center gap-1">
          View Inventory <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="p-5 flex flex-col grow">
        <div className="mb-4">
          <div className="text-2xl font-bold tracking-tight tabular-nums">₹4,75,000</div>
          <div className="text-sm text-muted-foreground">Inventory value</div>
        </div>
        
        <div className="flex items-center justify-between text-sm font-medium mb-5">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Products</span>
            <span className="text-foreground tabular-nums">24</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Low Stock</span>
            <span className="text-amber-500 tabular-nums">4</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-normal">Wastage</span>
            <span className="text-red-500 tabular-nums">₹18.5K</span>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-auto">
          <div className="flex flex-col gap-3">
            {[
              { name: "Apple", qty: "240 kg", val: "₹32.4K", pct: "75%", color: "bg-emerald-500" },
              { name: "Banana", qty: "180 kg", val: "₹9.3K", pct: "25%", color: "bg-amber-500" },
              { name: "Mango", qty: "95 kg", val: "₹14.7K", pct: "40%", color: "bg-blue-500" },
              { name: "Grapes", qty: "120 kg", val: "₹28.8K", pct: "60%", color: "bg-emerald-500" },
              { name: "Orange", qty: "85 kg", val: "₹11.9K", pct: "15%", color: "bg-red-500" },
            ].map((item) => (
              <div key={item.name} className="flex flex-col gap-1.5 group cursor-pointer">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium group-hover:text-primary transition-colors">{item.name}</span>
                  <div className="flex items-center gap-2 text-muted-foreground tabular-nums">
                    <span>{item.qty}</span>
                    <span>·</span>
                    <span className="font-semibold text-foreground">{item.val}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", item.color)} style={{ width: item.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
