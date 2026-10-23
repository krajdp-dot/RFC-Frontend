"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { fetchApi } from "@/lib/fetchApi";
import { AddProductModal } from "@/components/inventory/AddProductModal";
import { PERMISSIONS } from "@/lib/permissions";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const { can } = useAuth();

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetchApi("/products?limit=200&isActive=true");
      setProducts(Array.isArray(res) ? res : res?.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openEdit(product: any) {
    setEditing(product);
    setForm({
      name: product.name || "",
      category: product.category || "",
      reorderThreshold: product.reorderThreshold ?? "",
      reorderQty: product.reorderQty ?? "",
      defaultMarkupPct: product.defaultMarkupPct ?? "",
      minMarginPct: product.minMarginPct ?? "",
      shelfLifeDays: product.shelfLifeDays ?? "",
    });
    setFormError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !editing) return;
    setSubmitting(true);
    setFormError("");
    try {
      await fetchApi(`/products/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.name,
          category: form.category || undefined,
          reorderThreshold: form.reorderThreshold !== "" ? Number(form.reorderThreshold) : undefined,
          reorderQty: form.reorderQty !== "" ? Number(form.reorderQty) : undefined,
          defaultMarkupPct: form.defaultMarkupPct !== "" ? Number(form.defaultMarkupPct) : undefined,
          minMarginPct: form.minMarginPct !== "" ? Number(form.minMarginPct) : undefined,
          shelfLifeDays: form.shelfLifeDays !== "" ? Number(form.shelfLifeDays) : undefined,
        }),
      });
      setEditing(null);
      await loadProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProduct(product: any) {
    if (!window.confirm(`Remove "${product.name}" from the active product catalogue?\\n\\nPast sales, purchases, stock movements and reports will be preserved. This is an archive, not a permanent erasure.`)) return;
    setDeletingProductId(product.id);
    setError("");
    try {
      await fetchApi(`/products/${encodeURIComponent(product.id)}`, {
        method: "DELETE",
        body: JSON.stringify({ reason: "Product removed from active catalogue by owner" }),
      });
      await loadProducts();
    } catch (err: any) {
      setError(err.message || "Failed to remove product");
    } finally {
      setDeletingProductId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-5 w-full max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Products"
        subtitle="Configure reorder points, margins, and shelf life per product."
        primaryAction={{ label: "Add Product", onClick: () => setShowAdd(true), permission: PERMISSIONS.PRODUCTS_EDIT }}
      />

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {loading && <div className="p-8 text-center text-muted-foreground">Loading products...</div>}
        {!loading && error && (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
            <button type="button" onClick={loadProducts} className="mt-3 underline">Try again</button>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No products yet.</div>
        )}
        {!loading && !error && products.length > 0 && (
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-semibold text-muted-foreground bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Reorder At</th>
                <th className="px-4 py-3 font-medium text-right">Reorder Qty</th>
                <th className="px-4 py-3 font-medium text-right">Markup %</th>
                <th className="px-4 py-3 font-medium text-right">Min Margin %</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.reorderThreshold != null ? p.reorderThreshold : (
                      <span className="text-amber-600 text-xs">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.reorderQty ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.defaultMarkupPct != null ? `${p.defaultMarkupPct}%` : "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.minMarginPct != null ? `${p.minMarginPct}%` : "—"}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                    {true && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={deletingProductId === p.id}
                        onClick={() => handleDeleteProduct(p)}
                        aria-label={`Remove product ${p.name}`}
                        title="Remove product from active catalogue"
                      >
                        <Trash2 className={`h-4 w-4 ${deletingProductId === p.id ? "opacity-50" : ""}`} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Products without a reorder point configured are never flagged as low
        stock on the dashboard — set one here for anything you want tracked.
      </p>

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            loadProducts();
          }}
        />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editing?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Reorder Threshold (boxes)</label>
                <NumberInput min="0"
                  value={form.reorderThreshold}
                  onChange={(e) => setForm({ ...form, reorderThreshold: e.target.value })}
                  placeholder="e.g. 50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Reorder Qty (boxes)</label>
                <NumberInput min="0"
                  value={form.reorderQty}
                  onChange={(e) => setForm({ ...form, reorderQty: e.target.value })}
                  placeholder="e.g. 200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Default Markup %</label>
                <NumberInput min="0" step="0.1"
                  value={form.defaultMarkupPct}
                  onChange={(e) => setForm({ ...form, defaultMarkupPct: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Min Margin %</label>
                <NumberInput min="0" step="0.1"
                  value={form.minMarginPct}
                  onChange={(e) => setForm({ ...form, minMarginPct: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Shelf Life (days)</label>
              <NumberInput min="0"
                value={form.shelfLifeDays}
                onChange={(e) => setForm({ ...form, shelfLifeDays: e.target.value })}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
