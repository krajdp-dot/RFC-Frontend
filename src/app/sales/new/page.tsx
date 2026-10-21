"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  CreditCard,
  Landmark,
  Minus,
  Package,
  Plus,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
  UserRound,
  WifiOff,
  X,
} from "lucide-react";
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

// The actual account remains the source of truth for the payment method:
// CASH -> CASH, BANK -> BANK_TRANSFER, DIGITAL -> UPI.
function methodForAccountType(type: string | undefined): string {
  if (type === "BANK") return "BANK_TRANSFER";
  if (type === "DIGITAL") return "UPI";
  return "CASH";
}

function paymentLabel(type: string): string {
  if (type === "DIGITAL") return "UPI";
  if (type === "BANK") return "Bank transfer";
  if (type === "CASH") return "Cash";
  return type.replaceAll("_", " ").toLowerCase();
}

function accountIcon(type: string) {
  if (type === "DIGITAL") return Smartphone;
  if (type === "BANK") return Landmark;
  return Banknote;
}

export default function NewSalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCustomerId = searchParams.get("customerId") || "";
  const { user, business } = useAuth();
  const { refresh: refreshOffline } = useOffline();

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  // Keep this key stable for retries and offline sync so one action cannot
  // accidentally become two sales.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [showAllProducts, setShowAllProducts] = useState(false);
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
        const productsArr = getArray(productsResponse).filter(
          (product: any) => product.remainingBoxes > 0,
        );
        const accountsArr = getArray(accountsResponse);

        setCustomers(customersArr);
        setProducts(productsArr);
        setAccounts(accountsArr);

        // Keep the existing small, write-through cache for offline sale entry.
        void setCache(CACHE_KEYS.customers, customersArr);
        void setCache(CACHE_KEYS.products, productsArr);
        void setCache(CACHE_KEYS.accounts, accountsArr);
      } catch (err) {
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
            err instanceof Error ? err.message : "Failed to load sale dependencies",
          );
        }
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function totalFor(data: typeof formData) {
    return (
      data.items.reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
        0,
      ) - (Number(data.discount) || 0)
    );
  }

  function handleItemChange(
    index: number,
    field: keyof SaleItem,
    value: string | number,
  ) {
    setFormData((current) => {
      const items = [...current.items];
      items[index] = { ...items[index], [field]: value };
      return { ...current, items };
    });
  }

  function addProduct(product: Product) {
    setError("");
    const existing = formData.items.find((item) => item.productId === product.id);
    if (
      existing &&
      typeof product.remainingBoxes === "number" &&
      existing.quantity >= product.remainingBoxes
    ) {
      setError(`Only ${product.remainingBoxes} boxes of ${product.name} are available.`);
      return;
    }

    setFormData((current) => {
      const existingIndex = current.items.findIndex(
        (item) => item.productId === product.id,
      );

      if (existingIndex >= 0) {
        const items = [...current.items];
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: Math.min(
            items[existingIndex].quantity + 1,
            product.remainingBoxes ?? items[existingIndex].quantity + 1,
          ),
        };
        return { ...current, items };
      }

      const emptyIndex = current.items.findIndex((item) => !item.productId);
      if (emptyIndex >= 0) {
        const items = [...current.items];
        items[emptyIndex] = { ...items[emptyIndex], productId: product.id };
        return { ...current, items };
      }

      return {
        ...current,
        items: [
          ...current.items,
          { productId: product.id, quantity: 1, rate: 0, unit: "BOX" },
        ],
      };
    });
    setProductQuery("");
    setShowAllProducts(false);
  }

  function removeItem(index: number) {
    setFormData((current) => {
      const items = current.items.filter((_, i) => i !== index);
      return {
        ...current,
        items:
          items.length > 0
            ? items
            : [{ productId: "", quantity: 1, rate: 0, unit: "BOX" }],
      };
    });
  }

  function choosePaymentAccount(account: Account) {
    setError("");
    setFormData((current) => {
      const sameIndex = current.payments.findIndex(
        (payment) => payment.accountId === account.id,
      );

      if (sameIndex >= 0 && current.payments[sameIndex].amount > 0) {
        return current;
      }

      const receivedFromOthers = current.payments.reduce(
        (sum, payment, index) =>
          index !== sameIndex && payment.accountId && payment.amount > 0
            ? sum + Number(payment.amount)
            : sum,
        0,
      );
      const remaining = Math.max(0, totalFor(current) - receivedFromOthers);
      const payments = [...current.payments];

      if (sameIndex >= 0) {
        payments[sameIndex] = {
          accountId: account.id,
          amount: remaining,
        };
      } else {
        const active = payments.filter(
          (payment) => payment.accountId && payment.amount > 0,
        );
        payments.splice(0, payments.length, ...active, {
          accountId: account.id,
          amount: remaining,
        });
      }

      return { ...current, payments };
    });
  }

  function handlePaymentAmount(index: number, amount: number) {
    setFormData((current) => {
      const payments = [...current.payments];
      payments[index] = { ...payments[index], amount };
      return { ...current, payments };
    });
  }

  function removePayment(index: number) {
    setFormData((current) => {
      const payments = current.payments.filter((_, i) => i !== index);
      return {
        ...current,
        payments:
          payments.length > 0 ? payments : [{ accountId: "", amount: 0 }],
      };
    });
  }

  function recordOnCredit() {
    setFormData((current) => ({
      ...current,
      payments: [{ accountId: "", amount: 0 }],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    if (!formData.customerId) {
      setError("Choose the customer before saving this sale.");
      return;
    }
    if (
      formData.items.length === 0 ||
      formData.items.some((item) => !item.productId)
    ) {
      setError("Add a fruit/stock item to the sale first.");
      return;
    }
    const invalidItem = formData.items.find(
      (item) =>
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        !Number.isFinite(Number(item.rate)) ||
        Number(item.rate) < 0,
    );
    if (invalidItem) {
      setError("Check the box quantity and rate for each sale item.");
      return;
    }
    const overStockItem = formData.items.find((item) => {
      const product = products.find((p) => p.id === item.productId);
      return (
        product &&
        typeof product.remainingBoxes === "number" &&
        item.quantity > product.remainingBoxes
      );
    });
    if (overStockItem) {
      setError("A box quantity is higher than the available stock. Please review it.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        customerId: formData.customerId,
        businessDate: formData.businessDate,
        items: formData.items.map((item) => ({
          ...item,
          rate: String(item.rate || 0),
        })),
        discount: formData.discount ? String(formData.discount) : undefined,
        payments: formData.payments
          .filter((payment) => payment.accountId && payment.amount > 0)
          .map((payment) => ({
            accountId: payment.accountId,
            amount: String(payment.amount),
            method: methodForAccountType(
              accounts.find((account) => account.id === payment.accountId)?.type,
            ),
          })),
        notes: formData.notes,
        idempotencyKey,
      };

      const customerName =
        customers.find((customer) => customer.id === payload.customerId)?.name ||
        "Customer";
      const itemCount = payload.items.length;

      // Keep the existing offline-safe, idempotent sale submission unchanged.
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
        setCreatedSaleId(result.data.id);
      }
    } catch (err) {
      console.error("Failed to create sale:", err);
      setError(err instanceof Error ? err.message : "Failed to create sale");
      setLoading(false);
    }
  }

  if (createdSaleId) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-6">
        <PostSaleWhatsAppOffer
          kind="sale"
          entityId={createdSaleId}
          onDone={() => router.push("/sales")}
        />
      </div>
    );
  }

  const selectedCustomer = customers.find(
    (customer) => customer.id === formData.customerId,
  );
  const customerMatches = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerQuery.trim().toLowerCase()),
  );
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productQuery.trim().toLowerCase()),
  );
  const visibleProducts =
    showAllProducts || productQuery.trim()
      ? filteredProducts
      : filteredProducts.slice(0, 8);
  const subtotal = formData.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
    0,
  );
  const saleTotal = subtotal - (Number(formData.discount) || 0);
  const received = formData.payments.reduce(
    (sum, payment) =>
      payment.accountId && payment.amount > 0
        ? sum + Number(payment.amount)
        : sum,
    0,
  );
  const credit = Math.max(0, saleTotal - received);
  const selectedBoxes = formData.items.reduce(
    (sum, item) => sum + (item.productId ? Number(item.quantity) || 0 : 0),
    0,
  );
  const activePayments = formData.payments.filter((payment) => payment.accountId);

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-1 pb-28 sm:gap-6 xl:pb-10">
      <PageHeader
        title="New Sale"
        subtitle="A faster way to move fruit, boxes and money."
        primaryAction={{
          label: "Cancel",
          icon: ArrowLeft,
          href: "/sales",
        }}
      />

      {queuedOffline && (
        <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            Couldn&apos;t reach RFC — this sale is safely saved on this device and will sync automatically.
          </span>
        </div>
      )}

      {usingCachedOptions && !queuedOffline && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>
            Showing customers, stock and accounts from {cacheAge} — live data couldn&apos;t refresh.
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span className="min-w-0 flex-1">{error}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
            className="rounded-md p-1 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold tracking-tight">Who&apos;s buying?</h2>
                    <p className="text-xs text-muted-foreground">Search by customer name. One tap to select.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 sm:min-w-[190px]">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    aria-label="Sale date"
                    required
                    value={formData.businessDate}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        businessDate: e.target.value,
                      }))
                    }
                    className="h-7 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="p-5">
                {selectedCustomer ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                      {selectedCustomer.name.trim().slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-emerald-800/70 dark:text-emerald-300/70">Sale for</div>
                      <div className="truncate font-semibold text-foreground">{selectedCustomer.name}</div>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      <Check className="h-3.5 w-3.5" /> Selected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData((current) => ({ ...current, customerId: "" }));
                        setCustomerQuery("");
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        autoComplete="off"
                        placeholder="Type a customer name…"
                        value={customerQuery}
                        onChange={(e) => setCustomerQuery(e.target.value)}
                        disabled={loadingOptions}
                        className="h-12 rounded-xl pl-10 text-base"
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {(customerQuery.trim()
                        ? customerMatches.slice(0, 9)
                        : customerMatches.slice(0, 6)
                      ).map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setFormData((current) => ({
                              ...current,
                              customerId: customer.id,
                            }));
                            setCustomerQuery("");
                          }}
                          className="group flex min-h-[58px] items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition hover:border-emerald-500/50 hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-emerald-950/20"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
                            {customer.name.trim().slice(0, 1).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{customer.name}</span>
                          <Plus className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-emerald-700" />
                        </button>
                      ))}
                    </div>
                    {!loadingOptions && customerMatches.length === 0 && (
                      <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        No customer found for “{customerQuery}”. Check the name or add the customer from Customers first.
                      </p>
                    )}
                    {!customerQuery.trim() && customers.length > 6 && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Showing 6 customers to start. Type a name to search the full customer list.
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    <Package className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold tracking-tight">Pick fruit from live stock</h2>
                    <p className="text-xs text-muted-foreground">Tap a stock card to add one box. Tap again to add more.</p>
                  </div>
                </div>
                <div className="relative sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    autoComplete="off"
                    placeholder="Find fruit or lot…"
                    value={productQuery}
                    onChange={(e) => {
                      setProductQuery(e.target.value);
                      setShowAllProducts(false);
                    }}
                    disabled={loadingOptions}
                    className="h-10 rounded-xl pl-9"
                  />
                </div>
              </div>

              <div className="p-5">
                {loadingOptions ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="h-28 animate-pulse rounded-xl bg-muted/70" />
                    ))}
                  </div>
                ) : visibleProducts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {visibleProducts.map((product) => {
                        const quantityInSale = formData.items
                          .filter((item) => item.productId === product.id)
                          .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                        const isInSale = quantityInSale > 0;
                        const ProductActionIcon = isInSale ? Check : Plus;
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product)}
                            disabled={
                              typeof product.remainingBoxes === "number" &&
                              quantityInSale >= product.remainingBoxes
                            }
                            className="group relative flex min-h-[126px] flex-col rounded-xl border border-border bg-background p-3 text-left transition hover:-translate-y-0.5 hover:border-amber-500/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isInSale && (
                              <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                {quantityInSale}
                              </span>
                            )}
                            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                              <Package className="h-4 w-4" />
                            </span>
                            <span className="line-clamp-2 pr-3 text-sm font-semibold leading-5">{product.name}</span>
                            <span className="mt-1 text-xs text-muted-foreground">
                              {product.remainingBoxes ?? 0} boxes available
                            </span>
                            <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              <ProductActionIcon className="h-3.5 w-3.5" />
                              {isInSale ? "Add another" : "Add to sale"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {!productQuery.trim() && filteredProducts.length > 8 && (
                      <div className="mt-4 flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllProducts((current) => !current)}
                        >
                          {showAllProducts ? "Show fewer stock cards" : `View all ${filteredProducts.length} stock items`}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-4 py-9 text-center">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground/60" />
                    <p className="mt-3 font-medium">
                      {productQuery.trim() ? "No matching stock found" : "No boxes currently available"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {productQuery.trim()
                        ? "Try another fruit name or lot reference."
                        : "When stock is added, it will appear here ready to sell."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-semibold tracking-tight">Sale basket</h2>
                  <p className="text-xs text-muted-foreground">
                    Change box count and rate here. Totals update as you type.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                  {formData.items.filter((item) => item.productId).length} line
                  {formData.items.filter((item) => item.productId).length === 1 ? "" : "s"}
                </span>
              </div>

              {formData.items.some((item) => item.productId) ? (
                <div className="divide-y divide-border">
                  {formData.items.map((item, index) => {
                    if (!item.productId) return null;
                    const product = products.find((p) => p.id === item.productId);
                    const lineTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                    return (
                      <div key={item.productId + "-" + index} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_100px_130px_110px_36px] sm:items-center sm:gap-4 sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{product?.name ?? "Stock item"}</div>
                            <div className="text-xs text-muted-foreground">
                              {product?.remainingBoxes ?? "—"} boxes available
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Boxes</label>
                          <div className="flex h-10 items-center rounded-lg border border-input bg-background">
                            <button
                              type="button"
                              aria-label={`Remove one box of ${product?.name ?? "stock"}`}
                              disabled={item.quantity <= 1}
                              onClick={() => handleItemChange(index, "quantity", Math.max(1, item.quantity - 1))}
                              className="flex h-full w-9 items-center justify-center rounded-l-lg text-muted-foreground transition hover:bg-muted disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <Input
                              type="number"
                              min="1"
                              max={product?.remainingBoxes}
                              required
                              aria-label={`Box quantity for ${product?.name ?? "stock"}`}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                              className="h-full min-w-0 border-0 px-0 text-center text-sm font-semibold shadow-none focus-visible:ring-0"
                            />
                            <button
                              type="button"
                              aria-label={`Add one box of ${product?.name ?? "stock"}`}
                              disabled={typeof product?.remainingBoxes === "number" && item.quantity >= product.remainingBoxes}
                              onClick={() => handleItemChange(index, "quantity", Math.min(item.quantity + 1, product?.remainingBoxes ?? item.quantity + 1))}
                              className="flex h-full w-9 items-center justify-center rounded-r-lg text-muted-foreground transition hover:bg-muted disabled:opacity-30"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rate / box (₹)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            aria-label={`Rate per box for ${product?.name ?? "stock"}`}
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, "rate", Number(e.target.value))}
                            className="h-10 font-semibold"
                          />
                        </div>

                        <div className="sm:text-right">
                          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Line total</div>
                          <div className="mt-1 font-semibold tabular-nums">₹{lineTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${product?.name ?? "stock"} from sale`}
                          onClick={() => removeItem(index)}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-9 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                  </span>
                  <p className="mt-3 font-semibold">Your basket is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">Tap a stock card above to add boxes. No product dropdown required.</p>
                </div>
              )}

              <div className="flex flex-col gap-2 border-t border-border bg-muted/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">Discount (optional)</span>
                <div className="flex items-center gap-2 sm:w-48">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    aria-label="Discount amount"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        discount: Number(e.target.value),
                      }))
                    }
                    className="h-10 bg-background text-right font-semibold"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-24">
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold tracking-tight">Payment received</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tap Cash, UPI or a bank account. The balance stays on credit.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 xl:grid-cols-2">
                {accounts.map((account) => {
                  const AccountIcon = accountIcon(account.type);
                  const chosen = formData.payments.some(
                    (payment) => payment.accountId === account.id,
                  );
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => choosePaymentAccount(account)}
                      aria-pressed={chosen}
                      className={`relative flex min-h-[84px] flex-col items-start justify-between rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${chosen ? "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600/20 dark:border-emerald-700 dark:bg-emerald-950/30" : "border-border bg-background hover:border-emerald-500/50 hover:bg-muted/30"}`}
                    >
                      {chosen && (
                        <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
                      )}
                      <AccountIcon className={`h-4 w-4 ${chosen ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`} />
                      <span className="mt-3 w-full truncate text-sm font-semibold">{account.name}</span>
                      <span className="text-[11px] text-muted-foreground">{paymentLabel(account.type)}</span>
                    </button>
                  );
                })}
              </div>

              {accounts.length === 0 && (
                <div className="px-5 pb-4 text-sm text-muted-foreground">
                  No payment accounts were returned. You can still save this sale on credit.
                </div>
              )}

              <div className="mx-4 mb-4 rounded-xl border border-dashed border-border p-3">
                <button
                  type="button"
                  onClick={recordOnCredit}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg p-2 text-left transition ${activePayments.length === 0 ? "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200" : "hover:bg-muted/60"}`}
                  aria-pressed={activePayments.length === 0}
                >
                  <span>
                    <span className="block text-sm font-semibold">Full credit / no payment</span>
                    <span className="block text-xs opacity-75">Record now, collect later</span>
                  </span>
                  {activePayments.length === 0 && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </div>

              {activePayments.length > 0 && (
                <div className="border-t border-border px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount received</span>
                    <span className="text-xs text-muted-foreground">Edit split below</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {formData.payments.map((payment, index) => {
                      if (!payment.accountId) return null;
                      const account = accounts.find((item) => item.id === payment.accountId);
                      return (
                        <div key={payment.accountId} className="rounded-xl border border-border bg-background p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="min-w-0 truncate text-sm font-medium">{account?.name ?? "Payment account"}</span>
                            <button
                              type="button"
                              aria-label={`Remove payment from ${account?.name ?? "account"}`}
                              onClick={() => removePayment(index)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">₹</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              aria-label={`Amount received to ${account?.name ?? "account"}`}
                              value={payment.amount}
                              onChange={(e) => handlePaymentAmount(index, Number(e.target.value))}
                              className="h-10 text-right font-semibold"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-border p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note (optional)</label>
                <Input
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((current) => ({ ...current, notes: e.target.value }))
                  }
                  placeholder="e.g. delivery, quality or buyer note"
                  className="h-10"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold tracking-tight">Sale summary</h2>
                <span className="rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {selectedBoxes} box{selectedBoxes === 1 ? "" : "es"}
                </span>
              </div>

              <div className="flex items-end justify-between gap-3">
                <span className="text-sm text-muted-foreground">Amount to collect</span>
                <span className="text-3xl font-bold tracking-tight tabular-nums">
                  ₹{saleTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Items subtotal</span>
                  <span className="font-medium tabular-nums">₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium tabular-nums">− ₹{(Number(formData.discount) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Received</span>
                  <span className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">₹{received.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2.5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  <span className="font-medium">Remaining on credit</span>
                  <span className="font-bold tabular-nums">₹{credit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-5 hidden w-full font-semibold xl:flex"
                disabled={loading || loadingOptions}
              >
                {queuedOffline ? "Saved offline ✓" : loading ? "Saving sale…" : "Save sale"}
                {!loading && !queuedOffline && <Check className="ml-2 h-4 w-4" />}
              </Button>
              <p className="mt-3 hidden text-center text-[11px] leading-5 text-muted-foreground xl:block">
                Stock and payment entries are recorded together. You can review the sale after saving.
              </p>
            </section>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur xl:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-muted-foreground">Sale total</div>
              <div className="truncate text-xl font-bold tabular-nums">
                ₹{saleTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Credit ₹{credit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
            </div>
            <Button type="submit" size="lg" disabled={loading || loadingOptions} className="min-w-[150px] font-semibold">
              {queuedOffline ? "Saved offline ✓" : loading ? "Saving…" : "Save sale"}
              {!loading && !queuedOffline && <Check className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
