"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchApi } from "@/lib/fetchApi";
import { Pagination, PaginationMeta } from "@/components/shared/Pagination";

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  businessName?: string | null;
  creditLimit?: string | number | null;
  creditTermsDays?: number | null;
  notes?: string | null;
  active?: boolean;
};

type CustomerForm = {
  name: string;
  phone: string;
  address: string;
  businessName: string;
  creditLimit: string;
  creditTermsDays: string;
  notes: string;
};

const emptyForm: CustomerForm = {
  name: "",
  phone: "",
  address: "",
  businessName: "",
  creditLimit: "",
  creditTermsDays: "",
  notes: "",
};

function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        activeOnly: "false",
      });

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const response = await fetchApi(`/customers?${params.toString()}`);

      if (response && response.data) {
        setCustomers(response.data);
        setMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        setCustomers(response);
        setMeta(null);
      } else {
        setCustomers([]);
        setMeta(null);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load customers"
      );

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [debouncedSearch, page]);

  function updateForm(
    field: keyof CustomerForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createCustomer() {
    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
      };

      if (form.phone.trim()) {
        payload.phone = form.phone.trim();
      }

      if (form.address.trim()) {
        payload.address = form.address.trim();
      }

      if (form.businessName.trim()) {
        payload.businessName = form.businessName.trim();
      }

      if (form.creditLimit.trim()) {
        payload.creditLimit = form.creditLimit.trim();
      }

      if (form.creditTermsDays.trim()) {
        payload.creditTermsDays = Number(form.creditTermsDays);
      }

      if (form.notes.trim()) {
        payload.notes = form.notes.trim();
      }

      await fetchApi("/customers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setForm(emptyForm);
      setShowAddDialog(false);

      await loadCustomers();
    } catch (err) {
      console.error("Failed to create customer:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create customer"
      );
    } finally {
      setSaving(false);
    }
  }

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.active !== false
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.active === false
  ).length;

  const withCreditLimit = customers.filter(
    (customer) =>
      customer.creditLimit !== null &&
      customer.creditLimit !== undefined &&
      Number(customer.creditLimit) > 0
  ).length;

  const metrics = [
    {
      label: "Customers",
      value: String(totalCustomers),
    },
    {
      label: "Active",
      value: String(activeCustomers),
      subtext: "Current",
    },
    {
      label: "Inactive",
      value: String(inactiveCustomers),
    },
    {
      label: "With Credit",
      value: String(withCreditLimit),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage customer relationships, credit and collections."
        primaryAction={{
          label: "Add Customer",
          onClick: () => {
            setError("");
            setForm(emptyForm);
            setShowAddDialog(true);
          },
        }}
      />

      <MetricStrip metrics={metrics} />

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between gap-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            Customer List
          </h2>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers..."
            className="h-9 w-64 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {loading && (
          <div className="p-8 text-center text-muted-foreground">
            Loading customers...
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>

            <button
              type="button"
              onClick={loadCustomers}
              className="mt-3 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && customers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No customers found.</p>

            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setShowAddDialog(true);
              }}
              className="mt-3 underline"
            >
              Add your first customer
            </button>
          </div>
        )}

        {!loading && !error && customers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-left font-medium">
                    Phone
                  </th>

                  <th className="px-6 py-3 text-left font-medium">
                    Business
                  </th>

                  <th className="px-6 py-3 text-right font-medium">
                    Credit Limit
                  </th>

                  <th className="px-6 py-3 text-right font-medium">
                    Credit Terms
                  </th>

                  <th className="px-6 py-3 text-left font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() =>
                      router.push(`/customers/${customer.id}`)
                    }
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      {customer.name}
                    </td>

                    <td className="px-6 py-4">
                      {customer.phone || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {customer.businessName || "—"}
                    </td>

                    <td className="px-6 py-4 text-right tabular-nums">
                      {formatCurrency(customer.creditLimit)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {customer.creditTermsDays != null
                        ? `${customer.creditTermsDays} days`
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        label={
                          customer.active === false
                            ? "Inactive"
                            : "Active"
                        }
                        variant={
                          customer.active === false
                            ? "error"
                            : "success"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && customers.length > 0 && !loading && !error && (
          <Pagination meta={meta} onPageChange={setPage} />
        )}
      </div>

      {showAddDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddDialog(false);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Add Customer
                </h2>

                <p className="text-sm text-muted-foreground">
                  Create a new customer account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddDialog(false)}
                className="text-xl text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Name *
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  placeholder="Ramesh Singh"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone
                </label>

                <input
                  value={form.phone}
                  onChange={(event) =>
                    updateForm("phone", event.target.value)
                  }
                  placeholder="+919876543210"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Business Name
                </label>

                <input
                  value={form.businessName}
                  onChange={(event) =>
                    updateForm("businessName", event.target.value)
                  }
                  placeholder="Ramesh Trading Co."
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Credit Limit
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.creditLimit}
                  onChange={(event) =>
                    updateForm("creditLimit", event.target.value)
                  }
                  placeholder="50000"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Credit Terms
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.creditTermsDays}
                  onChange={(event) =>
                    updateForm(
                      "creditTermsDays",
                      event.target.value
                    )
                  }
                  placeholder="15"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Address
                </label>

                <input
                  value={form.address}
                  onChange={(event) =>
                    updateForm("address", event.target.value)
                  }
                  placeholder="123 Market Road"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    updateForm("notes", event.target.value)
                  }
                  placeholder="VIP customer..."
                  rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => setShowAddDialog(false)}
                disabled={saving}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createCustomer}
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}