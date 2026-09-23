"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, WifiOff } from "lucide-react";
import { fetchApi } from "@/lib/fetchApi";
import { useAuth } from "@/contexts/AuthContext";
import { useOffline } from "@/contexts/OfflineContext";
import { submitWithOfflineFallback } from "@/lib/offline/offlineMutate";
import { setCache, getCache, CACHE_KEYS, formatAge } from "@/lib/offline/cacheStore";
import { PostSaleWhatsAppOffer } from "@/components/whatsapp/PostSaleWhatsAppOffer";

type Customer = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  remainingBoxes?: number;
};

type Account = {
  id: string;
  name: string;
  type: string;
};

type SaleItem = {
  productId: string;
  quantity: number;
  rate: number;
  unit: string;
};

type Payment = {
  accountId: string;
  amount: number;
};

// Every payment's real "how" is the account the money is landing in — CASH
// account -> CASH method, BANK -> BANK_TRANSFER, DIGITAL -> UPI. There's no
// separate method selector in this form (one less decision for the person
// standing in the market), so the method sent to the backend is derived
// from whichever account they picked.
function methodForAccountType(type: string | undefined): string {
  if (type === "BANK") return "BANK_TRANSFER";
  if (type === "DIGITAL") return "UPI";
  return "CASH";
}

export default function NewSalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCustomerId = searchParams.get("customerId") || "";
  const { user, business } = useAuth();
  const { refresh: refreshOffline } = useOffline();

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  // Phase 11: the same key survives every retry of this form, whether
  // "retry" means the person hitting Save again after a live error, or
  // the sync engine resending a queued attempt later. Never regenerated
  // (section 8) — that's what makes a retry idempotent instead of a
  // second sale.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [usingCachedOptions, setUsingCachedOptions] = useState(false);
  const [cacheAge, setCacheAge] = useState("");
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [createdSaleId, setCreatedSaleId] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customerId: prefillCustomerId,
    businessDate: new Date().toISOString().split("T")[0],
    items: [
      {
        productId: "",
        quantity: 1,
        rate: 0,
        unit: "BOX",
      },
    ] as SaleItem[],
    discount: 0,
    payments: [
      {
        accountId: "",
        amount: 0,
      },
    ] as Payment[],
    notes: "",
  });

  const getArray = (response: any) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    return [];
  };

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError("");
      setUsingCachedOptions(false);

      try {
        const [customersResponse, productsResponse, accountsResponse] =
          await Promise.all([
            fetchApi("/customers"),
            fetchApi("/inventory"),
            fetchApi("/accounts"),
          ]);

        const customersArr = getArray(customersResponse);
        const productsArr = getArray(productsResponse).filter((p: any) => p.remainingBoxes > 0);
        const accountsArr = getArray(accountsResponse);

        setCustomers(customersArr);
        setProducts(productsArr);
        setAccounts(accountsArr);

        // Phase 11, section 26: write-through cache of exactly what this
        // form needs to function offline — not the whole ERP.
        void setCache(CACHE_KEYS.customers, customersArr);
        void setCache(CACHE_KEYS.products, productsArr);
        void setCache(CACHE_KEYS.accounts, accountsArr);
      } catch (err) {
        // Phase 11: a live fetch failing is exactly when cached master
        // data earns its keep — a salesman opening this page with no
        // signal still sees the customers/products/accounts from the
        // last time it loaded successfully, instead of a dead end.
        const [cachedCustomers, cachedProducts, cachedAccounts] = await Promise.all([
          getCache<Customer[]>(CACHE_KEYS.customers),
          getCache<Product[]>(CACHE_KEYS.products),
          getCache<Account[]>(CACHE_KEYS.accounts),
        ]);

        if (cachedCustomers && cachedProducts && cachedAccounts) {
          setCustomers(cachedCustomers.value);
          setProducts(cachedProducts.value);
          setAccounts(cachedAccounts.value);
          setUsingCachedOptions(true);
          setCacheAge(formatAge(cachedCustomers));
        } else {
          console.error("Failed to load sale dependencies:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load sale dependencies",
          );
        }
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function handleItemChange(
    index: number,
    field: keyof SaleItem,
    value: string | number,
  ) {
    setFormData((current) => {
      const items = [...current.items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...current,
        items,
      };
    });
  }

  function addItem() {
    setFormData((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          productId: "",
          quantity: 1,
          rate: 0,
          unit: "BOX",
        },
      ],
    }));
  }

  function removeItem(index: number) {
    setFormData((current) => ({
      ...current,
      items: current.items.filter((_, i) => i !== index),
    }));
  }

  function handlePaymentChange(
    index: number,
    field: keyof Payment,
    value: string | number,
  ) {
    setFormData((current) => {
      const payments = [...current.payments];

      payments[index] = {
        ...payments[index],
        [field]: value,
      };

      return {
        ...current,
        payments,
      };
    });
  }

  function addPayment() {
    setFormData((current) => ({
      ...current,
      payments: [...current.payments, { accountId: "", amount: 0 }],
    }));
  }

  function removePayment(index: number) {
    setFormData((current) => ({
      ...current,
      payments: current.payments.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        customerId: formData.customerId,
        businessDate: formData.businessDate,
        items: formData.items.map(i => ({
          ...i,
          rate: String(i.rate || 0)
        })),
        discount: formData.discount ? String(formData.discount) : undefined,
        payments: formData.payments
          .filter((payment) => payment.accountId && payment.amount > 0)
          .map((p) => ({
            accountId: p.accountId,
            amount: String(p.amount),
            method: methodForAccountType(
              accounts.find((a) => a.id === p.accountId)?.type,
            ),
          })),
        notes: formData.notes,
        idempotencyKey,
      };

      if (!payload.payments || payload.payments.length === 0) {
        payload.payments = [];
      }

      const customerName = customers.find((c) => c.id === payload.customerId)?.name || "Customer";
      const itemCount = payload.items.length;

      // Phase 11: the only thing that changed about submitting this form —
      // a network failure now queues instead of just failing, for exactly
      // this one operation (see capabilityMatrix.ts). Every other failure
      // (validation, insufficient stock, permissions) throws through to
      // the same catch block as before, unchanged.
      const result = await submitWithOfflineFallback({
        operation: "sale.create",
        endpoint: "/sales",
        payload,
        mutationId: idempotencyKey,
        businessId: business?.id || "",
        userId: user?.id || "",
        entityLabel: "Sale",
        summary: `${customerName} · ${itemCount} item${itemCount === 1 ? "" : "s"}`,
      });

      if (result.mode === "queued") {
        setQueuedOffline(true);
        void refreshOffline();
        setTimeout(() => router.push("/sales"), 1800);
      } else {
        // Phase 12, section 20/26: only offered here — a live,
        // server-confirmed sale with a real id. The offline branch above
        // never reaches this; a queued sale has no real id yet to send a
        // confirmation for.
        setCreatedSaleId(result.data.id);
      }
    } catch (err) {
      console.error("Failed to create sale:", err);

      setError(
        err instanceof Error ? err.message : "Failed to create sale",
      );

      setLoading(false);
    }
  }

  if (createdSaleId) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full max-w-md mx-auto">
        <PostSaleWhatsAppOffer
          kind="sale"
          entityId={createdSaleId}
          onDone={() => router.push("/sales")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
      <PageHeader
        title="New Sale"
        subtitle="Record an outgoing sale to a customer."
        primaryAction={{
          label: "Cancel",
          icon: ArrowLeft,
          href: "/sales",
        }}
      />

      {queuedOffline && (
        <div className="bg-sky-50 text-sky-800 p-4 rounded-xl border border-sky-200 flex items-center gap-2 text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Couldn&apos;t reach RFC — this sale is safely saved on this device and will sync automatically.</span>
        </div>
      )}

      {usingCachedOptions && !queuedOffline && (
        <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 flex items-center gap-2 text-xs">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Showing customers, products and accounts from {cacheAge} — couldn&apos;t refresh just now.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-lg">General Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Customer</label>

              <select
                required
                disabled={loadingOptions}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.customerId}
                onChange={(e) =>
                  setFormData((current) => ({
                    ...current,
                    customerId: e.target.value,
                  }))
                }
              >
                <option value="">
                  {loadingOptions
                    ? "Loading customers..."
                    : "Select Customer"}
                </option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Date</label>

              <Input
                type="date"
                required
                value={formData.businessDate}
                onChange={(e) =>
                  setFormData((current) => ({
                    ...current,
                    businessDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Items</h2>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          {formData.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border"
            >
              <select
                required
                disabled={loadingOptions}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={item.productId}
                onChange={(e) =>
                  handleItemChange(index, "productId", e.target.value)
                }
              >
                <option value="">
                  {loadingOptions
                    ? "Loading products..."
                    : "Select Product"}
                </option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.remainingBoxes} boxes avail.)
                  </option>
                ))}
              </select>

              {(() => {
                const selectedProd = products.find(p => p.id === item.productId);
                const maxQty = selectedProd?.remainingBoxes || undefined;
                return (
                  <Input
                    type="number"
                    min="1"
                    max={maxQty}
                    placeholder="Qty"
                    className="w-24"
                    required
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Number(e.target.value),
                      )
                    }
                  />
                );
              })()}

              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Rate"
                className="w-28"
                required
                value={item.rate}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "rate",
                    Number(e.target.value),
                  )
                }
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={formData.items.length === 1}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}

          <div className="flex items-center gap-4 mt-2 border-t pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Discount Applied
              </label>

              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Discount"
                className="w-32"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((current) => ({
                    ...current,
                    discount: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Payment Received</h2>
            <Button type="button" variant="outline" size="sm" onClick={addPayment}>
              <Plus className="w-4 h-4 mr-1" />
              Split Payment
            </Button>
          </div>

          {formData.payments.map((payment, index) => (
            <div key={index} className="flex items-center gap-3">
              <select
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={payment.accountId}
                onChange={(e) =>
                  handlePaymentChange(index, "accountId", e.target.value)
                }
              >
                <option value="">Select Account</option>

                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>

              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                className="w-36"
                value={payment.amount}
                onChange={(e) =>
                  handlePaymentChange(index, "amount", Number(e.target.value))
                }
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePayment(index)}
                disabled={formData.payments.length === 1}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Leave the amount at 0, or remove all rows, to record the full sale on credit.
          </p>

          {(() => {
            const saleTotal = formData.items.reduce(
              (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.rate) || 0),
              0,
            ) - (Number(formData.discount) || 0);
            const received = formData.payments.reduce(
              (sum, p) => sum + (p.accountId && p.amount > 0 ? Number(p.amount) : 0),
              0,
            );
            const credit = saleTotal - received;
            return (
              <div className="flex justify-between text-sm border-t pt-3 tabular-nums">
                <span className="text-muted-foreground">Sale total: ₹{saleTotal.toFixed(2)}</span>
                <span className="text-muted-foreground">Received: ₹{received.toFixed(2)}</span>
                <span className={credit > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                  On credit: ₹{Math.max(0, credit).toFixed(2)}
                </span>
              </div>
            );
          })()}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full font-semibold"
          disabled={loading || loadingOptions}
        >
          {queuedOffline ? "Saved offline ✓" : loading ? "Creating..." : "Create Sale"}
        </Button>
      </form>
    </div>
  );
}