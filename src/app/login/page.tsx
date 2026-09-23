"use client";

import React, { useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      login(data.token, data.user, data.business);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Rajdeep Fruits OS</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="w-full h-10 mt-6" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
