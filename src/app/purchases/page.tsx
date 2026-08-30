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

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  async function loadPurchases() {
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

      const response = await fetchApi(`/purchases?${params.toString()}`);

      if (response && response.data) {
        setPurchases(response.data);
        setMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        setPurchases(response);
        setMeta(null);
      } else {
        setPurchases([]);
        setMeta(null);
      }
    } catch (err: any) {
      console.error("Failed to load purchases:", err);
      setError(err.message || "Failed to load purchases");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPurchases();
  }, [search, page]);

  const metrics = [
    { label: "Total Purchases", value: meta?.total?.toString() || purchases.length.toString() },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Purchases" 
        subtitle="Track procurement, supplier payments and inventory additions." 
        primaryAction={{ label: "New Purchase", icon: Plus, href: "/purchases/new" }} 
      />
      
      <MetricStrip metrics={metrics} />
      
      <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-muted/20">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Purchases</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search purchases..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground" onClick={loadPurchases}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {loading && (
          <div className="p-8 text-center text-muted-foreground">Loading purchases...</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
            <button type="button" onClick={loadPurchases} className="mt-3 underline">Try again</button>
          </div>
        )}

        {!loading && !error && purchases.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No purchases found.
          </div>
        )}

        {!loading && !error && purchases.length > 0 && (
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
                      {Number(purchase.creditAmount) > 0 ? formatCurrency(purchase.creditAmount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge variant={purchase.status?.toLowerCase() as any} label={purchase.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {meta && purchases.length > 0 && !loading && !error && (
          <Pagination meta={meta} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
