"use client"

import { useState } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'

const TABS = ['Stock Lots', 'Sales', 'Purchases', 'Wastage', 'Price History']

const LOTS = [
  { id: 'LOT-AUG13-001', qty: '80kg', cost: '₹128/kg', age: '0 days', freshness: 100, recommendedPrice: '₹140/kg', status: 'fresh' },
  { id: 'LOT-AUG11-001', qty: '60kg', cost: '₹120/kg', age: '2 days', freshness: 78, recommendedPrice: '₹115/kg', status: 'watch' },
  { id: 'LOT-AUG09-001', qty: '40kg', cost: '₹115/kg', age: '4 days', freshness: 45, recommendedPrice: '₹88/kg', status: 'markdown' },
]

export default function ProductProfilePage() {
  const [activeTab, setActiveTab] = useState('Stock Lots')

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-card border rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mango</h1>
            <p className="text-sm text-muted-foreground mt-1">Product Profile</p>
          </div>
          <StatusBadge status="watch" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-y">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
            <p className="text-2xl font-semibold tabular-nums">180 kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Inventory Value</p>
            <p className="text-2xl font-semibold tabular-nums">₹14,400</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg Cost</p>
            <p className="text-2xl font-semibold tabular-nums">₹80/kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Market</p>
            <p className="text-2xl font-semibold tabular-nums">₹112/kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Recommended</p>
            <p className="text-2xl font-semibold tabular-nums text-primary">₹108/kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Potential Revenue</p>
            <p className="text-2xl font-semibold tabular-nums">₹19,440</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Freshness</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold tabular-nums text-amber-500">82%</p>
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
                {LOTS.map(lot => (
                  <tr key={lot.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{lot.id}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{lot.qty}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{lot.cost}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{lot.age}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${lot.freshness < 50 ? 'bg-destructive' : lot.freshness < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${lot.freshness}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs">{lot.freshness}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{lot.recommendedPrice}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lot.status as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Sales' && (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            Sales history will be displayed here.
          </div>
        )}
        
        {activeTab === 'Wastage' && (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            Wastage records will be displayed here.
          </div>
        )}
      </div>
    </div>
  )
}
