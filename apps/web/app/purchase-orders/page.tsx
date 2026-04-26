import { cookies } from "next/headers";
import Link from "next/link";
import { POStatus, Role } from "@repo/db/enums";
import type { PurchaseOrder, Supplier, User, PurchaseOrderItem, Product } from "@repo/db";
import { getUserSession } from "../../lib/session";
import StatusControlButton from "../../components/po-status-button";

type FullPO = PurchaseOrder & {
  supplier: Supplier;
  creator: User;
  approver: User | null;
  items: (PurchaseOrderItem & { product: Product })[];
};

async function getPurchaseOrders(): Promise<FullPO[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch("http://127.0.0.1:3001/purchase-orders", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return [];
  return response.json();
}

export default async function PurchaseOrdersPage() {
  const orders = await getPurchaseOrders();
  const session = await getUserSession();
  const userRole = session?.role as Role;

  const statusColors = {
    [POStatus.DRAFT]: "bg-zinc-800 text-zinc-400 border-zinc-700",
    [POStatus.PENDING_APPROVAL]: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    [POStatus.APPROVED]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    [POStatus.REJECTED]: "bg-red-500/10 text-red-400 border-red-500/20",
    [POStatus.RECEIVED]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans">
      <main className="max-w-6xl mx-auto space-y-12 py-12">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
              Operations Center
            </h1>
            <p className="text-zinc-500 text-lg">
              Manage Purchase Orders and Material Approval Workflows.
            </p>
          </div>
          <Link 
            href="/purchase-orders/create"
            className="inline-flex items-center justify-center bg-zinc-100 text-zinc-950 px-6 py-3 rounded-full font-bold hover:bg-white transition-all transform hover:scale-105 active:scale-95"
          >
            + Create Order
          </Link>
        </header>

        <section className="grid gap-6">
          {orders.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-900 rounded-3xl">
              <p className="text-zinc-600 italic">No purchase orders found in the pipeline.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((po) => (
                <div key={po.id} className="group bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 hover:bg-zinc-900 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[po.status as keyof typeof statusColors]}`}>
                          {po.status}
                        </span>
                        <span className="text-xs text-zinc-600 font-mono">PO-#{po.id.slice(-6).toUpperCase()}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Supplier</label>
                          <p className="text-sm font-semibold">{po.supplier.name}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Creator</label>
                          <p className="text-xs text-zinc-400 font-mono truncate">{po.creator.email}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Total Items</label>
                          <p className="text-sm font-semibold">{po.items.length} Lines</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 border-t lg:border-t-0 lg:border-l border-zinc-800 lg:pl-8 pt-6 lg:pt-0">
                      <div className="text-right sm:pr-4">
                        <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Total Amount</label>
                        <span className="text-xl font-bold font-mono text-zinc-200">
                          ${po.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                        </span>
                      </div>
                      <StatusControlButton po={po} userRole={userRole} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
