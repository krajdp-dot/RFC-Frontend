import { Info } from "lucide-react";

export function PurchasingCapacity({ data = {} }: { data?: any }) {
  const moneyPosition = data?.moneyPosition || {};
  const receivables = data?.receivables || {};
  const payables = data?.payables || {};

  const available = Number(moneyPosition?.available?.total || 0);
  const expectedCollections = Number(receivables?.dueSoon || 0);
  const supplierCommitments = Number(payables?.dueThisWeek || 0) + Number(payables?.dueToday || 0);
  const essentialExpenses = Number(moneyPosition?.committed?.expenses || 0);

  const estimatedCapacity = available + expectedCollections - supplierCommitments - essentialExpenses;

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div className="bg-card border rounded-xl h-full flex flex-col p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">READY TO RESTOCK?</h2>
        <button className="text-muted-foreground hover:text-foreground transition-colors group relative" title="Purchasing Capacity = Cash/Bank + Expected Collections - Supplier Commitments - Essential Expenses">
          <Info className="w-4 h-4" />
          <span className="sr-only">Info</span>
        </button>
      </div>
      
      <div className="mb-6 text-center">
        <div className="text-3xl font-bold tracking-tight tabular-nums mb-1">{formatCurrency(Math.max(0, estimatedCapacity))}</div>
        <div className="text-sm text-muted-foreground">Estimated Purchasing Capacity</div>
      </div>
      
      <div className="space-y-2 text-sm mb-6 grow">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Available</span>
          <span className="font-semibold tabular-nums">{formatCurrency(available)}</span>
        </div>
        <div className="flex justify-between text-emerald-600">
          <span>Expected collections (Soon)</span>
          <span className="font-semibold tabular-nums">+{formatCurrency(expectedCollections)}</span>
        </div>
        <div className="flex justify-between text-red-500">
          <span>Supplier commitments (Soon)</span>
          <span className="font-semibold tabular-nums">−{formatCurrency(supplierCommitments)}</span>
        </div>
        <div className="flex justify-between text-red-500">
          <span>Essential expenses</span>
          <span className="font-semibold tabular-nums">−{formatCurrency(essentialExpenses)}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-3 mt-auto">
        {estimatedCapacity > 0 ? (
           <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold tracking-wider uppercase">
             GOOD TO RESTOCK
           </div>
        ) : (
           <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-bold tracking-wider uppercase">
             LOW CAPACITY
           </div>
        )}
        <div className="text-[11px] text-muted-foreground">
          Management estimate · Not guaranteed
        </div>
      </div>
    </div>
  );
}
