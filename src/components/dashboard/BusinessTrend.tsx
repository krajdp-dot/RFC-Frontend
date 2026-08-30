"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BusinessTrend({ data = {} }: { data?: any }) {
  const [activeTab, setActiveTab] = useState("Sales");
  const [activePeriod, setActivePeriod] = useState("7D");
  
  const tabs = ["Sales", "Collections", "Purchases", "Expenses", "Profit"];
  const periods = ["7D", "30D", "90D", "YTD"];

  return (
    <div className="bg-card border rounded-xl overflow-hidden p-5 flex flex-col h-full">
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">BUSINESS TREND</h2>
          
          {/* Tabs */}
          <div className="flex items-center gap-4 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            {tabs.map(tab => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "h-auto pb-2 px-1 rounded-none border-b-2 text-sm font-medium transition-colors hover:bg-transparent",
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center gap-1 shrink-0 bg-muted/50 p-1 rounded-lg self-start md:self-auto md:mt-6">
          {periods.map(period => (
            <Button
              key={period}
              variant="ghost"
              onClick={() => setActivePeriod(period)}
              className={cn(
                "h-auto px-2.5 py-1 text-xs font-medium rounded-md transition-colors hover:bg-transparent",
                activePeriod === period
                  ? "bg-primary/10 text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Chart Placeholder */}
      <div className="grow bg-muted/10 rounded-lg border border-dashed border-border/60 flex items-center justify-center min-h-[192px]">
        <div className="text-center text-muted-foreground">
          <p className="text-sm font-medium">Chart will render here</p>
          <p className="text-xs mt-1">Showing {activeTab} for the last {activePeriod}</p>
        </div>
      </div>
    </div>
  );
}
