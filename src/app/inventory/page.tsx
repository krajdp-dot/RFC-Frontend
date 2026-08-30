"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Search, Filter, MoreHorizontal, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MetricStrip } from '@/components/shared/MetricStrip'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { fetchApi } from '@/lib/fetchApi'

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
    item.productName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.totalValue) || 0), 0);
  const lowStockItems = inventory.filter(item => item.totalStock <= (item.reorderThreshold || 10)).length;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Inventory"
        description="Track stock levels, freshness and value."
        primaryAction={{ label: "Stock Adjustment" }}
        secondaryActions={[{ label: "Import" }, { label: "Export" }]}
      />
      
      <MetricStrip
        metrics={[
          { label: "Inventory Value", value: `₹${totalValue.toLocaleString('en-IN')}` },
          { label: "Low Stock Items", value: lowStockItems.toString() },
          { label: "Total Products", value: inventory.length.toString() }
        ]}
      />

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={loadInventory}>
            Refresh
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
          <div className="p-8 text-center text-muted-foreground">
            No inventory found.
          </div>
        )}

        {!loading && !error && filteredInventory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[13px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 text-right font-semibold">Available</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Unit</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg Cost</th>
                  <th className="px-4 py-3 text-right font-semibold">Value</th>
                  <th className="px-4 py-3 text-right font-semibold">Freshness</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInventory.map((item) => (
                  <tr key={item.productId} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/inventory/${item.productId}`} className="hover:underline">{item.productName}</Link>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {item.totalStock} {item.totalBoxes ? `(${item.totalBoxes} boxes)` : ''}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.unit || 'KG'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {item.avgCost ? `₹${Number(item.avgCost).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {item.totalValue ? `₹${Number(item.totalValue).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {item.avgFreshness ? (
                        <span className={`font-medium ${item.avgFreshness < 50 ? 'text-destructive' : item.avgFreshness < 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {Math.round(item.avgFreshness)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
