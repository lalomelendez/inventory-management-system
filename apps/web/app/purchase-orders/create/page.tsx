"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Supplier, Product } from "@repo/db";
import { proxyApi } from "../../actions/api";

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: string; unitPrice: string }[]>([
    { productId: "", quantity: "1", unitPrice: "0" }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supData, prodData] = await Promise.all([
          proxyApi("/suppliers"),
          proxyApi("/products"),
        ]);

        setSuppliers(supData);
        if (supData.length > 0) setSelectedSupplierId(supData[0].id);
        
        setProducts(prodData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { productId: products[0]?.id || "", quantity: "1", unitPrice: "0" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[key] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await proxyApi("/purchase-orders", {
        method: "POST",
        body: {
          supplierId: selectedSupplierId,
          items: items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity, 10),
            unitPrice: parseFloat(item.unitPrice),
          })),
        },
      });

      router.push("/purchase-orders");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans">
      <main className="max-w-3xl mx-auto space-y-8 py-12">
        <header className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
          <p className="text-zinc-400">Draft a new request for materials from a supplier.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-900">
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Header Info</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Target Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all appearance-none"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Line Items</h2>
              <button 
                type="button" 
                onClick={addItem}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300 transition-colors"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end bg-zinc-950/30 p-4 rounded-xl border border-zinc-900/50">
                  <div className="col-span-12 sm:col-span-5 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
                    >
                      <option value="" disabled>Select Product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-6 sm:col-span-3 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-2"
                      disabled={items.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="text-sm text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-zinc-50 text-zinc-950 font-bold py-4 rounded-xl hover:bg-white transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Saving Draft..." : "Create Purchase Order Draft"}
          </button>
        </form>
      </main>
    </div>
  );
}
