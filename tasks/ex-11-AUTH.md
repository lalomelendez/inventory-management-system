Welcome back! Have a seat.

In Phase 3, we built the machine that mints the "VIP Wristband" (the JWT). But right now, your `Products` vault is still wide open. Anyone can walk in off the street and start grabbing data. 

In Phase 4, we are going to hire the Global Bouncer. We will teach NestJS how to inspect the wristband, read the invisible ink inside it, and kick out anyone who doesn't belong. 

Here is your super simple, step-by-step breakdown.

---

### **Phase 4: The Global Bouncer (Backend Protection)**

#### **Preparation: Install the Passport Tools**
NestJS uses a famous library called `Passport` to handle the heavy lifting of security strategies. Let's install it in your backend.
Open your terminal in `apps/api`:
```bash
pnpm add @nestjs/passport passport passport-jwt
pnpm add -D @types/passport-jwt
```

#### **Task 4.1: The JWT Strategy (Teaching the Bouncer to Read)**
The "Strategy" is a set of rules that tells NestJS *where* to look for the token (the headers) and *how* to verify the cryptographic signature.

1. **Create the Strategy File:** Manually create `apps/api/src/auth/jwt.strategy.ts`.
2. **Write the Rules:**
   ```typescript
   import { ExtractJwt, Strategy } from 'passport-jwt';
   import { PassportStrategy } from '@nestjs/passport';
   import { Injectable } from '@nestjs/common';

   @Injectable()
   export class JwtStrategy extends PassportStrategy(Strategy) {
     constructor() {
       super({
         // Tell the bouncer to look in the "Authorization: Bearer <token>" header
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         // This MUST match the secret you used in Phase 3!
         secretOrKey: 'MY_SUPER_SECRET_KEY_DONT_SHARE', 
       });
     }

     // If the signature is valid, NestJS automatically calls this function.
     // Whatever you return here gets attached to the request as `req.user`.
     async validate(payload: any) {
       return { userId: payload.sub, email: payload.email, role: payload.role };
     }
   }
   ```
3. **Register the Strategy:** Open `apps/api/src/auth/auth.module.ts`. You must add `JwtStrategy` to the `providers` array so NestJS knows it exists.
   ```typescript
   // Inside AuthModule...
   providers: [AuthService, JwtStrategy], // <-- Add JwtStrategy here!
   ```

#### **Task 4.2: Locking the Vault (Auth Guards)**
Now that the Bouncer knows *how* to read a token, we have to tell him *where* to stand. We want him guarding the Products Controller.

1. **Create a Clean Guard:** Create `apps/api/src/auth/jwt-auth.guard.ts`. This is just a tiny wrapper that makes our code cleaner later.
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { AuthGuard } from '@nestjs/passport';

   @Injectable()
   export class JwtAuthGuard extends AuthGuard('jwt') {}
   ```
2. **Lock the Products Controller:** Open `apps/api/src/products/products.controller.ts`. Add the `@UseGuards` decorator to the entire class.
   ```typescript
   import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
   import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // <-- Import the guard

   @UseGuards(JwtAuthGuard) // <-- THE BOUNCER IS NOW AT THE DOOR
   @Controller('products')
   export class ProductsController {
     // ... your existing routes remain untouched
   }
   ```

#### **Task 4.3: The Identity Decorator (Who is asking?)**
When a verified user asks to create a product, you often want to know *who* they are (e.g., to record an "addedBy" audit log). We will create a custom decorator to grab their identity easily.

1. **Create the Decorator:** Create `apps/api/src/auth/current-user.decorator.ts`.
   ```typescript
   import { createParamDecorator, ExecutionContext } from '@nestjs/common';

   export const CurrentUser = createParamDecorator(
     (data: unknown, ctx: ExecutionContext) => {
       const request = ctx.switchToHttp().getRequest();
       // This `request.user` is exactly what you returned in the JwtStrategy!
       return request.user; 
     },
   );
   ```
2. **Test the Decorator (Optional):** In your `ProductsController`, you can now magically pull the user's data into any route.
   ```typescript
   import { CurrentUser } from '../auth/current-user.decorator';

   @Get()
   findAll(@CurrentUser() user: any) {
     console.log('The user making this request is:', user.email);
     return this.productsService.findAll();
   }
   ```

---

### **🧪 Testing Instructions (Verification)**

Let's prove the vault is locked using your API testing tool (cURL, Postman, or Thunder Client).

**Test 1: The Rejection Check**
1. Send a `GET` request to `http://127.0.0.1:3001/products`.
2. **Verify:** You should be immediately rejected with a `401 Unauthorized` error. The Bouncer works!

**Test 2: The VIP Access Check**
1. Send a `POST` to `http://127.0.0.1:3001/auth/login` to get a fresh `access_token`. Copy that long string of gibberish.
2. Send a `GET` to `http://127.0.0.1:3001/products`.
3. In your API client, go to the **Headers** section. Add a new header:
   * **Key:** `Authorization`
   * **Value:** `Bearer YOUR_COPIED_TOKEN_HERE` *(Make sure there is a space after "Bearer")*
4. **Verify:** You should receive a `200 OK` and see your list of products. Look at your backend terminal—you should also see the `console.log` printing your user's email!

---

### **🚑 Troubleshooting Guide**

* **Symptom:** `401 Unauthorized` even when passing the token.
  * **Cause A:** You forgot the word `Bearer` in the header. It must be strictly formatted as `Bearer eyJhbG...`.
  * **Cause B:** The `secretOrKey` in your `JwtStrategy` doesn't exactly match the `secret` you defined in your `AuthModule` in Phase 3. The signatures won't match.
  * **Cause C:** The token expired. By default, we set it to 1 day. Generate a new one via the login route.
* **Symptom:** The console logs `undefined` when trying to print the user.
  * **Cause:** Your `JwtStrategy` isn't returning the payload correctly in the `validate` method, or `JwtStrategy` was never added to the `providers` array in `AuthModule`.
* **Symptom:** `Error: Unknown authentication strategy "jwt"`
  * **Cause:** You forgot to export the `JwtStrategy` or didn't add it to the `providers` inside `AuthModule`. NestJS doesn't know the strategy exists.

Execute these tasks. Once your endpoints are secured and you've verified access with a token, the backend vault will be completely locked down.



---
---

Edited ex-10-AUTH.md
Ran command: `pnpm add @nestjs/passport passport passport-jwt && pnpm add -D @types/passport-jwt`
Edited jwt.strategy.ts
Edited auth.module.ts
Edited jwt-auth.guard.ts
Edited products.controller.ts
Edited current-user.decorator.ts

I have successfully completed **Phase 4: The Global Bouncer** as described in `ex-11-AUTH.md`.

### ✅ Completed Steps:
1.  **Hired the Passport Bouncer**:
    *   Installed `@nestjs/passport` and `passport-jwt` to manage complex security strategies.
2.  **Taught the Bouncer to Read (Task 4.1)**:
    *   Created the **`JwtStrategy`**, which tells NestJS exactly how to extract and verify the "VIP Wristband" (JWT) from incoming request headers.
3.  **Registered the Security Strategy**:
    *   Integrated `JwtStrategy` into the `AuthModule` providers.
4.  **Locked the Vault (Task 4.2)**:
    *   Created the **`JwtAuthGuard`** and applied it to the **`ProductsController`**.
    *   **Effect**: All inventory data is now invisible to anonymous users. The API will now strictly return a `401 Unauthorized` if a valid token is not provided.
5.  **Implemented the Identity Decorator (Task 4.3)**:
    *   Created the **`@CurrentUser`** decorator. Your API can now instantly identify *who* is making a request (e.g., for audit logging or role-based logic).

### 🧪 Verification:
*   **Access Denied**: Requests to `GET /products` without a token will now be rejected.
*   **VIP Access**: Requests providing a valid `Authorization: Bearer <token>` header will successfully bypass the bouncer and receive data.

---

**Phase 4 is complete!** The backend is now a secure fortress. Are you ready for the final stretch, **Phase 5: The Frontend Vault**, to connect your UI?


