import { PageHeader } from "@/components/shared/PageHeader"
import { MetricStrip } from "@/components/shared/MetricStrip"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"

const metrics = [
  { label: "Total Receivables", value: "₹3.42L" },
  { label: "Overdue", value: "₹84K", trend: "down" },
  { label: "Due Soon", value: "₹42K" },
  { label: "Current", value: "₹2.36L" },
  { label: "Collected This Month", value: "₹4.8L", trend: "up" },
]

const receivables = [
  { id: 1, name: "Krishna Retail", outstanding: "₹2,00,000", oldestInvoice: "INV-0789", days: "90+ days", recentPayment: "45 days ago", risk: "critical" },
  { id: 2, name: "Patel Fruits", outstanding: "₹1,50,000", oldestInvoice: "INV-0912", days: "28 days", recentPayment: "5 days ago", risk: "watch" },
  { id: 3, name: "Singh Wholesale", outstanding: "₹1,50,000", oldestInvoice: "INV-1002", days: "12 days", recentPayment: "Today", risk: "healthy" },
  { id: 4, name: "Amit Retail", outstanding: "₹1,20,000", oldestInvoice: "INV-0855", days: "45 days", recentPayment: "18 days ago", risk: "watch" },
  { id: 5, name: "Verma Market", outstanding: "₹80,000", oldestInvoice: "INV-0801", days: "65 days", recentPayment: "32 days ago", risk: "high" },
  { id: 6, name: "Rajesh Traders", outstanding: "₹70,000", oldestInvoice: "INV-0988", days: "14 days", recentPayment: "2 days ago", risk: "healthy" },
]

export default function ReceivablesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Receivables"
        subtitle="Money customers owe you."
        primaryAction={{ label: "Send Reminders" }}
      />

      <MetricStrip metrics={metrics} />

      {/* Ageing Breakdown */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Ageing Breakdown</h2>
        <div className="flex h-8 rounded-md overflow-hidden mb-4">
          <div className="bg-emerald-500 w-[35%]" title="0-7 days: ₹1.2L"></div>
          <div className="bg-amber-500 w-[14%]" title="8-15 days: ₹48K"></div>
          <div className="bg-orange-500 w-[12%]" title="16-30 days: ₹42K"></div>
          <div className="bg-red-500 w-[39%]" title="31+ days: ₹84K"></div>
        </div>
        <div className="grid grid-cols-4 text-sm text-center">
          <div>
            <p className="text-muted-foreground mb-1">0-7 days</p>
            <p className="font-semibold tabular-nums">₹1.2L</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">8-15 days</p>
            <p className="font-semibold tabular-nums">₹48K</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">16-30 days</p>
            <p className="font-semibold tabular-nums">₹42K</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">31+ days</p>
            <p className="font-semibold tabular-nums text-red-600">₹84K</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Customer Receivables</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Customer</th>
                <th className="px-6 py-3 text-right font-medium">Outstanding</th>
                <th className="px-6 py-3 text-left font-medium">Oldest Invoice</th>
                <th className="px-6 py-3 text-left font-medium">Days Overdue</th>
                <th className="px-6 py-3 text-left font-medium">Recent Payment</th>
                <th className="px-6 py-3 text-left font-medium">Risk</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{r.name}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-amber-600 font-medium">{r.outstanding}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.oldestInvoice}</td>
                  <td className="px-6 py-4">{r.days}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.recentPayment}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={r.risk.charAt(0).toUpperCase() + r.risk.slice(1)}
                      variant={
                        r.risk === "healthy" ? "success" :
                        r.risk === "watch" ? "warning" :
                        r.risk === "high" ? "error" : "error"
                      }
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">Remind</Button>
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
