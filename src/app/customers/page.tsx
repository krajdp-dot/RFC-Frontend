import { PageHeader } from "@/components/shared/PageHeader"
import { MetricStrip } from "@/components/shared/MetricStrip"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const metrics = [
  { label: "Total Customers", value: "28" },
  { label: "Active", value: "24", subtext: "This month" },
  { label: "With Outstanding", value: "18" },
  { label: "Overdue", value: "6", trend: "down" },
  { label: "Collections Today", value: "₹45,000", trend: "up" },
]

const customers = [
  { id: 1, name: "Rajesh Traders", sales: "₹4,20,000", collected: "₹3,50,000", outstanding: "₹70,000", oldestDue: "14 days", lastPayment: "2 days ago", status: "Active", risk: "healthy" },
  { id: 2, name: "Sharma Retail", sales: "₹1,80,000", collected: "₹1,50,000", outstanding: "₹30,000", oldestDue: "8 days", lastPayment: "1 day ago", status: "Active", risk: "healthy" },
  { id: 3, name: "Amit Retail", sales: "₹3,20,000", collected: "₹2,00,000", outstanding: "₹1,20,000", oldestDue: "45 days", lastPayment: "18 days ago", status: "Watch", risk: "watch" },
  { id: 4, name: "Gupta & Sons", sales: "₹90,000", collected: "₹90,000", outstanding: "₹0", oldestDue: "-", lastPayment: "3 days ago", status: "Active", risk: "healthy" },
  { id: 5, name: "Patel Fruits", sales: "₹5,50,000", collected: "₹4,00,000", outstanding: "₹1,50,000", oldestDue: "28 days", lastPayment: "5 days ago", status: "Active", risk: "watch" },
  { id: 6, name: "Singh Wholesale", sales: "₹8,00,000", collected: "₹6,50,000", outstanding: "₹1,50,000", oldestDue: "12 days", lastPayment: "Today", status: "Active", risk: "healthy" },
  { id: 7, name: "Verma Market", sales: "₹1,20,000", collected: "₹40,000", outstanding: "₹80,000", oldestDue: "65 days", lastPayment: "32 days ago", status: "Overdue", risk: "high" },
  { id: 8, name: "Krishna Retail", sales: "₹2,50,000", collected: "₹50,000", outstanding: "₹2,00,000", oldestDue: "90+ days", lastPayment: "45 days ago", status: "Critical", risk: "critical" },
]

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage customer relationships, credit and collections."
        primaryAction={{ label: "Add Customer" }}
      />

      <MetricStrip metrics={metrics} />

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Customer List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Customer</th>
                <th className="px-6 py-3 text-right font-medium">Sales (month)</th>
                <th className="px-6 py-3 text-right font-medium">Collected</th>
                <th className="px-6 py-3 text-right font-medium">Outstanding</th>
                <th className="px-6 py-3 text-left font-medium">Oldest Due</th>
                <th className="px-6 py-3 text-left font-medium">Last Payment</th>
                <th className="px-6 py-3 text-left font-medium">Status / Risk</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{c.sales}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-emerald-600 font-medium">{c.collected}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-amber-600 font-medium">{c.outstanding}</td>
                  <td className="px-6 py-4">{c.oldestDue}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.lastPayment}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={c.status}
                      variant={
                        c.risk === "healthy" ? "success" :
                        c.risk === "watch" ? "warning" :
                        c.risk === "high" ? "error" : "error"
                      }
                    />
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
