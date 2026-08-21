import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'

const PRICE_DATA = [
  { id: 'mango', name: 'Mango', marketPrice: '₹112', avgCost: '₹80', recommended: '₹108', current: '₹110', margin: '₹28', marginPercent: '25.5%', trend: 'up', source: 'Manual' },
  { id: 'apple', name: 'Apple', marketPrice: '₹135', avgCost: '₹120', recommended: '₹132', current: '₹130', margin: '₹10', marginPercent: '7.7%', trend: 'up', source: 'Manual' },
  { id: 'banana', name: 'Banana', marketPrice: '₹48', avgCost: '₹35', recommended: '₹45', current: '₹44', margin: '₹9', marginPercent: '20.5%', trend: 'down', source: 'Manual' },
  { id: 'grapes', name: 'Grapes', marketPrice: '₹195', avgCost: '₹160', recommended: '₹190', current: '₹190', margin: '₹30', marginPercent: '15.8%', trend: 'down', source: 'Manual' },
  { id: 'orange', name: 'Orange', marketPrice: '₹120', avgCost: '₹90', recommended: '₹118', current: '₹115', margin: '₹25', marginPercent: '21.7%', trend: 'up', source: 'Manual' },
  { id: 'papaya', name: 'Papaya', marketPrice: '₹75', avgCost: '₹55', recommended: '₹72', current: '₹70', margin: '₹15', marginPercent: '21.4%', trend: 'up', source: 'Manual' },
  { id: 'pomegranate', name: 'Pomegranate', marketPrice: '₹180', avgCost: '₹140', recommended: '₹175', current: '₹175', margin: '₹35', marginPercent: '20.0%', trend: 'up', source: 'Manual' },
  { id: 'watermelon', name: 'Watermelon', marketPrice: '₹38', avgCost: '₹25', recommended: '₹35', current: '₹35', margin: '₹10', marginPercent: '28.6%', trend: 'down', source: 'Manual' },
  { id: 'guava', name: 'Guava', marketPrice: '₹95', avgCost: '₹70', recommended: '₹90', current: '₹90', margin: '₹20', marginPercent: '22.2%', trend: 'down', source: 'Manual' },
  { id: 'lemon', name: 'Lemon', marketPrice: '₹110', avgCost: '₹80', recommended: '₹105', current: '₹105', margin: '₹25', marginPercent: '23.8%', trend: 'up', source: 'Manual' },
]

export default function PriceBoardPage() {
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Price Board"
        description="Daily reference for fruit pricing and margins."
        secondaryActions={[{ label: "Update Prices" }]}
      />
      
      <p className="text-sm text-muted-foreground">Last updated: 13 Aug 2026, 8:30 AM · Manual Reference</p>

      <div className="bg-card border rounded-xl overflow-hidden p-6 space-y-4 mb-6">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">TODAY'S RECOMMENDED PRICES</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-lg">Mango</h4>
              <span className="text-xl font-bold tabular-nums text-primary">₹108<span className="text-sm font-normal text-muted-foreground">/kg</span></span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
              <div className="flex flex-col"><span>Cost</span><span className="font-medium text-foreground tabular-nums">₹80</span></div>
              <div className="flex flex-col"><span>Market</span><span className="font-medium text-foreground tabular-nums">₹112</span></div>
              <div className="flex flex-col"><span>Freshness</span><span className="font-medium text-amber-500 tabular-nums">82%</span></div>
              <div className="flex flex-col"><span>Demand</span><span className="font-medium text-emerald-600">High</span></div>
            </div>
            <div className="pt-3 border-t text-sm flex justify-between">
              <span className="text-muted-foreground">Target margin <span className="font-medium text-foreground tabular-nums">₹28</span></span>
              <span className="text-muted-foreground">Min safe <span className="font-medium text-foreground tabular-nums">₹98</span></span>
            </div>
          </div>

          <div className="border rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-lg">Apple</h4>
              <span className="text-xl font-bold tabular-nums text-primary">₹132<span className="text-sm font-normal text-muted-foreground">/kg</span></span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
              <div className="flex flex-col"><span>Cost</span><span className="font-medium text-foreground tabular-nums">₹120</span></div>
              <div className="flex flex-col"><span>Market</span><span className="font-medium text-foreground tabular-nums">₹135</span></div>
              <div className="flex flex-col"><span>Freshness</span><span className="font-medium text-emerald-500 tabular-nums">94%</span></div>
              <div className="flex flex-col"><span>Demand</span><span className="font-medium text-blue-600">Medium</span></div>
            </div>
            <div className="pt-3 border-t text-sm flex justify-between">
              <span className="text-muted-foreground">Target margin <span className="font-medium text-foreground tabular-nums">₹12</span></span>
              <span className="text-muted-foreground">Min safe <span className="font-medium text-foreground tabular-nums">₹125</span></span>
            </div>
          </div>

          <div className="border rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-lg">Banana</h4>
              <span className="text-xl font-bold tabular-nums text-primary">₹45<span className="text-sm font-normal text-muted-foreground">/kg</span></span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
              <div className="flex flex-col"><span>Cost</span><span className="font-medium text-foreground tabular-nums">₹35</span></div>
              <div className="flex flex-col"><span>Market</span><span className="font-medium text-foreground tabular-nums">₹48</span></div>
              <div className="flex flex-col"><span>Freshness</span><span className="font-medium text-emerald-500 tabular-nums">100%</span></div>
              <div className="flex flex-col"><span>Demand</span><span className="font-medium text-emerald-600">High</span></div>
            </div>
            <div className="pt-3 border-t text-sm flex justify-between">
              <span className="text-muted-foreground">Target margin <span className="font-medium text-foreground tabular-nums">₹10</span></span>
              <span className="text-muted-foreground">Min safe <span className="font-medium text-foreground tabular-nums">₹40</span></span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">Recommendations based on cost, market price, freshness and configured rules</p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[13px] font-semibold uppercase tracking-wider text-muted-foreground text-left bg-muted/30">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 text-right font-semibold">Market Price</th>
                <th className="px-4 py-3 text-right font-semibold">Your Avg Cost</th>
                <th className="px-4 py-3 text-right font-semibold">Recommended</th>
                <th className="px-4 py-3 text-right font-semibold">Current Selling</th>
                <th className="px-4 py-3 text-right font-semibold">Margin</th>
                <th className="px-4 py-3 text-right font-semibold">Margin %</th>
                <th className="px-4 py-3 text-right font-semibold">Trend</th>
                <th className="px-4 py-3 text-right font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {PRICE_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.marketPrice}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.avgCost}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-primary">{item.recommended}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{item.current}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-medium">{item.margin}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.marginPercent}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${item.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.trend === 'up' ? '↑' : '↓'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] uppercase tracking-wider rounded font-medium">
                      {item.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
