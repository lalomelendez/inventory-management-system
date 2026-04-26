# **Phase 1: Advanced Authorization (Departmental Boundaries)**

Right now, anyone with a token can do anything. We must enforce the boundaries between departments so logistics teams and administrative staff only interact with their specific domains.

- **Step 1.1: Backend Role Guards:** We will create custom NestJS decorators (`@Roles('LOGISTICS', 'ADMIN')`) to protect specific endpoints. A `USER` can view stock, but only `LOGISTICS` can receive a shipment, and only `HR` or `ADMIN` can create new employee accounts.
- **Step 1.2: UI Feature Toggling:** The Next.js frontend needs to read the JWT payload and dynamically hide or show UI elements. If you aren't an admin, the "Delete Product" button shouldn't just fail when clicked—it shouldn't render on the screen at all.

---

---

## **Phase 1: Advanced Authorization**. tasks

Welcome back to the architect's desk.

To upgrade our system from a simple access list to a strict departmental hierarchy, we must follow our Spec-Driven Development (SDD) principles. We will build the backend "Role Enforcer" first, and then teach the frontend how to read the user's identity to adapt the UI.

Here is your clear, step-by-step execution plan for **Phase 1: Advanced Authorization**.

---

### **Part 1: Backend Role Guards (The Departmental Enforcer)**

We are going to teach the NestJS Bouncer to look at the *specific* role inside the JWT payload before granting access to a route.

### **Task 1.1: The Roles Contract (Decorator)**

We need a way to label our endpoints with the allowed departments.

1. **Navigate to your Auth Module:** Open `apps/api/src/auth/`.
2. **Create the Decorator:** Create a new file named `roles.decorator.ts`.
3. **The Implementation:** Use NestJS's `SetMetadata` to create a `@Roles()` decorator. It should accept a list of roles (using the `Role` enum imported from your `@repo/db` package) and attach them to the route's metadata.

### **Task 1.2: The Roles Guard (The Logic)**

Now we need the actual guard that checks the user's wristband against the required roles.

1. **Create the Guard:** Create `apps/api/src/auth/roles.guard.ts`.
2. **The Logic:** * Inject the NestJS `Reflector` (this reads the metadata you set in Task 1.1).
    - Inside the `canActivate` method, retrieve the required roles. If there are none, return `true`.
    - Extract the user from the request (`const { user } = context.switchToHttp().getRequest();`).
    - Check if `requiredRoles.includes(user.role)`. Return `true` if they match, or `false` (which automatically throws a 403 Forbidden error).

### **Task 1.3: Enforcing the Vault (Controller Wiring)**

Apply your new rules to the `ProductsController`.

1. **Open the Controller:** Navigate to `apps/api/src/products/products.controller.ts`.
2. **Apply the Guards:** * Update the class-level `@UseGuards()` decorator to include BOTH guards: `@UseGuards(JwtAuthGuard, RolesGuard)`. (The JWT guard must run first to populate `req.user`).
3. **Tag the Endpoints:**
    - Leave `@Get()` alone (or tag it with `@Roles(Role.USER, Role.LOGISTICS, Role.ADMIN)` if you want to be explicit).
    - Above your `@Post()` (create) and `@Patch()` (update), add `@Roles(Role.LOGISTICS, Role.ADMIN)`.
    - Above your `@Delete()` route, add `@Roles(Role.ADMIN)`.

---

### **Part 2: UI Feature Toggling (The Adaptive Dashboard)**

The backend is now secure. If a `USER` tries to delete an item, they get a `403 Forbidden`. But we must provide a good UX: they shouldn't even see the button.

### **Task 1.4: The Frontend Identity Decoder**

Next.js needs to read the JWT payload (the middle section of the token) to know the user's role without making a round-trip to the database.

1. **Create a Session Utility:** Navigate to `apps/web/app/` and create a `lib/session.ts` file (or put it in your `actions` folder).
2. **The Logic:** Write a function `getUserSession()`.
    - Read the `token` from `cookies().get('token')`.
    - If it exists, split the string by the period (`token.split('.')[1]`).
    - Decode that middle base64 string using `Buffer.from(payload, 'base64').toString()`.
    - Parse the JSON to return the user object: `{ sub, email, role }`.

### **Task 1.5: UI Toggling (Conditional Rendering)**

Adapt the Next.js UI to respect the user's department.

1. **Update the List View:** Open `apps/web/app/products/page.tsx` (or wherever your list is rendered).
2. **Inject the Session:** Call your new `getUserSession()` at the top of the Server Component to get the current user's `role`.
3. **Conditional Renders:**
    - Wrap the `+ Add Product` link in a condition: `if (role === 'ADMIN' || role === 'LOGISTICS') { render link }`.
    - Pass the `role` down as a prop to your `DeleteProductButton` client component. Inside that component, if `role !== 'ADMIN'`, return `null` so it becomes invisible.

---

### **🧪 Testing Instructions (Verification)**

We must verify both the visual UI and the invisible backend perimeter.

**Test 1: The UI Disappearance**

1. Log in to the Next.js frontend using an account with the `USER` role.
2. Navigate to the Products dashboard.
3. **Verify:** The "Add Product" and "Delete" buttons should be completely gone from the screen.

**Test 2: The Direct Backend Assault**

1. Grab the JWT for the `USER` account from your browser cookies.
2. Open your API client (Postman/Thunder Client).
3. Attempt to send a `DELETE` request to `http://127.0.0.1:3001/products/{id}` using the `USER` token.
4. **Verify:** You should receive a strict `403 Forbidden` response. The backend enforcer works.

Execute these tasks. When your UI magically adapts to the logged-in department and your backend correctly blocks unauthorized roles, let me know. We will then have a truly multi-departmental foundation ready for Phase 2: Supply Chain Expansion!

When you are wiring up Role-Based Access Control (RBAC), the bugs can be incredibly frustrating because they usually result in silent failures or getting locked out of your own system.

Here is your troubleshooting runbook for the Advanced Authorization phase. Keep this handy while you build.

---

### **🚑 The Authorization Troubleshooting Guide**

### **Backend (NestJS) Issues**

- **Symptom:** Your `RolesGuard` crashes with `TypeError: Cannot read properties of undefined (reading 'role')`.
    - **The Cause:** The Bouncer isn't passing the wristband to the Guard. In NestJS, guards run in the exact order they are listed. If your `RolesGuard` runs *before* the `JwtAuthGuard`, `request.user` hasn't been populated yet.
    - **The Fix:** Open your controller and ensure the order is strictly: `@UseGuards(JwtAuthGuard, RolesGuard)`. The JWT guard must validate the token and attach the user object to the request first.
- **Symptom:** You are logged in as an `ADMIN`, but you get a `403 Forbidden` on every protected route.
    - **The Cause:** The `Reflector` is failing to read the metadata, so it thinks the required roles are undefined, or there is a mismatch between your Prisma Enum and the string evaluation.
    - **The Fix:** 1. Check your `roles.decorator.ts`. Ensure the metadata key (e.g., `'roles'`) exactly matches the key you are querying in `roles.guard.ts`: `this.reflector.getAllAndOverride<Role[]>('roles', ...)`
        
        2. Add a temporary `console.log(user.role, requiredRoles)` inside your `canActivate` method to visually verify that the payload matches the required array.
        

### **Frontend (Next.js) Issues**

- **Symptom:** Next.js throws an error saying `Buffer is not defined` or `btoa is not defined` when trying to decode the JWT.
    - **The Cause:** You are trying to run Node.js-specific code (`Buffer`) inside a Next.js Edge runtime or a Client Component.
    - **The Fix:** Ensure your `getUserSession()` utility is only being executed inside a Next.js **Server Component** (like `page.tsx` without the `"use client"` directive). If you must decode it in a broader environment, use the built-in browser `atob()` function, but Server Components are much safer for evaluating identity.
- **Symptom:** Your Client Component (like `DeleteProductButton`) crashes because it can't read the `token` from the cookies.
    - **The Cause:** In Phase 5, we deliberately set the cookie as `HttpOnly`. This was a security decision to prevent XSS attacks. By design, no Client Component (`"use client"`) can ever read an `HttpOnly` cookie.
    - **The Fix:** **Do not try to read the cookie in the Client Component.** Read the cookie and decode the JWT in the parent Server Component (e.g., `app/products/page.tsx`), extract the `role`, and pass that role down as a simple prop:
        
        `<DeleteProductButton productId={item.id} userRole={role} />`
        
- **Symptom:** You conditionally hid the "Delete" button, but a user navigated to the page, and the button flashed on the screen for a split second before disappearing (Hydration Mismatch).
    - **The Cause:** This happens if you evaluate the role on the client side after the initial HTML was painted by the server.
    - **The Fix:** Evaluating the role on the Server Component and passing it down as a prop (as described above) completely prevents this. The server will never render the HTML for the button in the first place if the user isn't an admin.

Keep an eye out for these specific hurdles. The boundary between Server Components and Client Components is where 90% of RBAC bugs happen in Next.js. Let me know when you have navigated this and successfully locked down the departments!





Implementation Plan - Phase 1: Advanced Authorization
This plan outlines the steps to implement Role-Based Access Control (RBAC) across the Enterprise Monorepo, ensuring that only authorized departments can perform specific actions on products.

User Review Required
IMPORTANT

The product list is currently located in apps/web/app/page.tsx instead of apps/web/app/products/page.tsx as mentioned in the original task description. I will implement the UI toggling in the main page.

Proposed Changes
Backend (NestJS API)
[NEW] 
roles.decorator.ts
Create a custom decorator to attach role metadata to routes.
[NEW] 
roles.guard.ts
Implement the guard logic to check the user's role against the required roles for a route.
[MODIFY] 
products.controller.ts
Apply JwtAuthGuard and RolesGuard to the controller.
Tag endpoints with @Roles(...) as specified:
POST / PATCH: LOGISTICS, ADMIN
DELETE: ADMIN
Frontend (Next.js Web)
[NEW] 
session.ts
Create a utility to decode the JWT from cookies and extract user information (id, email, role).
[MODIFY] 
page.tsx
Use getUserSession to get the user's role.
Conditionally render the "+ Add Product" button (only for ADMIN or LOGISTICS).
Pass the role to the DeleteProductButton.
[MODIFY] 
delete-button.tsx
Add role prop.
Return null if the user is not an ADMIN.
Verification Plan
Manual Verification
Test 1: The UI Disappearance
Login: Log in to the Next.js frontend using an account with the USER role.
Navigate: Go to the Products dashboard (main page).
Verify: Ensure the "+ Add Product" link and "Delete" buttons are completely hidden from the screen.
Test 2: The Direct Backend Assault
Extract Token: Grab the JWT for the USER account from the browser cookies.
Request: Open an API client (Postman/Thunder Client/cURL).
Attack: Attempt to send a DELETE request to http://127.0.0.1:3001/products/{id} using the USER token in the Authorization header.
Verify: Confirm a 403 Forbidden response.
Test 3: Admin Full Access (Implicit but necessary)
Login: Log in as an ADMIN.
Verify: Ensure all UI elements are visible and API requests (POST/PATCH/DELETE) succeed.


---


Walkthrough - Phase 1: Advanced Authorization
I have successfully implemented Role-Based Access Control (RBAC) across the stack.

Changes Made
Backend (NestJS)
Roles Decorator: Created 
roles.decorator.ts
 to tag routes with required roles.
Roles Guard: Created 
roles.guard.ts
 that extracts user info from the request and validates their role against the decorator's metadata.
Controller Enforcement: Updated 
products.controller.ts
 to require specific roles:
POST & PATCH: LOGISTICS or ADMIN
DELETE: ADMIN only.
Frontend (Next.js)
Session Utility: Created 
session.ts
 to server-side decode the JWT from the token cookie.
Main Page: Updated 
page.tsx
 to read user roles and conditionally hide the "+ Add Product" button.
Delete Button: Updated 
delete-button.tsx
 to receive the userRole prop and render null if the user is not an ADMIN.
Verification Instructions
IMPORTANT

To verify these changes, please follow the manual tests outlined in the 
implementation_plan.md
.

Quick Summary of Tests:
User View: Login as USER. The "Add Product" and "Delete" buttons should not appear.
Admin View: Login as ADMIN. All buttons should be visible.
API Security: Try a DELETE request manually with a USER token; it should return 403 Forbidden.

