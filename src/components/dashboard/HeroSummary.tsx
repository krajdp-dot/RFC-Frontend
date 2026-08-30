import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export function HeroSummary({ data = {} }: { data?: any }) {
  const sales = data?.sales || { total: 0, cash: 0, digital: 0, credit: 0, trend: 0 };
  const totalSales = Number(sales.total) || 0;
  
  const cashPct = totalSales ? ((Number(sales.cash) || 0) / totalSales) * 100 : 33.33;
  const digitalPct = totalSales ? ((Number(sales.digital) || 0) / totalSales) * 100 : 33.33;
  const creditPct = totalSales ? ((Number(sales.credit) || 0) / totalSales) * 100 : 33.34;

  return (
    <div className="bg-card border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="w-full md:w-auto">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">TODAY</h2>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-bold tracking-tight tabular-nums">{formatCurrency(totalSales)}</span>
          <span className="text-muted-foreground font-medium">Sales</span>
        </div>
        
        {/* Proportion Bar */}
        <div className="w-full max-w-sm h-1.5 rounded-full overflow-hidden flex mb-2 bg-muted">
          <div className="bg-emerald-500" style={{ width: `${cashPct}%` }} />
          <div className="bg-blue-500" style={{ width: `${digitalPct}%` }} />
          <div className="bg-amber-500" style={{ width: `${creditPct}%` }} />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cash <span className="tabular-nums">{formatCurrency(sales.cash || 0)}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Digital <span className="tabular-nums">{formatCurrency(sales.digital || 0)}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Credit <span className="tabular-nums">{formatCurrency(sales.credit || 0)}</span></span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium self-start md:self-auto shrink-0">
        <TrendingUp className="w-4 h-4" />
        <span>{sales.trend > 0 ? '+' : ''}{sales.trend || 0}% vs yesterday</span>
      </div>
    </div>
  );
}
