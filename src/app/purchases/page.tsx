import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/lib/formatters";
import { fetchApi } from "@/lib/fetchApi";

export default async function PurchasesPage() {
  let purchasesResponse: any[] = [];
  let error = null;
  
  try {
    purchasesResponse = await fetchApi('/purchases');
  } catch (err: any) {
    error = err.message;
  }

  const purchases = purchasesResponse || [];

  const metrics = [
    { label: "Today's Purchases", value: "₹0", trend: { value: "+0%", positive: true } },
    { label: "Paid", value: "₹0" },
    { label: "Supplier Credit", value: "₹0", trend: { value: "+0%", positive: false } },
    { label: "Total Transactions", value: purchases.length.toString() },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Purchases" 
        subtitle="Track procurement, supplier payments and inventory additions." 
        primaryAction={{ label: "New Purchase", icon: Plus, href: "/purchases/new" }} 
      />
      
      <MetricStrip metrics={metrics} />
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          Failed to load purchases from API: {error}
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-muted/20">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Purchases</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search purchases..." 
                className="pl-9 pr-4 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
            </div>
            <button className="p-1.5 border rounded-lg hover:bg-muted text-muted-foreground">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Purchase ID</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium text-right">Value</th>
                <th className="px-4 py-3 font-medium text-right">Paid</th>
                <th className="px-4 py-3 font-medium text-right">Credit</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No purchases found.
                  </td>
                </tr>
              )}
              {purchases.map((purchase: any) => (
                <tr key={purchase.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(purchase.businessDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{purchase.purchaseReference}</td>
                  <td className="px-4 py-3 font-medium">{purchase.supplier?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-right">{formatCurrency(purchase.totalAmount)}</td>
                  <td className="px-4 py-3 tabular-nums text-right text-muted-foreground">{formatCurrency(purchase.paidAmount)}</td>
                  <td className="px-4 py-3 tabular-nums text-right text-amber-600 font-medium">
                    {purchase.creditAmount > 0 ? formatCurrency(purchase.creditAmount) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge variant={purchase.status.toLowerCase() as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
          <span>Showing {purchases.length} purchases</span>
          <div className="flex items-center gap-1">
            <button className="p-1 border rounded hover:bg-muted disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 border rounded hover:bg-muted" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
