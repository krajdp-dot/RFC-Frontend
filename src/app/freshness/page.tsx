import { PageHeader } from '@/components/shared/PageHeader'
import { MetricStrip } from '@/components/shared/MetricStrip'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'

export default function FreshnessPage() {
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Freshness Control"
        description="Monitor stock quality, plan markdowns and prevent waste."
      />
      
      <MetricStrip
        metrics={[
          { label: "Fresh Stock", value: "₹3,20,000" },
          { label: "Needs Attention", value: "₹85,000" },
          { label: "Markdown Recommended", value: "₹42,000" },
          { label: "High Risk", value: "₹18,000" },
          { label: "Expected Waste", value: "₹8,500" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive"></div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">STOCK AT RISK</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-[13px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Age</th>
                    <th className="px-4 py-3 text-center">Quality</th>
                    <th className="px-4 py-3 text-right">Value</th>
                    <th className="px-4 py-3 text-right">At Risk</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">Guava</td>
                    <td className="px-4 py-3 text-right tabular-nums">45kg</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">4 days</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-destructive w-[40%]" /></div>
                        <span className="tabular-nums text-xs">40%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">₹4,050</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-destructive">₹2,800</td>
                    <td className="px-4 py-3"><StatusBadge status="urgent" /></td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">Orange</td>
                    <td className="px-4 py-3 text-right tabular-nums">85kg</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">3 days</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[65%]" /></div>
                        <span className="tabular-nums text-xs">65%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">₹11,900</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-600">₹3,500</td>
                    <td className="px-4 py-3"><StatusBadge status="markdown" /></td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">Mango <span className="text-xs text-muted-foreground font-normal">(Lot 009)</span></td>
                    <td className="px-4 py-3 text-right tabular-nums">40kg</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">4 days</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-destructive w-[45%]" /></div>
                        <span className="tabular-nums text-xs">45%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">₹4,600</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-600">₹2,100</td>
                    <td className="px-4 py-3"><StatusBadge status="markdown" /></td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">Papaya</td>
                    <td className="px-4 py-3 text-right tabular-nums">60kg</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">2 days</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[78%]" /></div>
                        <span className="tabular-nums text-xs">78%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">₹4,800</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">₹800</td>
                    <td className="px-4 py-3"><StatusBadge status="watch" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden p-6 space-y-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">CLEAR TODAY</h3>
            <div className="space-y-3">
              <div className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-lg">Guava <span className="text-sm font-normal text-muted-foreground">45kg</span></h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Mkt <span className="font-medium text-foreground tabular-nums">₹95</span></span>
                    <span>Clearance <span className="font-medium text-amber-600 tabular-nums">₹70</span></span>
                    <span>Potential loss tomorrow <span className="font-medium text-destructive tabular-nums">-₹1,125</span></span>
                  </div>
                </div>
                <Button size="sm">Create Sale</Button>
              </div>

              <div className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-lg">Mango <span className="text-sm font-normal text-muted-foreground">(old lot) 40kg</span></h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Mkt <span className="font-medium text-foreground tabular-nums">₹112</span></span>
                    <span>Clearance <span className="font-medium text-amber-600 tabular-nums">₹88</span></span>
                    <span>Potential loss <span className="font-medium text-destructive tabular-nums">-₹960</span></span>
                  </div>
                </div>
                <Button size="sm">Create Sale</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">VALUE AT RISK</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current inventory value</span>
                <span className="font-medium tabular-nums">₹4,75,000</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Expected normal sale value</span>
                <span className="font-medium tabular-nums">₹5,80,000</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">If delayed 2 days</span>
                <span className="font-medium tabular-nums text-amber-600">₹5,42,000</span>
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold">Potential value erosion</span>
                <span className="font-bold tabular-nums text-destructive">₹38,000</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic mt-4">Management estimate based on configured freshness rules</p>
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Freshness Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Banana</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[100%]" /></div>
                  <StatusBadge status="fresh" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Apple</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[94%]" /></div>
                  <StatusBadge status="fresh" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Grapes</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[90%]" /></div>
                  <StatusBadge status="good" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Mango</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[82%]" /></div>
                  <StatusBadge status="watch" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
