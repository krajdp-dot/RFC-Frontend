import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export function PurchasingCapacity({ data = {} }: { data?: any }) {
  return (
    <div className="bg-card border rounded-xl h-full flex flex-col p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">READY TO RESTOCK?</h2>
        <button className="text-muted-foreground hover:text-foreground transition-colors group relative">
          <Info className="w-4 h-4" />
          <span className="sr-only">Info</span>
        </button>
      </div>
      
      <div className="mb-6 text-center">
        <div className="text-3xl font-bold tracking-tight tabular-nums mb-1">₹2,15,000</div>
        <div className="text-sm text-muted-foreground">Estimated Purchasing Capacity</div>
      </div>
      
      <div className="space-y-2 text-sm mb-6 grow">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cash + Bank</span>
          <span className="font-semibold tabular-nums">₹2,19,000</span>
        </div>
        <div className="flex justify-between text-emerald-600">
          <span>Expected collections</span>
          <span className="font-semibold tabular-nums">+₹70,000</span>
        </div>
        <div className="flex justify-between text-red-500">
          <span>Supplier commitments</span>
          <span className="font-semibold tabular-nums">−₹40,000</span>
        </div>
        <div className="flex justify-between text-red-500">
          <span>Essential expenses</span>
          <span className="font-semibold tabular-nums">−₹34,000</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-3 mt-auto">
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold tracking-wider uppercase">
          GOOD TO RESTOCK
        </div>
        <div className="text-[11px] text-muted-foreground">
          Management estimate · Not guaranteed
        </div>
      </div>
    </div>
  );
}
