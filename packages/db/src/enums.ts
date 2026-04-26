/**
 * Manual re-export of Enums to resolve monorepo synchronization issues 
 * between Prisma generated client and the TypeScript language server.
 */

export enum Role {
  ADMIN = "ADMIN",
  HR = "HR",
  LOGISTICS = "LOGISTICS",
  USER = "USER",
}

export enum MovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum POStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECEIVED = "RECEIVED",
}
