"use client"

import { useState, useEffect } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { fetchApi } from '@/lib/fetchApi'
import { useParams } from 'next/navigation'

const TABS = ['Stock Lots', 'Sales', 'Purchases', 'Wastage', 'Price History']

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

export default function ProductProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('Stock Lots')
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProductData() {
      try {
        setLoading(true);
        setError("");
        
        let itemData = null;
        try {
          const res = await fetchApi(`/inventory/${id}`);
          itemData = res;
        } catch (e) {
          const allInv = await fetchApi('/inventory');
          const list = Array.isArray(allInv) ? allInv : (allInv.data || []);
          itemData = list.find((item: any) => item.id === id || item.productId === id);
          if (!itemData) {
             const prod = await fetchApi(`/products/${id}`);
             itemData = { ...prod, name: prod.name, remainingBoxes: 0, stockValue: 0 };
          }
        }
        
        setData(itemData);
      } catch (err: any) {
        console.error("Failed to load inventory details:", err);
        setError(err.message || "Failed to load inventory details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProductData();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading product details...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-destructive bg-card border rounded-xl">
        <p>{error || "Product not found."}</p>
      </div>
    );
  }

  const lots = Array.isArray(data.lots) ? data.lots : [];

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-card border rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.name || "Unknown Product"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Product Profile</p>
          </div>
          {data.status && <StatusBadge status={data.status} />}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-y">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
            <p className="text-2xl font-semibold tabular-nums">{data.remainingBoxes || 0} {data.unit || 'boxes'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Inventory Value</p>
            <p className="text-2xl font-semibold tabular-nums">{formatCurrency(data.stockValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg Cost</p>
            <p className="text-2xl font-semibold tabular-nums">
              {data.stockValue && data.remainingBoxes ? formatCurrency(Number(data.stockValue) / Number(data.remainingBoxes)) : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Market</p>
            <p className="text-2xl font-semibold tabular-nums">{formatCurrency(data.marketPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Recommended</p>
            <p className="text-2xl font-semibold tabular-nums text-primary">{formatCurrency(data.recommendedPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Potential Revenue</p>
            <p className="text-2xl font-semibold tabular-nums">
              {data.recommendedPrice && data.remainingBoxes ? formatCurrency(Number(data.recommendedPrice) * Number(data.remainingBoxes)) : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg Freshness</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-semibold tabular-nums ${
                (data.avgFreshness || 0) < 50 ? 'text-destructive' : (data.avgFreshness || 0) < 80 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {data.avgFreshness ? Math.round(data.avgFreshness) + '%' : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2 border-b pb-2 overflow-x-auto">
          {TABS.map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? "secondary" : "ghost"}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 h-auto text-sm font-medium rounded-lg whitespace-nowrap"
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'Stock Lots' && (
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[13px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                  <th className="px-4 py-3">Lot ID</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Age</th>
                  <th className="px-4 py-3 text-right">Freshness</th>
                  <th className="px-4 py-3 text-right">Recommended Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No active lots available.</td>
                  </tr>
                ) : (
                  lots.map((lot: any) => (
                    <tr key={lot.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{lot.id}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{lot.qty} {lot.unit || 'kg'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(lot.cost)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{lot.ageDays ? `${lot.ageDays} days` : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${(lot.freshness || 0) < 50 ? 'bg-destructive' : (lot.freshness || 0) < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${lot.freshness || 0}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-xs">{lot.freshness || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{formatCurrency(lot.recommendedPrice)}</td>
                      <td className="px-4 py-3">
                        {lot.status && <StatusBadge status={lot.status} />}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab !== 'Stock Lots' && (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            {activeTab} records will be displayed here.
          </div>
        )}
      </div>
    </div>
  )
}
