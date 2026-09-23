"use client";

import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, type Permission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

/**
 * Phase 10 — the two ways this UI hides things it knows will be refused.
 *
 * <Can> for a control (a button, a menu row, a column), PermissionGate for
 * a whole page. Neither is a security measure — the backend rejects the
 * request either way — they exist so nobody is offered an action that was
 * never going to work.
 */

export function Can({
  permission,
  anyOf,
  children,
  fallback = null,
}: {
  permission?: Permission;
  /** Show if the person holds at least one of these. */
  anyOf?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, canAny } = useAuth();
  const allowed = permission ? can(permission) : anyOf ? canAny(anyOf) : true;
  return <>{allowed ? children : fallback}</>;
}

/**
 * Wraps a page. Renders nothing while the session is still loading, so a
 * permitted page never flashes "no access" on the way in.
 */
export function PermissionGate({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const { can, loading, role } = useAuth();

  if (loading) return null;
  if (can(permission)) return <>{children}</>;

  return <NoAccess role={role} />;
}

export function NoAccess({ role }: { role?: string | null }) {
  const roleLabel = role ? ROLE_LABELS[role] ?? role : null;

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">This page isn&apos;t part of your access</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {roleLabel
          ? `Your account is set up as ${roleLabel}. An owner can change that from Settings.`
          : "An owner can grant you access from Settings."}
      </p>
      <Link href="/">
        <Button size="sm" variant="outline" className="mt-4 h-8 text-[13px]">
          Back to dashboard
        </Button>
      </Link>
    </div>
  );
}
