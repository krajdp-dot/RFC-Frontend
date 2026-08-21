import { PageHeader } from "@/components/shared/PageHeader"
import { MetricStrip } from "@/components/shared/MetricStrip"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"

const metrics = [
  { label: "Total Suppliers", value: "12" },
  { label: "Active", value: "10" },
  { label: "Outstanding", value: "₹2.18L", trend: "up" },
  { label: "Overdue", value: "₹12K", trend: "down" },
  { label: "Purchases This Month", value: "₹8.4L" },
]

const suppliers = [
  { id: 1, name: "Merchant A", purchases: "₹2,40,000", paid: "₹1,80,000", outstanding: "₹60,000", quality: "Excellent", lastPurchase: "Yesterday", status: "Active" },
  { id: 2, name: "Merchant B", purchases: "₹1,80,000", paid: "₹1,80,000", outstanding: "₹0", quality: "Good", lastPurchase: "3 days ago", status: "Active" },
  { id: 3, name: "Merchant C", purchases: "₹3,20,000", paid: "₹2,50,000", outstanding: "₹70,000", quality: "Average", lastPurchase: "Today", status: "Active" },
  { id: 4, name: "Gupta Farms", purchases: "₹45,000", paid: "₹0", outstanding: "₹45,000", quality: "Excellent", lastPurchase: "1 week ago", status: "Overdue" },
  { id: 5, name: "Patel Orchards", purchases: "₹1,50,000", paid: "₹1,20,000", outstanding: "₹30,000", quality: "Good", lastPurchase: "2 days ago", status: "Active" },
  { id: 6, name: "Singh Fruits", purchases: "₹90,000", paid: "₹77,000", outstanding: "₹13,000", quality: "Good", lastPurchase: "5 days ago", status: "Active" },
]

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Track supplier purchases, payments and relationships."
        primaryAction={{ label: "Add Supplier" }}
      />

      <MetricStrip metrics={metrics} />

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Supplier List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Supplier</th>
                <th className="px-6 py-3 text-right font-medium">Purchases (month)</th>
                <th className="px-6 py-3 text-right font-medium">Paid</th>
                <th className="px-6 py-3 text-right font-medium">Outstanding</th>
                <th className="px-6 py-3 text-left font-medium">Quality</th>
                <th className="px-6 py-3 text-left font-medium">Last Purchase</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{s.purchases}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-emerald-600 font-medium">{s.paid}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-amber-600 font-medium">{s.outstanding}</td>
                  <td className="px-6 py-4">{s.quality}</td>
                  <td className="px-6 py-4 text-muted-foreground">{s.lastPurchase}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={s.status}
                      variant={s.status === "Active" ? "success" : s.status === "Overdue" ? "error" : "default"}
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
