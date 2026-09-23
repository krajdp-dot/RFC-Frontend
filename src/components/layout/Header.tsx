"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Bell, Search, Plus, ShoppingCart, Package, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { ConnectivityBadge } from "@/components/offline/ConnectivityBadge";

export function Header() {
  const router = useRouter();
  // Was a hardcoded "Today, 13 Aug 2026" regardless of the actual date.
  // Rendered client-side (not on the server) to avoid a hydration mismatch
  // between server render time and the visitor's own clock.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    );
  }, []);

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-muted-foreground">Overview</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <ConnectivityBadge />

        {/* Command Search */}
        <Button variant="outline" className="flex justify-between w-[260px] h-8 px-3 bg-muted/30 hover:bg-muted/50 text-muted-foreground text-[13px] font-normal border-dashed">
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search or jump to...</span>
          </div>
          <kbd className="inline-flex items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <div className="h-4 w-px bg-border" />

        {/* Date Display */}
        <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-input text-[13px] font-medium text-muted-foreground bg-background">
          <Calendar className="h-3.5 w-3.5" />
          <span>{today ? `Today, ${today}` : "\u00A0"}</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        {/* New Transaction \u2014 was a button with no menu behind it */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Phase 10: the quick-create menu offers only what this role
                can actually complete. */}
            <Can permission={PERMISSIONS.SALES_CREATE}>
              <DropdownMenuItem onClick={() => router.push("/sales/new")}>
                <ShoppingCart className="h-3.5 w-3.5 mr-2" /> New Sale
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.PURCHASES_CREATE}>
              <DropdownMenuItem onClick={() => router.push("/purchases/new")}>
                <Package className="h-3.5 w-3.5 mr-2" /> New Purchase
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.EXPENSES_CREATE}>
              <DropdownMenuItem onClick={() => router.push("/expenses")}>
                <Receipt className="h-3.5 w-3.5 mr-2" /> New Expense
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.INVENTORY_WASTAGE}>
              <DropdownMenuItem onClick={() => router.push("/inventory/wastage")}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Record Wastage
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
