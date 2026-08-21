import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    href?: string;
  };
  secondaryActions?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
  }[];
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, description, primaryAction, secondaryActions, children, className }: PageHeaderProps) {
  const sub = subtitle || description;
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {secondaryActions?.map((action, i) => (
          <Button key={i} variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]" onClick={action.onClick}>
            {action.icon && <action.icon className="h-3.5 w-3.5" />}
            {action.label}
          </Button>
        ))}
        {primaryAction && primaryAction.href ? (
          <Link href={primaryAction.href} className={cn(buttonVariants({ size: "sm" }), "h-8 gap-1.5 text-[13px]")}>
            {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5" />}
            {primaryAction.label}
          </Link>
        ) : primaryAction && (
          <Button size="sm" className="h-8 gap-1.5 text-[13px]" onClick={primaryAction.onClick}>
            {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5" />}
            {primaryAction.label}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
