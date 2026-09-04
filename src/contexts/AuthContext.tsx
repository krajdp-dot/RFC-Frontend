"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";

type User = {
  id: string;
  name: string;
  email: string;
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
      // F1 FIX: Auth is intentionally OFF. Provide dev context instead of
      // blocking the entire app. The backend JwtAuthGuard handles injecting
      // business context when JWT_SECRET === 'dev-secret'.
      setUser({ id: 'dev-user', name: 'Developer', email: 'dev@rfcerp.local' });
      setBusiness({ id: 'dev-business', name: 'Rajdeep Fruits Company', legalName: 'Rajdeep Fruits Company', currency: 'INR' });
      setToken('dev-mode');
      setLoading(false);
    }
  }, []);

  // F1 FIX: Removed the redirect to /login that blocked the entire app
  // when auth is off. Navigation protection is only needed in production
  // with real auth enabled.

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
    <AuthContext.Provider value={{ user, business, token, isAuthenticated: !!token, loading, login, logout }}>
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
