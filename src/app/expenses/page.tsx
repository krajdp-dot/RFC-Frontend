import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { formatCurrency } from "@/lib/formatters";

const metrics = [
  { label: "Today", value: "₹8,500" },
  { label: "This Month", value: "₹1,20,000", trend: { value: "+5%", positive: false } },
  { label: "Largest Category", value: "Transport", subtext: "₹42,000" },
  { label: "Cash Expenses", value: "₹65,000" },
];

const expenses = [
  { id: "EXP-802", date: "16 Aug 2026", category: "Transport", desc: "Freight for Apple box from HP", amount: 4500, method: "Bank Transfer", account: "HDFC Current" },
  { id: "EXP-801", date: "16 Aug 2026", category: "Labour", desc: "Daily wage loading/unloading", amount: 1200, method: "Cash", account: "Petty Cash" },
  { id: "EXP-800", date: "15 Aug 2026", category: "Fuel", desc: "Delivery tempo diesel", amount: 2500, method: "UPI", account: "SBI Current" },
  { id: "EXP-799", date: "15 Aug 2026", category: "Other", desc: "Tea & Snacks", amount: 300, method: "Cash", account: "Petty Cash" },
  { id: "EXP-798", date: "14 Aug 2026", category: "Rent", desc: "Godown rent part payment", amount: 12000, method: "Bank Transfer", account: "HDFC Current" },
  { id: "EXP-797", date: "14 Aug 2026", category: "Transport", desc: "Local delivery charges", amount: 800, method: "Cash", account: "Petty Cash" },
];

const breakdown = [
  { category: "Transport", amount: 42000, color: "bg-blue-500", pct: 35 },
  { category: "Labour", amount: 28000, color: "bg-amber-500", pct: 23 },
  { category: "Loading", amount: 15000, color: "bg-green-500", pct: 12.5 },
  { category: "Rent", amount: 12000, color: "bg-purple-500", pct: 10 },
  { category: "Fuel", amount: 8000, color: "bg-red-500", pct: 6.6 },
  { category: "Other", amount: 15000, color: "bg-slate-500", pct: 12.5 },
];

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Expenses" 
        subtitle="Understand where business money is going." 
        primaryAction={{ label: "Record Expense", icon: Plus }} 
      />
      
      <MetricStrip metrics={metrics} />
      
      <div className="bg-card border rounded-xl p-5 flex flex-col">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-6">Where did money go? (This Month)</h2>
        
        <div className="space-y-6">
          <div className="h-6 w-full rounded-full overflow-hidden flex bg-muted">
            {breakdown.map((item) => (
              <div 
                key={item.category} 
                className={`h-full ${item.color} border-r border-background/20 last:border-0 hover:opacity-90 transition-opacity cursor-pointer`} 
                style={{ width: `${item.pct}%` }}
                title={`${item.category}: ${formatCurrency(item.amount)}`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {breakdown.map((item) => (
              <div key={item.category} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <span className="text-lg font-bold tabular-nums ml-5">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-muted/20">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Expenses</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search expenses..." 
                className="pl-9 pr-4 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
            </div>
            <button className="p-1.5 border rounded-lg hover:bg-muted text-muted-foreground">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-center">Method</th>
                <th className="px-4 py-3 font-medium">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{expense.date}</td>
                  <td className="px-4 py-3 font-medium">
                    <span className="px-2 py-1 rounded-md bg-muted text-xs">{expense.category}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{expense.desc}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-right">{formatCurrency(expense.amount)}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{expense.method}</td>
                  <td className="px-4 py-3 text-muted-foreground">{expense.account}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
