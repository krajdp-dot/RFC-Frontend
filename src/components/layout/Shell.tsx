"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { NoAccess } from "@/components/auth/Can";
import { permissionForRoute } from "@/lib/permissions";

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { can, loading, role } = useAuth();

  const isAuthRoute = pathname === '/login' || pathname === '/register';

  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Phase 10: gating every page from one place, rather than asking each
  // page to remember to gate itself. Someone who types a URL they can't
  // use gets told so instead of a screenful of failed requests. The
  // backend refuses those requests either way — this is about the
  // experience, not the boundary.
  const required = permissionForRoute(pathname);
  const blocked = !loading && required !== undefined && !can(required);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main Content */}
      <div 
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-200",
          collapsed ? "md:pl-[72px]" : "md:pl-[256px]"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {blocked ? <NoAccess role={role} /> : children}
        </main>
      </div>
    </div>
  );
}
