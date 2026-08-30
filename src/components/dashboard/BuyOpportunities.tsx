import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

export function BuyOpportunities({ data = {} }: { data?: any }) {
  const opportunities = [
    { 
      name: "Apple", 
      details: "Stock low (35kg) • Daily sales 80kg", 
      price: "Price ₹118 • Margin ₹17/kg",
      status: "BUY", 
      type: "success" 
    },
    { 
      name: "Banana", 
      details: "Price dropped 5% • Good demand", 
      price: "Current ₹24/kg",
      status: "CONSIDER", 
      type: "info" 
    },
  ];

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Buy Opportunities</h2>
      </div>
      <div className="p-0 flex-1 flex flex-col">
        {opportunities.map((item, idx) => (
          <div key={idx} className="p-4 border-b last:border-b-0 hover:bg-muted/30 space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm">{item.name}</span>
              <StatusBadge status={item.status} type={item.type as "error" | "warning" | "success" | "info" | "default"} />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{item.details}</p>
              <p className="font-medium text-foreground">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t bg-muted/10 text-center mt-auto">
        <Button variant="link" className="text-sm p-0 h-auto font-medium">View Board</Button>
      </div>
    </div>
  );
}
