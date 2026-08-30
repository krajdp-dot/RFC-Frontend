"use client";

import React, { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";



export function SalesTrend({ data = [] }: { data?: any[] }) {
  const [activeTab, setActiveTab] = useState("Sales");
  const [period, setPeriod] = useState("7D");

  const dataKey = activeTab.toLowerCase();

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col w-full h-[350px]">
      <div className="p-4 border-b flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {["Sales", "Collections", "Credit"].map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 h-auto text-xs font-medium rounded-md transition-colors hover:bg-transparent",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {["7D", "30D", "90D", "YTD"].map((p) => (
            <Button
              key={p}
              variant="ghost"
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2 py-1 h-auto text-xs font-medium rounded-md transition-colors hover:bg-transparent",
                period === p
                  ? "bg-primary/10 text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d6a6a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2d6a6a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
              tickFormatter={(value) => `₹${value / 1000}k`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px', fontWeight: 500 }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px', marginBottom: '4px' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, activeTab]}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#2d6a6a" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
