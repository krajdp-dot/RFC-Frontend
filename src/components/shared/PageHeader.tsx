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
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {visibleSecondary?.map((action, i) => (
          <Button key={i} variant="outline" size="sm" className="h-8 gap-1.5 text-[13px]" onClick={action.onClick}>
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
