"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, RefreshCw, CalendarDays, FileBarChart2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { todayBusinessDate } from "@/lib/businessDate";
import { fetchApi } from "@/lib/fetchApi";

type ValueFormat = "currency" | "number" | "date" | "percent" | "text";
type MetricSpec = { label: string; path: string; format?: ValueFormat };
type ColumnSpec = { label: string; key: string; format?: ValueFormat };
type ReportSpec = {
  title: string;
  description: string;
  endpoint: string;
  metrics: MetricSpec[];
  columns: ColumnSpec[];
  rowsPath?: string;
  currentPosition?: boolean;
};

const REPORTS: Record<string, ReportSpec> = {
  sales: {
    title: "Sales performance",
    description: "Recorded sales, collections, credit created and gross profit for the selected business dates.",
    endpoint: "sales",
    metrics: [
      { label: "Total sales", path: "totalSales", format: "currency" },
      { label: "Gross profit", path: "totalGrossProfit", format: "currency" },
      { label: "Cost of goods sold", path: "totalCogs", format: "currency" },
      { label: "Credit created", path: "totalCredit", format: "currency" },
    ],
    columns: [
      { label: "Date", key: "businessDate", format: "date" },
      { label: "Reference", key: "saleReference" },
      { label: "Customer", key: "customerName" },
      { label: "Items", key: "itemCount", format: "number" },
      { label: "Sale total", key: "total", format: "currency" },
      { label: "Received", key: "received", format: "currency" },
      { label: "Credit", key: "creditAmount", format: "currency" },
      { label: "Gross profit", key: "grossProfit", format: "currency" },
    ],
  },
  purchases: {
    title: "Purchase report",
    description: "Supplier purchases, landed cost, payments and credit created for the selected business dates.",
    endpoint: "purchases",
    metrics: [
      { label: "Landed cost", path: "totalPurchases", format: "currency" },
      { label: "Purchase subtotal", path: "totalSubtotal", format: "currency" },
      { label: "Credit created", path: "totalCredit", format: "currency" },
    ],
    columns: [
      { label: "Date", key: "businessDate", format: "date" },
      { label: "Reference", key: "purchaseReference" },
      { label: "Supplier", key: "supplierName" },
      { label: "Items", key: "itemCount", format: "number" },
      { label: "Subtotal", key: "subtotal", format: "currency" },
      { label: "Landed cost", key: "landedCost", format: "currency" },
      { label: "Paid", key: "paid", format: "currency" },
      { label: "Credit", key: "creditAmount", format: "currency" },
    ],
  },
  "cash-flow": {
    title: "Cash flow",
    description: "Ledger movements across cash, bank and digital accounts. Debit is money in; credit is money out.",
    endpoint: "cash-flow",
    metrics: [
      { label: "Money in", path: "in", format: "currency" },
      { label: "Money out", path: "out", format: "currency" },
      { label: "Net movement", path: "net", format: "currency" },
    ],
    columns: [
      { label: "Date", key: "date", format: "date" },
      { label: "Account", key: "accountName" },
      { label: "Activity", key: "description" },
      { label: "Type", key: "transactionType" },
      { label: "Money in", key: "debit", format: "currency" },
      { label: "Money out", key: "credit", format: "currency" },
    ],
  },
  "money-flow": {
    title: "Money flow",
    description: "Trace opening balance, collections, supplier payments and expenses through to the calculated closing position.",
    endpoint: "money-flow",
    metrics: [
      { label: "Opening balance", path: "opening", format: "currency" },
      { label: "Customer collections", path: "collections", format: "currency" },
      { label: "Supplier payments", path: "purchases", format: "currency" },
      { label: "Expenses", path: "expenses", format: "currency" },
      { label: "Account transfers", path: "transfers", format: "currency" },
      { label: "Closing position", path: "closing", format: "currency" },
    ],
    columns: [],
  },
  pnl: {
    title: "Profit & loss",
    description: "Revenue, cost of goods sold and recorded expenses for the selected business dates.",
    endpoint: "pnl",
    metrics: [
      { label: "Revenue", path: "revenue", format: "currency" },
      { label: "Cost of goods sold", path: "cogs", format: "currency" },
      { label: "Gross profit", path: "grossProfit", format: "currency" },
      { label: "Expenses", path: "expenses", format: "currency" },
      { label: "Profit after recorded expenses", path: "profit", format: "currency" },
    ],
    columns: [
      { label: "Product", key: "productName" },
      { label: "Revenue", key: "revenue", format: "currency" },
      { label: "Cost of goods sold", key: "cogs", format: "currency" },
      { label: "Gross profit", key: "grossProfit", format: "currency" },
      { label: "Margin", key: "margin", format: "percent" },
    ],
  },
  inventory: {
    title: "Inventory valuation",
    description: "Current value of remaining stock by live lot, product and supplier.",
    endpoint: "inventory",
    metrics: [
      { label: "Stock value", path: "totalValue", format: "currency" },
      { label: "Active lots", path: "totalLots", format: "number" },
    ],
    columns: [
      { label: "Received", key: "receivedDate", format: "date" },
      { label: "Lot", key: "lotReference" },
      { label: "Product", key: "productName" },
      { label: "Supplier", key: "supplierName" },
      { label: "Remaining boxes", key: "remainingBoxes", format: "number" },
      { label: "Cost / box", key: "costPerBox", format: "currency" },
      { label: "Stock value", key: "value", format: "currency" },
      { label: "Freshness", key: "freshnessStatus" },
    ],
    currentPosition: true,
  },
  freshness: {
    title: "Freshness report",
    description: "Current stock value grouped by freshness risk, with at-risk lots and estimated value erosion.",
    endpoint: "freshness",
    metrics: [
      { label: "Total stock value", path: "summary.totalValue", format: "currency" },
      { label: "Fresh", path: "summary.freshStockValue", format: "currency" },
      { label: "Needs attention", path: "summary.attentionValue", format: "currency" },
      { label: "Markdown", path: "summary.markdownValue", format: "currency" },
      { label: "High risk", path: "summary.highRiskValue", format: "currency" },
      { label: "Value erosion estimate", path: "summary.erosionValue", format: "currency" },
    ],
    columns: [
      { label: "Product", key: "productName" },
      { label: "Remaining", key: "quantity", format: "number" },
      { label: "Age (days)", key: "ageDays", format: "number" },
      { label: "Quality", key: "qualityPct", format: "percent" },
      { label: "Stock value", key: "value", format: "currency" },
      { label: "Risk estimate", key: "riskValue", format: "currency" },
      { label: "Status", key: "status" },
    ],
    rowsPath: "items",
    currentPosition: true,
  },
  wastage: {
    title: "Wastage report",
    description: "Recorded wastage cost and boxes lost by date, product and lot.",
    endpoint: "wastage",
    metrics: [
      { label: "Wastage value", path: "totalWastageValue", format: "currency" },
      { label: "Boxes wasted", path: "totalWastedBoxes", format: "number" },
    ],
    columns: [
      { label: "Date", key: "date", format: "date" },
      { label: "Product", key: "productName" },
      { label: "Lot", key: "lotReference" },
      { label: "Boxes", key: "boxes", format: "number" },
      { label: "Cost / unit", key: "costPerUnit", format: "currency" },
      { label: "Total cost", key: "totalCost", format: "currency" },
      { label: "Notes", key: "notes" },
    ],
  },
  margins: {
    title: "Product gross margins",
    description: "Product-level revenue, cost of goods sold and gross profit from recorded sales.",
    endpoint: "margins",
    metrics: [{ label: "Average gross margin", path: "avgMargin", format: "percent" }],
    columns: [
      { label: "Product", key: "productName" },
      { label: "Units sold", key: "unitsSold", format: "number" },
      { label: "Revenue", key: "revenue", format: "currency" },
      { label: "Cost of goods sold", key: "cogs", format: "currency" },
      { label: "Gross profit", key: "grossProfit", format: "currency" },
      { label: "Margin", key: "marginPct", format: "percent" },
    ],
  },
};

type Period = "today" | "7d" | "30d" | "month" | "custom";

function getRange(period: Exclude<Period, "custom">) {
  const end = todayBusinessDate();
  if (period === "today") return { start: end, end };
  if (period === "month") return { start: `${end.slice(0, 7)}-01`, end };
  const days = period === "7d" ? 7 : 30;
  const startDate = new Date(`${end}T12:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
  return { start: startDate.toISOString().slice(0, 10), end };
}

function getPathValue(value: any, path: string): unknown {
  return path.split(".").reduce((current, key) => current?.[key], value);
}

function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
}

function formatValue(value: unknown, format: ValueFormat = "text"): string {
  if (value === null || value === undefined || value === "") return "—";
  if (format === "currency") return formatCurrency(value);
  if (format === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(parsed) : String(value);
  }
  if (format === "percent") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(parsed)}%` : String(value);
  }
  if (format === "date") {
    const date = String(value).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return String(value);
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  }
  return String(value).replaceAll("_", " ");
}

export default function ReportDetailPage() {
  const params = useParams<{ report: string }>();
  const slug = Array.isArray(params.report) ? params.report[0] : params.report;
  const spec = REPORTS[slug];
  const initialRange = useMemo(() => getRange("30d"), []);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [draftStart, setDraftStart] = useState(initialRange.start);
  const [draftEnd, setDraftEnd] = useState(initialRange.end);
  const [period, setPeriod] = useState<Period>("30d");
  const [rangeError, setRangeError] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!spec) {
      setLoading(false);
      setError("This report isn't available yet.");
      return;
    }
    if (!startDate || !endDate || startDate > endDate) {
      setLoading(false);
      setError("Choose a valid reporting period.");
      return;
    }
    let cancelled = false;
    async function loadReport() {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ startDate, endDate });
        const response = await fetchApi(`/reports/${spec.endpoint}?${query.toString()}`);
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Couldn't load this report.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadReport();
    return () => { cancelled = true; };
  }, [spec, startDate, endDate, refreshKey]);

  const rows = useMemo(() => {
    if (!spec || !data) return [];
    const source = spec.rowsPath ? getPathValue(data, spec.rowsPath) : data.data;
    return Array.isArray(source) ? source : [];
  }, [spec, data]);

  function applyPreset(next: Exclude<Period, "custom">) {
    const range = getRange(next);
    setPeriod(next);
    setRangeError("");
    setStartDate(range.start);
    setEndDate(range.end);
    setDraftStart(range.start);
    setDraftEnd(range.end);
  }

  function applyCustomRange() {
    if (!draftStart || !draftEnd || draftStart > draftEnd) {
      setRangeError("The start date must be on or before the end date.");
      return;
    }
    setPeriod("custom");
    setStartDate(draftStart);
    setEndDate(draftEnd);
    setRangeError("");
  }

  function exportCsv() {
    if (!spec) return;
    const csvRows = [
      spec.columns.map((column) => column.label),
      ...rows.map((row: any) => spec.columns.map((column) => row?.[column.key] ?? "")),
    ];
    const csv = csvRows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rfc-${slug}-${startDate}-to-${endDate}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!spec) {
    return (
      <div className="space-y-5">
        <PageHeader title="Report unavailable" description="This report hasn't been connected to a live data source." primaryAction={{ label: "All reports", icon: ArrowLeft, href: "/reports" }} />
        <div className="rounded-xl border border-border bg-white p-6 text-sm text-muted-foreground">{error || "This report isn't available yet."}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 pb-10">
      <PageHeader
        title={spec.title}
        description={spec.description}
        primaryAction={{ label: "All reports", icon: ArrowLeft, href: "/reports" }}
      />

      <section className="rounded-xl border border-border bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Reporting period
            </div>
            <div className="flex flex-wrap gap-1.5" aria-label="Report date presets">
              {([
                ["today", "Today"],
                ["7d", "7 days"],
                ["30d", "30 days"],
                ["month", "This month"],
                ["custom", "Custom"],
              ] as [Period, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={period === value}
                  onClick={() => value === "custom" ? (setPeriod("custom"), setDraftStart(startDate), setDraftEnd(endDate)) : applyPreset(value)}
                  className={`h-8 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${period === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-muted-foreground hover:bg-muted/50"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {period === "custom" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block text-xs font-medium text-muted-foreground">
                From
                <Input type="date" value={draftStart} max={draftEnd || undefined} onChange={(event) => setDraftStart(event.target.value)} className="mt-1 h-9 w-full sm:w-36" />
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                To
                <Input type="date" value={draftEnd} min={draftStart || undefined} onChange={(event) => setDraftEnd(event.target.value)} className="mt-1 h-9 w-full sm:w-36" />
              </label>
              <Button type="button" size="sm" onClick={applyCustomRange} className="h-9 rounded-lg">Apply</Button>
            </div>
          )}
        </div>
        {rangeError && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{rangeError}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {spec.currentPosition ? "Current stock positions; date range doesn't change the valuation." : `${formatValue(startDate, "date")} – ${formatValue(endDate, "date")}`}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => setRefreshKey((current) => current + 1)} disabled={loading} className="h-8 rounded-lg">
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </section>

      {error && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-800">
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setRefreshKey((current) => current + 1)}>Retry report</Button>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${spec.metrics.length >= 4 ? "xl:grid-cols-4" : spec.metrics.length === 3 ? "xl:grid-cols-3" : spec.metrics.length === 2 ? "xl:grid-cols-2" : "xl:grid-cols-1"}`}>
        {spec.metrics.map((metric) => (
          <div key={metric.path} className="min-w-0 rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
            {loading ? (
              <div className="mt-3 h-7 w-32 animate-pulse rounded-md bg-muted/70" />
            ) : (
              <p className="mt-2 truncate text-[23px] font-semibold tracking-tight tabular-nums">
                {formatValue(getPathValue(data, metric.path), metric.format)}
              </p>
            )}
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{spec.columns.length ? "Report details" : "Period summary"}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{spec.columns.length ? `${rows.length} rows returned · maximum 200 records per report` : "Calculated from the report service's recorded totals."}</p>
          </div>
          {spec.columns.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={exportCsv} disabled={loading || rows.length === 0} className="h-8 rounded-lg">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
          )}
        </div>

        {spec.columns.length === 0 ? (
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
            {spec.metrics.map((metric) => (
              <div key={metric.path} className="bg-white p-4">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-base font-semibold tabular-nums">{loading ? "Loading…" : formatValue(getPathValue(data, metric.path), metric.format)}</p>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="space-y-3 p-4">
            <div className="h-8 animate-pulse rounded-lg bg-muted/50" />
            <div className="h-8 animate-pulse rounded-lg bg-muted/50" />
            <div className="h-8 animate-pulse rounded-lg bg-muted/50" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40">
              <FileBarChart2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">No records in this period</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">No matching transactions were returned. Choose another reporting period or check the source page.</p>
          </div>
        ) : (
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="sticky top-0 z-[1] bg-muted/70">
                <tr>
                  {spec.columns.map((column) => <th key={column.key} className="px-4 py-3 text-left font-semibold text-muted-foreground">{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any, index: number) => (
                  <tr key={row.id || row.lotId || row.productId || `${slug}-row-${index}`} className="transition-colors hover:bg-muted/25">
                    {spec.columns.map((column) => (
                      <td key={column.key} className={`px-4 py-3 ${column.format === "currency" || column.format === "number" || column.format === "percent" ? "text-right tabular-nums" : ""} ${column.format === "currency" ? "font-medium" : "text-foreground"}`}>
                        <span className={column.key === "status" ? "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize" : column.key.endsWith("Reference") ? "font-mono text-xs" : ""}>
                          {formatValue(row?.[column.key], column.format)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
