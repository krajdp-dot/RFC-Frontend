"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Calendar, Clock, CreditCard } from "lucide-react"

export default function CustomerProfilePage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-card border rounded-xl p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Rajesh Traders</h1>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Outstanding:</span>
            <StatusBadge label="₹72,000 Overdue" variant="error" />
            <span className="text-sm text-muted-foreground ml-2">Since 14 days</span>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline">Statement</Button>
          <Button variant="outline">New Sale</Button>
          <Button>Receive Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Sales This Month</p>
              <p className="text-xl font-semibold tabular-nums">₹2,84,000</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Collected</p>
              <p className="text-xl font-semibold tabular-nums text-emerald-600">₹2,12,000</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Credit Limit</p>
              <p className="text-xl font-semibold tabular-nums">₹1,00,000</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Avg Payment</p>
              <p className="text-xl font-semibold tabular-nums">17 days</p>
            </div>
          </div>

          {/* Ageing Bar */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Outstanding Ageing</h2>
            <div className="flex h-8 rounded-md overflow-hidden mb-4">
              <div className="bg-emerald-500 w-[27%]" title="0-7 days: ₹20,000"></div>
              <div className="bg-amber-500 w-[25%]" title="8-15 days: ₹18,000"></div>
              <div className="bg-orange-500 w-[33%]" title="16-30 days: ₹24,000"></div>
              <div className="bg-red-500 w-[15%]" title="31+ days: ₹10,000"></div>
            </div>
            <div className="grid grid-cols-4 text-sm text-center">
              <div>
                <p className="text-muted-foreground mb-1">0-7 days</p>
                <p className="font-semibold tabular-nums">₹20,000</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">8-15 days</p>
                <p className="font-semibold tabular-nums">₹18,000</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">16-30 days</p>
                <p className="font-semibold tabular-nums">₹24,000</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">31+ days</p>
                <p className="font-semibold tabular-nums text-red-600">₹10,000</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Transactions</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                  <th className="px-6 py-3 text-left font-medium">Ref</th>
                  <th className="px-6 py-3 text-right font-medium">Amount</th>
                  <th className="px-6 py-3 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3">Today</td>
                  <td className="px-6 py-3"><span className="text-emerald-600 font-medium">Payment Received</span></td>
                  <td className="px-6 py-3 text-muted-foreground">RCT-482</td>
                  <td className="px-6 py-3 text-right tabular-nums text-emerald-600">₹15,000</td>
                  <td className="px-6 py-3 text-right tabular-nums font-medium">₹72,000</td>
                </tr>
                <tr className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3">Yesterday</td>
                  <td className="px-6 py-3">Sale (Credit)</td>
                  <td className="px-6 py-3 text-muted-foreground">INV-1045</td>
                  <td className="px-6 py-3 text-right tabular-nums">₹32,000</td>
                  <td className="px-6 py-3 text-right tabular-nums font-medium">₹87,000</td>
                </tr>
                <tr className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3">05 Oct</td>
                  <td className="px-6 py-3">Sale (Credit)</td>
                  <td className="px-6 py-3 text-muted-foreground">INV-1022</td>
                  <td className="px-6 py-3 text-right tabular-nums">₹18,000</td>
                  <td className="px-6 py-3 text-right tabular-nums font-medium">₹55,000</td>
                </tr>
                <tr className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3">02 Oct</td>
                  <td className="px-6 py-3"><span className="text-emerald-600 font-medium">Payment Received</span></td>
                  <td className="px-6 py-3 text-muted-foreground">RCT-465</td>
                  <td className="px-6 py-3 text-right tabular-nums text-emerald-600">₹40,000</td>
                  <td className="px-6 py-3 text-right tabular-nums font-medium">₹37,000</td>
                </tr>
                <tr className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3">28 Sep</td>
                  <td className="px-6 py-3">Sale (Credit)</td>
                  <td className="px-6 py-3 text-muted-foreground">INV-0988</td>
                  <td className="px-6 py-3 text-right tabular-nums">₹45,000</td>
                  <td className="px-6 py-3 text-right tabular-nums font-medium">₹77,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contact Information</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">+91 98765 43210</p>
                  <p className="text-muted-foreground">Rajesh Kumar (Owner)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p>rajesh.traders@example.com</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="leading-tight">Shop 42, APMC Market,<br/>Vashi, Navi Mumbai 400703</p>
              </div>
            </div>
          </div>

          {/* Payment Behavior */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Payment Behavior</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">On-time payments</span>
                </div>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Avg. days to pay</span>
                </div>
                <span className="font-medium">17 days</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Preferred method</span>
                </div>
                <span className="font-medium">Bank Transfer</span>
              </div>
              
              <div className="pt-4 border-t mt-4">
                <p className="text-xs text-muted-foreground mb-2">Trend over last 6 months</p>
                <div className="flex items-end gap-1 h-12">
                  <div className="bg-emerald-500/20 w-1/6 h-[60%] rounded-t-sm"></div>
                  <div className="bg-emerald-500/40 w-1/6 h-[70%] rounded-t-sm"></div>
                  <div className="bg-emerald-500/60 w-1/6 h-[85%] rounded-t-sm"></div>
                  <div className="bg-emerald-500/80 w-1/6 h-[75%] rounded-t-sm"></div>
                  <div className="bg-emerald-500/90 w-1/6 h-[90%] rounded-t-sm"></div>
                  <div className="bg-emerald-500 w-1/6 h-[100%] rounded-t-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
