import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MoneyPosition({ data = {} }: { data?: any }) {
  const money = data?.moneyPosition || {};
  const available = money.available || {};
  const committed = money.committed || {};
  const working = money.working || {};
  
  const inventoryValue = data?.inventory?.totalValue || "0";

  const formatCurrency = (val: any) => {
    if (!val) return "₹0";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));
  };

  const totalWorking = Number(working.customerReceivables || 0) + Number(inventoryValue || 0);
  const totalCommitted = Number(committed.supplierPayables || 0) + Number(committed.expenses || 0);

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">MONEY POSITION</h2>
        <Link href="/reports" className="text-sm p-0 h-auto font-medium flex items-center gap-1 text-primary hover:underline">Full Report <ArrowRight className="w-3 h-3" /></Link>
      </div>
      
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
        {/* Column 1 */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AVAILABLE NOW</h3>
          </div>
          <ul className="space-y-2 mb-4 grow text-sm">
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Cash</span>
              <span className="font-semibold tabular-nums">{formatCurrency(available.cash)}</span>
            </li>
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Bank</span>
              <span className="font-semibold tabular-nums">{formatCurrency(available.bank)}</span>
            </li>
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Digital Wallets</span>
              <span className="font-semibold tabular-nums">{formatCurrency(available.digital)}</span>
            </li>
          </ul>
          <div className="pt-3 border-t flex justify-between font-semibold">
            <span>Total Available</span>
            <span className="tabular-nums">{formatCurrency(available.total)}</span>
          </div>
        </div>
        
        {/* Column 2 */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">WORKING IN BUSINESS</h3>
          </div>
          <ul className="space-y-2 mb-4 grow text-sm">
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Customers Owe</span>
              <span className="font-semibold tabular-nums">{formatCurrency(working.customerReceivables)}</span>
            </li>
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Inventory Value</span>
              <span className="font-semibold tabular-nums">{formatCurrency(inventoryValue)}</span>
            </li>
          </ul>
          <div className="pt-3 border-t flex justify-between font-semibold">
            <span>Total Working</span>
            <span className="tabular-nums">{formatCurrency(totalWorking)}</span>
          </div>
        </div>
        
        {/* Column 3 */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">COMMITTED</h3>
          </div>
          <ul className="space-y-2 mb-4 grow text-sm">
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Suppliers Owed</span>
              <span className="font-semibold tabular-nums">{formatCurrency(committed.supplierPayables)}</span>
            </li>
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Expenses Due</span>
              <span className="font-semibold tabular-nums">{formatCurrency(committed.expenses)}</span>
            </li>
          </ul>
          <div className="pt-3 border-t flex justify-between font-semibold">
            <span>Total Committed</span>
            <span className="tabular-nums">{formatCurrency(totalCommitted)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
