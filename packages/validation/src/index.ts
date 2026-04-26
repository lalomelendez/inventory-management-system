import { z } from "zod";
import { MovementType, POStatus } from "@repo/db/enums";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Export the TypeScript types so Next.js can use them
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;


export const ProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  locationId: z.string().min(1, "Location is required"),
  minimumStockLevel: z.number().min(0).optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export const CreateStockMovementSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  type: z.nativeEnum(MovementType),
  notes: z.string().optional(),
});

export type CreateStockMovementInput = z.infer<typeof CreateStockMovementSchema>;

export const CreatePOSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  items: z.array(z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be positive"),
  })).min(1, "At least one item is required"),
});

export type CreatePOInput = z.infer<typeof CreatePOSchema>;

export const UpdatePOStatusSchema = z.object({
  status: z.nativeEnum(POStatus),
});

export type UpdatePOStatusInput = z.infer<typeof UpdatePOStatusSchema>;

export const CommandCenterResponseSchema = z.object({
  lowStockItems: z.array(z.any()), // Assuming we don't have full product schema modeled in validation package, but optionally can be defined if needed
  pendingPOs: z.array(z.any()),
  recentActivity: z.array(z.any()),
});

export type CommandCenterResponse = z.infer<typeof CommandCenterResponseSchema>;
