import { AlertCircle, AlertTriangle, Package, TrendingDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActionCenter({ data = {} }: { data?: any }) {
  const alerts = data?.alerts || [];

  const getAlertIcon = (type: string, severity: string) => {
    if (severity === 'HIGH' || type === 'URGENT') return <AlertCircle className="w-4 h-4" />;
    if (severity === 'MEDIUM') return <AlertTriangle className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const getAlertColors = (severity: string) => {
    if (severity === 'HIGH') return "bg-red-100 text-red-600";
    if (severity === 'MEDIUM') return "bg-amber-100 text-amber-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        {alerts.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground grow">NEEDS ATTENTION</h2>
        {alerts.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{alerts.length}</span>
        )}
      </div>
      
      <div className="flex flex-col divide-y grow">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm font-medium">You're all caught up</p>
            <p className="text-xs mt-1">No immediate actions require attention.</p>
          </div>
        ) : (
          alerts.map((alert: any, idx: number) => (
            <div key={idx} className="p-4 flex items-center gap-3 group hover:bg-muted/30 transition-colors cursor-pointer">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getAlertColors(alert.severity)}`}>
                {getAlertIcon(alert.type, alert.severity)}
              </div>
              <div className="grow min-w-0">
                <p className="font-medium text-sm truncate">{alert.type}</p>
                <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
              </div>
              {alert.action && (
                <Button variant="secondary" size="sm" className="shrink-0 text-xs px-3 h-auto py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {alert.action}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
