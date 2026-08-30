"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/fetchApi";

type Customer = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
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
  method: string;
};

export default function NewSalePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
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
        method: "CASH",
      },
    ] as Payment[],
    notes: "",
  });

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      try {
        const [customersResponse, productsResponse, accountsResponse] =
          await Promise.all([
            fetchApi("/customers"),
            fetchApi("/products"),
            fetchApi("/accounts"),
          ]);

        const getArray = (response: any) => {
          if (Array.isArray(response)) return response;
          if (Array.isArray(response?.data)) return response.data;
          if (Array.isArray(response?.items)) return response.items;
          return [];
        };

        setCustomers(getArray(customersResponse));
        setProducts(getArray(productsResponse));
        setAccounts(getArray(accountsResponse));
      } catch (err) {
        console.error("Failed to load sale dependencies:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load sale dependencies",
        );
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
    field: keyof Payment,
    value: string | number,
  ) {
    setFormData((current) => {
      const payments = [...current.payments];

      payments[0] = {
        ...payments[0],
        [field]: value,
      };

      return {
        ...current,
        payments,
      };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const payload = {
        customerId: formData.customerId,
        businessDate: formData.businessDate,
        items: formData.items.map(i => ({
          ...i,
          rate: String(i.rate)
        })),
        discount: formData.discount ? String(formData.discount) : undefined,
        payments: formData.payments.filter(
          (payment) => payment.accountId && payment.amount > 0,
        ).map(p => ({
          ...p,
          amount: String(p.amount)
        })),
        notes: formData.notes,
      };

      if (!payload.payments || payload.payments.length === 0) {
        payload.payments = [];
      }

      await fetchApi("/sales", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/sales");
      router.refresh();
    } catch (err) {
      console.error("Failed to create sale:", err);

      setError(
        err instanceof Error ? err.message : "Failed to create sale",
      );

      setLoading(false);
    }
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
                    {product.name}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                min="1"
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
          <h2 className="font-semibold text-lg">Payment Received</h2>

          <div className="flex items-center gap-4">
            <select
              className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.payments[0].accountId}
              onChange={(e) =>
                handlePaymentChange("accountId", e.target.value)
              }
            >
              <option value="">
                No Payment (Credit) / Select Account
              </option>

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
              placeholder="Amount Received"
              className="w-36"
              value={formData.payments[0].amount}
              onChange={(e) =>
                handlePaymentChange(
                  "amount",
                  Number(e.target.value),
                )
              }
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full font-semibold"
          disabled={loading || loadingOptions}
        >
          {loading ? "Creating..." : "Create Sale"}
        </Button>
      </form>
    </div>
  );
}