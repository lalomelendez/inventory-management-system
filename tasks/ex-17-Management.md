# **Phase 4: Operational Workflows (Approvals & Accountability)**

Operations require oversight. We need to integrate the human element into the system.

- **Step 4.1: Purchase Orders (POs):** Instead of magically adding stock, a user creates a PO requesting materials from a Supplier.
- **Step 4.2: Status Pipelines:** The PO moves through a state machine: `DRAFT` -> `PENDING_APPROVAL` -> `APPROVED` -> `RECEIVED`.
- **Step 4.3: The Audit Trail:** Because we built the `@CurrentUser` decorator, every PO, status change, and stock movement will be permanently stamped with the ID of the employee who executed it, securing the administrative workflow.

---

## **Phase 4: Operational Workflows**. tasks

Welcome back to the architect's desk. You are doing fantastic.

We have reached the phase where software meets human psychology. An immutable ledger tracks *what* happened, but operational workflows dictate *what is allowed to happen*. By introducing Purchase Orders (POs) and a state machine, we are removing the "magic" from inventory creation. Users can no longer just spawn 100 GPUs out of thin air; they must request them, get approval, and physically receive them.

Here is your Spec-Driven Development (SDD) execution plan for **Phase 4: Operational Workflows**.

---

### **Part 1: The Domain Model (Schema Design)**

We need to create the Purchase Order document and the strict sequence of states it can exist in.

- **Task 4.1: Define the State Machine (Enum):** Open `packages/db/prisma/schema.prisma`. Create a new Enum to lock down the approval pipeline.Code snippet
    
    `enum POStatus {
      DRAFT
      PENDING_APPROVAL
      APPROVED
      REJECTED
      RECEIVED
    }`
    
- **Task 4.2: Build the PO Entities:** A Purchase Order isn't just one table; it's a header and its line items.
    - **Create `PurchaseOrder`:** Needs an `id`, `status` (defaulting to `DRAFT`), `supplierId` (foreign key), and timestamp fields.
    - **Create `PurchaseOrderItem`:** Needs an `id`, `purchaseOrderId`, `productId`, `quantity` (Int), and `unitPrice` (Float).
- **Task 4.3: The Audit Trail (Relationships):** This is where accountability lives.
    - Add `creatorId` (String) to `PurchaseOrder` and link it to the `User` model.
    - Add `approverId` (String, optional/nullable) and link it to the `User` model as well.
- **Task 4.4: Synchronize the Vault:** Run `pnpm --filter @repo/db exec prisma db push` and `pnpm run build --filter @repo/db` to broadcast the new physical reality to the monorepo.

---

### **Part 2: The Security Contracts (Payload Validation)**

We must define the rules for creating a PO and for moving it through the state machine.

- **Task 4.5: Update the SSOT (Zod):** In `packages/validation/src/index.ts`, create two schemas.
    - `CreatePOSchema`: Requires a `supplierId` and an array of items (each with `productId`, `quantity`, and `unitPrice`).
    - `UpdatePOStatusSchema`: Requires a valid `POStatus` enum value.
    - Rebuild the validation package.
- **Task 4.6: Update the API DTOs:** In NestJS (`apps/api`), scaffold a new module (`npx nest g resource purchase-orders`). Create the corresponding DTOs using `class-validator` to strictly enforce the Zod shapes at the backend boundary.

---

### **Part 3: The API Implementation (State & Automation)**

The NestJS backend must act as the workflow enforcer. It must check permissions at every status change and automate the ledger when goods arrive.

- **Task 4.7: The Creation Endpoint:** In your `PurchaseOrdersController`, create a `POST` route to generate a new PO.
    - Use `@UseGuards(JwtAuthGuard)` to secure it.
    - Use your `@CurrentUser()` decorator. Force the backend to automatically map the `user.id` to the `creatorId` field of the new PO. Do *not* trust the frontend to send the creator ID.
- **Task 4.8: The Approval Pipeline (Role Guards):** Create a `PATCH /:id/status` endpoint.
    - Protect this specifically with your Role Guards from Phase 1. E.g., `@Roles(Role.ADMIN, Role.LOGISTICS)`. A base `USER` cannot approve a PO.
    - If the status changes to `APPROVED` or `REJECTED`, automatically stamp the `@CurrentUser().id` into the `approverId` field.
- **Task 4.9: The Automation Bridge (The "RECEIVED" trigger):** Inside your `PurchaseOrdersService`, write the critical business logic:
    - When a PO's status is updated to `RECEIVED`, loop through every `PurchaseOrderItem`.
    - For each item, automatically inject a new `IN` record into the `StockMovement` table (your Immutable Ledger from Phase 3). This perfectly bridges the administrative workflow with the physical warehouse logic.

---

### **Part 4: UI Orchestration (The Approvals Dashboard)**

The Next.js frontend must adapt to show different views based on the user's role and the current state of the document.

- **Task 4.10: The PO Creation Form:** Build a dynamic Next.js form that lets users select a Supplier, then dynamically add multiple line items (Products) before submitting the DRAFT.
- **Task 4.11: The Kanban / Status Dashboard:** Create a dashboard (`apps/web/app/purchase-orders/page.tsx`) that groups POs by their current `POStatus`. Use visual badges (Gray for Draft, Yellow for Pending, Green for Approved, Blue for Received).
- **Task 4.12: Contextual Action Buttons:** Fetch the user's session role (Task 1.4).
    - If the user is a `USER`, they only see a "Submit for Approval" button (which shifts `DRAFT` to `PENDING_APPROVAL`).
    - If the user is an `ADMIN` and the PO is `PENDING_APPROVAL`, they see "Approve" and "Reject" buttons.

---

### **🧪 Testing Instructions (Verification)**

**Test 1: The Accountability Check**

1. Log in as a base `USER`. Create a new PO.
2. Log in as an `ADMIN`. Approve the PO.
3. **Verify:** Check your database. The `creatorId` must belong to the `USER`, and the `approverId` must belong to the `ADMIN`. The audit trail is flawless.

**Test 2: The Automation Check**

1. As the `ADMIN` (or Logistics manager), change the approved PO status to `RECEIVED`.
2. Navigate to your Products dashboard (from Phase 3).
3. **Verify:** The `currentStock` of the products on that PO should have automatically increased. Check the `StockMovement` ledger to ensure the new `IN` movements were correctly stamped by the backend automation.

Execute these tasks with care. You are now linking different architectural patterns together—authorization, state machines, and event ledgers. Let me know if you run into any turbulence.

---

Troubleshooting guide

Building state machines and automated workflows introduces a whole new class of bugs. You are no longer just moving data from point A to point B; you are managing the *timing* and *sequence* of that data.

When things break in Phase 4, it is almost always related to **Ambiguous Database Relations**, **Transaction Failures**, or **Stale UI State**.

Here is your dedicated troubleshooting guide for Operational Workflows. Keep it open while you build.

---

### **🚑 Troubleshooting Guide: Operational Workflows**

### **1. Database & Prisma Issues (The "Double Relation" Trap)**

- **Symptom:** You try to run `prisma db push` and get an error like *"Ambiguous relation detected... Please provide a relation name."*
    - **The Cause:** You added both `creatorId` and `approverId` to the `PurchaseOrder` model, and both point to the `User` table. Prisma gets confused because it doesn't know which foreign key belongs to which relationship.
    - **The Fix:** You must explicitly name the relationships using the `@relation` attribute in `schema.prisma`.Code snippet
        
        `model PurchaseOrder {
          // ...
          creatorId  String
          approverId String?
          creator    User    @relation(name: "CreatedPOs", fields: [creatorId], references: [id])
          approver   User?   @relation(name: "ApprovedPOs", fields: [approverId], references: [id])
        }
        
        model User {
          // ...
          createdPOs  PurchaseOrder[] @relation("CreatedPOs")
          approvedPOs PurchaseOrder[] @relation("ApprovedPOs")
        }`
        

### **2. Backend & Automation Issues (The Transaction Nightmare)**

- **Symptom:** You change a PO to `RECEIVED`. The status updates, but your app crashes halfway through injecting the `StockMovements`. Now your PO says "Received", but your inventory is wrong.
    - **The Cause:** You wrote a standard `for` loop to insert stock movements. If the loop fails on item #3 (e.g., due to a bad product ID), items #1 and #2 were already saved, but the rest weren't. Your database is now out of sync with reality.
    - **The Fix:** You must use a **Prisma Transaction** (`this.db.$transaction`). This wraps all operations into an "all-or-nothing" bundle. If one write fails, PostgreSQL automatically rolls back the entire bundle, ensuring your data never corrupts.TypeScript
        
        `await this.db.$transaction(async (prisma) => {
          // 1. Update PO Status
          await prisma.purchaseOrder.update({ ... });
        
          // 2. Insert Stock Movements
          await prisma.stockMovement.createMany({ ... });
        });`
        
- **Symptom:** You send a `POST` to create a PO, and NestJS returns a `400 Bad Request` complaining about the `items` array, even though the Zod payload looks perfect.
    - **The Cause:** Validating arrays of objects in NestJS requires an extra step. `class-validator` doesn't automatically dive into nested objects unless you explicitly tell it to.
    - **The Fix:** In your `CreatePurchaseOrderDto`, you must use `@ValidateNested()` and the `@Type()` decorator from `class-transformer` to parse the incoming JSON array.TypeScript
        
        `import { ValidateNested } from 'class-validator';
        import { Type } from 'class-transformer';
        
        export class CreatePurchaseOrderDto {
          @ValidateNested({ each: true })
          @Type(() => PurchaseOrderItemDto) // <-- Crucial!
          items: PurchaseOrderItemDto[];
        }`
        

### **3. Frontend (Next.js) & State Issues**

- **Symptom:** A `USER` submits a PO. An `ADMIN` clicks "Approve". The UI button changes, but when they refresh the page, it goes back to "Pending Approval".
    - **The Cause:** Next.js caches data aggressively. If you updated the backend but didn't tell the Next.js router to refresh its cache, it will keep displaying the stale data from the initial load.
    - **The Fix:** Immediately after your successful `fetch()` call to update the status, call `router.refresh()` in your Client Component, or use `revalidatePath('/purchase-orders')` if you are using Server Actions.
- **Symptom:** An `ADMIN` sees the "Approve" button and clicks it, but the network request fails with a `403 Forbidden`.
    - **The Cause:** Your frontend UI successfully checked the role and rendered the button, but your backend `PATCH /:id/status` controller route is missing the `@Roles()` decorator, or it was configured incorrectly. The Bouncer and the UI must share the exact same rulebook.
    - **The Fix:** Check your `PurchaseOrdersController` and ensure the exact endpoint receiving the click is tagged with `@Roles(Role.ADMIN, Role.LOGISTICS)`.
- **Symptom:** A user manages to change a PO directly from `DRAFT` to `RECEIVED`, bypassing the approval step.
    - **The Cause:** Your backend endpoint blindly accepted the `status` from the frontend payload without checking the *previous* state.
    - **The Fix:** State machines must be enforced by the server. Before updating, fetch the current PO. If the current status is `DRAFT`, only allow a transition to `PENDING_APPROVAL`. Throw a `400 Bad Request` if they try to skip steps.

Tackle these state transitions carefully. Keep an eye on those terminal logs, and remember: never trust the frontend to dictate the state machine!


---


Implementation Plan - Phase 4: Operational Workflows
This phase introduces human-in-the-loop inventory management through Purchase Orders and an approval state machine.

User Review Required
IMPORTANT

Ambiguous Relations: I will name the relations in the User <-> PurchaseOrder mapping as createdPOs and approvedPOs to avoid Prisma conflicts.
Transactions: The transition to RECEIVED will be wrapped in a Prisma transaction to ensure the PO status and stock movements are updated atomically.
Nested Validation: The PO item array in the DTO will use @ValidateNested() as advised in the troubleshooting guide.
Proposed Changes
1. Domain Model (Database)
[MODIFY] 
schema.prisma
Add POStatus enum.
Add PurchaseOrder model with creatorId and approverId.
Add PurchaseOrderItem model.
Explicitly name relationships in the User model.
[RUN] Database Migration
Run prisma db push.
Run pnpm build --filter @repo/db.
2. Security Contracts (Validation)
[MODIFY] 
index.ts
Add POStatus to exports from @repo/db.
Create CreatePOSchema and UpdatePOStatusSchema.
Run pnpm build --filter @repo/validation.
[NEW] API DTOs
Create CreatePurchaseOrderDto and UpdatePOStatusDto.
Ensure nested item validation using class-transformer.
3. API Implementation (NestJS)
[NEW] PurchaseOrders Resource
Create PurchaseOrdersModule.
Implement POST /purchase-orders (locked to @CurrentUser()).
Implement PATCH /purchase-orders/:id/status with Role Guards.
Implement the "RECEIVED" logic within a transaction in PurchaseOrdersService.
4. UI Implementation (Next.js)
[NEW] PO Dashboard
Create apps/web/app/purchase-orders/page.tsx.
Group orders by status using visual badges.
[NEW] Create PO Form
Dynamic form allowing users to add/remove line items.
[NEW] PO Details & Actions
Contextual buttons based on user role and current PO status.
Verification Plan
Test 1: Accountability Check
Login as USER, create a PO.
Login as ADMIN, approve it.
Verify creatorId (User) and approverId (Admin) in Database.
Test 2: Automation Check
Update status to RECEIVED.
Check Products Dashboard.
Verify currentStock increased and StockMovement ledger has new IN entries.



---

## **Phase 4 Execution Audit & Specific Fixes**

During the implementation of these operational workflows, we encountered and resolved several complex monorepo and architecture-level issues. Here is a summary of the critical fixes:

### **1. Resolution of Ambiguous Database Relations**
*   **Problem**: Prisma yielded errors when linking both `creatorId` and `approverId` to the same `User` model.
*   **Fix**: Implemented **Named Relations** in `schema.prisma`. We explicitly named the relations `"CreatedPOs"` and `"ApprovedPOs"` in both the `PurchaseOrder` and `User` models.
*   **Rationale**: This provides the Prisma engine with a clear mapping of which foreign key belongs to which logical relationship, enabling bidirectional navigation (e.g., `user.createdPOs`).

### **2. The "Source of Truth" Enum System (Runtime Stability)**
*   **Problem**: The browser threw `Uncaught TypeError: Cannot read properties of undefined (reading 'DRAFT')`. 
*   **Fix**: Created a dedicated [packages/db/src/enums.ts](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/packages/db/src/enums.ts) file manually defining the `POStatus`, `Role`, and `MovementType` enums.
*   **Rationale**: Prisma sometimes fails to export the physical JavaScript enum objects in monorepo structures (only exporting types). By hard-coding the enums in our source tree, we guaranteed they are present at runtime for both the API and the Frontend.

### **3. Localized Prisma Generation (TypeScript Sync)**
*   **Problem**: The API and Editor reported that `purchaseOrder` did not exist on the `PrismaClient` type, despite a successful database push.
*   **Fix**: Modified `schema.prisma` to use a localized output path: `output = "../src/generated"`. We then updated [packages/db/src/index.ts](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/packages/db/src/index.ts) to import from this local folder.
*   **Rationale**: This bypasses the complexity of the `node_modules/.pnpm` virtual store. By placing the generated client inside our own package source, we forced the TypeScript compiler and Language Server to see the updated schema immediately.

### **4. Pnpm "Approve Builds" & Binary Linking**
*   **Problem**: Critical dependencies like `@nestjs/core`, `bcrypt`, and `@prisma/client` were failing to run their post-install scripts.
*   **Fix**: Executed `pnpm approve-builds --all` followed by a forced `pnpm install`.
*   **Rationale**: Security-focused package managers (like pnpm v10+) require explicit approval for native scripts. Approving these allowed the Prisma binary engines and NestJS core logic to link correctly into the runtime environment.

### **5. Atomic Automation (Transaction Integrity)**
*   **Problem**: High risk of data inconsistency if the PO status updated but the stock movement injection failed.
*   **Fix**: Wrapped the reception logic in `PurchaseOrdersService` within a **Prisma Transaction** (`db.$transaction`).
*   **Rationale**: This ensures that either *both* the status update and the stock injection succeed, or *nothing* happens, maintaining the integrity of our Immutable Ledger.

### **6. Frontend Syntax & Import Corrections**
*   **Problem**: Broken imports (relative path errors) and syntax errors (invalid `div` inside `li`) caused the Next.js build to fail.
*   **Fix**: Audited [apps/web/app/purchase-orders/page.tsx](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/apps/web/app/purchase-orders/page.tsx) and updated the `FullPO` type definition to use explicit intersection types instead of the Prisma namespace.
*   **Rationale**: Using explicit types (e.g., `PurchaseOrder & { supplier: Supplier }`) made the UI code more resilient to fluctuations in the generated Prisma types during building.



Viewed tsconfig.json:1-26
Ran command: `grep "purchaseOrder" apps/api/node_modules/.prisma/client/index.d.ts | head -n 5`
Ran command: `grep "purchaseOrder" node_modules/.prisma/client/index.d.ts | head -n 5`
Edited schema.prisma
Edited index.ts
Ran command: `pnpm generate && pnpm run build --filter @repo/db`

I have implemented the **Localized Type Synchronization** strategy to fix the "Property 'purchaseOrder' does not exist" error.

### What was fixed:
1.  **Direct Local Output**: In a monorepo, the TypeScript language server sometimes fails to resolve types from the pnpm virtual store (`.pnpm/...`). I have modified [schema.prisma](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/packages/db/prisma/schema.prisma) to generate the Prisma Client directly into a [generated](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/packages/db/src/generated) folder within the `@repo/db` source tree.
2.  **Hard-Linked Types**: Updated [packages/db/src/index.ts](file:///home/lalo/CODING/Turborepo-Clon-00/turborepo-setup-template/packages/db/src/index.ts) to import models and the `db` instance from this local folder. This makes it physically impossible for the TypeScript server to ignore the new `purchaseOrder` model.
3.  **TSUP Bundling**: Re-built the database package. All Prisma logic and types are now bundled into the package distribution, ensuring that the API and Frontend see the exact same schema.

### Action Required:
Please **Restart your TypeScript Server** (`Ctrl+Shift+P` -> `TypeScript: Restart TS Server`) to clear the cached errors in your editor. 

With the types now physically present in the package source, your editor should immediately recognize `db.purchaseOrder` and show its corresponding fields (id, status, items, etc.).

---

### **7. Frontend Client Component & Backend Ecosystem Insulation**
*(Fixes for "Module not found: Can't resolve 'fs' & 'async_hooks'")*
*   **Problem**: Next.js App Router aggressively bundles code imported by Client Components (`"use client"`). When components like `delete-button.tsx` or `record-movement-form.tsx` imported enums using standard `import { Role } from "@repo/db"`, they accidentally dragged the gigantic Node.js-only **Prisma Client** (which requires file system libraries like `fs` and `async_hooks`) into the browser context, crashing the build.
*   **Fix**: 
    1. Reconfigured `@repo/db/package.json` to have split sub-path `"exports"`. We exposed a dedicated `.` entry point for the backend, and an isolated `./enums` entry point exclusively for browser-safe variables.
    2. Enforced pure **Type Imports** (`import type { Product } from "@repo/db"`) in Next.js Client Components, meaning the compiler strips out the Prisma namespace from the browser bundle.

### **8. TSConfig Validation Fixes (Bundler Module Resolution)**
*(Fixes for "Option 'bundler' can only be used when 'module'...")*
*   **Problem**: In order for the validation package to recognize the newly created `./enums` export from `@repo/db`, it needed `"moduleResolution": "bundler"`. However, doing so threw a compiler warning because it inherited an older CommonJS target. Furthermore, providing uppercase `"module": "ES2022"` caused parsing errors.
*   **Fix**: Explicitly set both `"moduleResolution": "bundler"` and strictly lowercase `"module": "es2022"` inside `packages/validation/tsconfig.json`.

### **9. App Router Server Action API Proxying (HttpOnly Token Gap)**
*(Fixes for "HTTP/1.1 401 Unauthorized" when fetching /products or /suppliers)*
*   **Problem**: The Enterprise Authentication subsystem sets the `token` cookie as **HttpOnly**. This is an excellent security measure (it prevents Cross-Site Scripting [XSS] attacks), but it rendered the token completely invisible to JavaScript (`document.cookie`). As a result, when client components attempted to fetch data from `http://127.0.0.1:3001`, they sent blank Authorization headers and were immediately bounced by NestJS's security guards.
*   **Fix**: 
    1. Built a secure Next.js **Server Action** (`proxyApi` inside `apps/web/app/actions/api.ts`). Server Actions execute on the backend, allowing them to legally access the `HttpOnly` cookie via `cookies().get('token')`.
    2. Rewrote all client-side data fetches (`create/page.tsx`, `products/[id]/page.tsx`, `purchase-orders/create/page.tsx`) and mutations to route through the `proxyApi()` instead of direct bare-metal network `fetch()` calls. 
*   **Rationale**: This ensures your application maintains the highest enterprise security standard possible (`HttpOnly` cookies strictly enforced) while enabling responsive React client components to dynamically query the deeply-nested NestJS architecture using Server boundaries.