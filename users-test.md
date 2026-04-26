Edited ex-18-Management.md
Ran command: `pnpm build`
Viewed package.json:1-87
Viewed package.json:1-23
Viewed .env:1-3
Viewed index.ts:1-9
Ran command: `pnpm add -D bcryptjs dotenv`
Ran command: `pnpm add -D -w bcryptjs dotenv @prisma/client`
Edited populate-enterprise-users.mjs
Ran command: `node populate-enterprise-users.mjs`

I have created the population script `populate-enterprise-users.mjs` in the root of your project. This script uses **Prisma** to upsert two users for each role (`ADMIN`, `HR`, `LOGISTICS`, `USER`) into your database.

### 🧪 User Credentials for Testing
All users share the same password for convenience during testing.

| Role | User 1 Email | User 2 Email | Password |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin1@enterprise.local` | `admin2@enterprise.local` | `Password123!` |
| **HR** | `hr1@enterprise.local` | `hr2@enterprise.local` | `Password123!` |
| **LOGISTICS** | `logistics1@enterprise.local` | `logistics2@enterprise.local` | `Password123!` |
| **USER** | `user1@enterprise.local` | `user2@enterprise.local` | `Password123!` |

---

### 🚀 Instructions to Run the Script
I have already executed the script once and confirmed the output, but you can run it again at any time if you reset your database or need to update the users.

Run the following command from the project root:

```bash
node populate-enterprise-users.mjs
```

> [!NOTE]
> The script automatically detects your database configuration from `packages/db/.env`. Make sure your database container is running before executing it.