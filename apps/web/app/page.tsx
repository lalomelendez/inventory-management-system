import { Role } from "@repo/db/enums";
import type { Product, Category, Prisma, Supplier, Location } from "@repo/db";
import Link from "next/link";
import DeleteProductButton from "../components/delete-button";
import { cookies } from 'next/headers';
import { getUserSession } from "../lib/session";

type FullProduct = Prisma.ProductGetPayload<{
  include: { category: true; supplier: true; location: true; stockMovements: true }
}> & { currentStock: number };

async function getProducts(): Promise<FullProduct[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch("http://127.0.0.1:3001/products", {
    cache: "no-store", // Ensure we get fresh data
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    return [];
  }
  
  return response.json();
}


export default async function Home() {
  const products = await getProducts();
  const session = await getUserSession();
  const userRole = session?.role;

  const canCreate = userRole === Role.ADMIN || userRole === Role.LOGISTICS;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans">
      <main className="max-w-4xl mx-auto space-y-12 py-12">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-500 bg-clip-text text-transparent">
              Logistics Dashboard
            </h1>
            <p className="text-zinc-400 text-lg">
              Mapping products to physical locations and vendors.
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/purchase-orders"
              className="inline-flex items-center justify-center border border-zinc-800 text-zinc-400 px-6 py-3 rounded-full font-bold hover:text-zinc-100 hover:border-zinc-700 transition-all"
            >
              Operations Center
            </Link>
            {canCreate && (
              <Link 
                href="/create"
                className="inline-flex items-center justify-center bg-zinc-50 text-zinc-950 px-6 py-3 rounded-full font-bold hover:bg-white transition-all transform hover:scale-105 active:scale-95"
              >
                + Add Product
              </Link>
            )}
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 italic">No products found. Seed the database to see the "Aha!" moment.</p>
            </div>
          ) : (
            products.map((product) => (
              <div 
                key={product.id}
                className="group flex flex-col p-6 rounded-2xl border border-zinc-900 bg-zinc-900/50 hover:bg-zinc-900 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-xl font-semibold text-zinc-100 group-hover:text-white transition-colors">
                        {product.title}
                      </h2>
                      {product.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 font-mono mt-1 uppercase tracking-widest">
                      ID: {product.id}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Stock</span>
                      <span className={`text-lg font-mono font-bold ${product.currentStock > 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {product.currentStock}
                      </span>
                    </div>

                    <div className="space-y-1 px-1">
                      {product.supplier && (
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span className="font-bold uppercase tracking-tighter opacity-50 text-[9px]">Supplier:</span>
                          <span className="text-zinc-300 truncate">{product.supplier.name}</span>
                        </div>
                      )}
                      {product.location && (
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span className="font-bold uppercase tracking-tighter opacity-50 text-[9px]">Location:</span>
                          <span className="text-zinc-300">{product.location.name} ({product.location.aisle}-{product.location.shelf})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-bold text-zinc-50">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-zinc-500 uppercase font-medium tracking-tighter">USD</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                  <div className="flex gap-4">
                    <Link 
                      href={`/products/${product.id}`}
                      className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <Link 
                      href={`/products/${product.id}/ledger`}
                      className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
                    >
                      Ledger
                    </Link>
                  </div>
                  <DeleteProductButton id={product.id} userRole={userRole} />
                </div>
              </div>
            ))
          )}
        </section>

        <footer className="pt-12 border-t border-zinc-900">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            CONNECTED TO API: http://127.0.0.1:3001/products
          </div>
        </footer>
      </main>
    </div>
  );
}
