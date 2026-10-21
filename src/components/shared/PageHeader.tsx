"use client";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import type { Permission } from "@/lib/permissions";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  /**
   * Phase 10: an action can declare the permission it needs, and is simply
   * not rendered without it. The endpoint behind it is guarded server-side
   * regardless — this keeps people from being offered a button that was
   * always going to come back 403.
   */
  primaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    href?: string;
    permission?: Permission;
  };
  secondaryActions?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    permission?: Permission;
  }[];
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, description, primaryAction, secondaryActions, children, className }: PageHeaderProps) {
  const { can } = useAuth();
  const sub = subtitle || description;
  const allowed = (permission?: Permission) => !permission || can(permission);
  const visibleSecondary = secondaryActions?.filter((action) => allowed(action.permission));
  const showPrimary = primaryAction && allowed(primaryAction.permission);
  return (
    <div className={cn("mb-7 flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6", className)}>
      <div>
        <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> RFC workspace</div>
        <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-[30px]">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">{sub}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {visibleSecondary?.map((action, i) => (
          <Button key={i} variant="outline" size="sm" className="h-9 gap-2 rounded-xl px-3 text-[13px]" onClick={action.onClick}>
            {action.icon && <action.icon className="h-3.5 w-3.5" />}
            {action.label}
          </Button>
        ))}
        {showPrimary && primaryAction.href ? (
          <Link href={primaryAction.href} className={cn(buttonVariants({ size: "sm" }), "h-8 gap-1.5 text-[13px]")}>
            {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5" />}
            {primaryAction.label}
          </Link>
        ) : showPrimary && (
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
