import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/lib/formatters";
import { fetchApi } from "@/lib/fetchApi";

export default async function SalesPage() {
  let salesResponse: any[] = [];
  let error = null;
  
  try {
    salesResponse = await fetchApi('/sales');
  } catch (err: any) {
    error = err.message;
  }

  const sales = salesResponse || [];

  const metrics = [
    { label: "Today's Sales", value: "₹0", trend: { value: "+0%", positive: true } },
    { label: "Collected", value: "₹0" },
    { label: "Customer Credit", value: "₹0", trend: { value: "-0%", positive: true } },
    { label: "Total Transactions", value: sales.length.toString() },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Sales" 
        subtitle="Track daily sales, customer credits and outgoing inventory." 
        primaryAction={{ label: "New Sale", icon: Plus, href: "/sales/new" }} 
      />
      
      <MetricStrip metrics={metrics} />
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          Failed to load sales from API: {error}
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-muted/20">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Sales</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search sales..." 
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
                <th className="px-4 py-3 font-medium">Sale ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium text-right">Value</th>
                <th className="px-4 py-3 font-medium text-right">Received</th>
                <th className="px-4 py-3 font-medium text-right">Credit</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sales.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No sales found.
                  </td>
                </tr>
              )}
              {sales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(sale.businessDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{sale.saleReference}</td>
                  <td className="px-4 py-3 font-medium">{sale.customer?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-right">{formatCurrency(sale.totalAmount)}</td>
                  <td className="px-4 py-3 tabular-nums text-right text-muted-foreground">{formatCurrency(sale.receivedAmount)}</td>
                  <td className="px-4 py-3 tabular-nums text-right text-amber-600 font-medium">
                    {sale.creditAmount > 0 ? formatCurrency(sale.creditAmount) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge variant={sale.status.toLowerCase() as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
          <span>Showing {sales.length} sales</span>
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
