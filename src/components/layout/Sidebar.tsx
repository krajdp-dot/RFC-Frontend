"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS, ROLE_LABELS, type Permission } from "@/lib/permissions";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  PackageSearch, 
  Boxes, 
  Users, 
  Truck, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Diamond,
  Receipt,
  ArrowLeftRight,
  Thermometer,
  Tag,
  TrendingUp,
  Trash2,
  CalendarCheck,
  Package,
  LogOut,
  Radar
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Phase 10: every destination declares what it needs, and a group whose
 * items are all out of reach disappears with its heading — a STAFF login
 * shouldn't see a "Money" section with nothing under it.
 */
type NavItem = { name: string; href: string; icon: typeof LayoutDashboard; permission: Permission };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    ]
  },
  {
    label: "Business",
    items: [
      { name: "Sales", href: "/sales", icon: ShoppingCart, permission: PERMISSIONS.SALES_VIEW },
      { name: "Purchases", href: "/purchases", icon: PackageSearch, permission: PERMISSIONS.PURCHASES_VIEW },
      { name: "Inventory", href: "/inventory", icon: Boxes, permission: PERMISSIONS.INVENTORY_VIEW },
      { name: "Products", href: "/products", icon: Package, permission: PERMISSIONS.PRODUCTS_VIEW },
      { name: "Expenses", href: "/expenses", icon: Receipt, permission: PERMISSIONS.EXPENSES_VIEW },
    ]
  },
  {
    label: "Relationships",
    items: [
      { name: "Customers", href: "/customers", icon: Users, permission: PERMISSIONS.CUSTOMERS_VIEW },
      { name: "Suppliers", href: "/suppliers", icon: Truck, permission: PERMISSIONS.SUPPLIERS_VIEW },
    ]
  },
  {
    label: "Money",
    items: [
      { name: "Cash & Banks", href: "/cash", icon: Wallet, permission: PERMISSIONS.ACCOUNTS_VIEW },
      { name: "Receivables", href: "/receivables", icon: ArrowDownLeft, permission: PERMISSIONS.RECEIVABLES_VIEW },
      { name: "Payables", href: "/payables", icon: ArrowUpRight, permission: PERMISSIONS.PAYABLES_VIEW },
      { name: "Money Flow", href: "/money-flow", icon: ArrowLeftRight, permission: PERMISSIONS.REPORTS_VIEW },
      { name: "Day Close", href: "/day-close", icon: CalendarCheck, permission: PERMISSIONS.DAY_CLOSE_PREVIEW },
    ]
  },
  {
    label: "Freshness & Market",
    items: [
      { name: "Freshness", href: "/freshness", icon: Thermometer, permission: PERMISSIONS.INVENTORY_VIEW },
      { name: "Price Board", href: "/price-board", icon: Tag, permission: PERMISSIONS.PRICING_VIEW },
    ]
  },
  {
    label: "Insights",
    items: [
      { name: "Intelligence", href: "/intelligence", icon: Radar, permission: PERMISSIONS.INTELLIGENCE_VIEW },
      { name: "Reports", href: "/reports", icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW },
      { name: "Analytics", href: "/analytics", icon: TrendingUp, permission: PERMISSIONS.REPORTS_VIEW },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings, permission: PERMISSIONS.BUSINESS_VIEW },
    ]
  }
];

function initialsFor(name?: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { can, user, role, logout } = useAuth();

  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[8px_0_32px_rgba(12,28,18,0.04)] transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[256px]"
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center justify-center shrink-0 px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center w-full", collapsed ? "justify-center" : "justify-start gap-3")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shrink-0">
            <Diamond className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold leading-tight tracking-tight">RAJDEEP <span className="font-medium">FRUITS</span></span>
              <span className="text-[10px] font-medium leading-tight text-muted-foreground">OS</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 flex flex-col gap-5 custom-scrollbar">
        {visibleGroups.map((group, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {!collapsed && (
              <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
                {group.label}
              </div>
            )}
            {group.items.map((item, j) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={j}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-primary shadow-sm" 
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                    collapsed && "mx-auto h-10 w-10 justify-center px-0"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sidebar-primary" />
                  )}
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Toggle & Profile */}
      <div className="mt-auto border-t border-sidebar-border shrink-0">
        <Button
          variant="ghost"
          onClick={onToggle}
          className="w-full rounded-none h-10 hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground border-b border-sidebar-border"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <div className="p-3">
          <div className={cn(
            "flex items-center gap-3 rounded-md",
            collapsed ? "justify-center" : "px-2 py-1.5 hover:bg-sidebar-accent transition-colors cursor-pointer"
          )}>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 border border-primary/20">
              {initialsFor(user?.name)}
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden flex-1">
                {/* Was hardcoded to "Rajdeep Thakur / Owner" for every session. */}
                <span className="text-[13px] font-medium leading-tight truncate">{user?.name || "Signed in"}</span>
                <span className="text-[11px] text-muted-foreground leading-tight truncate">
                  {role ? ROLE_LABELS[role] ?? role : ""}
                </span>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                title="Sign out"
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
