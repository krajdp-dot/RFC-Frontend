import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function MoneyPosition() {
  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">MONEY POSITION</h2>
        <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          Full Report <ArrowRight className="w-3 h-3" />
        </button>
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
              <span className="font-semibold tabular-nums">₹85,000</span>
            </li>
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Bank</span>
              <span className="font-semibold tabular-nums">₹1,10,000</span>
            </li>
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Digital Wallets</span>
              <span className="font-semibold tabular-nums">₹24,000</span>
            </li>
          </ul>
          <div className="pt-3 border-t flex justify-between font-semibold">
            <span>Total Available</span>
            <span className="tabular-nums">₹2,19,000</span>
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
              <span className="font-semibold tabular-nums">₹3,42,000</span>
            </li>
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Inventory Value</span>
              <span className="font-semibold tabular-nums">₹2,80,000</span>
            </li>
          </ul>
          <div className="pt-3 border-t flex justify-between font-semibold">
            <span>Total Working</span>
            <span className="tabular-nums">₹6,22,000</span>
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
              <span className="font-semibold tabular-nums">₹2,18,000</span>
            </li>
            <li className="flex justify-between hover:text-primary transition cursor-pointer group">
              <span className="group-hover:translate-x-0.5 transition-transform">Expenses Due</span>
              <span className="font-semibold tabular-nums">₹15,000</span>
            </li>
          </ul>
          <div className="pt-3 border-t flex justify-between font-semibold">
            <span>Total Committed</span>
            <span className="tabular-nums">₹2,33,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
