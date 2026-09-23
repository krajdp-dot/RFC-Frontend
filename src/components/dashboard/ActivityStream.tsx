import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ShoppingCart, Truck, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ActivityStream({ data = {} }: { data?: any }) {
  const activities = data?.recentActivity || [];

  const formatCurrency = (val: any) => {
    if (!val) return "₹0";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(val));
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "numeric", hour12: true }).format(date);
  };

  const getActivityConfig = (type: string) => {
    switch(type) {
      case 'SALE':
        return { color: 'text-emerald-600', bg: 'bg-emerald-100', icon: ArrowUpRight };
      case 'RECEIPT':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: ArrowDownLeft };
      case 'PURCHASE':
        return { color: 'text-orange-600', bg: 'bg-orange-100', icon: ShoppingCart };
      case 'EXPENSE':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: Truck };
      case 'PAYMENT':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: ArrowUpRight };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: RefreshCcw };
    }
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">TODAY'S ACTIVITY</h2>
        <Link href="/reports" className="text-sm p-0 h-auto font-medium text-primary hover:underline">View All</Link>
      </div>
      <div className="p-2 grow flex flex-col justify-center">
        {activities.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs mt-1">Recent transactions will appear here.</p>
          </div>
        ) : (
          activities.map((activity: any, index: number) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;
            return (
              <div key={index} className="relative flex items-start px-2 py-3 group hover:bg-muted/20 rounded-lg transition-colors">
                {index !== activities.length - 1 && (
                  <div className="absolute top-10 left-6 bottom-0 w-px bg-border -mb-3 hidden sm:block" />
                )}
                
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10", config.bg, config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="ml-4 flex-1 min-w-0 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="text-sm font-medium text-foreground truncate">{activity.type}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-sm font-semibold tabular-nums", activity.type === 'EXPENSE' || activity.type === 'PAYMENT' ? 'text-foreground' : config.color)}>
                      {formatCurrency(activity.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTime(activity.time)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
