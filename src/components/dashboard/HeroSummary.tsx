import { cn } from "@/lib/utils";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

export function HeroSummary({ data = {} }: { data?: any }) {
  const sales = data?.sales || { total: 0, collections: 0, creditCreated: 0 };
  const totalSales = Number(sales.total) || 0;
  
  const collectionsPct = totalSales ? ((Number(sales.collections) || 0) / totalSales) * 100 : 0;
  const creditPct = totalSales ? ((Number(sales.creditCreated) || 0) / totalSales) * 100 : 0;

  return (
    <div className="bg-card border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="w-full md:w-auto">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">TODAY'S SALES</h2>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-bold tracking-tight tabular-nums">{formatCurrency(totalSales)}</span>
        </div>
        
        {/* Proportion Bar */}
        <div className="w-full max-w-sm h-1.5 rounded-full overflow-hidden flex mb-2 bg-muted">
          {totalSales > 0 ? (
            <>
              <div className="bg-emerald-500" style={{ width: `${collectionsPct}%` }} />
              <div className="bg-amber-500" style={{ width: `${creditPct}%` }} />
            </>
          ) : (
            <div className="w-full bg-muted" />
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Collections <span className="tabular-nums">{formatCurrency(sales.collections || 0)}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Credit <span className="tabular-nums">{formatCurrency(sales.creditCreated || 0)}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
