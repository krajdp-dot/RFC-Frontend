"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/fetchApi";

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
  method: string;
};

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.items)) return value.data.items;
  return [];
}

export default function NewPurchasePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [accounts, setAccounts] = useState<Option[]>([]);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    supplierId: "",
    businessDate: new Date().toISOString().split("T")[0],
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
        method: "CASH",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          ratePerUnit: String(i.ratePerUnit)
        })),
        payments: formData.payments.filter(p => p.amount > 0 && p.accountId).map(p => ({
          ...p,
          amount: String(p.amount)
        }))
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
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
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
        <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-lg">General Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Supplier</label>

              <select
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplierId: e.target.value,
                  })
                }
              >
                <option value="">Select Supplier</option>

                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
              <select
                required
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={item.productId}
                onChange={(e) =>
                  handleItemChange(index, "productId", e.target.value)
                }
              >
                <option value="">Select Product</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>

              <Input
                type="number"
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

              <Input
                type="number"
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

          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Transport</label>
              <Input
                type="number"
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
              <Input
                type="number"
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
              <Input
                type="number"
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
              <Input
                type="number"
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
          <h2 className="font-semibold text-lg">Payment</h2>

          <div className="flex items-center gap-4">
            <select
              className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.payments[0].accountId}
              onChange={(e) => {
                const payments = [...formData.payments];

                payments[0] = {
                  ...payments[0],
                  accountId: e.target.value,
                };

                setFormData({
                  ...formData,
                  payments,
                });
              }}
            >
              <option value="">
                No Payment (Credit) / Select Account
              </option>

              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.type ? ` (${account.type})` : ""}
                </option>
              ))}
            </select>

            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount Paid"
              className="w-32"
              value={formData.payments[0].amount}
              onChange={(e) => {
                const payments = [...formData.payments];

                payments[0] = {
                  ...payments[0],
                  amount: Number(e.target.value),
                };

                setFormData({
                  ...formData,
                  payments,
                });
              }}
            />
          </div>
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
