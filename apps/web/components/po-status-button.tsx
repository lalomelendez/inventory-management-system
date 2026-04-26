"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { POStatus, Role } from "@repo/db/enums";
import { proxyApi } from "../app/actions/api";

export default function StatusControlButton({ po, userRole }: { po: any, userRole: Role }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: POStatus) => {
    setIsLoading(true);

    try {
      await proxyApi(`/purchase-orders/${po.id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
      });

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Transition failed. Check permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = userRole === Role.ADMIN || userRole === Role.LOGISTICS;

  // Decision Matrix
  if (po.status === POStatus.DRAFT) {
    return (
      <button 
        onClick={() => updateStatus(POStatus.PENDING_APPROVAL)}
        disabled={isLoading}
        className="bg-zinc-100 text-zinc-950 px-4 py-2 rounded-lg text-xs font-bold hover:bg-white transition-all disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Submit for Approval"}
      </button>
    );
  }

  if (po.status === POStatus.PENDING_APPROVAL && isAdmin) {
    return (
      <div className="flex gap-2">
        <button 
          onClick={() => updateStatus(POStatus.APPROVED)}
          disabled={isLoading}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-400 transition-all disabled:opacity-50"
        >
          Approve
        </button>
        <button 
          onClick={() => updateStatus(POStatus.REJECTED)}
          disabled={isLoading}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-400 transition-all disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    );
  }

  if (po.status === POStatus.APPROVED && isAdmin) {
    return (
      <button 
        onClick={() => updateStatus(POStatus.RECEIVED)}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-400 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      >
        {isLoading ? "Updating Ledger..." : "Confirm Reception"}
      </button>
    );
  }

  return (
    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest italic">
      No actions pending
    </span>
  );
}
