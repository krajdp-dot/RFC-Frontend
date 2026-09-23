import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info } from "lucide-react";

export function BuyOpportunities({ data = {} }: { data?: any }) {
  // If the API provided opportunities, we would read them here.
  // We assume data.opportunities could exist in the future.
  const opportunities = data?.opportunities || [];

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex items-center space-x-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Buy Opportunities</h2>
      </div>
      <div className="p-0 flex-1 flex flex-col justify-center">
        {opportunities.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
             <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No buy opportunities</p>
            <p className="text-xs mt-1">Market conditions do not currently suggest any optimal purchases.</p>
          </div>
        ) : (
          opportunities.map((item: any, idx: number) => (
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
          ))
        )}
      </div>
      <div className="p-3 border-t bg-muted/10 text-center mt-auto">
        <Link href="/price-board" className="text-sm p-0 h-auto font-medium text-primary hover:underline">View Price Board</Link>
      </div>
    </div>
  );
}
