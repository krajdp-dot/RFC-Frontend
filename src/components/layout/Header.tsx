"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, ChevronRight, Plus, ShoppingCart, Package, Receipt, Trash2, Menu, X, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { ConnectivityBadge } from "@/components/offline/ConnectivityBadge";
import { cn } from "@/lib/utils";

const routeNames: Record<string, string> = {
  dashboard: "Home",
  sales: "Sales",
  new: "New entry",
  purchases: "Purchases",
  inventory: "Stock",
  customers: "Customers",
  suppliers: "Suppliers",
  receivables: "Money to collect",
  payables: "Supplier payments",
  expenses: "Expenses",
  cash: "Cash",
  "day-close": "Day close",
  reports: "Reports",
  analytics: "Analytics",
  intelligence: "Insights",
  products: "Fruit & products",
  "price-board": "Price board",
  "money-flow": "Money movement",
  settings: "Settings",
  freshness: "Freshness",
  sync: "Sync status",
  returns: "Sales returns",
  wastage: "Wastage",
  "receive-payment": "Receive money",
  "make-payment": "Make payment",
  "bulk-lot": "Bulk lot sale",
};

function readableSegment(segment: string) {
  return routeNames[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Header({ mobileMenuOpen = false, onMobileMenuToggle, onCommandMenuOpen }: { mobileMenuOpen?: boolean; onMobileMenuToggle?: () => void; onCommandMenuOpen?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
  }, []);

  const segments = (pathname || "/").split("/").filter(Boolean);
  const crumbs = segments.length ? segments : ["dashboard"];

  return (
    <header className={cn("sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8", pathname === "/" ? "bg-white" : "bg-background/90")}>
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen} onClick={onMobileMenuToggle} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 md:hidden">
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[13px] sm:text-sm">
        {crumbs.map((segment, index) => (
          <span key={`${segment}-${index}`} className="flex min-w-0 items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
            <span className={index === crumbs.length - 1 ? "truncate font-semibold text-foreground" : "truncate text-muted-foreground"}>
              {readableSegment(segment)}
            </span>
          </span>
        ))}
      </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button type="button" onClick={onCommandMenuOpen} aria-label="Jump to a page or action (Command or Control K)" className="hidden h-9 w-[182px] items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-left text-xs text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 sm:flex lg:w-[210px]">
          <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <span className="flex-1 truncate">Jump to a page…</span>
          <kbd className="shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] text-neutral-500">⌘ / Ctrl K</kbd>
        </button>
        <ConnectivityBadge />
        {today && (
          <div className="hidden h-8 items-center gap-2 rounded-lg border border-border px-2.5 text-xs text-muted-foreground md:flex">
            <Calendar className="h-3.5 w-3.5" />
            <span>{today}</span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-px hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Plus className="h-4 w-4" />
            <span>New</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Can permission={PERMISSIONS.SALES_CREATE}>
              <DropdownMenuItem onClick={() => router.push("/sales/new")}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Record sale
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.PURCHASES_CREATE}>
              <DropdownMenuItem onClick={() => router.push("/purchases/new")}>
                <Package className="mr-2 h-4 w-4" /> Add purchase
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.EXPENSES_CREATE}>
              <DropdownMenuItem onClick={() => router.push("/expenses")}>
                <Receipt className="mr-2 h-4 w-4" /> Record expense
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.INVENTORY_WASTAGE}>
              <DropdownMenuItem onClick={() => router.push("/inventory/wastage")}>
                <Trash2 className="mr-2 h-4 w-4" /> Record wastage
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
