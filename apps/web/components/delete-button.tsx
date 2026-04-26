"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Role } from "@repo/db/enums";
import { proxyApi } from "../app/actions/api";

export default function DeleteProductButton({ 
  id, 
  userRole 
}: { 
  id: string, 
  userRole?: Role | string 
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Strictly enforce that only ADMIN can see this button
  if (userRole !== Role.ADMIN) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setIsDeleting(true);
    try {
      await proxyApi(`/products/${id}`, {
        method: "DELETE",
      });

      router.refresh();
    } catch (err) {
      alert("Error deleting product");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
