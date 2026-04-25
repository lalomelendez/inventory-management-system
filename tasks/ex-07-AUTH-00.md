Excellent choice. Taking the Architect's Path means you will own every byte of your user data, which is absolutely critical when you are mapping out internal corporate tools and SME operational workflows. 

Since we are strictly following Spec-Driven Development (SDD), we will build this from the database up to the browser, ensuring the security contracts are unbreakable at every layer.

Here is your master index for **Exercise 6: The Authentication Engine**. 

Review this structure. Once you are ready, just say "Phase 1" and we will break it down into actionable tasks and write the code together.

---

### **Exercise 6: The Custom JWT Authentication Engine**

#### **Phase 1: The Identity Domain (Schema & Synchronization)**
* **Task 1.1: The User Model:** Expanding the Prisma schema to handle identities, credentials, and access roles.
* **Task 1.2: Database Migration:** Pushing the new security schema to PostgreSQL and regenerating the workspace types.

#### **Phase 2: The Security Contracts (Payload Validation)**
* **Task 2.1: The Registration Spec:** Creating strict DTOs to enforce email formats and password complexity at the backend boundary.
* **Task 2.2: The Login Spec:** Defining the exact payload required to request a token.
* **Task 2.3: Contract Propagation:** Ensuring the frontend Next.js application imports these new identity types.

#### **Phase 3: The Cryptographic Engine (NestJS Auth Module)**
* **Task 3.1: Password Hashing:** Implementing `bcrypt` so plain-text passwords never touch your database.
* **Task 3.2: User Verification:** Building the service logic to safely query a user and compare their encrypted credentials.
* **Task 3.3: Token Generation:** Configuring `@nestjs/jwt` to mint and sign the cryptographic "VIP Wristband" upon successful login.

#### **Phase 4: The Global Bouncer (Backend Protection)**
* **Task 4.1: The JWT Strategy:** Teaching NestJS how to read, decode, and validate incoming tokens from the frontend.
* **Task 4.2: Locking the Vault:** Applying Auth Guards to your existing `Products` endpoints so anonymous users can no longer read or modify inventory.
* **Task 4.3: The Identity Decorator:** Creating a custom `@CurrentUser` decorator so your API always knows *who* is making the request.

#### **Phase 5: The Frontend Vault (Next.js Session Management)**
* **Task 5.1: The Authentication UI:** Building the Register and Login forms using your strictly typed shared schemas.
* **Task 5.2: Secure Token Storage:** Designing the storage mechanism (Cookies) to hold the JWT safely in the browser.
* **Task 5.3: The Network Interceptor:** Updating your frontend `fetch` calls to automatically attach the "VIP Wristband" (Authorization header) to every backend request.
* **Task 5.4: Route Protection:** Implementing Next.js Middleware to instantly redirect unauthenticated users away from your secure dashboard back to the login screen.

---

This is a comprehensive, enterprise-grade security implementation. Let me know when you are ready to begin Phase 1!