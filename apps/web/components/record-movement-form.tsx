"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MovementType } from "@repo/db/enums";
import { proxyApi } from "../app/actions/api";

export default function RecordMovementForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    quantity: "",
    type: MovementType.IN,
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await proxyApi("/stock-movements", {
        method: "POST",
        body: {
          productId,
          type: formData.type,
          quantity: parseInt(formData.quantity, 10),
          notes: formData.notes,
        },
      });

      setFormData({ quantity: "", type: MovementType.IN, notes: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
      <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Append Stock Event
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-700 outline-none transition-all"
          >
            <option value={MovementType.IN}>IN (Receive)</option>
            <option value={MovementType.OUT}>OUT (Ship)</option>
            <option value={MovementType.ADJUSTMENT}>ADJUSTMENT (Loss/Audit)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quantity</label>
          <input
            type="number"
            required
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-700 outline-none transition-all"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Notes (Optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-700 outline-none transition-all min-h-[80px] resize-none"
          placeholder="Reason for adjustment, order #, etc."
        />
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-zinc-100 text-zinc-950 font-bold py-2 rounded-lg hover:bg-white transition-all disabled:opacity-50 text-sm"
      >
        {isSaving ? "Recording..." : "Execute Transaction"}
      </button>
    </form>
  );
}
