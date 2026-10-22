"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  Download,
  Package,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { todayBusinessDate } from "@/lib/businessDate";
import { fetchApi } from "@/lib/fetchApi";

type Period = "today" | "7d" | "30d" | "month";

type AnalyticsData = {
  sales: any | null;
  margins: any | null;
  wastage: any | null;
};

function getRange(period: Period) {
  const end = todayBusinessDate();
  if (period === "today") return { start: end, end };
  if (period === "month") return { start: `${end.slice(0, 7)}-01`, end };

  const startDate = new Date(`${end}T12:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - (period === "7d" ? 6 : 29));
  return { start: startDate.toISOString().slice(0, 10), end };
}

function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(value: unknown): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(amount);
}

function displayDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const range = useMemo(() => getRange(period), [period]);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    setData(null);

    const query = new URLSearchParams({ startDate: range.start, endDate: range.end });
    const endpoints = [
      ["sales", `/reports/sales?${query.toString()}`],
      ["margins", `/reports/margins?${query.toString()}`],
      ["wastage", `/reports/wastage?${query.toString()}`],
    ] as const;

    const results = await Promise.allSettled(endpoints.map(([, endpoint]) => fetchApi(endpoint)));
    const next: AnalyticsData = { sales: null, margins: null, wastage: null };
    const nextErrors: string[] = [];

    results.forEach((result, index) => {
      const [key, endpoint] = endpoints[index];
      if (result.status === "fulfilled") {
        next[key] = result.value;
      } else {
        nextErrors.push(`${key[0].toUpperCase()}${key.slice(1)} report could not be loaded.`);
      }
    });

    setData(next);
    setErrors(nextErrors);
    setUpdatedAt(new Date());
    setLoading(false);
  }, [range.start, range.end]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshCount]);

  const marginRows: any[] = Array.isArray(data?.margins?.data) ? data.margins.data : [];
  const wastageRows: any[] = Array.isArray(data?.wastage?.data) ? data.wastage.data : [];

  const bestSelling = marginRows.length
    ? marginRows.reduce((best, row) => Number(row.unitsSold || 0) > Number(best.unitsSold || 0) ? row : best)
    : null;
  const highestMargin = marginRows.length
    ? marginRows.reduce((best, row) => Number(row.marginPct || 0) > Number(best.marginPct || 0) ? row : best)
    : null;

  const metricCards = [
    {
      label: "Sales revenue",
      value: formatCurrency(data?.sales?.totalSales),
      helper: data?.sales ? "Recorded sales in this period" : "Report unavailable",
      icon: CircleDollarSign,
      href: "/reports/sales",
    },
    {
      label: "Gross profit",
      value: formatCurrency(data?.sales?.totalGrossProfit),
      helper: data?.sales ? "From recorded sale costs" : "Report unavailable",
      icon: TrendingUp,
      href: "/reports/sales",
    },
    {
      label: "Cost of goods sold",
      value: formatCurrency(data?.sales?.totalCogs),
      helper: data?.sales ? "Cost assigned to recorded sales" : "Report unavailable",
      icon: Package,
      href: "/reports/sales",
    },
    {
      label: "Credit created",
      value: formatCurrency(data?.sales?.totalCredit),
      helper: data?.sales ? "Credit recorded on sales" : "Report unavailable",
      icon: Wallet,
      href: "/reports/sales",
    },
    {
      label: "Average gross margin",
      value: data?.margins?.avgMargin == null ? "—" : `${formatNumber(data.margins.avgMargin)}%`,
      helper: data?.margins ? "From product-level sales margins" : "Report unavailable",
      icon: ChartNoAxesCombined,
      href: "/reports/margins",
    },
    {
      label: "Wastage value",
      value: formatCurrency(data?.wastage?.totalWastageValue),
      helper: data?.wastage ? `${formatNumber(data.wastage.totalWastedBoxes)} boxes recorded as wasted` : "Report unavailable",
      icon: BarChart3,
      href: "/reports/wastage",
    },
  ];

  const periodLabel = `${displayDate(range.start)} – ${displayDate(range.end)}`;
  const allSourcesFailed = Boolean(data) && !data.sales && !data.margins && !data.wastage;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 pb-10">
      <PageHeader
        title="Business Analytics"
        description="A clear view of recorded sales, product margins and wastage—with no guessed or demo metrics."
        primaryAction={{ label: "All Reports", icon: ArrowRight, href: "/reports" }}
        secondaryActions={[{
          label: loading ? "Refreshing…" : "Refresh",
          icon: RefreshCw,
          onClick: () => setRefreshCount((current) => current + 1),
        }]}
      />

      <section className="rounded-xl border border-border bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Reporting period</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{periodLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5" aria-label="Analytics reporting period">
            {([
              ["today", "Today"],
              ["7d", "7 days"],
              ["30d", "30 days"],
              ["month", "This month"],
            ] as [Period, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
                className={`h-8 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${period === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-muted-foreground hover:bg-muted/50"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {updatedAt ? `Updated ${new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(updatedAt)} IST` : "Live report data"}
          </p>
          <p className="text-xs text-muted-foreground">Figures use recorded transactions for the selected business dates.</p>
        </div>
      </section>

      {errors.length > 0 && (
        <div role="status" className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-950">{allSourcesFailed ? "Analytics reports are unavailable" : "Some analytics could not be loaded"}</p>
            <p className="mt-1 text-xs leading-5 text-amber-900">{errors.join(" ")}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setRefreshCount((current) => current + 1)} disabled={loading} className="shrink-0 border-amber-200 bg-white">
            Retry
          </Button>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Performance summary</h2>
            <p className="mt-1 text-xs text-muted-foreground">Live totals from RFC's report service.</p>
          </div>
          <span className="text-xs text-muted-foreground">INR</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((metric) => (
            <Link
              key={metric.label}
              href={metric.href}
              className="group min-w-0 rounded-xl border border-border bg-white p-4 transition-colors hover:border-primary/25 hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/8 group-hover:text-primary">
                  <metric.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 truncate text-[23px] font-semibold tracking-tight tabular-nums text-foreground">
                {loading ? "Loading…" : metric.value}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-muted-foreground">{metric.helper}</p>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Best-selling product</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Ranked by units sold in recorded transactions.</p>
            </div>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="m-4 h-14 animate-pulse rounded-lg bg-muted/50" />
          ) : bestSelling ? (
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{bestSelling.productName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatNumber(bestSelling.unitsSold)} units sold · {formatCurrency(bestSelling.revenue)} revenue</p>
              </div>
              <Link href="/reports/margins" className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5">
                View report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <p className="px-4 py-7 text-sm text-muted-foreground">{data?.margins ? "No product sales recorded for this period." : "Product sales analysis is unavailable."}</p>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Highest-margin product</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Ranked by recorded gross margin percentage.</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="m-4 h-14 animate-pulse rounded-lg bg-muted/50" />
          ) : highestMargin ? (
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{highestMargin.productName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatNumber(highestMargin.marginPct)}% margin · {formatCurrency(highestMargin.grossProfit)} gross profit</p>
              </div>
              <Link href="/reports/margins" className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5">
                View report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <p className="px-4 py-7 text-sm text-muted-foreground">{data?.margins ? "No product sales recorded for this period." : "Product margin analysis is unavailable."}</p>
          )}
        </div>
      </section>
    </div>
  );
}
