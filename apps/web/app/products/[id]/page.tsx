"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Category, Supplier, Location } from "@repo/db";
import { proxyApi } from "../../actions/api";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    categoryId: "",
    supplierId: "",
    locationId: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [product, cats, sups, locs] = await Promise.all([
          proxyApi(`/products/${id}`),
          proxyApi(`/categories`),
          proxyApi(`/suppliers`),
          proxyApi(`/locations`)
        ]);

        if (!product) throw new Error("Product not found");
        
        setCategories(cats);
        setSuppliers(sups);
        setLocations(locs);

        setFormData({
          title: product.title,
          price: product.price.toString(),
          categoryId: product.categoryId || (cats.length > 0 ? cats[0].id : ""),
          supplierId: product.supplierId || (sups.length > 0 ? sups[0].id : ""),
          locationId: product.locationId || (locs.length > 0 ? locs[0].id : ""),
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await proxyApi(`/products/${id}`, {
        method: "PATCH",
        body: {
          title: formData.title,
          price: Number(formData.price),
          categoryId: formData.categoryId,
          supplierId: formData.supplierId,
          locationId: formData.locationId,
        },
      });

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse font-mono tracking-widest uppercase">Initializing Specification...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans">
      <main className="max-w-xl mx-auto space-y-8 py-12">
        <header className="space-y-2">
          <button 
            onClick={() => router.push("/")}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-2 mb-6"
          >
            ← Back to List
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Modify Product</h1>
          <p className="text-zinc-400 font-mono text-sm uppercase tracking-tighter">Targeting Record: {id}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-900 shadow-2xl">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-zinc-400">Product Title</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-zinc-400">Category</label>
              <select
                id="category"
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all appearance-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-zinc-400">Price (USD)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="supplier" className="text-sm font-medium text-zinc-400">Supplier</label>
            <select
              id="supplier"
              required
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all appearance-none"
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-zinc-400">Warehouse Location</label>
            <select
              id="location"
              required
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all appearance-none"
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} (Aisle {location.aisle})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 bg-zinc-900 text-zinc-400 font-bold py-3 rounded-lg hover:text-zinc-200 transition-colors border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] bg-zinc-50 text-zinc-950 font-bold py-3 rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
            >
              {isSaving ? "Synchronizing..." : "Update Specification"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
