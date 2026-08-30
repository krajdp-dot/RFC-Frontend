"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationMeta } from "@/components/shared/Pagination";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  async function loadSales() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetchApi(`/sales?${params.toString()}`);

      if (response && response.data) {
        setSales(response.data);
        setMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        setSales(response);
        setMeta(null);
      } else {
        setSales([]);
        setMeta(null);
      }
    } catch (err: any) {
      console.error("Failed to load sales:", err);
      setError(err.message || "Failed to load sales");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, [search, page]);

  const metrics = [
    { label: "Total Sales", value: meta?.total?.toString() || sales.length.toString() },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Sales" 
        subtitle="Track daily sales, customer credits and outgoing inventory." 
        primaryAction={{ label: "New Sale", icon: Plus, href: "/sales/new" }} 
      />
      
      <MetricStrip metrics={metrics} />
      
      <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-muted/20">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Sales</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search sales..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground" onClick={loadSales}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {loading && (
          <div className="p-8 text-center text-muted-foreground">Loading sales...</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
            <button type="button" onClick={loadSales} className="mt-3 underline">Try again</button>
          </div>
        )}

        {!loading && !error && sales.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No sales found.
          </div>
        )}

        {!loading && !error && sales.length > 0 && (
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
                      {Number(sale.creditAmount) > 0 ? formatCurrency(sale.creditAmount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge variant={sale.status?.toLowerCase() as any} label={sale.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {meta && sales.length > 0 && !loading && !error && (
          <Pagination meta={meta} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
