import Link from 'next/link'
import { Search, Filter, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MetricStrip } from '@/components/shared/MetricStrip'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'

const INVENTORY_DATA = [
  { id: 'mango', name: 'Mango', available: '180kg', unit: 'kg', avgCost: '₹80', marketPrice: '₹112', recommended: '₹108', value: '₹14,400', age: '2d', freshness: 82, status: 'watch' },
  { id: 'apple', name: 'Apple', available: '240kg', unit: 'kg', avgCost: '₹120', marketPrice: '₹135', recommended: '₹132', value: '₹32,400', age: '1d', freshness: 94, status: 'fresh' },
  { id: 'banana', name: 'Banana', available: '180kg', unit: 'kg', avgCost: '₹35', marketPrice: '₹48', recommended: '₹45', value: '₹9,300', age: '0d', freshness: 100, status: 'fresh' },
  { id: 'grapes', name: 'Grapes', available: '120kg', unit: 'kg', avgCost: '₹160', marketPrice: '₹195', recommended: '₹190', value: '₹28,800', age: '1d', freshness: 90, status: 'good' },
  { id: 'orange', name: 'Orange', available: '85kg', unit: 'kg', avgCost: '₹90', marketPrice: '₹120', recommended: '₹118', value: '₹11,900', age: '3d', freshness: 65, status: 'markdown' },
  { id: 'papaya', name: 'Papaya', available: '60kg', unit: 'kg', avgCost: '₹55', marketPrice: '₹75', recommended: '₹72', value: '₹4,800', age: '2d', freshness: 78, status: 'watch' },
  { id: 'pomegranate', name: 'Pomegranate', available: '95kg', unit: 'kg', avgCost: '₹140', marketPrice: '₹180', recommended: '₹175', value: '₹17,100', age: '0d', freshness: 100, status: 'fresh' },
  { id: 'watermelon', name: 'Watermelon', available: '200kg', unit: 'kg', avgCost: '₹25', marketPrice: '₹38', recommended: '₹35', value: '₹7,000', age: '1d', freshness: 88, status: 'good' },
  { id: 'guava', name: 'Guava', available: '45kg', unit: 'kg', avgCost: '₹70', marketPrice: '₹95', recommended: '₹90', value: '₹4,050', age: '4d', freshness: 40, status: 'urgent' },
  { id: 'lemon', name: 'Lemon', available: '30kg', unit: 'kg', avgCost: '₹80', marketPrice: '₹110', recommended: '₹105', value: '₹3,150', age: '2d', freshness: 85, status: 'good' },
]

export default function InventoryPage() {
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
          { label: "Inventory Value", value: "₹4,75,000" },
          { label: "Fresh Stock", value: "₹3,20,000" },
          { label: "At-Risk Stock", value: "₹85,000" },
          { label: "Wastage (month)", value: "₹18,500" },
          { label: "Low Stock Items", value: "4" },
          { label: "Products", value: "24" }
        ]}
      />

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[13px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 text-right font-semibold">Available</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Unit</th>
                <th className="px-4 py-3 text-right font-semibold">Avg Cost</th>
                <th className="px-4 py-3 text-right font-semibold">Market Price</th>
                <th className="px-4 py-3 text-right font-semibold">Recommended</th>
                <th className="px-4 py-3 text-right font-semibold">Value</th>
                <th className="px-4 py-3 text-right font-semibold">Age</th>
                <th className="px-4 py-3 text-right font-semibold">Freshness</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {INVENTORY_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/inventory/${item.id}`} className="hover:underline">{item.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{item.available}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.avgCost}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.marketPrice}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{item.recommended}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{item.value}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.age}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={`font-medium ${item.freshness < 50 ? 'text-destructive' : item.freshness < 80 ? 'text-amber-500' : 'text-emerald-600'}`}>{item.freshness}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status as any} />
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
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">SHOULD YOU BUY?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-semibold">Apple</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded">BUY</span>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div className="flex justify-between"><span>Stock</span><span className="tabular-nums font-medium text-foreground">35kg</span></div>
              <div className="flex justify-between"><span>Daily sales</span><span className="tabular-nums">80kg</span></div>
              <div className="flex justify-between"><span>Coverage</span><span className="tabular-nums">0.4 days</span></div>
              <div className="flex justify-between"><span>Market</span><span className="tabular-nums">₹135/kg</span></div>
              <div className="flex justify-between"><span>Margin</span><span className="tabular-nums">₹15/kg</span></div>
            </div>
            <div className="pt-2 border-t text-sm">
              <div className="flex justify-between"><span>Suggested</span><span className="font-medium text-foreground tabular-nums">100kg</span></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-semibold">Banana</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded">HOLD</span>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div className="flex justify-between"><span>Stock</span><span className="tabular-nums font-medium text-foreground">180kg</span></div>
              <div className="flex justify-between"><span>Daily sales</span><span className="tabular-nums">65kg</span></div>
              <div className="flex justify-between"><span>Coverage</span><span className="tabular-nums">2.8 days</span></div>
            </div>
            <div className="pt-2 border-t text-sm">
              <span className="text-muted-foreground">Fresh window 2 days</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-semibold">Mango</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded">CLEAR FIRST</span>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div className="flex justify-between"><span>Stock</span><span className="tabular-nums font-medium text-foreground">180kg</span></div>
              <span>Freshness declining</span>
            </div>
            <div className="pt-2 border-t text-sm">
              <span className="text-muted-foreground">Sell existing before buying</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-semibold">Grapes</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded">WAIT</span>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div className="flex justify-between"><span>Stock covers</span><span className="tabular-nums font-medium text-foreground">3 days</span></div>
              <span>Price trending down</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
