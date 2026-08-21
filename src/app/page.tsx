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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good evening, Rajdeep</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening at Rajdeep Fruits Company today.
          </p>
        </div>
      </div>

      {/* ROW 1: Hero — today's primary metric */}
      <HeroSummary />

      {/* ROW 2: Money Position — Available → Working → Committed */}
      <MoneyPosition />

      {/* ROW 3: Purchasing Capacity + Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PurchasingCapacity />
        <div className="lg:col-span-2">
          <ActionCenter />
        </div>
      </div>

      {/* ROW 4: Activity + Business Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityStream />
        <BusinessTrend />
      </div>

      {/* ROW 5: Stock at Risk + Buy Opportunities + Wastage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StockAtRisk />
        <BuyOpportunities />
        <WastageSummary />
      </div>

      {/* ROW 6: Receivables + Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerCredit />
        <SupplierPayables />
      </div>

      {/* ROW 7: Inventory, Performance, Cash */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InventorySnapshot />
        <BusinessPerformance />
        <CashMovement />
      </div>
    </div>
  );
}
