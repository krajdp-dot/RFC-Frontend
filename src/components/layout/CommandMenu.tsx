"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight, BarChart3, Boxes, CalendarCheck,
  FileText, LayoutDashboard, Package, PackagePlus, Receipt, Search,
  Settings, ShoppingCart, Tag, Thermometer, Truck, Users, Wallet, Radar, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type CommandItem = {
  label: string;
  description: string;
  href: string;
  group: string;
  icon: LucideIcon;
  permission: Permission;
  keywords?: string;
  accent?: boolean;
};

const ITEMS: CommandItem[] = [
  { label: "Dashboard", description: "Business overview and today’s priorities", href: "/", group: "Navigate", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW, keywords: "home overview" },
  { label: "Sales", description: "Sales records, invoices and returns", href: "/sales", group: "Navigate", icon: ShoppingCart, permission: PERMISSIONS.SALES_VIEW, keywords: "invoice bill pekar retailer" },
  { label: "Purchases", description: "Supplier purchases and landed cost", href: "/purchases", group: "Navigate", icon: PackagePlus, permission: PERMISSIONS.PURCHASES_VIEW, keywords: "buy stock supplier" },
  { label: "Inventory", description: "Live stock, lots and stock movements", href: "/inventory", group: "Navigate", icon: Boxes, permission: PERMISSIONS.INVENTORY_VIEW, keywords: "boxes lots quantity" },
  { label: "Products", description: "Fruit varieties, grades and pricing", href: "/products", group: "Navigate", icon: Package, permission: PERMISSIONS.PRODUCTS_VIEW, keywords: "apple royal red gold" },
  { label: "Expenses", description: "Business expenses and categories", href: "/expenses", group: "Navigate", icon: Receipt, permission: PERMISSIONS.EXPENSES_VIEW, keywords: "cost spending" },
  { label: "Customers", description: "Retailers, pekars and customer ledger", href: "/customers", group: "Navigate", icon: Users, permission: PERMISSIONS.CUSTOMERS_VIEW, keywords: "buyers parties" },
  { label: "Suppliers", description: "Merchants, suppliers and balances", href: "/suppliers", group: "Navigate", icon: Truck, permission: PERMISSIONS.SUPPLIERS_VIEW, keywords: "merchant vendor" },
  { label: "Cash & Banks", description: "Cash, bank and digital accounts", href: "/cash", group: "Money", icon: Wallet, permission: PERMISSIONS.ACCOUNTS_VIEW, keywords: "balance upi phonepe sbi" },
  { label: "Receivables", description: "Customer dues and collections", href: "/receivables", group: "Money", icon: ArrowDownLeft, permission: PERMISSIONS.RECEIVABLES_VIEW, keywords: "collect outstanding overdue" },
  { label: "Payables", description: "Supplier dues and payments", href: "/payables", group: "Money", icon: ArrowUpRight, permission: PERMISSIONS.PAYABLES_VIEW, keywords: "pay merchant outstanding" },
  { label: "Money Flow", description: "Trace money between accounts and transactions", href: "/money-flow", group: "Money", icon: ArrowLeftRight, permission: PERMISSIONS.REPORTS_VIEW, keywords: "cash flow transfer" },
  { label: "Day Close", description: "Reconcile and commit today’s close", href: "/day-close", group: "Money", icon: CalendarCheck, permission: PERMISSIONS.DAY_CLOSE_PREVIEW, keywords: "reconcile close day" },
  { label: "Freshness", description: "Monitor fruit freshness and stock risk", href: "/freshness", group: "Market", icon: Thermometer, permission: PERMISSIONS.INVENTORY_VIEW, keywords: "quality spoiled age" },
  { label: "Price Board", description: "Quick market prices by product", href: "/price-board", group: "Market", icon: Tag, permission: PERMISSIONS.PRICING_VIEW, keywords: "rate market" },
  { label: "Intelligence", description: "Operational alerts and insights", href: "/intelligence", group: "Insights", icon: Radar, permission: PERMISSIONS.INTELLIGENCE_VIEW, keywords: "alerts risk forecast" },
  { label: "Reports", description: "Business reports and exports", href: "/reports", group: "Insights", icon: FileText, permission: PERMISSIONS.REPORTS_VIEW, keywords: "print export" },
  { label: "Analytics", description: "Trends, totals and comparisons", href: "/analytics", group: "Insights", icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW, keywords: "chart trend" },
  { label: "Settings", description: "Business, accounts and workspace settings", href: "/settings", group: "System", icon: Settings, permission: PERMISSIONS.BUSINESS_VIEW, keywords: "configuration" },
  { label: "New sale", description: "Record a sale with a quick box basket", href: "/sales/new", group: "Quick actions", icon: ShoppingCart, permission: PERMISSIONS.SALES_CREATE, keywords: "create sell invoice", accent: true },
  { label: "Add stock", description: "Record a purchase and bring stock in", href: "/purchases/new", group: "Quick actions", icon: PackagePlus, permission: PERMISSIONS.PURCHASES_CREATE, keywords: "receive inventory buy", accent: true },
  { label: "Record expense", description: "Add a business expense", href: "/expenses", group: "Quick actions", icon: Receipt, permission: PERMISSIONS.EXPENSES_CREATE, keywords: "new cost", accent: true },
  { label: "Receive money", description: "Record a customer collection", href: "/receivables/receive-payment", group: "Quick actions", icon: ArrowDownLeft, permission: PERMISSIONS.PAYMENTS_RECEIVE, keywords: "payment in collect", accent: true },
  { label: "Pay supplier", description: "Record a supplier payment", href: "/payables/make-payment", group: "Quick actions", icon: ArrowUpRight, permission: PERMISSIONS.PAYMENTS_MAKE, keywords: "payment out pay", accent: true },
];

export function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { can } = useAuth();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter((item) => can(item.permission)).filter((item) => {
      if (!q) return true;
      return [item.label, item.description, item.group, item.keywords || ""].some((part) => part.toLowerCase().includes(q));
    });
  }, [query, can]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) onClose();
        else window.dispatchEvent(new CustomEvent("rfc:open-command-menu"));
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, visibleItems.length - 1)));
  }, [visibleItems.length]);

  const choose = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!open) return null;

  let lastGroup = "";
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-neutral-950/35 px-3 pt-[12vh] backdrop-blur-[2px] sm:px-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Jump to a page or action"
        className="flex max-h-[76vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
      >
        <div className="flex items-center gap-3 border-b border-neutral-100 px-4">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
            onKeyDown={(event) => {
              if (event.key === "Escape") { event.preventDefault(); onClose(); }
              else if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, visibleItems.length - 1)); }
              else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(0, index - 1)); }
              else if (event.key === "Enter" && visibleItems[activeIndex]) { event.preventDefault(); choose(visibleItems[activeIndex].href); }
            }}
            placeholder="Jump to a page or action…"
            aria-label="Search pages and actions"
            className="h-[58px] min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none placeholder:text-neutral-400 focus-visible:ring-0"
          />
          <kbd className="hidden rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-1 text-[10px] font-medium text-neutral-500 sm:inline-flex">ESC</kbd>
          <button type="button" onClick={onClose} aria-label="Close command menu" className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-2">
          {visibleItems.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Search className="mx-auto h-5 w-5 text-neutral-300" />
              <p className="mt-3 text-sm font-medium text-neutral-800">Nothing found</p>
              <p className="mt-1 text-xs text-neutral-500">Try a page name, fruit, customer or action.</p>
            </div>
          ) : (
            visibleItems.map((item, index) => {
              const firstInGroup = item.group !== lastGroup;
              lastGroup = item.group;
              const Icon = item.icon;
              return (
                <div key={item.href + item.label}>
                  {firstInGroup && <p className={cn("px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400", index === 0 && "pt-1")}>{item.group}</p>}
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      activeIndex === index ? "bg-emerald-50 text-emerald-950" : "text-neutral-800 hover:bg-neutral-50",
                    )}
                  >
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", item.accent ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-neutral-100 bg-white text-neutral-500")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[13px] font-semibold leading-5">{item.label}</span>
                      <span className="truncate text-xs text-neutral-500">{item.description}</span>
                    </span>
                    {activeIndex === index && <span className="shrink-0 text-[10px] font-medium text-emerald-800">Enter ↵</span>}
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/70 px-4 py-2.5 text-[10px] text-neutral-500">
          <span>Search shortcuts and pages</span>
          <span className="flex items-center gap-2"><kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5">↑</kbd><kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5">↓</kbd><span>to navigate</span><kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5">↵</kbd><span>to open</span></span>
        </div>
      </section>
    </div>
  );
}
