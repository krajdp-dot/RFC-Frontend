"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchApi } from "@/lib/fetchApi";
import { Pagination, PaginationMeta } from "@/components/shared/Pagination";

type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  businessName?: string | null;
  active?: boolean;
};

type SupplierForm = {
  name: string;
  phone: string;
  address: string;
  businessName: string;
  paymentTermsDays: string;
  notes: string;
};

const emptyForm: SupplierForm = {
  name: "",
  phone: "",
  address: "",
  businessName: "",
  paymentTermsDays: "",
  notes: "",
};

export default function SuppliersPage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  async function loadSuppliers() {
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

      const response = await fetchApi(`/suppliers?${params.toString()}`);

      if (response && response.data) {
        setSuppliers(response.data);
        setMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        setSuppliers(response);
        setMeta(null);
      } else {
        setSuppliers([]);
        setMeta(null);
      }
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      setError(err instanceof Error ? err.message : "Failed to load suppliers");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, [debouncedSearch, page]);

  function updateForm(field: keyof SupplierForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createSupplier() {
    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
      };

      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.businessName.trim()) payload.businessName = form.businessName.trim();
      if (form.paymentTermsDays.trim()) payload.paymentTermsDays = Number(form.paymentTermsDays);
      if (form.notes.trim()) payload.notes = form.notes.trim();

      await fetchApi("/suppliers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setForm(emptyForm);
      setShowAddDialog(false);
      await loadSuppliers();
    } catch (err) {
      console.error("Failed to create supplier:", err);
      setError(err instanceof Error ? err.message : "Failed to create supplier");
    } finally {
      setSaving(false);
    }
  }

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.active !== false).length;

  const metrics = [
    { label: "Suppliers", value: String(meta?.total || totalSuppliers) },
    { label: "Active", value: String(activeSuppliers), subtext: "Current Page" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage supplier relationships and purchases."
        primaryAction={{
          label: "Add Supplier",
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
            Supplier List
          </h2>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search suppliers..."
            className="h-9 w-64 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {loading && (
          <div className="p-8 text-center text-muted-foreground">Loading suppliers...</div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
            <button type="button" onClick={loadSuppliers} className="mt-3 underline">Try again</button>
          </div>
        )}

        {!loading && !error && suppliers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No suppliers found.</p>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setShowAddDialog(true);
              }}
              className="mt-3 underline"
            >
              Add your first supplier
            </button>
          </div>
        )}

        {!loading && !error && suppliers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Supplier</th>
                  <th className="px-6 py-3 text-left font-medium">Phone</th>
                  <th className="px-6 py-3 text-left font-medium">Business</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    onClick={() => router.push(`/suppliers/${supplier.id}`)}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">{supplier.name}</td>
                    <td className="px-6 py-4">{supplier.phone || "—"}</td>
                    <td className="px-6 py-4">{supplier.businessName || "—"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        label={supplier.active === false ? "Inactive" : "Active"}
                        variant={supplier.active === false ? "error" : "success"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && suppliers.length > 0 && !loading && !error && (
          <Pagination meta={meta} onPageChange={setPage} />
        )}
      </div>

      {showAddDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddDialog(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Add Supplier</h2>
                <p className="text-sm text-muted-foreground">Create a new supplier account.</p>
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
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="Suresh Kumar"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                  placeholder="+919876543211"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Business Name</label>
                <input
                  value={form.businessName}
                  onChange={(event) => updateForm("businessName", event.target.value)}
                  placeholder="Suresh Farms"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Payment Terms (Days)</label>
                <input
                  type="number"
                  min="0"
                  value={form.paymentTermsDays}
                  onChange={(event) => updateForm("paymentTermsDays", event.target.value)}
                  placeholder="30"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Address</label>
                <input
                  value={form.address}
                  onChange={(event) => updateForm("address", event.target.value)}
                  placeholder="456 Farm Road"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Reliable grape supplier..."
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
                onClick={createSupplier}
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
