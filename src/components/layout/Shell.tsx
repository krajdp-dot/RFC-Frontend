"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { NoAccess } from "@/components/auth/Can";
import { permissionForRoute } from "@/lib/permissions";

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { can, loading, role } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
    <div className={cn("min-h-screen flex", "bg-background")}>
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/25"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 z-10 w-[256px]">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main Content */}
      <div 
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-200",
          collapsed ? "md:pl-[64px]" : "md:pl-[240px]"
        )}
      >
        <Header mobileMenuOpen={mobileOpen} onMobileMenuToggle={() => setMobileOpen((open) => !open)} />
        <main className={cn("min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 xl:p-6", pathname === "/" && "bg-white")}>
          {blocked ? <NoAccess role={role} /> : children}
        </main>
      </div>
    </div>
  );
}
