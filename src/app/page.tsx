"use client";

import { useEffect, useState } from "react";
import { HeroSummary } from "@/components/dashboard/HeroSummary";
import { MoneyPosition } from "@/components/dashboard/MoneyPosition";
import { PurchasingCapacity } from "@/components/dashboard/PurchasingCapacity";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { ActivityStream } from "@/components/dashboard/ActivityStream";
import { BusinessPerformance } from "@/components/dashboard/BusinessPerformance";
import { CustomerCredit } from "@/components/dashboard/CustomerCredit";
import { SupplierPayables } from "@/components/dashboard/SupplierPayables";
import { InventorySnapshot } from "@/components/dashboard/InventorySnapshot";
import { CashMovement } from "@/components/dashboard/CashMovement";
import { BusinessTrend } from "@/components/dashboard/BusinessTrend";
import { StockAtRisk } from "@/components/dashboard/StockAtRisk";
import { BuyOpportunities } from "@/components/dashboard/BuyOpportunities";
import { WastageSummary } from "@/components/dashboard/WastageSummary";
import { fetchApi } from "@/lib/fetchApi";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { business, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetchApi('/dashboard');
        setData(res);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading your business dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-destructive text-center">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good evening, {user?.name || "there"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening at {business?.legalName || "your business"} today.
          </p>
        </div>
      </div>

      {/* ROW 1: Hero — today's primary metric */}
      <HeroSummary data={data} />

      {/* ROW 2: Money Position — Available → Working → Committed */}
      <MoneyPosition data={data} />

      {/* ROW 3: Purchasing Capacity + Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PurchasingCapacity data={data} />
        <div className="lg:col-span-2">
          <ActionCenter data={data} />
        </div>
      </div>

      {/* ROW 4: Activity + Business Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityStream data={data} />
        <BusinessTrend data={data} />
      </div>

      {/* ROW 5: Stock at Risk + Buy Opportunities + Wastage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StockAtRisk data={data} />
        <BuyOpportunities data={data} />
        <WastageSummary data={data} />
      </div>

      {/* ROW 6: Receivables + Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerCredit data={data} />
        <SupplierPayables data={data} />
      </div>

      {/* ROW 7: Inventory, Performance, Cash */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InventorySnapshot data={data} />
        <BusinessPerformance data={data} />
        <CashMovement data={data} />
      </div>
    </div>
  );
}
