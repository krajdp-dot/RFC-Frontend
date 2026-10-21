"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  PackagePlus,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { HeroSummary } from "@/components/dashboard/HeroSummary";
import { MoneyPosition } from "@/components/dashboard/MoneyPosition";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { ActivityStream } from "@/components/dashboard/ActivityStream";
import { CustomerCredit } from "@/components/dashboard/CustomerCredit";
import { SupplierPayables } from "@/components/dashboard/SupplierPayables";
import { InventorySnapshot } from "@/components/dashboard/InventorySnapshot";
import { CashMovement } from "@/components/dashboard/CashMovement";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/fetchApi";
import { useAuth } from "@/contexts/AuthContext";

const quickActions = [
  {
    href: "/sales/new",
    title: "Record a sale",
    detail: "Boxes sold, payment and credit",
    icon: ShoppingCart,
    tone: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    href: "/purchases/new",
    title: "Add stock",
    detail: "New fruit purchase or lot",
    icon: PackagePlus,
    tone: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  },
  {
    href: "/receivables/receive-payment",
    title: "Receive money",
    detail: "Collect customer dues",
    icon: ArrowDownLeft,
    tone: "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  },
  {
    href: "/inventory",
    title: "Check stock",
    detail: "What is available right now",
    icon: Boxes,
    tone: "bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
  },
];

export default function DashboardPage() {
  const { business, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchApi("/dashboard");
      setData(res);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="font-semibold tracking-tight">Your dashboard could not load</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="secondary" size="sm" onClick={loadDashboard}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-1 pb-12 sm:gap-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Rajdeep Fruits · Daily operations
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {business?.legalName || "Your business"} · Start with what needs doing today.
          </p>
        </div>
        <Link
          href="/day-close"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Wallet className="h-4 w-4" />
          Review today’s close
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </section>

      <section aria-label="Daily shortcuts">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">What do you need to do?</h2>
          <span className="text-xs text-muted-foreground">Quick actions</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ href, title, detail, icon: Icon, tone }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-[104px] items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold tracking-tight">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{detail}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Today at a glance</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">The numbers that matter before you make the next move.</p>
          </div>
        </div>
        <HeroSummary data={data} />
        <MoneyPosition data={data} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <ActionCenter data={data} />
        </div>
        <div className="xl:col-span-3">
          <ActivityStream data={data} />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Money owed to you and by you</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Keep customer collections and supplier payments visible.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CustomerCredit data={data} />
          <SupplierPayables data={data} />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Stock and cash</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">A quick operational check, without opening separate reports.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InventorySnapshot data={data} />
          <CashMovement data={data} />
        </div>
      </section>
    </main>
  );
}
