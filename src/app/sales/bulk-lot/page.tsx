"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Plus, X, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { fetchApi } from "@/lib/fetchApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function formatCurrency(amount: string | number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
];

type Allocation = {
  customerId: string;
  quantity: string;
  rate: string;
  discount: string;
  paymentMethod: string;
  paymentAmount: string;
  paymentAccountId: string;
};

const emptyAllocation: Allocation = {
  customerId: "",
  quantity: "",
  rate: "",
  discount: "0",
  paymentMethod: "CASH",
  paymentAmount: "",
  paymentAccountId: "",
};

export default function BulkLotSalePage() {
  const router = useRouter();
  const [lots, setLots] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [lotId, setLotId] = useState("");
  const [businessDate, setBusinessDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [allocations, setAllocations] = useState<Allocation[]>([
    { ...emptyAllocation },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const [invData, custData, accData] = await Promise.all([
          fetchApi("/inventory"),
          fetchApi("/customers"),
          fetchApi("/accounts"),
        ]);

        // Get products with stock, then load lot details for each
        const products = Array.isArray(invData) ? invData : invData.data || [];
        const productsWithStock = products.filter(
          (p: any) => p.remainingBoxes > 0
        );

        const allLots: any[] = [];
        for (const prod of productsWithStock) {
          try {
            const detail = await fetchApi(`/inventory/products/${prod.id}`);
            if (detail?.lots) {
              for (const lot of detail.lots) {
                allLots.push({
                  ...lot,
                  productName: prod.name,
                });
              }
            }
          } catch {
            // skip
          }
        }

        setLots(allLots.filter((l: any) => l.remainingBoxes > 0));
        setCustomers(
          Array.isArray(custData) ? custData : custData.data || []
        );
        setAccounts(
          Array.isArray(accData) ? accData : accData.data || []
        );
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedLot = lots.find((l) => l.id === lotId);

  const totalAllocated = allocations.reduce(
    (sum, a) => sum + (parseInt(a.quantity, 10) || 0),
    0
  );
  const remaining = selectedLot
    ? selectedLot.remainingBoxes - totalAllocated
    : 0;

  function updateAllocation(index: number, field: keyof Allocation, value: string) {
    setAllocations((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  function addAllocation() {
    setAllocations((prev) => [...prev, { ...emptyAllocation }]);
  }

  function removeAllocation(index: number) {
    if (allocations.length <= 1) return;
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lotId) {
      setError("Select a lot");
      return;
    }

    const validAllocations = allocations.filter(
      (a) => a.customerId && a.quantity && a.rate
    );
    if (validAllocations.length === 0) {
      setError("Add at least one allocation with customer, quantity, and rate");
      return;
    }

    if (remaining < 0) {
      setError("Total allocated exceeds available stock");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        lotId,
        businessDate,
        allocations: validAllocations.map((a) => ({
          customerId: a.customerId,
          quantity: parseInt(a.quantity, 10),
          rate: a.rate,
          discount: a.discount || "0",
          payment:
            a.paymentAmount && Number(a.paymentAmount) > 0
              ? {
                  method: a.paymentMethod,
                  amount: a.paymentAmount,
                  accountId: a.paymentAccountId || undefined,
                }
              : undefined,
        })),
      };

      await fetchApi("/sales/bulk-lot", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess("Bulk lot sale completed successfully!");
      setTimeout(() => router.push("/sales"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create bulk sale");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <PageHeader
        title="Bulk Lot Sale"
        subtitle="Sell boxes from a single lot to multiple customers at once."
        secondaryActions={[
          {
            label: "Back to Sales",
            icon: ArrowLeft,
            onClick: () => router.push("/sales"),
          },
        ]}
      />

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 text-sm font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Lot Selection & Date */}
        <div className="bg-card border rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            Step 1: Select Lot
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Lot *
              </label>
              <select
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select lot...</option>
                {lots.map((l: any) => (
                  <option key={l.id} value={l.id}>
                    {l.lotReference} — {l.productName} — {l.remainingBoxes}{" "}
                    boxes @ {formatCurrency(l.costPerBox)}/box
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Business Date *
              </label>
              <input
                type="date"
                value={businessDate}
                onChange={(e) => setBusinessDate(e.target.value)}
                className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          {selectedLot && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">
                  {selectedLot.productName} — {selectedLot.lotReference}
                </p>
                <p className="mt-1">
                  Available: <strong>{selectedLot.remainingBoxes} boxes</strong>{" "}
                  • Cost/box: {formatCurrency(selectedLot.costPerBox)} •
                  Quality: {selectedLot.quality}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Allocations */}
        {selectedLot && (
          <div className="bg-card border rounded-xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                Step 2: Allocate to Customers
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  Allocated:{" "}
                  <strong className="text-foreground">{totalAllocated}</strong> /{" "}
                  {selectedLot.remainingBoxes}
                </span>
                <span
                  className={`font-semibold ${
                    remaining < 0
                      ? "text-red-600"
                      : remaining === 0
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {remaining >= 0
                    ? `${remaining} remaining`
                    : `${Math.abs(remaining)} over-allocated!`}
                </span>
              </div>
            </div>

            {allocations.map((alloc, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 flex flex-col gap-3 relative bg-muted/20"
              >
                {allocations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAllocation(index)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Customer #{index + 1}
                </div>

                {/* Row 1: Customer + Quantity + Rate */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Customer
                    </label>
                    <select
                      value={alloc.customerId}
                      onChange={(e) =>
                        updateAllocation(index, "customerId", e.target.value)
                      }
                      className="h-8 rounded-md border bg-background px-2 text-sm"
                    >
                      <option value="">Select...</option>
                      {customers.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Qty (boxes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={alloc.quantity}
                      onChange={(e) =>
                        updateAllocation(index, "quantity", e.target.value)
                      }
                      placeholder="e.g. 10"
                      className="h-8 rounded-md border bg-background px-2 text-sm tabular-nums"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Rate (₹/box)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={alloc.rate}
                      onChange={(e) =>
                        updateAllocation(index, "rate", e.target.value)
                      }
                      placeholder="e.g. 500"
                      className="h-8 rounded-md border bg-background px-2 text-sm tabular-nums"
                    />
                  </div>
                </div>

                {/* Row 2: Discount + Payment Amount + Method + Account */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={alloc.discount}
                      onChange={(e) =>
                        updateAllocation(index, "discount", e.target.value)
                      }
                      className="h-8 rounded-md border bg-background px-2 text-sm tabular-nums"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Payment (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={alloc.paymentAmount}
                      onChange={(e) =>
                        updateAllocation(index, "paymentAmount", e.target.value)
                      }
                      placeholder="0 = credit"
                      className="h-8 rounded-md border bg-background px-2 text-sm tabular-nums"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Method
                    </label>
                    <select
                      value={alloc.paymentMethod}
                      onChange={(e) =>
                        updateAllocation(index, "paymentMethod", e.target.value)
                      }
                      className="h-8 rounded-md border bg-background px-2 text-sm"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Account
                    </label>
                    <select
                      value={alloc.paymentAccountId}
                      onChange={(e) =>
                        updateAllocation(
                          index,
                          "paymentAccountId",
                          e.target.value
                        )
                      }
                      className="h-8 rounded-md border bg-background px-2 text-sm"
                    >
                      <option value="">None</option>
                      {accounts.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Line total */}
                {alloc.quantity && alloc.rate && (
                  <div className="text-xs text-muted-foreground text-right">
                    Line total:{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(
                        Number(alloc.quantity) * Number(alloc.rate) -
                          Number(alloc.discount || 0)
                      )}
                    </span>
                    {Number(alloc.paymentAmount) > 0 && (
                      <>
                        {" "}
                        • Paid: {formatCurrency(alloc.paymentAmount)} • Credit:{" "}
                        {formatCurrency(
                          Number(alloc.quantity) * Number(alloc.rate) -
                            Number(alloc.discount || 0) -
                            Number(alloc.paymentAmount)
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAllocation}
              className="self-start gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Customer
            </Button>
          </div>
        )}

        {/* Submit */}
        {selectedLot && (
          <div className="flex items-center justify-end gap-3">
            <Link href="/sales">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || remaining < 0}
              className="gap-1.5"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {submitting
                ? "Processing..."
                : `Create ${
                    allocations.filter((a) => a.customerId && a.quantity).length
                  } Sale(s)`}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
