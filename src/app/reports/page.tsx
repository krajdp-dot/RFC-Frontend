"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
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
  BadgeIndianRupee,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

type ReportItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
};

const reportGroups: { label: string; reports: ReportItem[] }[] = [
  {
    label: "SALES",
    reports: [
      { title: "Sales Performance", description: "Daily, weekly and monthly sales, cost and gross-profit totals.", icon: TrendingUp, href: "/reports/sales" },
      { title: "Sales vs Collections", description: "Compare invoice totals with the money received and credit still created.", icon: LineChart, href: "/reports/sales" },
      { title: "Customer Sales", description: "Review recorded sales by customer and invoice.", icon: Users, href: "/reports/sales" },
      { title: "Product Sales", description: "See product-level sales revenue, cost and gross margins.", icon: PieChart, href: "/reports/margins" },
    ],
  },
  {
    label: "MONEY",
    reports: [
      { title: "Cash Flow", description: "Trace ledger money in and money out across cash, bank and digital accounts.", icon: ArrowRightLeft, href: "/reports/cash-flow" },
      { title: "Money Flow", description: "Follow opening funds, collections, supplier payments, expenses and closing position.", icon: Banknote, href: "/reports/money-flow" },
      { title: "Receivables Ageing", description: "Review customer dues and collection priorities.", icon: ReceiptText, href: "/receivables" },
      { title: "Payables Summary", description: "Review supplier balances and payments to make.", icon: CreditCard, href: "/payables" },
      { title: "Expense Analysis", description: "Review recorded business expenses and categories.", icon: Wallet, href: "/expenses" },
    ],
  },
  {
    label: "INVENTORY",
    reports: [
      { title: "Inventory Valuation", description: "Live remaining stock value by lot, product and supplier.", icon: Calculator, href: "/reports/inventory" },
      { title: "Stock Movement", description: "Purchase, sale and wastage history report.", icon: RefreshCcw },
      { title: "Freshness Report", description: "Current stock quality, freshness risk and estimated value erosion.", icon: Apple, href: "/reports/freshness" },
      { title: "Wastage Report", description: "Recorded wasted boxes and value by date, product and lot.", icon: Trash2, href: "/reports/wastage" },
      { title: "Markdown Performance", description: "Review market prices and manual price references.", icon: Tag, href: "/price-board" },
    ],
  },
  {
    label: "PROFIT",
    reports: [
      { title: "Profit & Loss", description: "Revenue, cost of goods sold, expenses and calculated profit.", icon: CircleDollarSign, href: "/reports/pnl" },
      { title: "Gross Margin", description: "Product-level revenue, cost and gross margin percentages.", icon: Percent, href: "/reports/margins" },
      { title: "Customer Profitability", description: "Customer-level profit contributions require a dedicated server-side report.", icon: BadgeIndianRupee },
    ],
  },
];

function ReportCard({ report }: { report: ReportItem }) {
  const content = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${report.href ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-border bg-muted/50 text-muted-foreground"}`}>
        <report.icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-5 text-foreground">{report.title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{report.description}</span>
      </span>
      {report.href ? (
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-emerald-700" />
      ) : (
        <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Coming soon</span>
      )}
    </>
  );

  const className = `group flex min-h-[100px] items-start gap-3 rounded-xl border border-border bg-white p-4 text-left transition-colors ${report.href ? "hover:border-emerald-200 hover:bg-emerald-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25" : "cursor-default"}`;

  return report.href ? (
    <Link href={report.href} className={className}>{content}</Link>
  ) : (
    <div className={className} aria-disabled="true">{content}</div>
  );
}

export default function ReportsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 pb-10">
      <PageHeader
        title="Reports"
        description="Choose a live report or open the matching operational workspace. Report figures come from RFC's recorded data."
      />

      <div className="space-y-6">
        {reportGroups.map((group) => (
          <section key={group.label} className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{group.label}</h2>
              <span className="text-xs text-muted-foreground">{group.reports.filter((report) => report.href).length} available</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.reports.map((report) => <ReportCard key={report.title} report={report} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
