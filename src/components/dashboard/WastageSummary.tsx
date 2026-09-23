import { Info } from "lucide-react";

export function WastageSummary({ data = {} }: { data?: any }) {
  const inventory = data?.inventory || {};
  const wastageValue = Number(inventory.wastageThisMonth || 0);

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Wastage This Month</h2>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-4">
        {wastageValue === 0 ? (
           <div className="text-center text-muted-foreground">
             <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
             <p className="text-sm font-medium">No wastage recorded</p>
           </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl font-bold tabular-nums tracking-tight text-red-500">{formatCurrency(wastageValue)}</div>
            <div className="text-sm text-muted-foreground mt-2">Total Value Lost</div>
          </div>
        )}
      </div>
    </div>
  );
}
