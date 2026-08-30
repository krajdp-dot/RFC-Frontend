import { cn } from "@/lib/utils";

export function CashMovement({ data = {} }: { data?: any }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">CASH MOVEMENT</h2>
        <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md">Today</span>
      </div>
      
      <div className="space-y-4 text-sm grow flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Opening Balance</span>
          <span className="tabular-nums font-medium">₹2,85,000</span>
        </div>
        
        <div className="flex justify-between items-center text-emerald-600">
          <span className="flex items-center gap-2">
            <span className="w-4 inline-block text-center">+</span> Money Received
          </span>
          <span className="font-semibold tabular-nums">+ ₹2,45,000</span>
        </div>
        
        <div className="flex justify-between items-center text-red-500">
          <span className="flex items-center gap-2">
            <span className="w-4 inline-block text-center">−</span> Money Paid
          </span>
          <span className="font-semibold tabular-nums">− ₹1,88,000</span>
        </div>
        
        <div className="flex justify-between items-center text-blue-600 bg-blue-500/5 p-2 -mx-2 rounded-md border border-blue-500/10">
          <span className="flex items-center gap-2">
            <span className="w-4 inline-block text-center">↔</span> Transfers
          </span>
          <span className="font-semibold tabular-nums">↔ ₹25,000</span>
        </div>
        
        <div className="border-t-4 border-double pt-3 mt-1 flex justify-between items-center text-base">
          <span className="font-bold">Closing Balance</span>
          <span className="font-bold tabular-nums">₹3,17,000</span>
        </div>
      </div>
    </div>
  );
}
