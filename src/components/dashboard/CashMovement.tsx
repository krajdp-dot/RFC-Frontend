import { cn } from "@/lib/utils";

export function CashMovement({ data = {} }: { data?: any }) {
  const sales = data?.sales || {};
  const purchases = data?.purchases || {};
  const expenses = data?.expenses || {};

  const moneyReceived = Number(sales.collections || 0);
  const moneyPaid = Number(purchases.paid || 0) + Number(expenses.total || 0);
  
  const netChange = moneyReceived - moneyPaid;

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">CASH MOVEMENT</h2>
        <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md">Today</span>
      </div>
      
      <div className="space-y-4 text-sm grow flex flex-col justify-center">
        <div className="flex justify-between items-center text-emerald-600">
          <span className="flex items-center gap-2">
            <span className="w-4 inline-block text-center">+</span> Money Received
          </span>
          <span className="font-semibold tabular-nums">+{formatCurrency(moneyReceived)}</span>
        </div>
        
        <div className="flex justify-between items-center text-red-500">
          <span className="flex items-center gap-2">
            <span className="w-4 inline-block text-center">−</span> Money Paid
          </span>
          <span className="font-semibold tabular-nums">−{formatCurrency(moneyPaid)}</span>
        </div>
        
        <div className="border-t-4 border-double pt-3 mt-1 flex justify-between items-center text-base">
          <span className="font-bold">Net Change</span>
          <span className={cn("font-bold tabular-nums", netChange >= 0 ? "text-emerald-600" : "text-red-500")}>
            {netChange > 0 ? "+" : ""}{formatCurrency(netChange)}
          </span>
        </div>
      </div>
    </div>
  );
}
