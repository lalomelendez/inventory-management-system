Edited ex-12-AUTH.md

To test your new Authentication Engine, follow these precise steps. This will verify the security of the database, the API bouncer, and the Next.js middleware.

### 1. Launch the Environment
Ensure your containers and dev servers are running.
```bash
# Terminal 1: Database
docker compose up -d

# Terminal 2: Turborepo
pnpm dev
```

### 2. Create your "Corporate Identity"
Since we haven't built the Registration UI yet, use this command to create your first user directly via the API:
```bash
curl -X POST http://127.0.0.1:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@enterprise.com", "password": "SecurePassword123"}'
```
*Expected Result: You should receive a JSON object of your user profile (without the password).*

### 3. Test the "Bouncer" (Middleware)
1.  Open your browser and navigate to `http://localhost:3000/`.
2.  **Observation**: You should be instantly redirected to `http://localhost:3000/login`.
3.  Try to visit `http://localhost:3000/create` manually.
4.  **Observation**: You should again be bounced back to the login screen.
*This proves your Next.js Middleware is successfully guarding the operational routes.*

### 4. The VIP Entry (Login)
1.  On the Login page, enter:
    *   **Email**: `admin@enterprise.com`
    *   **Password**: `SecurePassword123`
2.  Click **Login**.
3.  **Observation**: You should be redirected back to the Home dashboard, where your products/inventory are now visible.

### 5. Verify the Secure Token
1.  Open Chrome/Firefox **Developer Tools** (F12).
2.  Go to the **Application** (or Storage) tab.
3.  Select **Cookies** -> `http://localhost:3000`.
4.  **Observation**: You should see a cookie named `token`. Notice that the **HttpOnly** checkbox is checked. This means the token is invisible to malicious Javascript, protecting your users from XSS attacks.

### 6. Test the "Auto-Home" Logic
1.  While still logged in, try to navigate manually to `http://localhost:3000/login`.
2.  **Observation**: The middleware should recognize your token and instantly prevent you from seeing the login screen again, sending you back home.

### 7. Optional: The "API Lockdown" Check
Try to hit the backend directly without the browser's credentials:
```bash
curl http://127.0.0.1:3001/products
```
*Expected Result: `{"statusCode":401,"message":"Unauthorized"}`.*

**Your system is now officially locked down and production-ready!** 🚀





lalo@pop-os:~/CODING/Turborepo-Clon-00/turborepo-setup-template$ curl -X POST http://127.0.0.1:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@enterprise.com", "password": "SecurePassword123"}'
{"id":"cmoes3ubi0000i0gqb8eyktyf","email":"admin@enterprise.com","role":"USER","createdAt":"2026-04-25T20:15:21.151Z","updatedAt":"2026-04-25T20:15:21.151Z"}lalo@pop-os:~/CODING/Turborepo-Clon-00/turborepo-setup-template$ 