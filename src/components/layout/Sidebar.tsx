"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  Trash2
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    label: "Business",
    items: [
      { name: "Sales", href: "/sales", icon: ShoppingCart },
      { name: "Purchases", href: "/purchases", icon: PackageSearch },
      { name: "Inventory", href: "/inventory", icon: Boxes },
      { name: "Expenses", href: "/expenses", icon: Receipt },
    ]
  },
  {
    label: "Relationships",
    items: [
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Suppliers", href: "/suppliers", icon: Truck },
    ]
  },
  {
    label: "Money",
    items: [
      { name: "Cash & Banks", href: "/cash", icon: Wallet },
      { name: "Receivables", href: "/receivables", icon: ArrowDownLeft },
      { name: "Payables", href: "/payables", icon: ArrowUpRight },
      { name: "Money Flow", href: "/money-flow", icon: ArrowLeftRight },
    ]
  },
  {
    label: "Freshness & Market",
    items: [
      { name: "Freshness", href: "/freshness", icon: Thermometer },
      { name: "Price Board", href: "/price-board", icon: Tag },
    ]
  },
  {
    label: "Insights",
    items: [
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[256px]"
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center justify-center shrink-0 px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center w-full", collapsed ? "justify-center" : "justify-start gap-3")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 flex flex-col gap-6 custom-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {!collapsed && (
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 px-2 font-semibold mb-1">
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
                    "relative flex items-center gap-2.5 rounded-md py-1.5 px-2.5 text-[13px] font-medium transition-colors group",
                    isActive 
                      ? "bg-primary/8 text-primary" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0 h-9 w-9 mx-auto"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-r-full" />
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
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center h-10 hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors border-b border-sidebar-border"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <div className="p-3">
          <div className={cn(
            "flex items-center gap-3 rounded-md",
            collapsed ? "justify-center" : "px-2 py-1.5 hover:bg-sidebar-accent transition-colors cursor-pointer"
          )}>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 border border-primary/20">
              RJ
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-medium leading-tight truncate">Rajdeep Thakur</span>
                <span className="text-[11px] text-muted-foreground leading-tight truncate">Owner</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
