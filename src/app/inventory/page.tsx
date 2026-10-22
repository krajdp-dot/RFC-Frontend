"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Download, RefreshCw, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MetricStrip } from '@/components/shared/MetricStrip'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchApi } from '@/lib/fetchApi'
import { AddProductModal } from '@/components/inventory/AddProductModal'
import { PERMISSIONS } from "@/lib/permissions";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  async function loadInventory() {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetchApi('/inventory');
      
      if (Array.isArray(response)) {
        setInventory(response);
      } else if (response && Array.isArray(response.data)) {
        setInventory(response.data);
      } else {
        setInventory([]);
      }
    } catch (err: any) {
      console.error("Failed to load inventory:", err);
      setError(err.message || "Failed to load inventory");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => 
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.stockValue) || 0), 0);
  const lowStockItems = inventory.filter(item => item.remainingBoxes <= 10).length;

  function exportInventoryCsv() {
    const columns = ["Product", "Available boxes", "Unit", "Average cost per box (INR)", "Stock value (INR)", "Average freshness (%)"];
    const rows = inventory.map((item) => [
      item.name || "",
      item.remainingBoxes ?? "",
      item.unit || "BOX",
      item.stockValue != null && Number(item.remainingBoxes) > 0
        ? (Number(item.stockValue) / Number(item.remainingBoxes)).toFixed(2)
        : "",
      item.stockValue ?? "",
      item.avgFreshness ?? "",
    ]);
    const csv = [columns, ...rows].map((row) =>
      row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rfc-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Inventory"
        description="Track stock levels, freshness and value."
        primaryAction={{ label: "Add Product", onClick: () => setShowAddProduct(true), permission: PERMISSIONS.PRODUCTS_EDIT }}
        secondaryActions={[{ label: "Export CSV", icon: Download, onClick: exportInventoryCsv }]}
      />
      
      <MetricStrip
        metrics={[
          { label: "Inventory Value", value: `₹${totalValue.toLocaleString('en-IN')}` },
          { label: "Low Stock Items", value: lowStockItems.toString() },
          { label: "Total Products", value: inventory.length.toString() }
        ]}
      />

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search inventory products"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={loadInventory} disabled={loading} aria-label="Refresh inventory">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
        
        {loading && (
          <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
            <button type="button" onClick={loadInventory} className="mt-3 underline">Try again</button>
          </div>
        )}

        {!loading && !error && filteredInventory.length === 0 && (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {search ? "No matching products" : "No inventory recorded yet"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search ? "Try another product name or clear the search." : "Stock appears here when products have available lots from recorded purchases."}
            </p>
            {search && <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setSearch("")}>Clear search</Button>}
          </div>
        )}

        {!loading && !error && filteredInventory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-sm font-semibold tracking-tight text-foreground text-left">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 text-right font-semibold">Available</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Unit</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg Cost</th>
                  <th className="px-4 py-3 text-right font-semibold">Value</th>
                  <th className="px-4 py-3 text-right font-semibold">Freshness</th>
                  <th className="px-4 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/inventory/${item.id}`} className="hover:underline">{item.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {item.remainingBoxes} boxes
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.unit || 'BOX'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {item.stockValue && item.remainingBoxes ? `₹${(Number(item.stockValue) / item.remainingBoxes).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {item.stockValue ? `₹${Number(item.stockValue).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {item.avgFreshness ? (
                        <span className={`font-medium ${item.avgFreshness < 50 ? 'text-destructive' : item.avgFreshness < 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {Math.round(item.avgFreshness)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/inventory/${item.id}`}
                        aria-label={`View ${item.name} inventory details`}
                        title="View details"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddProduct && (
        <AddProductModal 
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => {
            setShowAddProduct(false);
            loadInventory();
          }}
        />
      )}
    </div>
  )
}
