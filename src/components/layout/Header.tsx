import React from "react";
import { Calendar, Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-muted-foreground">Overview</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
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
          <span>Today, 13 Aug 2026</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        {/* New Transaction Dropdown Placeholder */}
        <div className="relative">
          <Button size="sm" className="h-8 gap-1.5 px-3">
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
