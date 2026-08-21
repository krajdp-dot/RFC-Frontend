import { PageHeader } from "@/components/shared/PageHeader";
import {
  TrendingUp,
  LineChart,
  Users,
  PieChart,
  ArrowRightLeft,
  Banknote,
  ReceiptText,
  CreditCard,
  Wallet,
  Calculator,
  RefreshCcw,
  Apple,
  Trash2,
  Tag,
  CircleDollarSign,
  Percent,
  BadgeIndianRupee
} from "lucide-react";

export default function ReportsPage() {
  const reportGroups = [
    {
      label: "SALES",
      reports: [
        { title: "Sales Performance", description: "Daily, weekly and monthly sales trends with comparisons", icon: TrendingUp },
        { title: "Sales vs Collections", description: "Compare sales generation with actual cash received", icon: LineChart },
        { title: "Customer Sales", description: "Sales breakdown by customer with rankings", icon: Users },
        { title: "Product Sales", description: "Which fruits sell the most and generate best margins", icon: PieChart },
      ],
    },
    {
      label: "MONEY",
      reports: [
        { title: "Cash Flow", description: "Track money coming in and going out", icon: ArrowRightLeft },
        { title: "Money Flow", description: "Detailed movement of money through the business", icon: Banknote },
        { title: "Receivables Ageing", description: "Customer outstanding with ageing analysis", icon: ReceiptText },
        { title: "Payables Summary", description: "Supplier outstanding and payment schedule", icon: CreditCard },
        { title: "Expense Analysis", description: "Where business money is going", icon: Wallet },
      ],
    },
    {
      label: "INVENTORY",
      reports: [
        { title: "Inventory Valuation", description: "Current stock value and cost analysis", icon: Calculator },
        { title: "Stock Movement", description: "Purchase, sale and wastage flow", icon: RefreshCcw },
        { title: "Freshness Report", description: "Stock quality and deterioration analysis", icon: Apple },
        { title: "Wastage Report", description: "Total wastage, by product, supplier, reason", icon: Trash2 },
        { title: "Markdown Performance", description: "Effectiveness of markdown decisions", icon: Tag },
      ],
    },
    {
      label: "PROFIT",
      reports: [
        { title: "Profit & Loss", description: "Revenue, costs and profit summary", icon: CircleDollarSign },
        { title: "Gross Margin", description: "Product-level margin analysis", icon: Percent },
        { title: "Customer Profitability", description: "Which customers generate best margins", icon: BadgeIndianRupee },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Business intelligence and analytics."
      />

      <div className="space-y-8">
        {reportGroups.map((group) => (
          <section key={group.label} className="space-y-4">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.reports.map((report) => (
                <div
                  key={report.title}
                  className="bg-card border rounded-xl p-4 hover:bg-muted/30 transition cursor-pointer flex flex-col space-y-2 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <report.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold">{report.title}</h3>
                  </div>
                  <p className="text-[13px] text-muted-foreground pl-[44px]">
                    {report.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
