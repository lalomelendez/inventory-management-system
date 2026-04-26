# **Phase 3: The Immutable Ledger (Stock Movement)**

This is the most critical shift. We must stop doing simple `PATCH` requests to update inventory counts and shift to an event-driven ledger.

- **Step 3.1: The Transaction Log:** We will build a `StockMovement` table. Every time inventory changes, a record is created: `IN` (receiving goods), `OUT` (shipping/usage), or `ADJUSTMENT` (shrinkage/loss).
- **Step 3.2: Derived Inventory Calculation:** A product's "current stock" will no longer be a dumb number we overwrite. It will be the mathematical sum of all its `StockMovement` records. This guarantees a mathematically perfect audit trail.

---

## **Phase 3: The Immutable Ledger**. tasks

Welcome back to the architect's desk. This is the big league.

Up until now, our database has acted like a chalkboard. If you had 10 keyboards and sold 2, you erased the "10" and wrote "8". But in enterprise systems, erasing data is a catastrophic failure of accountability. If a warehouse is missing 50 GPUs, you need to know exactly *when* they went missing, *who* logged the adjustment, and *why*.

We are moving from a state-based system to an **Event-Driven Immutable Ledger**. We will never overwrite a stock count again; we will only append events.

Here is your Spec-Driven Development (SDD) execution plan for **Phase 3: The Immutable Ledger**.

---

### **Part 1: The Domain Model (Schema Design)**

We must create the mathematical ledger in the database and tie every transaction to the employee who executed it.

- **Task 3.1: Define the Movement Types:** Open `packages/db/prisma/schema.prisma`. Create an Enum to strictly define what can happen to inventory.Code snippet
    
    `enum MovementType {
      IN         // Receiving new stock
      OUT        // Shipping or fulfilling orders
      ADJUSTMENT // Shrinkage, damage, or audits
    }`
    
- **Task 3.2: Create the Ledger Entity:** Build the `StockMovement` model. It needs an `id`, `quantity` (Int), `type` (MovementType), `notes` (String, optional), and a `createdAt` timestamp.
- **Task 3.3: Forge the Relationships:** * Add a `productId` to tie the movement to a specific item.
    - Add a `userId` to tie the movement to the employee who logged it (Accountability!).
    - Update your `Product` and `User` models to include the reciprocal `StockMovement[]` arrays.
- **Task 3.4: Synchronize the Vault:** Run your standard commands to push the schema to PostgreSQL and rebuild the `@repo/db` package so the monorepo learns the new reality.

---

### **Part 2: The Security Contracts (Payload Validation)**

The backend must strictly enforce how a movement is recorded.

- **Task 3.5: Update the SSOT (Zod):** Open `packages/validation/src/index.ts`. Create a `CreateStockMovementSchema`. It must require a `productId`, an absolute `quantity` (must be greater than 0), and a valid `MovementType`. Rebuild the package.
- **Task 3.6: Update the API DTOs:** In `apps/api`, create `create-stock-movement.dto.ts` mapping precisely to your new Zod rules using `class-validator` decorators (`@IsInt()`, `@Min(1)`, `@IsEnum(MovementType)`).

---

### **Part 3: The API Implementation (The Math Engine)**

The backend now has two jobs: safely recording new movements and calculating the "current stock" on the fly for the frontend.

- **Task 3.7: The Movement Endpoint:** Scaffold a `StockMovements` module in NestJS. Create a `POST` route to record a movement.
    - **Crucial:** Secure it with `@UseGuards(JwtAuthGuard)`. Use your `@CurrentUser()` decorator to extract the employee's ID from the JWT so you can seamlessly attach it to the `StockMovement` database write.
- **Task 3.8: The Derived Calculation:** Open `apps/api/src/products/products.service.ts`. Update your `findMany` and `findOne` methods.
    - Tell Prisma to `include: { stockMovements: true }`.
    - Before returning the products to the frontend, loop through them and calculate the virtual stock. (e.g., `IN` adds to the total, `OUT` and `ADJUSTMENT` subtract from it).
    - Attach this dynamically calculated number as a `currentStock` property on the returned object.

---

### **Part 4: UI Orchestration (The Audit Dashboard)**

The frontend must adapt to display this read-only mathematical truth and provide a way to append new logs.

- **Task 3.9: The Immutable Display:** On your `apps/web/app/products/page.tsx` list, update the UI to display the derived `currentStock` value you calculated in Task 3.8.
- **Task 3.10: The Ledger History View:** Create a new dynamic route (e.g., `apps/web/app/products/[id]/ledger/page.tsx`). This page should fetch a single product and map over its `stockMovements` array, displaying a chronological table of events (Date, Type, Quantity, Employee ID, Notes).
- **Task 3.11: The Action Form:** Build a "Record Movement" Client Component form. It should feature a dropdown for the `MovementType`, a number input for the `Quantity`, and a text input for the `Notes`. Ensure the `fetch` request passes the Authorization cookie to your new NestJS endpoint!

---

### **🧪 Testing Instructions (Verification)**

**Test 1: The Accountability Check**

1. Log into your Next.js app as a specific user.
2. Submit a new `IN` stock movement for 50 units.
3. Open `npx prisma studio`. Look at the `StockMovement` table.
4. **Verify:** The row should exist, the quantity should be 50, and the `userId` must exactly match the user you logged in as.

**Test 2: The Math Engine Check**

1. Record an `OUT` movement for 10 units on the same product.
2. Record an `ADJUSTMENT` for 2 units (someone dropped a box).
3. Refresh your Next.js dashboard.
4. **Verify:** The UI should automatically display `38` as the current stock (50 - 10 - 2). You have achieved an immutable, mathematically perfect ledger!

Execute these tasks with precision. You are no longer just building an app; you are building an auditable ERP system. Let me know when the ledger is live!

---

Troubleshooting guide

Welcome to the complexities of Event-Driven Architecture! Moving from a simple "overwrite" system to an Immutable Ledger introduces a lot of mathematical and structural moving parts.

If something breaks during Phase 3, it is almost always related to **Type Intersections** (because we are creating data that doesn't strictly exist in a database column), **Enum Mismatches**, or **Array Math**.

Here is your dedicated troubleshooting guide for the Immutable Ledger. Keep it open while you build.

---

### **🚑 Troubleshooting Guide: The Immutable Ledger**

### **1. Database & Prisma Issues**

- **Symptom:** You try to record a movement and Prisma throws a `Foreign key constraint failed` error on the `userId` or `productId`.
    - **The Cause:** You are trying to attach the movement to a User or Product that doesn't exist. This usually happens if your `@CurrentUser()` decorator isn't pulling the correct ID from the JWT, passing `undefined` to the database.
    - **The Fix:** Put a `console.log(user)` inside your NestJS `StockMovements` controller right before you call the service. Ensure your `JwtStrategy` from Phase 4 is correctly mapping `payload.sub` to `user.userId` (or `user.id`), and that you are passing that exact string to Prisma.

### **2. The Math Engine (Backend) Issues**

- **Symptom:** The frontend displays `NaN` (Not a Number) for `currentStock`, or the backend crashes when trying to load the dashboard.
    - **The Cause:** If a product is brand new, its `stockMovements` array is completely empty. If you try to run a mathematical `.reduce()` on an empty array without providing an initial value, JavaScript panics.
    - **The Fix:** Ensure your NestJS math calculation has a fallback and an initial value of `0`.TypeScript
        
        `const currentStock = product.stockMovements.reduce((total, movement) => {
          if (movement.type === 'IN') return total + movement.quantity;
          if (movement.type === 'OUT' || movement.type === 'ADJUSTMENT') return total - movement.quantity;
          return total;
        }, 0); // <-- This 0 is critical!`
        

### **3. Monorepo Type Synchronization Issues**

- **Symptom:** Next.js throws a strict compiler error: `Property 'currentStock' does not exist on type 'Product'`.
    - **The Cause:** This is the most common Spec-Driven Development trap. Prisma generated the `Product` type based *exactly* on your PostgreSQL columns. Because `currentStock` is calculated on the fly in NestJS, the TypeScript compiler doesn't know it exists.
    - **The Fix:** You must create an intersection type in your frontend (or in your shared `@repo/validation` package) that extends the base Prisma type:TypeScript
        
        `import { Product } from "@repo/db";
        
        // Tell TypeScript about our dynamically calculated field
        export type ProductWithStock = Product & { currentStock: number };`
        
        Then, use `ProductWithStock[]` when fetching your dashboard data.
        

### **4. Validation & UI Forms**

- **Symptom:** You submit the "Record Movement" form, and NestJS returns a `400 Bad Request` saying `"type must be a valid enum value"`.
    - **The Cause:** Prisma Enums are strictly case-sensitive. Your HTML `<select>` might be sending the value as lowercase (`"in"`, `"out"`), but the database and DTO expect uppercase (`"IN"`, `"OUT"`).
    - **The Fix:** Ensure your Next.js HTML options are strictly capitalized in the `value` attribute:TypeScript
        
        `<option value="IN">Receive Stock (IN)</option>
        <option value="OUT">Ship Stock (OUT)</option>`
        
- **Symptom:** The backend rejects the movement saying `"quantity must be a number string"`, or Prisma throws an integer error.
    - **The Cause:** HTML number inputs technically output strings in React state (e.g., `"50"` instead of `50`).
    - **The Fix:** In your Next.js `onSubmit` handler, parse the state into a strict integer before converting it to JSON and sending it to the backend:TypeScript
        
        `body: JSON.stringify({ 
          productId, 
          type: movementType, 
          quantity: parseInt(quantity, 10) // Force strict integer!
        })`
        

Keep your terminal logs streaming, respect the strict types, and remember: do not mutate the past, only append the future.


---




Ran command: `mkdir -p apps/web/app/products/[id]/ledger`
Edited record-movement-form.tsx
Edited page.tsx
Viewed page.tsx:1-15
Viewed products.service.ts:38-47
Edited task.md

I have successfully completed **Phase 3: The Immutable Ledger**. We have shifted the system from simple "overwrite" stock counts to a mathematically perfect, event-driven ledger.

### Summary of Implementation:

#### 1. The Mathematical Foundation (Database)
*   **Ledger Schema**: Defined `MovementType` (IN, OUT, ADJUSTMENT) and created the `StockMovement` model in [schema.prisma](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/packages/db/prisma/schema.prisma).
*   **Accountability Link**: Every movement is now strictly tied to both a **Product** and the **User** (Employee) who logged the transaction.
*   **Synchronized**: The database is synced via `prisma db push` and the shared packages are rebuilt.

#### 2. The Validation Layer
*   **Shared Contract**: Added `CreateStockMovementSchema` to [@repo/validation](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/packages/validation/src/index.ts) to enforce that movements have positive integers and valid types.
*   **Server-Side Protection**: Implemented matching DTOs in the NestJS API with strict `class-validator` decorators.

#### 3. The Math Engine (Backend Logic)
*   **Eager Calculation**: Updated the [Products Service](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/apps/api/src/products/products.service.ts) to calculate `currentStock` on the fly by reducing the sum of all movements ($IN - OUT - ADJUSTMENT$).
*   **Security Guard**: The new `/stock-movements` endpoint is protected by `JwtAuthGuard`, automatically extracting the Employee ID from the token for the audit trail.

#### 4. The Audit Interface (Frontend)
*   **Dynamic Dashboard**: The [main dashboard](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/apps/web/app/page.tsx) now displays the live-calculated `currentStock` with visual color-coding (emerald for healthy stock, amber for low).
*   **Ledger History**: Created a new [Audit Ledger page](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/apps/web/app/products/[id]/ledger/page.tsx) that shows a vertical timeline of every transaction.
*   **Transaction Form**: Added a [Record Movement form](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/apps/web/components/record-movement-form.tsx) component to allow users to append new data to the ledger.

---

### **🧪 Verification (Self-Teaching Tests)**

You can now verify the system is working as intended:

1.  **Accountability**: On the Ledger page for any product, log an **IN** movement for 100 units. Check [Prisma Studio](http://localhost:5555) to see that your User ID was automatically recorded.
2.  **The Math Check**: Log an **OUT** movement for 25 units and an **ADJUSTMENT** for 5 units.
3.  **The Result**: Go back to the dashboard. The product should now mathematically show exactly **70** units.

Everything is live and the ledger is secure. Let me know if you would like to review any of the math logic or if you have further instructions!