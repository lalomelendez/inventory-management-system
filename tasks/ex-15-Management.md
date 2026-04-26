
# **Phase 2: Supply Chain Expansion (The Logistics Map)**

Products don't exist in a vacuum; they come from somewhere and live somewhere. We need to expand the Prisma domain model.

- **Step 2.1: Supplier Management:** Create a `Supplier` entity to track vendors, contact info, and lead times. A Product will now have a relationship to its primary Supplier.
- **Step 2.2: Location Mapping:** Create a `Location` or `Warehouse` entity. If you are managing operations across different sites, the system needs to track whether a keyboard is in "Warehouse A - Aisle 3" or "Warehouse B - Shelf 1".

---

## **Phase 2: Supply Chain Expansion**. Tasks

Welcome back to the architect's desk.

We are about to take your application out of the digital ether and map it to physical reality. A product isn't just a name and a price anymore; it is a physical box sitting on a specific warehouse shelf, ordered from a specific vendor.

In Spec-Driven Development, we never touch the frontend or the API until the database and the contracts reflect this new physical reality.

Here is your step-by-step execution plan for **Phase 2: Supply Chain Expansion**.

---

### **Part 1: The Domain Model (Schema Design)**

We must define the `Supplier` and `Location` entities and physically wire them to your `Product`.

- **Task 2.1: Define the Entities:** Open `packages/db/prisma/schema.prisma`. Add the two new models.
    - Create a `Supplier` model (fields: `id`, `name`, `contactEmail`, `leadTimeDays`).
    - Create a `Location` model (fields: `id`, `name`, `aisle`, `shelf`).
- **Task 2.2: Wire the Relationships:** Update your existing `Product` model. Add `supplierId` and `locationId` as foreign keys, and map the `@relation` for both just like you did with Category. (One Supplier has many Products; One Location has many Products).
- **Task 2.3: Synchronize the Vault:** * Run `pnpm --filter @repo/db exec prisma db push` from the root to alter the PostgreSQL tables.
    - Run `pnpm run build --filter @repo/db` to compile and broadcast the new types to the monorepo.

---

### **Part 2: The Security Contracts (Payload Validation)**

Now that the database requires a Supplier and a Location to create a Product, we must update the Bouncer's rulebook to enforce this.

- **Task 2.4: Update the SSOT (Zod):** Open `packages/validation/src/index.ts`. Add `supplierId: z.string()` and `locationId: z.string()` to your `CreateProductSchema`. Rebuild the package (`pnpm run build --filter @repo/validation`).
- **Task 2.5: Update the API DTOs:** Open `apps/api/src/products/dto/create-product.dto.ts`. Add the `@IsString()` and `@IsNotEmpty()` decorators for both `supplierId` and `locationId`. *(Note: Because we used `PartialType` in Phase 3, your `UpdateProductDto` will automatically inherit these as optional fields!)*

---

### **Part 3: The API Implementation (Hydration & Lookups)**

The backend must now serve the new 3D data structure and provide reference lists for the frontend forms.

- **Task 2.6: The Eager Load Expansion:** Open `apps/api/src/products/products.service.ts`. Find your `findAll()` method and expand the SQL JOIN:
    
    `include: { category: true, supplier: true, location: true }`.
    
- **Task 2.7: Scaffold Lookup Endpoints:** The frontend needs to know what locations and suppliers exist to build the dropdown menus.
    - Use the NestJS CLI to quickly generate the scaffolding: `npx nest g resource suppliers` and `npx nest g resource locations` (inside `apps/api`).
    - In their respective controllers, create simple `GET` endpoints that return `this.db.supplier.findMany()` and `this.db.location.findMany()`.
    - *Crucial:* Don't forget to protect these new endpoints with your `@UseGuards(JwtAuthGuard)`!

---

### **Part 4: UI Orchestration (The Logistics Dashboard)**

Finally, the frontend must adapt to display this new physical mapping and capture the new foreign keys during data entry.

- **Task 2.8: The Nested Render:** Open your main list view (`apps/web/app/products/page.tsx`). You can now safely render `product.supplier.name` and `product.location.aisle` on the screen because the backend is actively serving them.
- **Task 2.9: Fetch the Lookups:** In your "Add Product" and "Edit Product" forms, add `fetch()` calls to grab the data from your new `/suppliers` and `/locations` API endpoints.
- **Task 2.10: The Relational Inputs:** Add two new `<select>` dropdowns to your forms (just like you did for Categories). Map over the suppliers and locations so the user can select them visually, while capturing the `id` for the form submission state.

---

### **🧪 Testing Instructions (Verification)**

**Test 1: The Database Seed**

1. Open `npx prisma studio`.
2. Manually create at least one `Supplier` (e.g., "TechCorp") and one `Location` (e.g., "Warehouse A - Aisle 1"). This gives you valid foreign keys to test with.

**Test 2: The Contract Blockade**

1. Open your Next.js application, go to the "Add Product" form, and deliberately leave the Supplier and Location dropdowns blank.
2. Hit submit.
3. **Verify:** The UI should immediately halt you (thanks to the Zod schema), and if you bypass the UI, the NestJS backend should throw a `400 Bad Request` (thanks to the DTOs).

**Test 3: The Full Logistics Flow**

1. Fill out the "Add Product" form completely, selecting your seeded Category, Supplier, and Location.
2. Submit the form.
3. **Verify:** You are redirected to the dashboard, and your new product proudly displays exactly *what* it is, *where* it is, and *who* supplied it.

### **🚑 Troubleshooting Guide**

- **Symptom:** Next.js throws an error like `Property 'supplier' does not exist on type 'ProductWithCategory'`.
    - **Cause:** You updated the Prisma types, but your frontend intersection type (`ProductWithCategory`) wasn't updated to include the new relationships.
    - **Fix:** Update your frontend type definition. Remember the senior trick from earlier: `type FullProduct = Prisma.ProductGetPayload<{ include: { category: true, supplier: true, location: true } }>;`
- **Symptom:** The dropdowns in the UI are empty, but Prisma Studio shows data.
    - **Cause:** The `fetch` request to `/suppliers` or `/locations` failed, likely because you forgot to attach the JWT `Authorization: Bearer <token>` header in the Client Component.
    - **Fix:** Ensure your frontend fetching logic passes the user's token to these new lookup endpoints, just like it does for the main `/products` endpoint.

Execute these tasks. When your dashboard transforms from a simple list into a 3-dimensional map of your supply chain, let me know! We will then tackle the hardest, most powerful phase: **Phase 3: The Immutable Ledger**.

---

Welcome to the realities of relational data! When you start tying tables together, the potential for breaking things increases exponentially.

If something goes wrong during Phase 2 (Supply Chain Expansion), it is almost always an issue with **Type Synchronization**, **Foreign Key Constraints**, or **Nested Eager Loading**.

Here is your dedicated troubleshooting guide for this phase. Keep it open while you build.

---

### **🚑 Troubleshooting Guide: Supply Chain Expansion**

### **1. Database & Prisma Issues**

- **Symptom:** You run `pnpm --filter @repo/db exec prisma db push` and get an error: *"Cannot add a required column... because there is existing data."*
    - **The Cause:** You told Prisma that every `Product` *must* have a `supplierId` and a `locationId`. But you already have products in your database (like your "Quantum Keyboard" from Exercise 1) that don't have these IDs. PostgreSQL panics because it doesn't know what to do with the old data.
    - **The Fix:** Because this is local development, the easiest fix is to wipe the database clean and start fresh with the new rules. Run:Bash
        
        `pnpm --filter @repo/db exec prisma db push --force-reset`
        
        *(Note: You will need to recreate your dummy users and categories afterward).*
        

### **2. Monorepo Synchronization Issues**

- **Symptom:** Next.js or NestJS throws a compiler error: `Property 'supplierId' does not exist on type 'CreateProductDto'` or similar Zod errors.
    - **The Cause:** You updated `schema.prisma` and `packages/validation`, but you forgot to build the packages. The apps are still reading the old `.d.ts` files from memory.
    - **The Fix:** Always run the build command for your governing packages after changing a contract:Bash
        
        `pnpm run build --filter @repo/validation
        pnpm run build --filter @repo/db`
        

### **3. Backend (NestJS) Issues**

- **Symptom:** Your Next.js app crashes with `TypeError: Cannot read properties of undefined (reading 'name')` when trying to render `{product.supplier.name}`.
    - **The Cause:** Next.js expects the supplier data, but NestJS didn't send it. By default, Prisma does *not* fetch related tables unless you explicitly tell it to.
    - **The Fix:** Open `apps/api/src/products/products.service.ts`. Ensure your `findMany` query includes the SQL joins:TypeScript
        
        `return await this.db.product.findMany({
          include: { category: true, supplier: true, location: true },
        });`
        
- **Symptom:** You get a `401 Unauthorized` when the "Add Product" form tries to load the Locations or Suppliers dropdowns.
    - **The Cause:** You generated the new `/locations` and `/suppliers` endpoints in NestJS, but you secured them with `@UseGuards(JwtAuthGuard)`. The Next.js frontend is trying to fetch them without attaching the user's "VIP Wristband" (JWT).
    - **The Fix:** Update the `fetch()` calls in your Next.js forms to include the `Authorization: Bearer <token>` header, exactly like you did for the main `/products` dashboard.

### **4. Frontend (Next.js) & UI Issues**

- **Symptom:** You fill out the "Add Product" form, hit submit, and the NestJS backend returns a `400 Bad Request` saying `"supplierId must be a string"`, even though you have a dropdown menu.
    - **The Cause:** Your HTML `<select>` input might have a default option like `<option value="">Select a Supplier</option>`. If the user doesn't change it, Next.js submits an empty string `""`.
    - **The Fix:** Your Zod schema (`packages/validation`) should catch this before it even hits the backend. Make sure your Zod schema uses `.min(1, "Please select a supplier")` so the UI halts the user and highlights the dropdown in red.
- **Symptom:** Next.js build fails with `Type 'Product & ...' is not assignable to type '...'.`
    - **The Cause:** You are manually trying to type the nested object in Next.js, and you missed a field.
    - **The Fix:** Stop guessing types in the frontend. Use Prisma's built-in payload generator to create a mathematically perfect type that matches your exact backend `include` statement:TypeScript
        
        `import { Prisma } from "@repo/db";
        
        type FullyLoadedProduct = Prisma.ProductGetPayload<{
          include: { category: true; supplier: true; location: true }
        }>;`
        

Keep your terminal logs visible (`"ui": "stream"` in Turborepo will save your life here) and tackle the errors one boundary at a time: Database -> API -> UI.