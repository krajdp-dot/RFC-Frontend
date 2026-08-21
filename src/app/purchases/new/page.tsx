"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function NewPurchasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    supplierId: "",
    businessDate: new Date().toISOString().split("T")[0],
    items: [{ productId: "", quantityBoxes: 1, ratePerUnit: 0, unit: "BOX" }],
    transport: 0,
    loading: 0,
    unloading: 0,
    otherCosts: 0,
    payments: [{ accountId: "", amount: 0, method: "CASH" }],
    notes: ""
  });

  useEffect(() => {
    // Fetch options
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    Promise.all([
      fetch(`${baseUrl}/api/v1/suppliers`).then(r => r.json()),
      fetch(`${baseUrl}/api/v1/products`).then(r => r.json()),
      fetch(`${baseUrl}/api/v1/accounts`).then(r => r.json())
    ]).then(([s, p, a]) => {
      setSuppliers(s.data || s || []);
      setProducts(p.data || p || []);
      setAccounts(a.data || a || []);
    }).catch(err => {
      console.error("Failed to load dependencies", err);
    });
  }, []);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", quantityBoxes: 1, ratePerUnit: 0, unit: "BOX" }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      const res = await fetch(`${baseUrl}/api/v1/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      
      router.push("/purchases");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
      <PageHeader 
        title="New Purchase" 
        subtitle="Record an incoming purchase from a supplier." 
        primaryAction={{ label: "Cancel", icon: ArrowLeft, href: "/purchases" }}
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
              <label className="text-sm font-medium">Supplier</label>
              <select 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.supplierId}
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Date</label>
              <Input 
                type="date" 
                required
                value={formData.businessDate}
                onChange={e => setFormData({ ...formData, businessDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Items</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>
          
          {formData.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
              <select 
                required
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={item.productId}
                onChange={e => handleItemChange(i, 'productId', e.target.value)}
              >
                <option value="">Select Product</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <Input 
                type="number" 
                min="1" 
                placeholder="Qty (Boxes)" 
                className="w-24"
                required
                value={item.quantityBoxes}
                onChange={e => handleItemChange(i, 'quantityBoxes', Number(e.target.value))}
              />
              <Input 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="Rate" 
                className="w-24"
                required
                value={item.ratePerUnit}
                onChange={e => handleItemChange(i, 'ratePerUnit', Number(e.target.value))}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={formData.items.length === 1}>
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
              <Input type="number" value={formData.transport} onChange={e => setFormData({ ...formData, transport: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Loading</label>
              <Input type="number" value={formData.loading} onChange={e => setFormData({ ...formData, loading: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Unloading</label>
              <Input type="number" value={formData.unloading} onChange={e => setFormData({ ...formData, unloading: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Other</label>
              <Input type="number" value={formData.otherCosts} onChange={e => setFormData({ ...formData, otherCosts: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Payment</h2>
          <div className="flex items-center gap-4">
            <select 
              className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.payments[0].accountId}
              onChange={e => {
                const newP = [...formData.payments];
                newP[0].accountId = e.target.value;
                setFormData({ ...formData, payments: newP });
              }}
            >
              <option value="">No Payment (Credit) / Select Account</option>
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
              ))}
            </select>
            <Input 
              type="number" 
              min="0" 
              step="0.01"
              placeholder="Amount Paid" 
              className="w-32"
              value={formData.payments[0].amount}
              onChange={e => {
                const newP = [...formData.payments];
                newP[0].amount = Number(e.target.value);
                setFormData({ ...formData, payments: newP });
              }}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
          {loading ? "Creating..." : "Create Purchase"}
        </Button>
      </form>
    </div>
  );
}
