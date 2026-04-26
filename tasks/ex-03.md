

### **Phase 1: The Modification Contract (Partial DTOs)**
Before we can update a record, we must define what is allowed to be changed. We don't want to force the frontend to send the *entire* object just to update a price.

* **Task 1.1: Define the Update Payload.** Create an `UpdateProductDto` in NestJS. Instead of writing it from scratch, use NestJS's `PartialType()` utility to extend your existing `CreateProductDto`. This mathematically guarantees that the update contract matches the creation contract, but makes all fields optional.
* **Task 1.2: Define the Identity Contract.** Establish that any targeted operation requires an `id` passed securely via the URL path, not in the request body.

### **Phase 2: The API Signatures (Routing & Controllers)**
We need to establish the backend entry points that will handle these specific operations based on the ID.

* **Task 2.1: The Destructive Route.** In your `ProductsController`, define a `@Delete(':id')` endpoint. Extract the ID parameter using the `@Param('id')` decorator.
* **Task 2.2: The Mutation Route.** Define a `@Patch(':id')` endpoint. This requires two decorators: `@Param('id')` to know *which* record to target, and `@Body()` bound to your `UpdateProductDto` to know *what* data to change.

### **Phase 3: The Persistence Implementation (Atomic DB Operations)**
With the boundaries secure, we instruct the database to perform atomic operations.

* **Task 3.1: Execute the Deletion.** In your `ProductsService`, implement a method that runs `await prisma.product.delete({ where: { id } })`.
* **Task 3.2: Execute the Update.** Implement the patch method using `await prisma.product.update({ where: { id }, data: updateDto })`. Prisma handles the "atomic" nature here—it will only overwrite the exact fields provided in the DTO, leaving the rest of the database row perfectly intact.

### **Phase 4: The UI Implementation (The "Stateful" Cycle)**
This is where the frontend must orchestrate a multi-step dance to satisfy the user's intent to edit.

* **Task 4.1: The Navigation UI.** Update your main Next.js list page (from Exercise 1) to include a "Delete" button and an "Edit" `href` next to each item, dynamically injecting the `product.id` into the URL (e.g., `/products/[id]`).
* **Task 4.2: The Read-Modify-Write Form.** Create a new dynamic route in Next.js (`app/products/[id]/page.tsx`). On load, this component must first execute a `GET` request to fetch the existing product data. Use this data to pre-populate the HTML form's default values.
* **Task 4.3: The Destructive Action.** Wire the "Delete" button from the list view to trigger a `fetch()` call with the `DELETE` method targeting your backend. Follow it immediately with a UI state refresh (like Next.js `revalidatePath()`) so the item vanishes from the screen.

### **Phase 5: The Verification (The "Aha!" Moment)**
Validate that the state of your application accurately reflects reality at every step.

* **Task 5.1: Test the Mutation.** Click "Edit" on a product. Verify the form loads with the correct existing data. Change a value, hit submit, and ensure the UI redirects you to the main list with the newly updated value displayed.
* **Task 5.2: Test the Deletion.** Click "Delete" on an item. Verify that it is instantly removed from the UI and, more importantly, check Prisma Studio to confirm the row has been permanently excised from the PostgreSQL database.


I have completed all tasks specified in 

phase-03.md
. The application now supports full CRUD operations (Create, Read, Update, Delete) for the Product entity.

Phase 1: Modification Contract
Installed @nestjs/mapped-types.
Created 

UpdateProductDto
 using PartialType, ensuring all fields are optional for atomic updates while maintaining validation overhead.
Phase 2 & 3: API Signatures & Atomic Operations
Added GET /products/:id, PATCH /products/:id, and DELETE /products/:id endpoints to 

ProductsController
.
Implemented findOne, update, and remove methods in 

ProductsService
 using Prisma's atomic operations.
Phase 4: UI Implementation (The Stateful Cycle)
List Page Enhancements: Updated the 

Home Page
 to include Edit links and a Delete button for every product.
Delete Action: Created a Client Component 

DeleteProductButton
 that handles the destructive fetch request and triggers a UI refresh.
Edit Workflow: Created a dynamic route 

apps/web/app/products/[id]/page.tsx
. This page implements the Read-Modify-Write pattern:
Fetches existing product data on load.
Pre-populates the form.
Executes a PATCH request to synchronize changes.
Verification Checklist:
Test Mutation: On the home page, click Edit on any product. Change the price or name and hit Update Specification. You should be redirected back with the updated data displayed.
Test Deletion: Click Delete on a product. After confirming the browser prompt, the item will vanish from the UI and the database.
The total vertical slice is now complete! All operations are strictly typed and validated through the entire stack. Let me know if you have a Phase 4 or further refinements planned!