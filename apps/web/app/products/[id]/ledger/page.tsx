import { cookies } from "next/headers";
import Link from "next/link";
import { Prisma } from "@repo/db";
import type { Product, StockMovement, User } from "@repo/db";
import { MovementType } from "@repo/db/enums";
import RecordMovementForm from "../../../../components/record-movement-form";

// Type for movements with user info included
type MovementWithUser = StockMovement & { user: User };

async function getProduct(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`http://127.0.0.1:3001/products/${id}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return null;
  return response.json();
}

async function getMovements(id: string): Promise<MovementWithUser[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`http://127.0.0.1:3001/stock-movements/product/${id}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return [];
  return response.json();
}

export default async function ProductLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, movements] = await Promise.all([
    getProduct(id),
    getMovements(id),
  ]);

  if (!product) return <div>Product Not Found</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans">
      <main className="max-w-4xl mx-auto space-y-12 py-12">
        <header className="space-y-4">
          <Link 
            href="/"
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{product.title}</h1>
              <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">Immutable Audit Ledger</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center min-w-[150px]">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Current Stock</span>
              <span className="text-3xl font-mono font-bold text-emerald-400">{product.currentStock}</span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/80 border-b border-zinc-800">
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Type</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Qty</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-zinc-600 italic text-sm">
                        No transactions logged yet. Append the first event to begin calculation.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 text-xs text-zinc-400">
                          {new Date(m.createdAt).toLocaleDateString()}
                          <span className="block text-[9px] opacity-50">{new Date(m.createdAt).toLocaleTimeString()}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            m.type === 'IN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            m.type === 'OUT' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {m.type}
                          </span>
                        </td>
                        <td className={`p-4 font-mono font-bold text-sm text-right ${
                          m.type === 'IN' ? 'text-zinc-100' : 'text-zinc-500'
                        }`}>
                          {m.type === 'IN' ? '+' : '-'}{m.quantity}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-zinc-300 truncate max-w-[100px]">{m.user.email}</span>
                            <span className="text-[9px] text-zinc-600 font-mono uppercase truncate max-w-[100px]">{m.userId}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <RecordMovementForm productId={id} />
            
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-900">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Integrity Details</h4>
              <ul className="space-y-3">
                <li className="flex justify-between text-xs">
                  <span className="text-zinc-600">Product UID:</span>
                  <span className="text-zinc-400 font-mono text-[10px]">{id}</span>
                </li>
                <li className="flex justify-between text-xs">
                  <span className="text-zinc-600">Ledger Type:</span>
                  <span className="text-zinc-400 font-mono text-[10px]">E-D Immutable</span>
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
