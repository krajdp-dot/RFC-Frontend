"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/fetchApi';

interface AddProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductModal({ onClose, onSuccess }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [variety, setVariety] = useState('');
  const [primaryUnit, setPrimaryUnit] = useState('BOX');
  const [defaultBoxWeightKg, setDefaultBoxWeightKg] = useState('');
  const [shelfLifeDays, setShelfLifeDays] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          category: category || undefined,
          variety: variety || undefined,
          primaryUnit,
          defaultBoxWeightKg: defaultBoxWeightKg ? Number(defaultBoxWeightKg) : undefined,
          shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : undefined,
          status: 'ACTIVE'
        }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-xl border shadow-lg flex flex-col max-h-[90vh]">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Product</h2>
          <p className="text-sm text-muted-foreground mt-1">Create a new product in the catalog.</p>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <form id="add-product-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name <span className="text-destructive">*</span></label>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Apple"
                className="w-full p-2 bg-background border rounded-lg text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Fruits"
                  className="w-full p-2 bg-background border rounded-lg text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Variety</label>
                <input 
                  type="text" 
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  placeholder="e.g. Fuji"
                  className="w-full p-2 bg-background border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Unit <span className="text-destructive">*</span></label>
                <select 
                  required
                  value={primaryUnit}
                  onChange={e => setPrimaryUnit(e.target.value)}
                  className="w-full p-2 bg-background border rounded-lg text-sm"
                >
                  <option value="BOX">BOX</option>
                  <option value="KG">KG</option>
                  <option value="PIECE">PIECE</option>
                  <option value="CRATE">CRATE</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Box Weight (Kg)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={defaultBoxWeightKg}
                  onChange={e => setDefaultBoxWeightKg(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full p-2 bg-background border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Shelf Life (Days)</label>
              <input 
                type="number" 
                min="0"
                value={shelfLifeDays}
                onChange={e => setShelfLifeDays(e.target.value)}
                placeholder="e.g. 15"
                className="w-full p-2 bg-background border rounded-lg text-sm"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-muted/20 flex items-center justify-end gap-3 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="add-product-form" disabled={loading || !name}>
            {loading ? 'Saving...' : 'Add Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}
