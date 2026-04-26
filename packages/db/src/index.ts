import { PrismaClient } from "./generated";

export const db = new PrismaClient();
export * from "./generated";

// Source of Truth Enums (Resolves monorepo re-export issues)
export { Role, MovementType, POStatus } from "./enums";
export type { PurchaseOrder, Supplier, User, PurchaseOrderItem, Product, Category, Location, StockMovement, Prisma } from "./generated";
