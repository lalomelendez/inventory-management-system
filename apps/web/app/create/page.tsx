"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Category, Supplier, Location } from "@repo/db";
import { proxyApi } from "../actions/api";

export default function CreateProductPage() {
  const router = useRouter();
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, supRes, locRes] = await Promise.all([
          proxyApi("/categories"),
          proxyApi("/suppliers"),
          proxyApi("/locations"),
        ]);

        if (catRes) {
          setCategories(catRes);
          if (catRes.length > 0) setFormData(prev => ({ ...prev, categoryId: catRes[0].id }));
        }

        if (supRes) {
          setSuppliers(supRes);
          if (supRes.length > 0) setFormData(prev => ({ ...prev, supplierId: supRes[0].id }));
        }

        if (locRes) {
          setLocations(locRes);
          if (locRes.length > 0) setFormData(prev => ({ ...prev, locationId: locRes[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch lookup data", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await proxyApi("/products", {
        method: "POST",
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans">
      <main className="max-w-xl mx-auto space-y-8 py-12">
        <header className="space-y-2">
          <button 
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-2 mb-6"
          >
            ← Back to List
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
          <p className="text-zinc-400">Specify the new product details to add it to the inventory.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-900">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-zinc-400">Product Title</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
              placeholder="e.g. Mechanical Keyboard"
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
                {categories.length === 0 ? (
                  <option value="" disabled>No categories available</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                placeholder="0.00"
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
              {suppliers.length === 0 ? (
                <option value="" disabled>No suppliers available</option>
              ) : (
                suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))
              )}
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
              {locations.length === 0 ? (
                <option value="" disabled>No locations available</option>
              ) : (
                locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} (Aisle {location.aisle})
                  </option>
                ))
              )}
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-50 text-zinc-950 font-bold py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Product Specification"}
          </button>
        </form>
      </main>
    </div>
  );
}
