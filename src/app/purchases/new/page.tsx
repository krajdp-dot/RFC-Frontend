"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/fetchApi";
import { todayBusinessDate } from "@/lib/businessDate";
import { QuickPick } from "@/components/shared/QuickPick";

type Option = {
  id: string;
  name: string;
  type?: string;
};

type Item = {
  productId: string;
  quantityBoxes: number;
  ratePerUnit: number;
  unit: string;
};

type Payment = {
  accountId: string;
  amount: number;
};

// Same reasoning as the sales form: the account chosen already tells us
// the real payment method, so there's no separate selector to forget to
// wire up (and no way for it to say CASH while the money actually landed
// in the bank account).
function methodForAccountType(type: string | undefined): string {
  if (type === "BANK") return "BANK_TRANSFER";
  if (type === "DIGITAL") return "UPI";
  return "CASH";
}

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.items)) return value.data.items;
  return [];
}

export default function NewPurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillSupplierId = searchParams.get("supplierId") || "";

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [accounts, setAccounts] = useState<Option[]>([]);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    supplierId: prefillSupplierId,
    businessDate: todayBusinessDate(),
    items: [
      {
        productId: "",
        quantityBoxes: 1,
        ratePerUnit: 0,
        unit: "BOX",
      },
    ] as Item[],
    transport: 0,
    loading: 0,
    unloading: 0,
    otherCosts: 0,
    payments: [
      {
        accountId: "",
        amount: 0,
      },
    ] as Payment[],
    notes: "",
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError("");

        const [suppliersData, productsData, accountsData] = await Promise.all([
          fetchApi("/suppliers"),
          fetchApi("/products"),
          fetchApi("/accounts"),
        ]);

        setSuppliers(toArray(suppliersData));
        setProducts(toArray(productsData));
        setAccounts(toArray(accountsData));
      } catch (err) {
        console.error("Failed to load purchase options:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load purchase options"
        );

        setSuppliers([]);
        setProducts([]);
        setAccounts([]);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const items = [...formData.items];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      items,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: "",
          quantityBoxes: 1,
          ratePerUnit: 0,
          unit: "BOX",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;

    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handlePaymentChange = (
    index: number,
    field: keyof Payment,
    value: string | number
  ) => {
    const payments = [...formData.payments];
    payments[index] = { ...payments[index], [field]: value };
    setFormData({ ...formData, payments });
  };

  const addPayment = () => {
    setFormData({
      ...formData,
      payments: [...formData.payments, { accountId: "", amount: 0 }],
    });
  };

  const removePayment = (index: number) => {
    if (formData.payments.length <= 1) return;
    setFormData({
      ...formData,
      payments: formData.payments.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        transport: formData.transport ? String(formData.transport) : undefined,
        loading: formData.loading ? String(formData.loading) : undefined,
        unloading: formData.unloading ? String(formData.unloading) : undefined,
        otherCosts: formData.otherCosts ? String(formData.otherCosts) : undefined,
        items: formData.items.map(i => ({
          ...i,
          ratePerUnit: String(i.ratePerUnit || 0)
        })),
        payments: formData.payments
          .filter(p => p.amount > 0 && p.accountId)
          .map(p => ({
            accountId: p.accountId,
            amount: String(p.amount),
            method: methodForAccountType(accounts.find(a => a.id === p.accountId)?.type),
          })),
        idempotencyKey
      };

      if (!payload.payments || payload.payments.length === 0) {
        payload.payments = [];
      }

      await fetchApi("/purchases", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/purchases");
      router.refresh();
    } catch (err) {
      console.error("Failed to create purchase:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create purchase"
      );

      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-1 pb-8">
      <PageHeader
        title="New Purchase"
        subtitle="Record an incoming purchase from a supplier."
        primaryAction={{
          label: "Cancel",
          icon: ArrowLeft,
          href: "/purchases",
        }}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {loadingOptions && (
        <div className="bg-muted/30 border rounded-xl p-4 text-sm text-muted-foreground">
          Loading suppliers, products and accounts...
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-lg">General Info</h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(240px,1fr)]">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Supplier</label>

              <QuickPick
                value={formData.supplierId}
                onChange={(supplierId) => setFormData({ ...formData, supplierId })}
                options={suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.name,
                  icon: undefined,
                }))}
                mode="list"
                maxVisible={4}
                placeholder="Search suppliers…"
                emptyText="No suppliers found."
                disabled={loadingOptions}
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Date</label>

              <Input
                type="date"
                required
                value={formData.businessDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessDate: e.target.value,
                  })
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
              <div className="min-w-0 flex-1">
                <QuickPick
                  value={item.productId}
                  onChange={(productId) => handleItemChange(index, "productId", productId)}
                  options={products.map((product) => ({ value: product.id, label: product.name }))}
                  mode="list"
                  maxVisible={4}
                  placeholder="Search fruit or product…"
                  searchPlaceholder="Find fruit / product…"
                  emptyText="No products found."
                  className="min-w-0"
                />
              </div>

              <NumberInput
                min="1"
                required
                placeholder="Qty"
                className="w-24"
                value={item.quantityBoxes}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "quantityBoxes",
                    Number(e.target.value)
                  )
                }
              />

              <NumberInput
                min="0"
                step="0.01"
                required
                placeholder="Rate"
                className="w-24"
                value={item.ratePerUnit}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "ratePerUnit",
                    Number(e.target.value)
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
        </div>

        <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Additional Costs</h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Transport</label>
              <NumberInput
                min="0"
                value={formData.transport}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transport: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Loading</label>
              <NumberInput
                min="0"
                value={formData.loading}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    loading: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Unloading</label>
              <NumberInput
                min="0"
                value={formData.unloading}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unloading: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Other</label>
              <NumberInput
                min="0"
                value={formData.otherCosts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otherCosts: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Payment</h2>
            <Button type="button" variant="outline" size="sm" onClick={addPayment}>
              <Plus className="w-4 h-4 mr-1" />
              Split Payment
            </Button>
          </div>

          {formData.payments.map((payment, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <QuickPick
                  value={payment.accountId}
                  onChange={(accountId) => handlePaymentChange(index, "accountId", accountId)}
                  options={[
                    { value: "", label: "Credit / no payment", detail: "Leave outstanding" },
                    ...accounts.map((account) => ({
                      value: account.id,
                      label: account.name,
                      detail: account.type || "Payment account",
                    })),
                  ]}
                  mode="segments"
                  maxVisible={6}
                  placeholder="Search accounts…"
                  emptyText="No payment accounts found."
                />
              </div>

              <NumberInput
                min="0"
                step="0.01"
                placeholder="Amount Paid"
                className="w-32"
                value={payment.amount}
                onChange={(e) => handlePaymentChange(index, "amount", Number(e.target.value))}
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
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full font-semibold"
          disabled={loading || loadingOptions}
        >
          {loading ? "Creating..." : "Create Purchase"}
        </Button>
      </form>
    </div>
  );
}
