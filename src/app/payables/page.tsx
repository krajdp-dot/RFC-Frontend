import { PageHeader } from "@/components/shared/PageHeader"
import { MetricStrip } from "@/components/shared/MetricStrip"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"

const metrics = [
  { label: "Total Payables", value: "₹2.18L" },
  { label: "Due Today", value: "₹40K", trend: "up" },
  { label: "Due This Week", value: "₹75K" },
  { label: "Overdue", value: "₹12K", trend: "down" },
  { label: "Paid This Month", value: "₹6.9L" },
]

const payables = [
  { id: 1, name: "Merchant C", outstanding: "₹70,000", dueDate: "Today", lastPayment: "3 days ago", priority: "high" },
  { id: 2, name: "Merchant A", outstanding: "₹60,000", dueDate: "Tomorrow", lastPayment: "Yesterday", priority: "medium" },
  { id: 3, name: "Gupta Farms", outstanding: "₹45,000", dueDate: "Overdue (5 days)", lastPayment: "Never", priority: "critical" },
  { id: 4, name: "Patel Orchards", outstanding: "₹30,000", dueDate: "Next Week", lastPayment: "2 days ago", priority: "low" },
  { id: 5, name: "Singh Fruits", outstanding: "₹13,000", dueDate: "Next Week", lastPayment: "5 days ago", priority: "low" },
]

export default function PayablesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payables"
        subtitle="Money you owe to suppliers."
        primaryAction={{ label: "Make Payment" }}
      />

      <MetricStrip metrics={metrics} />

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Supplier Payables</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Supplier</th>
                <th className="px-6 py-3 text-right font-medium">Outstanding</th>
                <th className="px-6 py-3 text-left font-medium">Due Date</th>
                <th className="px-6 py-3 text-left font-medium">Last Payment</th>
                <th className="px-6 py-3 text-left font-medium">Priority</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {payables.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-amber-600 font-medium">{p.outstanding}</td>
                  <td className="px-6 py-4">
                    <span className={p.dueDate.includes("Overdue") ? "text-red-600 font-medium" : p.dueDate === "Today" ? "text-orange-600 font-medium" : ""}>
                      {p.dueDate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{p.lastPayment}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={p.priority.charAt(0).toUpperCase() + p.priority.slice(1)}
                      variant={
                        p.priority === "low" ? "default" :
                        p.priority === "medium" ? "warning" :
                        p.priority === "high" ? "error" : "error"
                      }
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="outline" size="sm">Pay Now</Button>
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
