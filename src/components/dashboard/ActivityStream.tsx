import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ShoppingCart, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActivityStream({ data = {} }: { data?: any }) {
  const activities = [
    { id: 1, type: 'sale', entity: 'Rajesh Traders', amount: '₹25,000', detail: '₹15K cash · ₹10K credit', time: '10:42 AM', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: ArrowUpRight },
    { id: 2, type: 'receipt', entity: 'Sharma Retail', amount: '₹8,000', detail: 'UPI payment', time: '10:27 AM', color: 'text-blue-600', bg: 'bg-blue-100', icon: ArrowDownLeft },
    { id: 3, type: 'purchase', entity: 'Merchant A', amount: '₹45,000', detail: 'Apple 200kg · ₹20K paid', time: '09:54 AM', color: 'text-orange-600', bg: 'bg-orange-100', icon: ShoppingCart },
    { id: 4, type: 'expense', entity: 'Transport', amount: '₹4,500', detail: 'Vehicle loading', time: '09:30 AM', color: 'text-red-600', bg: 'bg-red-100', icon: Truck },
    { id: 5, type: 'payment', entity: 'Merchant B', amount: '₹30,000', detail: 'SBI transfer', time: '09:15 AM', color: 'text-red-600', bg: 'bg-red-100', icon: ArrowUpRight },
    { id: 6, type: 'sale', entity: 'Amit Retail', amount: '₹18,500', detail: '₹18.5K cash', time: 'Yesterday', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: ArrowUpRight },
  ];

  return (
    <div className="bg-card border rounded-xl overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">TODAY'S ACTIVITY</h2>
        <Button variant="link" className="text-sm p-0 h-auto font-medium">View All</Button>
      </div>
      <div className="p-2 grow flex flex-col justify-center">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="relative flex items-start px-2 py-3 group hover:bg-muted/20 rounded-lg transition-colors">
              {index !== activities.length - 1 && (
                <div className="absolute top-10 left-6 bottom-0 w-px bg-border -mb-3 hidden sm:block" />
              )}
              
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10", activity.bg, activity.color)}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="ml-4 flex-1 min-w-0 flex items-center justify-between">
                <div className="truncate pr-2">
                  <p className="text-sm font-medium text-foreground truncate">{activity.entity}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-sm font-semibold tabular-nums", activity.type === 'expense' || activity.type === 'payment' ? 'text-foreground' : activity.color)}>
                    {activity.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
