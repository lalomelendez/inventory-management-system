Welcome back to class! 

When you are mapping out corporate departments to build a functional MVP, this phase is where you establish your digital hierarchy. A logistics manager checking inventory needs different system access than an administrative HR director. 

In Spec-Driven Development, we don't start writing login forms; we start by defining the absolute truth of what a "User" and their "Role" look like in the database.

Here is your super simple, step-by-step breakdown for Phase 1.

---

### **Phase 1: The Identity Domain (Schema & Synchronization)**

#### **Task 1.1: Define the Domain Model (The Schema)**
Before anyone can log in, we need a secure place to put them. We are going to add a `User` table and an `Enum` to strictly define corporate roles.

1. **Open your SSOT:** Navigate to `packages/db/prisma/schema.prisma`.
2. **Define the Roles:** Above your models, define an enumeration. This locks down the exact roles allowed in your system, preventing typos like "admn" from breaking your routing logic later.
   ```prisma
   enum Role {
     ADMIN
     HR
     LOGISTICS
     USER
   }
   ```
3. **Create the User Model:** Add the following model to the file. Notice that we are storing a `password`—we will ensure this is cryptographically hashed in Phase 3.
   ```prisma
   model User {
     id        String   @id @default(cuid())
     email     String   @unique
     password  String   // Will store the bcrypt hash, NEVER plain text
     role      Role     @default(USER)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

#### **Task 1.2: Database Synchronization (The Push)**
Now that the blueprint is written, we must push it to PostgreSQL and generate the TypeScript contracts for the monorepo.

1. **Push the Schema:** Open your terminal at the **root** of your workspace and run:
   ```bash
   pnpm --filter @repo/db exec prisma db push
   ```
2. **Compile the Governing Package:** We must build the `@repo/db` package so the new `User` type is broadcasted to Next.js and NestJS.
   ```bash
   pnpm run build --filter @repo/db
   ```

---

### **🧪 Testing Instructions (Verification)**

As a senior dev, you never assume a command worked just because it didn't throw an error. Let's verify the contract.

**Test 1: The Database Reality Check**
1. Run `npx prisma studio` from inside the `packages/db` directory.
2. A browser tab will open. You should see a new `User` model listed alongside your `Product` and `Category` models.
3. Click into `User` and click "Add Record". Verify that the `role` column forces you to choose from a dropdown (`ADMIN`, `HR`, `LOGISTICS`, `USER`). If it does, your database is successfully enforcing the contract.

**Test 2: The TypeScript Reality Check**
1. Open any frontend file, like `apps/web/app/page.tsx`.
2. At the top, temporarily import the User type: 
   ```typescript
   import { Product, User, Role } from "@repo/db";
   ```
3. If your IDE auto-completes this and doesn't show a red squiggly line, your monorepo successfully synchronized the new security types. (You can delete that import after verifying).

---

### **🚑 Troubleshooting Guide**

If things go wrong during this phase, it is usually a synchronization hiccup.

* **Symptom:** `Error: Type "Role" already exists` (or similar Prisma enum error).
  * **Cause:** PostgreSQL can be strict about altering Enums if you change them later.
  * **Fix:** If this is a local dev environment, you can force Prisma to drop and recreate the DB to match the new schema: `pnpm --filter @repo/db exec prisma db push --force-reset`. *(Warning: This wipes local data!)*
* **Symptom:** The IDE says `Module '"@repo/db"' has no exported member 'User'`.
  * **Cause:** Turborepo cache hit a false positive, or the build step failed. The apps are looking at old `.d.ts` files.
  * **Fix:** Manually clear the cache and rebuild the database package:
    ```bash
    rm -rf packages/db/.turbo
    rm -rf packages/db/dist
    pnpm turbo run generate
    pnpm run build --filter @repo/db
    ```

Execute these tasks. Once your database is fully aware of `User` and `Role`, let me know, and we will move to **Phase 2: The Security Contracts**!


------
Edited schema.prisma
Listed directory turborepo-setup-template
Ran command: `docker ps`
Ran command: `docker compose up -d`
Ran command: `pnpm --filter @repo/db exec prisma db push`
Ran command: `pnpm run build --filter @repo/db`
Viewed index.d.ts:1-4

I have successfully completed **Phase 1: The Identity Domain** as outlined in `ex-08-AUTH.md`.

### ✅ Completed Steps:
1.  **Updated `schema.prisma`**:
    *   Defined the `Role` enum (`ADMIN`, `HR`, `LOGISTICS`, `USER`).
    *   Updated the `User` model to include the `role` field (defaulting to `USER`) and added an `updatedAt` timestamp.
2.  **Synchronized Database**:
    *   Ensured the PostgreSQL container was running.
    *   Executed `prisma db push` to synchronize the schema with the database.
3.  **Broadcasting Types**:
    *   Built the `@repo/db` package to generate and export the new TypeScript contracts across your monorepo.

### 🧪 Verification:
*   The database is successfully in sync.
*   The new `User` and `Role` types are now available to both your NestJS API and Next.js frontend.

---

**Phase 1 is now complete!** Are you ready to move to **Phase 2: The Security Contracts** (payload validation and Zod schemas)?