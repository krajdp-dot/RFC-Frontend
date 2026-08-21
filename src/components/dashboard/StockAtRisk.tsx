import { StatusBadge } from "@/components/shared/StatusBadge";

export function StockAtRisk() {
  const atRisk = [
    { name: "Guava", details: "45kg, 4d old", value: "₹2.8K", status: "URGENT", type: "error" },
    { name: "Orange", details: "85kg, 3d old", value: "₹3.5K", status: "MARKDOWN", type: "warning" },
    { name: "Mango (old)", details: "40kg, 4d old", value: "₹2.1K", status: "MARKDOWN", type: "warning" },
  ];

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Stock At Risk</h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium">₹8,400 Total</span>
      </div>
      <div className="p-0 flex-1 flex flex-col">
        {atRisk.map((item, idx) => (
          <div key={idx} className="p-4 border-b last:border-b-0 flex justify-between items-center hover:bg-muted/30">
            <div>
              <div className="font-medium text-sm flex items-center space-x-2">
                <span>{item.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{item.value}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.details}</div>
            </div>
            <StatusBadge status={item.status} type={item.type as "error" | "warning" | "success" | "info" | "default"} />
          </div>
        ))}
      </div>
      <div className="p-3 border-t bg-muted/10 text-center">
        <button className="text-sm font-medium text-primary hover:underline">View All</button>
      </div>
    </div>
  );
}
