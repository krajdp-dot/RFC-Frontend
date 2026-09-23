"use client";

import React, { useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.businessName) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      
      login(data.token, data.user, data.business);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join Rajdeep Fruits OS</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name *</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Business Name *</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Rajdeep Fruits Pvt Ltd"
              value={formData.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone Number</label>
            <input
              type="tel"
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="+919876543210"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email *</label>
            <input
              type="email"
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password *</label>
            <input
              type="password"
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="w-full h-10 mt-6" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
