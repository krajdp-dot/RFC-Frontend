"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import type { Permission } from "@/lib/permissions";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  permissions?: Permission[];
};

type Business = {
  id: string;
  name: string;
  legalName?: string;
  currency?: string;
};

type AuthContextType = {
  user: User | null;
  business: Business | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** Role on the *current* business, as the backend reported it. */
  role: string | null;
  permissions: Permission[];
  /** True only if the backend said so — never inferred from the role here. */
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  /** Re-reads /auth/me; call after anything that could change your own access. */
  refresh: () => Promise<void>;
  login: (token: string, user: User, business: Business) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial load
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    const savedToken = match ? match[2] : null;

    if (savedToken) {
      setToken(savedToken);
      // Fetch current profile and business
      Promise.all([
        fetchApi('/auth/me'),
        fetchApi('/businesses/current')
      ]).then(([userData, businessData]) => {
        setUser(userData);
        setBusiness(businessData);
      }).catch((err) => {
        console.error("Auth init failed", err);
        // If 401, fetchApi already handles redirect to /login
      }).finally(() => {
        setLoading(false);
      });
    } else {
      // Phase 10: this used to fabricate a signed-in "Developer" user and a
      // "Rajdeep Fruits Company" business entirely client-side whenever no
      // token cookie was present, so the app rendered as if authenticated
      // without ever calling the backend. That paired with a matching
      // backend bypass (removed — see jwt-auth.guard.ts) that accepted
      // requests with no credentials at all under the same condition. With
      // no token, the person is simply not signed in.
      setLoading(false);
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  // Real auth is enforced both here (redirect when no token) and on every
  // API call via fetchApi's 401 handling — the backend remains the actual
  // security boundary regardless of what this does.

  /**
   * Phase 10: permissions come from the server on every load, so a role
   * change or a revoked membership takes effect on the next page load
   * rather than lingering in whatever the token said at login time.
   */
  const permissions = (user?.permissions ?? []) as Permission[];
  const role = user?.role ?? null;

  const can = (permission: Permission) => permissions.includes(permission);
  const canAny = (wanted: Permission[]) => wanted.some((p) => permissions.includes(p));

  const refresh = async () => {
    try {
      const [userData, businessData] = await Promise.all([
        fetchApi('/auth/me'),
        fetchApi('/businesses/current'),
      ]);
      setUser(userData);
      setBusiness(businessData);
    } catch (err) {
      console.error("Could not refresh the current session", err);
    }
  };

  const login = (newToken: string, newUser: User, newBusiness: Business) => {
    // Set cookie that expires in 7 days
    const d = new Date();
    d.setTime(d.getTime() + (7*24*60*60*1000));
    document.cookie = `token=${newToken}; expires=${d.toUTCString()}; path=/`;
    
    setToken(newToken);
    setUser(newUser);
    setBusiness(newBusiness);
    router.push('/');
  };

  const logout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setToken(null);
    setUser(null);
    setBusiness(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground text-sm font-medium">Starting up...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        isAuthenticated: !!token,
        loading,
        role,
        permissions,
        can,
        canAny,
        refresh,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
