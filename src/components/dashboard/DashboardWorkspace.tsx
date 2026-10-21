"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Landmark,
  Package,
  PackagePlus,
  RefreshCw,
  Search,
  Settings2,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/fetchApi";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/lib/permissions";

type DatePreset = "today" | "7d" | "30d" | "month" | "fy" | "custom";
type SearchResult = {
  key: string;
  label: string;
  detail: string;
  meta?: string;
  href: string;
  kind: string;
};
type Transaction = {
  id: string;
  reference?: string;
  date: string;
  timestamp?: string;
  party: string;
  partyId?: string;
  type: string;
  amount: string | number;
  status?: string;
  paymentStatus?: string;
  href: string;
};

const PERIODS: { value: Exclude<DatePreset, "custom">; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "month", label: "This month" },
  { value: "fy", label: "This financial year" },
];

function businessDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const read = (key: string) => parts.find((part) => part.type === key)?.value || "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

function shiftDate(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function presetRange(preset: Exclude<DatePreset, "custom">) {
  const today = businessDateString();
  if (preset === "today") return { start: today, end: today };
  if (preset === "7d") return { start: shiftDate(today, -6), end: today };
  if (preset === "30d") return { start: shiftDate(today, -29), end: today };
  if (preset === "month") return { start: `${today.slice(0, 7)}-01`, end: today };
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  return { start: `${month >= 4 ? year : year - 1}-04-01`, end: today };
}

function unwrapItems(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function formatCurrency(value: unknown, maximumFractionDigits = 0) {
  if (value === null || value === undefined || value === "") return "Not available";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not available";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(amount);
}

function formatCompactCurrency(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

function numberFromMoney(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function formatDisplayDate(value: string) {
  if (!value) return "—";
  const parts = value.slice(0, 10).split("-");
  if (parts.length !== 3) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${parts[0]}-${parts[1]}-${parts[2]}T12:00:00Z`));
}

function formatCompactTick(value: number) {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `${number > 0 ? "+" : ""}${number.toFixed(1)}%`;
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function transactionKind(type: string) {
  if (type === "SALE") return "Sale";
  if (type === "PURCHASE") return "Purchase";
  if (type === "PAYMENT_IN") return "Money received";
  if (type === "PAYMENT_OUT") return "Supplier payment";
  if (type === "EXPENSE") return "Expense";
  if (type === "REFUND") return "Refund";
  return titleCase(type || "Transaction");
}

function transactionStatusLabel(transaction: Transaction) {
  if (transaction.type === "SALE" || transaction.type === "PURCHASE") {
    return transaction.paymentStatus || transaction.status || "Recorded";
  }
  return transaction.paymentStatus || transaction.status || "Recorded";
}

function getTransactionTone(transaction: Transaction) {
  if (transaction.type === "SALE" || transaction.type === "PAYMENT_IN") return "text-emerald-700 bg-emerald-50";
  if (transaction.type === "PURCHASE" || transaction.type === "PAYMENT_OUT") return "text-neutral-700 bg-neutral-100";
  if (transaction.type === "EXPENSE" || transaction.type === "REFUND") return "text-amber-800 bg-amber-50";
  return "text-neutral-700 bg-neutral-100";
}

function getAlertHref(alert: any) {
  if (alert?.href) return alert.href;
  if (alert?.type === "OVERDUE_RECEIVABLE") return "/receivables";
  if (alert?.type === "OVERDUE_PAYABLE") return "/payables";
  if (alert?.type === "LOW_STOCK") return "/inventory";
  if (alert?.type === "STOCK_AT_RISK") return "/freshness";
  return "/reports";
}

function LoadingBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-neutral-100 ${className}`} />;
}

function KpiCard({
  label,
  value,
  subtext,
  change,
  icon: Icon,
  href,
  loading,
}: {
  label: string;
  value: string;
  subtext: string;
  change?: unknown;
  icon: typeof Activity;
  href: string;
  loading?: boolean;
}) {
  const formattedChange = formatPercent(change);
  return (
    <Link
      href={href}
      className="group min-w-0 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-neutral-600">{label}</p>
        <Icon className="h-[17px] w-[17px] shrink-0 text-neutral-500" aria-hidden="true" />
      </div>
      {loading ? (
        <LoadingBlock className="mt-4 h-8 w-32" />
      ) : (
        <p className="mt-3 truncate text-[25px] font-semibold leading-tight tracking-[-0.035em] text-neutral-950 tabular-nums">
          {value}
        </p>
      )}
      <div className="mt-3 flex min-h-5 items-start justify-between gap-2">
        <span className="min-w-0 text-xs leading-5 text-neutral-500">{subtext}</span>
        {formattedChange !== null && (
          <span className="shrink-0 text-xs font-semibold text-emerald-800 tabular-nums">
            {formattedChange}
          </span>
        )}
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        View details <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function SectionHeading({
  title,
  description,
  href,
  hrefLabel = "View all",
}: {
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-neutral-950">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
          {hrefLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function DashboardWorkspace() {
  const { business, user, can } = useAuth();
  const initialRange = useMemo(() => presetRange("30d"), []);
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [draftStart, setDraftStart] = useState(initialRange.start);
  const [draftEnd, setDraftEnd] = useState(initialRange.end);
  const [rangeError, setRangeError] = useState("");

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<"date" | "amount" | "party" | "type">("date");
  const [sortDescending, setSortDescending] = useState(true);
  const [transactionPage, setTransactionPage] = useState(1);

  const canViewSales = can(PERMISSIONS.SALES_VIEW);
  const canViewPurchases = can(PERMISSIONS.PURCHASES_VIEW);
  const canViewProducts = can(PERMISSIONS.PRODUCTS_VIEW);
  const canViewCustomers = can(PERMISSIONS.CUSTOMERS_VIEW);
  const canViewSuppliers = can(PERMISSIONS.SUPPLIERS_VIEW);
  const canViewInventory = can(PERMISSIONS.INVENTORY_VIEW);
  const canViewExpenses = can(PERMISSIONS.EXPENSES_VIEW);
  const canViewAccounts = can(PERMISSIONS.ACCOUNTS_VIEW);
  const canViewReceivables = can(PERMISSIONS.RECEIVABLES_VIEW);
  const canViewPayables = can(PERMISSIONS.PAYABLES_VIEW);
  const canViewReports = can(PERMISSIONS.REPORTS_VIEW);
  const canViewPayments = can(PERMISSIONS.PAYMENTS_VIEW);
  const canCreateSales = can(PERMISSIONS.SALES_CREATE);
  const canCreatePurchases = can(PERMISSIONS.PURCHASES_CREATE);
  const canCreateProducts = can(PERMISSIONS.PRODUCTS_EDIT);
  const canReceivePayments = can(PERMISSIONS.PAYMENTS_RECEIVE);
  const canMakePayments = can(PERMISSIONS.PAYMENTS_MAKE);
  const canViewSettings = can(PERMISSIONS.BUSINESS_VIEW);

  const loadToday = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const response = await fetchApi("/dashboard");
      setDashboardData(response);
      setRefreshedAt(new Date());
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Could not load the dashboard.");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday, refreshCount]);

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) {
      setAnalyticsError("Choose a valid date range.");
      setAnalyticsLoading(false);
      return;
    }
    let cancelled = false;
    const rangeDays = Math.floor((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1;
    const groupBy = rangeDays > 90 ? "month" : rangeDays > 31 ? "week" : "day";
    async function loadAnalytics() {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      try {
        const params = new URLSearchParams({ startDate, endDate, groupBy });
        const response = await fetchApi(`/dashboard/analytics?${params.toString()}`);
        if (!cancelled) setAnalytics(response);
      } catch (error) {
        if (!cancelled) {
          setAnalyticsError(error instanceof Error ? error.message : "Period analytics could not be loaded.");
          setAnalytics(null);
        }
      } finally {
        if (!cancelled) setAnalyticsLoading(false);
      }
    }
    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, refreshCount]);

  useEffect(() => {
    const query = globalSearch.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      const requests: Promise<SearchResult[]>[] = [];

      if (canViewSales) {
        requests.push(fetchApi(`/sales?search=${encodeURIComponent(query)}&page=1&limit=5`)
          .then((response) => unwrapItems(response).map((row) => ({
            key: `sale-${row.id}`, label: row.saleReference || "Sale", detail: row.customer?.name || "Customer",
            meta: formatCurrency(row.total), href: "/sales", kind: "Sale",
          })))
          .catch(() => []));
      }
      if (canViewPurchases) {
        requests.push(fetchApi(`/purchases?search=${encodeURIComponent(query)}&page=1&limit=5`)
          .then((response) => unwrapItems(response).map((row) => ({
            key: `purchase-${row.id}`, label: row.purchaseReference || "Purchase", detail: row.supplier?.name || "Supplier",
            meta: formatCurrency(row.landedCost), href: "/purchases", kind: "Purchase",
          })))
          .catch(() => []));
      }
      if (canViewProducts) {
        requests.push(fetchApi(`/products?search=${encodeURIComponent(query)}&page=1&limit=5`)
          .then((response) => unwrapItems(response).map((row) => ({
            key: `product-${row.id}`, label: row.name || "Product", detail: row.category || "Product",
            href: "/products", kind: "Product",
          })))
          .catch(() => []));
      }
      if (canViewCustomers) {
        requests.push(fetchApi(`/customers?search=${encodeURIComponent(query)}&page=1&limit=5`)
          .then((response) => unwrapItems(response).map((row) => ({
            key: `customer-${row.id}`, label: row.name || "Customer", detail: row.businessName || row.phone || "Customer record",
            href: `/customers/${row.id}`, kind: "Customer",
          })))
          .catch(() => []));
      }
      if (canViewSuppliers) {
        requests.push(fetchApi(`/suppliers?search=${encodeURIComponent(query)}&page=1&limit=5`)
          .then((response) => unwrapItems(response).map((row) => ({
            key: `supplier-${row.id}`, label: row.name || "Supplier", detail: row.businessName || row.phone || "Supplier record",
            href: `/suppliers/${row.id}`, kind: "Supplier",
          })))
          .catch(() => []));
      }

      const [remoteResults] = await Promise.all([Promise.all(requests)]);
      const localTransactions: SearchResult[] = (analytics?.transactions || [])
        .filter((row: Transaction) => {
          if (row.type === "SALE") return canViewSales && `${row.reference || ""} ${row.party || ""} ${transactionKind(row.type)}`.toLowerCase().includes(query.toLowerCase());
          if (row.type === "PURCHASE") return canViewPurchases && `${row.reference || ""} ${row.party || ""} ${transactionKind(row.type)}`.toLowerCase().includes(query.toLowerCase());
          if (row.type === "EXPENSE") return canViewExpenses && `${row.reference || ""} ${row.party || ""} ${transactionKind(row.type)}`.toLowerCase().includes(query.toLowerCase());
          if (row.type === "PAYMENT_IN" || row.type === "PAYMENT_OUT" || row.type === "REFUND") return canViewPayments && `${row.reference || ""} ${row.party || ""} ${transactionKind(row.type)}`.toLowerCase().includes(query.toLowerCase());
          return false;
        })
        .map((row: Transaction) => ({
          key: `transaction-${row.id}`, label: row.reference || transactionKind(row.type),
          detail: row.party || "Transaction", meta: formatCurrency(row.amount),
          href: row.href || "/reports", kind: "Transaction",
        }));
      if (!cancelled) setSearchResults([...remoteResults.flat(), ...localTransactions].slice(0, 15));
      if (!cancelled) setSearchLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [globalSearch, canViewSales, canViewPurchases, canViewProducts, canViewCustomers, canViewSuppliers, analytics]);

  const applyPreset = (nextPreset: Exclude<DatePreset, "custom">) => {
    const range = presetRange(nextPreset);
    setPreset(nextPreset);
    setRangeError("");
    setStartDate(range.start);
    setEndDate(range.end);
    setDraftStart(range.start);
    setDraftEnd(range.end);
    setTransactionPage(1);
  };

  const applyCustomRange = () => {
    if (!draftStart || !draftEnd || draftStart > draftEnd) {
      setRangeError("The start date must be on or before the end date.");
      return;
    }
    setStartDate(draftStart);
    setEndDate(draftEnd);
    setPreset("custom");
    setRangeError("");
    setTransactionPage(1);
  };

  const transactions = useMemo(() => {
    let rows: Transaction[] = Array.isArray(analytics?.transactions) ? [...analytics.transactions] : [];
    rows = rows.filter((row) => {
      if (row.type === "SALE") return canViewSales;
      if (row.type === "PURCHASE") return canViewPurchases;
      if (row.type === "EXPENSE") return canViewExpenses;
      if (row.type === "PAYMENT_IN" || row.type === "PAYMENT_OUT" || row.type === "REFUND") return canViewPayments;
      return false;
    });
    const query = transactionSearch.trim().toLowerCase();
    if (query) {
      rows = rows.filter((row) => `${row.reference || ""} ${row.party || ""} ${transactionKind(row.type)} ${row.paymentStatus || ""}`.toLowerCase().includes(query));
    }
    if (transactionFilter !== "ALL") {
      rows = rows.filter((row) => {
        if (transactionFilter === "PAYMENTS") return row.type === "PAYMENT_IN" || row.type === "PAYMENT_OUT" || row.type === "REFUND";
        return row.type === transactionFilter;
      });
    }
    rows.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "amount") comparison = (Number(a.amount) || 0) - (Number(b.amount) || 0);
      else if (sortKey === "party") comparison = (a.party || "").localeCompare(b.party || "");
      else if (sortKey === "type") comparison = transactionKind(a.type).localeCompare(transactionKind(b.type));
      else comparison = (a.date || "").localeCompare(b.date || "");
      return sortDescending ? -comparison : comparison;
    });
    return rows;
  }, [analytics, transactionSearch, transactionFilter, sortKey, sortDescending, canViewSales, canViewPurchases, canViewExpenses, canViewPayments]);

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(transactions.length / pageSize));
  const shownTransactions = transactions.slice((transactionPage - 1) * pageSize, transactionPage * pageSize);

  const salesTotal = analytics?.summary?.sales?.total;
  const grossProfit = analytics?.summary?.sales?.grossProfit;
  const purchasesTotal = analytics?.summary?.purchases?.total;
  const cashNow = dashboardData?.moneyPosition?.available?.cash;
  const bankNow = dashboardData?.moneyPosition?.available?.bank;
  const cashBank = cashNow === undefined || bankNow === undefined ? null : Number(cashNow) + Number(bankNow);
  const alerts: any[] = (dashboardData?.alerts || []).filter((alert: any) => {
    if (alert.type === "OVERDUE_RECEIVABLE") return canViewReceivables;
    if (alert.type === "OVERDUE_PAYABLE") return canViewPayables;
    if (alert.type === "LOW_STOCK" || alert.type === "STOCK_AT_RISK") return canViewInventory;
    if (alert.type === "RECONCILIATION_WARNING") return can(PERMISSIONS.RECONCILIATION_VIEW) || canViewReports;
    return can(PERMISSIONS.DASHBOARD_VIEW);
  });
  const criticalAlerts = alerts.filter((alert) => alert.severity === "HIGH").length;
  const chartHasActivity = (analytics?.trend || []).some((point: any) =>
    (canViewSales && Number(point.sales) !== 0) || (canViewPurchases && Number(point.purchases) !== 0)
  );
  const businessDateLabel = `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;

  const toggleSort = (key: "date" | "amount" | "party" | "type") => {
    setTransactionPage(1);
    if (sortKey === key) setSortDescending((current) => !current);
    else {
      setSortKey(key);
      setSortDescending(key === "date" || key === "amount");
    }
  };

  const exportTransactions = () => {
    const columns = ["Reference", "Date", "Party", "Type", "Amount (INR)", "Payment status"];
    const rows = transactions.map((row) => [
      row.reference || "",
      row.date || "",
      row.party || "",
      transactionKind(row.type),
      String(row.amount ?? ""),
      transactionStatusLabel(row),
    ]);
    const csv = [columns, ...rows].map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    ).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rfc-transactions-${startDate}-to-${endDate}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 bg-white pb-12 text-neutral-900">
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
              Business overview
            </div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-[32px]">
              Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-neutral-600">
              {business?.legalName || business?.name || "Your business"} · A live view of sales, cash, stock and what needs attention.
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              {refreshedAt ? `Updated ${new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(refreshedAt)} IST` : "Live business data"}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center xl:w-[540px] xl:justify-end">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={globalSearch}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setGlobalSearch(event.target.value);
                  setSearchOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Search products, customers, invoices…"
                aria-label="Search across RFC records"
                className="h-10 rounded-xl border-neutral-200 bg-white pl-9 pr-9 text-sm placeholder:text-neutral-400 focus-visible:border-emerald-700/50 focus-visible:ring-emerald-700/10"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSearch("");
                    setSearchResults([]);
                    setSearchOpen(false);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {searchOpen && globalSearch.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2.5">
                    <span className="text-xs font-semibold text-neutral-700">Search results</span>
                    {searchLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {searchLoading && searchResults.length === 0 ? (
                      <div className="space-y-2 p-3"><LoadingBlock className="h-10 w-full" /><LoadingBlock className="h-10 w-full" /></div>
                    ) : searchResults.length > 0 ? searchResults.map((result) => (
                      <Link
                        key={result.key}
                        href={result.href}
                        onClick={() => {
                          setSearchOpen(false);
                          setGlobalSearch("");
                        }}
                        className="flex items-center gap-3 border-b border-neutral-100 px-3 py-3 last:border-0 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600">
                          {result.kind === "Customer" || result.kind === "Supplier" ? <Users className="h-4 w-4" /> : result.kind === "Product" ? <Package className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-neutral-900">{result.label}</span>
                          <span className="block truncate text-xs text-neutral-500">{result.kind} · {result.detail}</span>
                        </span>
                        {result.meta && <span className="shrink-0 text-xs font-semibold text-neutral-700">{result.meta}</span>}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      </Link>
                    )) : (
                      <p className="p-4 text-sm text-neutral-500">No matching records were found.</p>
                    )}
                  </div>
                  <div className="border-t border-neutral-100 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
                    Searches the records your role is allowed to view.
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Notifications and alerts"
                  aria-expanded={alertsOpen}
                  onClick={() => {
                    setAlertsOpen((current) => !current);
                    setSearchOpen(false);
                  }}
                  className="relative h-10 w-10 rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                >
                  <Bell className="h-4 w-4" />
                  {criticalAlerts > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-emerald-700" />
                  )}
                </Button>
                {alertsOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(90vw,380px)] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">Needs attention</p>
                        <p className="mt-0.5 text-xs text-neutral-500">{alerts.length} current alert{alerts.length === 1 ? "" : "s"}</p>
                      </div>
                      <button type="button" aria-label="Close notifications" onClick={() => setAlertsOpen(false)} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto">
                      {dashboardLoading ? (
                        <div className="space-y-2 p-4"><LoadingBlock className="h-12 w-full" /><LoadingBlock className="h-12 w-full" /></div>
                      ) : alerts.length > 0 ? alerts.slice(0, 8).map((alert: any, index: number) => (
                        <Link key={`${alert.type}-${index}`} href={getAlertHref(alert)} onClick={() => setAlertsOpen(false)} className="flex gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 hover:bg-neutral-50">
                          {alert.severity === "HIGH" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-800" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />}
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-neutral-900">{titleCase(alert.type || "Alert")}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-neutral-600">{alert.message}</span>
                          </span>
                          <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        </Link>
                      )) : (
                        <div className="p-6 text-center">
                          <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-700" />
                          <p className="mt-2 text-sm font-medium text-neutral-900">You’re all caught up</p>
                          <p className="mt-1 text-xs text-neutral-500">No current dashboard alerts.</p>
                        </div>
                      )}
                    </div>
                    <Link href="/reports" onClick={() => setAlertsOpen(false)} className="block border-t border-neutral-100 px-4 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-neutral-50">
                      Review reports and reconciliation <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
              {canViewSettings && (
                <Link href="/settings" className="flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-700">
                    {(user?.name || "U").trim().slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-28 truncate md:block">{user?.name || "Settings"}</span>
                  <Settings2 className="h-3.5 w-3.5 text-neutral-400" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-700">Reporting period</p>
            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Dashboard date presets">
              {PERIODS.map((periodOption) => (
                <button
                  key={periodOption.value}
                  type="button"
                  aria-pressed={preset === periodOption.value}
                  onClick={() => applyPreset(periodOption.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${preset === periodOption.value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"}`}
                >
                  {periodOption.label}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={preset === "custom"}
                onClick={() => {
                  setPreset("custom");
                  setDraftStart(startDate);
                  setDraftEnd(endDate);
                }}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${preset === "custom" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"}`}
              >
                Custom dates
              </button>
            </div>
          </div>
          {preset === "custom" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block text-xs font-medium text-neutral-600">
                From
                <Input type="date" value={draftStart} max={draftEnd || undefined} onChange={(event) => setDraftStart(event.target.value)} className="mt-1 h-9 w-full rounded-lg border-neutral-200 bg-white text-xs sm:w-36" />
              </label>
              <label className="block text-xs font-medium text-neutral-600">
                To
                <Input type="date" value={draftEnd} min={draftStart || undefined} onChange={(event) => setDraftEnd(event.target.value)} className="mt-1 h-9 w-full rounded-lg border-neutral-200 bg-white text-xs sm:w-36" />
              </label>
              <Button type="button" onClick={applyCustomRange} className="h-9 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-800">
                Apply dates
              </Button>
            </div>
          )}
        </div>
        {rangeError && <p role="alert" className="mt-2 text-xs font-medium text-neutral-800">{rangeError}</p>}
      </section>

      <section aria-label="Dashboard actions" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-950">Quick actions</h2>
          <p className="mt-1 text-xs text-neutral-500">Common tasks, one click away.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreateSales && (
            <Link href="/sales/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
              <ShoppingCart className="h-4 w-4" /> New sale
            </Link>
          )}
          {canCreatePurchases && (
            <Link href="/purchases/new" className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
              <PackagePlus className="h-4 w-4" /> New purchase
            </Link>
          )}
          {canCreateProducts && (
            <Link href="/products" className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
              <Package className="h-4 w-4" /> Add product
            </Link>
          )}
          {canReceivePayments && (
            <Link href="/receivables/receive-payment" className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
              <Wallet className="h-4 w-4" /> Record payment
            </Link>
          )}
          <Link href="/day-close" className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
            <CalendarDays className="h-4 w-4" /> Day close
          </Link>
        </div>
      </section>

      {dashboardError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-neutral-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700" />
            <div>
              <p className="text-sm font-semibold text-neutral-900">Current position could not be loaded</p>
              <p className="mt-1 text-xs text-neutral-600">{dashboardError}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setRefreshCount((value) => value + 1)} className="h-9 rounded-lg border-neutral-200 bg-white text-neutral-800">
            Try again
          </Button>
        </div>
      )}

      <section>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-neutral-950">Financial overview</h2>
            <p className="mt-1 text-xs text-neutral-500">Activity for {businessDateLabel}. Cash, receivables, payables and inventory are current positions.</p>
          </div>
          <span className="text-xs text-neutral-500">Amounts in INR</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {canViewSales && <KpiCard label="Total sales" value={formatCurrency(salesTotal)} subtext={analytics?.summary?.sales?.count !== undefined ? `${analytics.summary.sales.count} sales · ${businessDateLabel}` : analyticsError ? "Period data unavailable" : "Selected period"} change={analytics?.changes?.salesPct} icon={ShoppingCart} href="/sales" loading={analyticsLoading} />}
          {canViewSales && canViewReports && <KpiCard label="Gross profit" value={formatCurrency(grossProfit)} subtext={analytics?.summary?.sales?.grossMarginPct !== null && analytics?.summary?.sales?.grossMarginPct !== undefined ? `${analytics.summary.sales.grossMarginPct}% gross margin` : "Margin unavailable for this period"} change={analytics?.changes?.grossProfitPct} icon={TrendingUp} href="/reports" loading={analyticsLoading} />}
          {canViewPurchases && <KpiCard label="Total purchases" value={formatCurrency(purchasesTotal)} subtext={analytics?.summary?.purchases?.count !== undefined ? `${analytics.summary.purchases.count} purchases · ${businessDateLabel}` : analyticsError ? "Period data unavailable" : "Selected period"} change={analytics?.changes?.purchasesPct} icon={Package} href="/purchases" loading={analyticsLoading} />}
          {canViewAccounts && <KpiCard label="Cash & bank balance" value={formatCurrency(cashBank)} subtext={cashNow !== undefined && bankNow !== undefined ? `Cash ${formatCompactCurrency(cashNow)} · Bank ${formatCompactCurrency(bankNow)} · Digital ${formatCompactCurrency(dashboardData?.moneyPosition?.available?.digital)}` : "Current balances unavailable"} icon={Landmark} href="/cash" loading={dashboardLoading} />}
          {canViewReceivables && <KpiCard label="Accounts receivable" value={formatCurrency(dashboardData?.receivables?.total)} subtext={dashboardData?.receivables?.overdue !== undefined ? `${formatCompactCurrency(dashboardData.receivables.overdue)} overdue · current balance` : "Current outstanding"} icon={ArrowDownRight} href="/receivables" loading={dashboardLoading} />}
          {canViewPayables && <KpiCard label="Accounts payable" value={formatCurrency(dashboardData?.payables?.total)} subtext={dashboardData?.payables?.overdue !== undefined ? `${formatCompactCurrency(dashboardData.payables.overdue)} overdue · current balance` : "Current outstanding"} icon={ArrowUpRight} href="/payables" loading={dashboardLoading} />}
          {canViewInventory && <KpiCard label="Inventory valuation" value={formatCurrency(dashboardData?.inventory?.totalValue)} subtext={dashboardData?.inventory?.totalBoxes !== undefined ? `${Number(dashboardData.inventory.totalBoxes).toLocaleString("en-IN")} boxes · ${dashboardData.inventory.lotCount || 0} active lots` : "Current stock value"} icon={Boxes} href="/inventory" loading={dashboardLoading} />}
        </div>
        {!analyticsLoading && analytics && !analytics.comparisonAvailable && (
          <p className="mt-2 text-[11px] text-neutral-500">No prior-period activity is recorded for a reliable percentage comparison yet; changes are omitted rather than estimated.</p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-neutral-950">Sales & purchase trend</h2>
              <p className="mt-1 text-xs text-neutral-500">{businessDateLabel} · {analytics?.range?.groupBy === "month" ? "Monthly" : analytics?.range?.groupBy === "week" ? "Weekly" : "Daily"} totals from recorded transactions</p>
            </div>
            <Link href="/reports" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950">
              Open reports <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {analyticsLoading ? (
            <div className="mt-5 space-y-3"><LoadingBlock className="h-56 w-full" /></div>
          ) : analyticsError ? (
            <div className="mt-5 flex min-h-[250px] flex-col items-center justify-center text-center">
              <AlertCircle className="h-6 w-6 text-neutral-400" />
              <p className="mt-3 text-sm font-semibold text-neutral-800">Trend data unavailable</p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">{analyticsError}</p>
              <Button variant="outline" onClick={() => setRefreshCount((value) => value + 1)} className="mt-3 h-8 rounded-lg border-neutral-200 text-xs">Retry</Button>
            </div>
          ) : chartHasActivity ? (
            <div className="mt-4 h-[280px] w-full" aria-label="Sales and purchase trend chart" role="img">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.trend || []} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#737373", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#D4D4D4" }} minTickGap={16} />
                  <YAxis tickFormatter={(value) => formatCompactTick(Number(value))} tick={{ fill: "#737373", fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip
                    contentStyle={{ border: "1px solid #E5E5E5", borderRadius: 10, boxShadow: "none", fontSize: 12 }}
                    labelStyle={{ color: "#404040", fontWeight: 600, marginBottom: 4 }}
                    formatter={(value) => [formatCurrency(value, 2), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#525252", paddingTop: 8 }} />
                  {canViewSales && <Line type="monotone" dataKey="sales" name="Sales" stroke="#166534" strokeWidth={2.2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />}
                  {canViewPurchases && <Line type="monotone" dataKey="purchases" name="Purchases" stroke="#737373" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-5 flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 px-4 text-center">
              <Activity className="h-6 w-6 text-neutral-400" />
              <p className="mt-3 text-sm font-semibold text-neutral-800">No sales or purchases in this period</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">Recorded activity will appear here. The chart does not use demo or estimated values.</p>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <SectionHeading title="Operational intelligence" description="Live alerts and items that may need action." href="/reports" hrefLabel="Review reports" />
          {dashboardLoading ? (
            <div className="mt-4 space-y-2"><LoadingBlock className="h-16 w-full" /><LoadingBlock className="h-16 w-full" /><LoadingBlock className="h-16 w-full" /></div>
          ) : alerts.length > 0 ? (
            <div className="mt-3 divide-y divide-neutral-100">
              {alerts.slice(0, 6).map((alert: any, index: number) => (
                <Link key={`${alert.type}-${index}`} href={getAlertHref(alert)} className="group flex items-start gap-3 py-3 first:pt-1 last:pb-1">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700">
                    {alert.severity === "HIGH" ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-neutral-900 group-hover:text-emerald-800">{titleCase(alert.type || "Alert")}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-neutral-600">{alert.message}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">{alert.action || "Review"} <ArrowRight className="h-3 w-3" /></span>
                  </span>
                </Link>
              ))}
              {alerts.length > 6 && <p className="pt-3 text-xs text-neutral-500">Showing 6 of {alerts.length} alerts.</p>}
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-800" />
              <p className="mt-3 text-sm font-semibold text-neutral-900">No current alerts</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">Reorder, freshness, overdue balance and reconciliation alerts appear here when the live data identifies them.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <SectionHeading title="Customer collections" description="Outstanding customer balances and ageing." href="/receivables" hrefLabel="Receivables" />
          {dashboardLoading ? (
            <div className="mt-4 space-y-2"><LoadingBlock className="h-12 w-full" /><LoadingBlock className="h-12 w-full" /></div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3 border-b border-neutral-100 pb-4">
                <div><p className="text-xs text-neutral-500">Outstanding</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCompactCurrency(dashboardData?.receivables?.total)}</p></div>
                <div><p className="text-xs text-neutral-500">Overdue</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCompactCurrency(dashboardData?.receivables?.overdue)}</p></div>
                <div><p className="text-xs text-neutral-500">Due soon</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCompactCurrency(dashboardData?.receivables?.dueSoon)}</p></div>
              </div>
              {(dashboardData?.receivables?.topOutstanding || []).slice(0, 3).length > 0 ? (
                <div className="mt-1 divide-y divide-neutral-100">
                  {(dashboardData?.receivables?.topOutstanding || []).slice(0, 3).map((item: any, index: number) => (
                    <div key={item.customerId || item.id || index} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0"><p className="truncate text-sm font-medium text-neutral-900">{item.name || "Customer"}</p><p className="mt-0.5 text-xs text-neutral-500">{item.overdue && Number(item.overdue) > 0 ? `${formatCompactCurrency(item.overdue)} overdue` : "Open balance"}</p></div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">{formatCompactCurrency(item.total || item.outstanding || item.balance || item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-neutral-500">No customer balance details returned for the current position.</p>
              )}
            </>
          )}
        </div>

        <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <SectionHeading title="Supplier payments" description="Outstanding supplier balances and ageing." href="/payables" hrefLabel="Payables" />
          {dashboardLoading ? (
            <div className="mt-4 space-y-2"><LoadingBlock className="h-12 w-full" /><LoadingBlock className="h-12 w-full" /></div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3 border-b border-neutral-100 pb-4">
                <div><p className="text-xs text-neutral-500">Outstanding</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCompactCurrency(dashboardData?.payables?.total)}</p></div>
                <div><p className="text-xs text-neutral-500">Overdue</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCompactCurrency(dashboardData?.payables?.overdue)}</p></div>
                <div><p className="text-xs text-neutral-500">Due this week</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCompactCurrency(dashboardData?.payables?.dueThisWeek)}</p></div>
              </div>
              {(dashboardData?.payables?.topOutstanding || []).slice(0, 3).length > 0 ? (
                <div className="mt-1 divide-y divide-neutral-100">
                  {(dashboardData?.payables?.topOutstanding || []).slice(0, 3).map((item: any, index: number) => (
                    <div key={item.supplierId || item.id || index} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0"><p className="truncate text-sm font-medium text-neutral-900">{item.name || "Supplier"}</p><p className="mt-0.5 text-xs text-neutral-500">{item.overdue && Number(item.overdue) > 0 ? `${formatCompactCurrency(item.overdue)} overdue` : "Open balance"}</p></div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">{formatCompactCurrency(item.total || item.outstanding || item.balance || item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-neutral-500">No supplier balance details returned for the current position.</p>
              )}
            </>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-neutral-950">Recent transactions</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Latest {analytics?.recentLimit || 25} records in {businessDateLabel}. Search, filter, sort, or export this loaded set.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input value={transactionSearch} onChange={(event) => { setTransactionSearch(event.target.value); setTransactionPage(1); }} placeholder="Filter transactions" aria-label="Filter loaded transactions" className="h-9 w-full rounded-lg border-neutral-200 bg-white pl-8 text-xs sm:w-48" />
            </div>
            <Button type="button" variant="outline" onClick={exportTransactions} disabled={transactions.length === 0} className="h-9 rounded-lg border-neutral-200 bg-white text-xs font-semibold text-neutral-700">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto border-b border-neutral-100 px-4 py-3 sm:px-5">
          {[
            { value: "ALL", label: "All" },
            { value: "SALE", label: "Sales" },
            { value: "PURCHASE", label: "Purchases" },
            { value: "PAYMENTS", label: "Payments" },
            { value: "EXPENSE", label: "Expenses" },
          ].map((option) => (
            <button key={option.value} type="button" aria-pressed={transactionFilter === option.value} onClick={() => { setTransactionFilter(option.value); setTransactionPage(1); }} className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${transactionFilter === option.value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"}`}>
              {option.label}
            </button>
          ))}
          <span className="ml-auto shrink-0 self-center text-xs text-neutral-500">{transactions.length} record{transactions.length === 1 ? "" : "s"}</span>
        </div>

        {analyticsLoading ? (
          <div className="space-y-2 p-4 sm:p-5"><LoadingBlock className="h-10 w-full" /><LoadingBlock className="h-10 w-full" /><LoadingBlock className="h-10 w-full" /><LoadingBlock className="h-10 w-full" /></div>
        ) : analyticsError ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-neutral-400" />
            <p className="mt-3 text-sm font-semibold text-neutral-900">Transactions could not be loaded</p>
            <p className="mt-1 text-xs text-neutral-500">{analyticsError}</p>
          </div>
        ) : shownTransactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600">
                  <tr>
                    <th className="px-4 py-3 sm:px-5"><button onClick={() => toggleSort("date")} className="inline-flex items-center gap-1 hover:text-neutral-950">Date <ChevronDown className="h-3 w-3" /></button></th>
                    <th className="px-4 py-3 sm:px-5"><button onClick={() => toggleSort("type")} className="inline-flex items-center gap-1 hover:text-neutral-950">Type <ChevronDown className="h-3 w-3" /></button></th>
                    <th className="px-4 py-3 sm:px-5">Reference</th>
                    <th className="px-4 py-3 sm:px-5"><button onClick={() => toggleSort("party")} className="inline-flex items-center gap-1 hover:text-neutral-950">Party <ChevronDown className="h-3 w-3" /></button></th>
                    <th className="px-4 py-3 text-right sm:px-5"><button onClick={() => toggleSort("amount")} className="inline-flex items-center gap-1 hover:text-neutral-950">Amount <ChevronDown className="h-3 w-3" /></button></th>
                    <th className="px-4 py-3 sm:px-5">Payment status</th>
                    <th className="px-4 py-3 text-right sm:px-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {shownTransactions.map((row) => (
                    <tr key={`${row.type}-${row.id}`} className="group transition-colors hover:bg-neutral-50">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500 sm:px-5">{formatDisplayDate(row.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold ${getTransactionTone(row)}`}>{transactionKind(row.type)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-900">{row.reference || "—"}</span>
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-neutral-700 sm:px-5">{row.party || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-neutral-900 sm:px-5">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border border-neutral-200 px-2 py-1 text-[11px] font-medium text-neutral-700">{transactionStatusLabel(row)}</span>
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <Link href={row.href || "/reports"} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950">
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-neutral-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="text-xs text-neutral-500">Showing {(transactionPage - 1) * pageSize + 1}–{Math.min(transactionPage * pageSize, transactions.length)} of {transactions.length} loaded transactions</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={transactionPage <= 1} onClick={() => setTransactionPage((page) => Math.max(1, page - 1))} className="h-8 rounded-lg border-neutral-200 bg-white px-3 text-xs">Previous</Button>
                <span className="text-xs text-neutral-600">Page {transactionPage} of {pageCount}</span>
                <Button variant="outline" disabled={transactionPage >= pageCount} onClick={() => setTransactionPage((page) => Math.min(pageCount, page + 1))} className="h-8 rounded-lg border-neutral-200 bg-white px-3 text-xs">Next</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
            <FileText className="h-7 w-7 text-neutral-400" />
            <p className="mt-3 text-sm font-semibold text-neutral-900">No transactions match this view</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">Try another filter or date range. The dashboard does not show fabricated rows.</p>
            {(transactionSearch || transactionFilter !== "ALL") && (
              <Button variant="outline" onClick={() => { setTransactionSearch(""); setTransactionFilter("ALL"); setTransactionPage(1); }} className="mt-3 h-8 rounded-lg border-neutral-200 bg-white text-xs">Clear filters</Button>
            )}
          </div>
        )}
      </section>

      <footer className="flex flex-col gap-2 border-t border-neutral-200 pt-4 text-[11px] leading-5 text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Financial totals use server-side aggregates. Cash, receivables, payables and stock valuation reflect the current position.</span>
        <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Business dates use Asia/Kolkata.</span>
      </footer>
    </div>
  );
}
