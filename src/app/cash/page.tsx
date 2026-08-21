import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Wallet, Landmark, Smartphone, ArrowDownRight, ArrowUpRight, Plus, ArrowRightLeft } from "lucide-react"

export default function CashBanksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash & Banks"
        subtitle="Track all money across accounts."
        primaryAction={{ label: "Transfer Money", icon: Plus }}
      />

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash */}
        <div className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Cash (Galla)</span>
          </div>
          <h3 className="text-2xl font-bold tabular-nums mb-4">₹85,000</h3>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-emerald-600 font-medium">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              <span>In ₹1.2L</span>
            </div>
            <div className="flex items-center text-red-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>Out ₹35K</span>
            </div>
          </div>
        </div>

        {/* SBI */}
        <div className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">SBI Account</span>
          </div>
          <h3 className="text-2xl font-bold tabular-nums mb-4">₹1,10,000</h3>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-emerald-600 font-medium">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              <span>In ₹80K</span>
            </div>
            <div className="flex items-center text-red-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>Out ₹45K</span>
            </div>
          </div>
        </div>

        {/* PNB */}
        <div className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">PNB Current</span>
          </div>
          <h3 className="text-2xl font-bold tabular-nums mb-4">₹34,000</h3>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-emerald-600 font-medium">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              <span>In ₹15K</span>
            </div>
            <div className="flex items-center text-red-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>Out ₹22K</span>
            </div>
          </div>
        </div>

        {/* UPI */}
        <div className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">UPI (PhonePe)</span>
          </div>
          <h3 className="text-2xl font-bold tabular-nums mb-4">₹24,000</h3>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-emerald-600 font-medium">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              <span>In ₹40K</span>
            </div>
            <div className="flex items-center text-red-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>Out ₹16K</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Transactions</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="divide-y">
              {[
                { id: 1, title: "Payment from Rajesh Traders", account: "Cash (Galla)", type: "in", amount: "₹15,000", date: "Today, 10:30 AM" },
                { id: 2, title: "Supplier Payment - Merchant A", account: "SBI Account", type: "out", amount: "₹45,000", date: "Yesterday" },
                { id: 3, title: "Cash Deposit to Bank", account: "Multiple", type: "transfer", amount: "₹25,000", date: "Yesterday" },
                { id: 4, title: "Daily Sales - Counter", account: "Cash (Galla)", type: "in", amount: "₹8,400", date: "12 Oct 2023" },
                { id: 5, title: "Electricity Bill", account: "UPI (PhonePe)", type: "out", amount: "₹3,200", date: "11 Oct 2023" },
              ].map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'in' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                      tx.type === 'out' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                    }`}>
                      {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4" /> :
                       tx.type === 'out' ? <ArrowUpRight className="w-4 h-4" /> :
                       <ArrowRightLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{tx.account}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold tabular-nums ${
                    tx.type === 'in' ? 'text-emerald-600' :
                    tx.type === 'out' ? 'text-foreground' : 'text-blue-600'
                  }`}>
                    {tx.type === 'in' ? '+' : tx.type === 'out' ? '-' : ''}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col - Cash Rec */}
        <div>
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Cash Reconciliation</h2>
            <p className="text-sm text-muted-foreground mb-6">Verify physical cash in drawer at end of day.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Expected Cash</span>
                <span className="font-semibold tabular-nums">₹85,000</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Physical Cash</span>
                <span className="font-semibold tabular-nums">₹82,500</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Difference</span>
                <span className="font-semibold tabular-nums text-red-600">-₹2,500</span>
              </div>
              
              <Button className="w-full mt-4" variant="outline">Log Discrepancy</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
