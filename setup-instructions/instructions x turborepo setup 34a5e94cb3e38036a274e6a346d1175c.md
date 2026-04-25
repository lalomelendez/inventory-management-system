# instructions x turborepo setup

## 🛠️ The "Fixed Template" Plan: Architectural Corrections

Before we rewrite the instructions, here is the detailed analysis of the fixes that will be baked into the new version:

### 1. The Networking & Prisma Fix

- **Problem:** Prisma couldn't find the DB because Node.js tried IPv6 (`::1`) while Docker listened on IPv4 (`127.0.0.1`).
- **Fix:** Hardcode `127.0.0.1` in all `.env` templates. Avoid `localhost` entirely to ensure cross-platform stability (especially on Linux/Pop!_OS).

### 2. The Next.js "Rogue File" Prevention

- **Problem:** `create-next-app` generates its own `pnpm-lock.yaml` and `pnpm-workspace.yaml`, which breaks the root monorepo's authority.
- **Fix:** Add an explicit "Cleanup Step" immediately after scaffolding the web app to delete these conflicting files.

### 3. Task Orchestration (Turbo 2.x)

- **Problem:** Legacy `pipeline` syntax is deprecated; the NestJS dev script name didn't match the Turbo task.
- **Fix:** Standardize all app scripts to `"dev"` and use the `"tasks"` key in `turbo.json`. Set `"ui": "stream"` globally to ensure logs are visible during crashes.

### 4. Database Lifecycle

- **Problem:** Apps booting before Postgres is ready; port 5432 being "hijacked" by other projects.
- **Fix:** Add a Docker health check to the `compose` file and unique container naming conventions to avoid collisions with other project containers.

---

## 📋 The New Instruction Index

*This is the structure for the "Master Template" you will give to your team.*

### **Phase 1: Workspace & Root Hygiene**

- **1.1** Root Initialization (pnpm & Workspace rules)
- **1.2** Turborepo 2.x Configuration (The Task Graph)
- **1.3** Global `.gitignore` and `.editorconfig`

### **Phase 2: The Shared "Governing" Packages**

- **2.1** `@repo/typescript-config` (TS 6.0 Patches)
- **2.2** `@repo/validation` (The Zod SSOT)
- **2.3** `@repo/db` (Isolated Prisma Client)

### **Phase 3: Infrastructure (Local Dev Environment)**

- **3.1** Docker Compose (With Health Checks)
- **3.2** Environment Variable Synchronization (`.env.example` strategy)

### **Phase 4: The Application Layer**

- **4.1** NestJS API (Port 3001 Isolation)
- **4.2** Next.js Web (The Workspace Cleanup Protocol)

### **Phase 5: The Boot Sequence**

- **5.1** First-Time Setup (The "Golden Path" Command)
- **5.2** Verification Checklist (Ports, DB Connection, Type-Gen)

### **Phase 6: The "Troubleshooting Library" (The Team Wiki)**

- **6.1** Solving `EADDRINUSE`
- **6.2** Resetting the Prisma/Docker State
- **6.3** Turbo Cache Clearing

---

## 🏗️ Detailed Fix Log (Internal Audit)

| **Step** | **Original Issue** | **Corrected Instruction** |
| --- | --- | --- |
| **Root Init** | Turbo 1.x syntax | Use `tasks` instead of `pipeline` in `turbo.json`. |
| **TS Config** | TS 6.0 warnings | Add `"ignoreDeprecations": "6.0"` to `base.json`. |
| **DB Link** | IPv6/DNS failure | Connection string: `postgresql://... @127.0.0.1:5432/...` |
| **API Init** | Port 3000 collision | `main.ts` updated to port `3001`. |
| **Web Init** | Nested workspaces | `rm apps/web/pnpm-workspace.yaml` after init. |
| **Prisma Push** | `pnpm dlx` collision | Use `pnpm --filter @repo/db exec prisma db push`. |

---

### Next Steps:

I have the full logic for the **"Master Fixed Instructions"** ready. Would you like me to generate the full document now so you can share it with your team, or should we refine a specific part—like adding a **custom Zod validation pipe** for NestJS to make the validation even more seamless?

---

This guide is designed to move your team beyond the standard "getting started" phase and into a robust, production-ready development environment. These instructions specifically address the networking and task-orchestration issues that typically stall monorepo adoption.

---

## Phase 1: Workspace & Root Hygiene

The goal of this phase is to establish a single source of truth for dependencies and task execution. By the end of this phase, your root directory will be the "brain" of the entire enterprise system.

### 1.1 Root Initialization (pnpm & Workspace Rules)

We use `pnpm` because its content-addressable storage is significantly faster and more disk-efficient for monorepos than `npm` or `yarn`.

1. **Initialize the project:**Bash
    
    Open your terminal in your desired projects folder and run:
    
    `mkdir enterprise-system && cd enterprise-system
    pnpm init
    mkdir apps packages`
    
2. **Define the Workspace Law:**YAML
    
    Create a `pnpm-workspace.yaml` file in the root. This file tells `pnpm` that this is a monorepo and defines where your code lives.
    
    `packages:
      - "apps/*"
      - "packages/*"`
    
3. **The "Rogue Lockfile" Rule:**
    
    **CRITICAL:** Advise your team that whenever they use a generator (like `create-next-app` or `nest new`), they **must** immediately delete the `pnpm-lock.yaml` and `node_modules` generated inside that sub-folder. There can only be **one** lockfile, located at the root, to prevent dependency fragmentation.
    

---

### 1.2 Turborepo 2.x Configuration (The Task Graph)

Turborepo 2.x uses a `tasks` syntax that is more granular and powerful than the legacy `pipeline` structure.

1. **Install the Orchestrator:**Bash
    
    Install `turbo` and basic development types at the workspace root.
    
    `pnpm add -wD turbo typescript @types/node`
    
2. **Configure `turbo.json`:**JSON
    
    Create a `turbo.json` in the root. We are adding a crucial `"ui": "stream"` configuration to ensure that when a backend service crashes, the full error logs are visible in the terminal rather than being truncated by the interactive UI.
    
    `{
      "$schema": "https://turbo.build/schema.json",
      "ui": "stream",
      "tasks": {
        "build": {
          "dependsOn": ["^build"],
          "outputs": [".next/**", "!.next/cache/**", "dist/**"]
        },
        "lint": {
          "dependsOn": ["^lint"]
        },
        "dev": {
          "cache": false,
          "persistent": true
        },
        "generate": {
          "cache": false
        },
        "db:push": {
          "cache": false
        }
      }
    }`
    
3. **Update Root Scripts:**JSON
    
    Modify your root `package.json` to expose these tasks. This allows the team to run `pnpm dev` from the root and boot the entire stack.
    
    `"scripts": {
      "dev": "turbo run dev",
      "build": "turbo run build",
      "lint": "turbo run lint",
      "generate": "turbo run generate"
    }`
    

---

### 1.3 Global `.gitignore` and `.editorconfig`

Standardizing the environment across your team prevents "git noise" (unnecessary file changes) and ensure consistent code formatting.

1. **The Enterprise `.gitignore`:**Plaintext
    
    Create a `.gitignore` at the root. This is tailored to exclude build artifacts and sensitive credentials for Next.js, NestJS, and Prisma.
    
    `# Dependencies
    node_modules
    .pnpm-debug.log
    
    # Build Outputs
    dist
    .next
    out
    .turbo
    
    # Environment & Secrets
    .env
    .env.local
    .env.*.local
    *.pem
    
    # Prisma
    /packages/db/src/generated
    
    # OS files
    .DS_Store
    Thumbs.db`
    
2. **The Team `.editorconfig`:**Ini, TOML
    
    Create an `.editorconfig` file. This forces the IDE (VS Code, Cursor, etc.) to use the same indentation and line-ending rules regardless of the developer's OS.
    
    `root = true
    
    [*]
    indent_style = space
    indent_size = 2
    charset = utf-8
    trim_trailing_whitespace = true
    insert_final_newline = true
    end_of_line = lf
    
    [*.md]
    trim_trailing_whitespace = false`
    

---

### 💡 Phase 1 Verification Checklist

Before moving to the shared packages in Phase 2, ensure your team checks the following:

- [ ]  Is there only **one** `pnpm-lock.yaml` file (at the root)?
- [ ]  Does `pnpm-workspace.yaml` correctly list both `apps/*` and `packages/*`?
- [ ]  Does running `pnpm turbo run build` result in a "No packages found" message (this is expected until we add packages)?

**Ready to proceed to Phase 2: The Shared Governing Packages?** I can provide the detailed setups for the TypeScript config, the Zod validation package, and the isolated Prisma package next.

---

---

Phase 2 establishes the "Governing Packages." These are internal, private packages that dictate the rules for the rest of the monorepo. By centralizing TypeScript rules, validation logic, and database access, you ensure that every application in the workspace stays in sync.

---

## 2.1 @repo/typescript-config (TS 6.0 Patches)

This package contains the base configuration that all other packages and apps will extend. This prevents "config drift" where one app is stricter than another.

### **Setup Steps:**

1. **Create the directory and initialize:**Bash
    
    `mkdir -p packages/typescript-config
    cd packages/typescript-config
    pnpm init`
    
2. **Configure `package.json`:**JSON
    
    Set the name to `@repo/typescript-config` and ensure it is marked as private so it isn't accidentally published.
    
    `{
      "name": "@repo/typescript-config",
      "version": "1.0.0",
      "private": true,
      "publishConfig": { "access": "restricted" }
    }`
    
3. **Create the `base.json` with the TS 6.0 Patch:**JSON
    
    This configuration includes the specific fix for TypeScript 6.0 deprecation warnings.
    
    `{
      "compilerOptions": {
        "target": "es2022",
        "module": "commonjs",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "ignoreDeprecations": "6.0" 
      }
    }`
    
    *Note: The `ignoreDeprecations: "6.0"` key is essential for stability on modern dev environments.*
    

---

## 2.2 @repo/validation (The Zod SSOT)

This is the "Golden Thread" that binds the frontend and backend. It houses your Zod schemas, which act as the Single Source of Truth (SSOT).

### **Setup Steps:**

1. **Initialize the package:**Bash
    
    `mkdir -p packages/validation/src
    cd packages/validation
    pnpm init
    pnpm add zod
    pnpm add -D typescript tsup @repo/typescript-config@workspace:*`
    
2. **Configure `package.json`:**JSON
    
    We use `tsup` for instant bundling, ensuring both NestJS (CommonJS) and Next.js (ESM) can consume the package.
    
    `{
      "name": "@repo/validation",
      "version": "1.0.0",
      "main": "./dist/index.js",
      "module": "./dist/index.mjs",
      "types": "./dist/index.d.ts",
      "scripts": {
        "build": "tsup src/index.ts --format cjs,esm --dts",
        "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
      },
      "dependencies": {
        "zod": "^3.23.0"
      }
    }`
    
3. **Create `tsconfig.json`:**JSON
    
    Extend the shared base configuration.
    
    `{
      "extends": "@repo/typescript-config/base.json",
      "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src"
      },
      "include": ["src"]
    }`
    
4. **Define a Shared Schema (`src/index.ts`):**TypeScript
    
    `import { z } from "zod";
    
    export const UserRegistrationSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      name: z.string().min(2, "Name is too short"),
    });
    
    export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;`
    

---

## 2.3 @repo/db (Isolated Prisma Client)

This package isolates your database logic and PostgreSQL client from your applications.

### **Setup Steps:**

1. **Initialize and Install:**Bash
    
    `mkdir -p packages/db/src
    cd packages/db
    pnpm init
    pnpm add @prisma/client
    pnpm add -D prisma typescript tsup @repo/typescript-config@workspace:*
    npx prisma init`
    
2. **Configure `package.json`:**JSON
    
    Ensure you include a `generate` script that Turborepo can call.
    
    `{
      "name": "@repo/db",
      "version": "1.0.0",
      "main": "./dist/index.js",
      "types": "./dist/index.d.ts",
      "scripts": {
        "build": "tsup src/index.ts --format cjs,esm --dts",
        "generate": "prisma generate"
      }
    }`
    
3. **Define the Schema (`prisma/schema.prisma`):**Code snippet
    
    To avoid "library not found" errors on Linux/Pop!_OS, explicitly define the binary targets.
    
    `generator client {
      provider      = "prisma-client-js"
      binaryTargets = ["native", "debian-openssl-3.0.x"]
    }
    
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    
    model User {
      id        String   @id @default(cuid())
      email     String   @unique
      name      String
      password  String
      createdAt DateTime @default(now())
    }`
    
4. **Export the Client (`src/index.ts`):**TypeScript
    
    `import { PrismaClient } from "@prisma/client";
    
    export const db = new PrismaClient();
    export * from "@prisma/client";`
    
5. **The IPv4 Fix (`.env`):**Code snippet
    
    To resolve the "P1001" connection errors, bypass DNS and use the explicit IPv4 loopback address.
    
    `DATABASE_URL="postgresql://admin:rootpassword@127.0.0.1:5432/enterprisedb?schema=public"`
    

---

### **💡 Phase 2 Verification Checklist**

- [ ]  Run `pnpm run build --filter @repo/validation` from the root. Does the `dist` folder appear?
- [ ]  Does the `@repo/db/.env` file use `127.0.0.1` instead of `localhost`?
- [ ]  Is `ignoreDeprecations: "6.0"` present in the base TypeScript config?

**Phase 2 is complete.** Ready to move to **Phase 3: Infrastructure (Local Dev Environment)** and **Phase 4: The Application Layer**?

---

Phase 3 focuses on creating a "Push-Button" infrastructure. The goal is to ensure that any developer on your team can clone the repo, run one command, and have a fully functional, healthy database environment without manually configuring PostgreSQL or fighting networking "ghosts."

---

## 3.1 Docker Compose (With Health Checks)

On Linux systems like Pop!_OS, Docker networking can be strict regarding port availability and service readiness. We use **Health Checks** to ensure that the database is actually accepting connections before the applications attempt to connect, preventing "Connection Refused" crashes during the boot sequence.

### **The Configuration (`docker-compose.yml`)**

Create this file at the **root** of your workspace.

YAML

`version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    # UNIQUE NAME: Prevents collisions with other local projects
    container_name: enterprise_system_db
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: rootpassword
      POSTGRES_DB: enterprisedb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    # HEALTH CHECK: Crucial for Turborepo orchestration
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d enterprisedb"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:`

### **Team Command: The Infrastructure Boot**

Advise your team to run this command from the root. The `-d` flag runs it in the background, freeing up the terminal for Turborepo logs.

Bash

`docker compose up -d`

---

## 3.2 Environment Variable Synchronization

The "IPv6 Trap" is the #1 cause of database connection failures in modern Node.js (v17+) environments. To solve this for the entire team, we bypass DNS resolution and use an explicit IPv4 strategy in our environment templates.

### **The `.env.example` Strategy**

Instead of checking `.env` files into Git, we provide `.env.example` files. Developers copy these to a local `.env` file that is ignored by Git.

### **1. The Shared DB Package (`packages/db/.env.example`)**

This file handles Prisma migrations and schema pushes.

Code snippet

`# EXPLICIT IPv4: Using 127.0.0.1 instead of localhost to prevent IPv6 resolution errors
DATABASE_URL="postgresql://admin:rootpassword@127.0.0.1:5432/enterprisedb?schema=public"`

### **2. The API App (`apps/api/.env.example`)**

NestJS requires this at runtime.

Code snippet

`PORT=3001
DATABASE_URL="postgresql://admin:rootpassword@127.0.0.1:5432/enterprisedb?schema=public"`

### **The Team Setup Script (Optional but Recommended)**

To automate the onboarding, you can add a "setup" script to your root `package.json`. This ensures every dev has the correct `.env` files with the IPv4 fix applied immediately.

JSON

`"scripts": {
  "setup:env": "cp packages/db/.env.example packages/db/.env && cp apps/api/.env.example apps/api/.env"
}`

---

### **💡 Phase 3 Verification Checklist**

Before moving to the Application Layer, have your team verify the Docker state:

- **Check Port Binding:** Run `docker ps`. Under the `PORTS` column, you should see `0.0.0.0:5432->5432/tcp`. If the port is missing, another container is likely "squatting" on 5432.
- **Check Health Status:** Run `docker inspect -f '{{.State.Health.Status}}' enterprise_system_db`. It should return `healthy`.
- **Verify IPv4:** Ensure `.env` files do **not** use the word `localhost`. They must use `127.0.0.1` to ensure compatibility with Docker on Linux host machines.

**Phase 3 is complete.** You have a stable, containerized database and a type-safe environment configuration. Ready to proceed to **Phase 4: The Application Layer (NestJS & Next.js)**?

---

---

Phase 4 is where we connect the logic. This is the stage where most monorepos fail because standard scaffolding tools often try to "take over" the workspace. We will implement strict isolation for the API and a rigorous cleanup protocol for the Web app to ensure they play nicely within the Turborepo ecosystem.

---

## 4.1 NestJS API (Port 3001 Isolation)

Standard NestJS installs often collide with Next.js because they both default to port `3000`. We are going to explicitly isolate the API to port `3001` and fix the script naming so Turborepo can see it.

### **Setup Steps:**

1. **Scaffold the API:**Bash
    
    Run this from the `apps/` directory. Use the `--skip-git` flag because the root already has a Git repository.
    
    `cd apps
    npx @nestjs/cli new api --package-manager pnpm --strict --skip-git
    cd api`
    
2. **The "Silent Backend" Fix (`package.json`):**JSON
    
    Turborepo looks for a `dev` script, but NestJS defaults to `start:dev`.
    
    - Change the package name to `@repo/api`.
    - Add a `"dev"` script that maps to the Nest start command.
    
    `{
      "name": "@repo/api",
      "scripts": {
        "dev": "nest start --watch",
        "build": "nest build"
      }
    }`
    
3. **Port 3001 Isolation (`src/main.ts`):**TypeScript
    
    Hardcode or environment-bind the port to `3001` to avoid `EADDRINUSE` errors with the frontend.
    
    `async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      // Explicitly use 3001 to avoid collision with Next.js
      await app.listen(process.env.PORT ?? 3001); 
      console.log(`Application is running on: ${await app.getUrl()}`);
    }
    bootstrap();`
    
4. **Link Shared Packages:**Bash
    
    Connect your internal governing packages to the API.
    
    `pnpm add @repo/db@workspace:* @repo/validation@workspace:*`
    

---

## 4.2 Next.js Web (The Workspace Cleanup Protocol)

`create-next-app` is "aggressive"—it generates its own workspace files that will break your root monorepo's authority if left untouched.

### **Setup Steps:**

1. **Scaffold the Web App:**Bash
    
    Run this from the `apps/` directory.
    
    `npx create-next-app@latest web --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm`
    
2. **The Cleanup Protocol (CRITICAL):**Bash
    
    Immediately after scaffolding, you must delete the rogue workspace files to restore the root's control.
    
    `cd web
    rm pnpm-workspace.yaml pnpm-lock.yaml`
    
3. **Configure Transpilation (`next.config.mjs`):**JavaScript
    
    Next.js needs to be told to compile the local TypeScript packages from your `packages/` folder.
    
    `/** @type {import('next').NextConfig} */
    const nextConfig = {
      // Allows Next.js to use the raw TS files from your workspace packages
      transpilePackages: ["@repo/db", "@repo/validation"],
    };
    
    export default nextConfig;`
    
4. **Link Shared Packages:**Bash
    
    `pnpm add @repo/db@workspace:* @repo/validation@workspace:*`
    

---

### **💡 Phase 4 Verification Checklist**

Before moving to the final boot sequence, have your team verify:

- [ ]  Does `apps/api/package.json` have a `"dev"` script?
- [ ]  Does `apps/api/src/main.ts` point to port `3001`?
- [ ]  Did you delete `pnpm-workspace.yaml` and `pnpm-lock.yaml` from `apps/web/`?
- [ ]  Is `transpilePackages` correctly set in the Next.js config?

**Phase 4 is complete.** You now have a backend and frontend that are correctly isolated and linked to your shared logic. Ready for **Phase 5: The Boot Sequence** to bring the whole system online?

---

---

Phase 5 is the "Moment of Truth." This is where we orchestrate the various layers—containers, shared packages, and applications—into a single, running ecosystem. For a dev team, having a single, reliable boot sequence prevents the "it works on my machine" syndrome.

---

## 5.1 First-Time Setup (The "Golden Path" Command)

To ensure consistency across the team, everyone should follow this exact sequence the first time they clone the repository or after a major schema change. This sequence respects the topological dependencies of the monorepo.

### **The Execution Sequence**

Run these commands from the **root** of the workspace:

1. **Install Dependencies:**Bash
    
    `pnpm install`
    
2. **Spin up Infrastructure:**Bash
    
    `docker compose up -d`
    
3. **Synchronize Database Schema:**Bash
    
    This command pushes the Prisma schema to your local Postgres and generates the client types.
    
    `pnpm --filter @repo/db exec prisma db push`
    
4. **Initial Build (Shared Packages):**Bash
    
    Build the validation and DB packages so the apps have the necessary artifacts to start.
    
    `pnpm run build --filter="./packages/*"`
    
5. **Start the Engine:**Bash
    
    `pnpm run dev`
    

> **Pro Tip:** You can combine these into a single "onboarding" script in your root `package.json` called `"setup"` to make it even easier for new hires.
> 

---

## 5.2 Verification Checklist

If someone on the team reports that the system isn't working, use this checklist to isolate the failure point.

### **1. Infrastructure (The Foundation)**

- **Docker Health:** Run `docker ps`. The `enterprise_system_db` container status must be `(healthy)`.
- **Port Binding:** Ensure the `PORTS` column shows `0.0.0.0:5432->5432/tcp`.
- **IPv4 Connectivity:** Ensure `.env` files point to `127.0.0.1:5432` and **not** `localhost`.

### **2. Networking (The App Layer)**

- **Web App:** Open `http://localhost:3000`. You should see the Next.js landing page.
- **API App:** Open `http://localhost:3001/users/register` (or check the terminal logs). If you see an `EADDRINUSE` error, a rogue process is still holding the port.
- **Log Visibility:** Since we set `"ui": "stream"` in `turbo.json`, the terminal should show a clear prefix for `[web:dev]` and `[api:dev]`.

### **3. Type Integrity (The Golden Thread)**

- **Prisma Client:** Navigate to `packages/db/src/generated`. If this folder is empty, `prisma generate` failed or wasn't run.
- **Zod Shared Logic:** Change a rule in `packages/validation/src/index.ts` (e.g., change password min length to 20). Both `apps/api` and `apps/web` should immediately flag TypeScript errors if they aren't updated to match.

---

### **Final Success State**

When everything is green, your terminal will show both the NestJS and Next.js servers running in parallel. Your frontend will be able to fetch data from the backend, and the backend will be successfully persisting users to the Dockerized Postgres database via the shared Prisma client.

**This concludes the Enterprise Monorepo Master Template.** Your team is now equipped with a professional-grade, type-safe, and highly scalable development environment. Happy coding!

---

---

---

---

This final phase is the most important for maintaining team velocity. In a monorepo, a single stuck process or a corrupted cache can halt work for everyone. Think of this as the "Emergency Break Glass" section of your team’s internal Wiki.

---

## Phase 6: The "Troubleshooting Library" (The Team Wiki)

### 6.1 Solving `EADDRINUSE` (Port Already in Use)

Because Turborepo orchestrates multiple servers simultaneously, it’s common for a process to "hang" even after you’ve stopped the main terminal. This usually happens on port `3000` (Web) or `3001` (API).

**The Symptom:**

Your terminal shows: `Error: listen EADDRINUSE: address already in use :::3001`.

**The One-Liner Fix (Linux/Pop!_OS):**

You can find and kill the specific process holding your port hostage without needing to reboot your machine.

Bash

`# Replace 3001 with whatever port is blocked
sudo lsof -i :3001 -t | xargs -r kill -9`

**The "Nuclear" Option:**

If you have multiple ghost processes, just kill all Node instances:

Bash

`killall node`

---

### 6.2 Resetting the Prisma/Docker State

Sometimes the PostgreSQL container becomes "unhealthy" or the local database schema drifts too far from the Prisma models due to failed migrations.

**The Symptom:**

- Prisma throws `P1001: Can't reach database server`.
- Docker shows a container as `unhealthy` or `exited`.

**The Clean Slate Protocol:**

Run this from the root to wipe the database and start fresh.

> **Warning:** This deletes all local data in your dev database.
> 

Bash

`# 1. Stop and REMOVE the volume (the -v is key)
docker compose down -v

# 2. Boot it back up
docker compose up -d

# 3. Re-sync the schema
pnpm --filter @repo/db exec prisma db push`

---

### 6.3 Turbo Cache Clearing

Turborepo is designed to be fast by not rebuilding things it thinks haven't changed. Occasionally, it gets a "false positive" on a cache hit, and you’ll see old code running even after you’ve made changes.

**The Symptom:**

You change a file (like a Zod schema), but the error persists as if the change never happened, even after a rebuild.

**The Fix:**

1. **Clear Local Turbo Cache:**Bash
    
    `rm -rf .turbo`
    
2. **The "Monorepo Refresh" (Delete all node_modules):**Bash
    
    If the environment feels completely broken, wipe all dependencies and the global lockfile for a fresh start.
    
    `# From the root
    find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
    rm pnpm-lock.yaml
    pnpm install`
    

---

### 💡 Phase 6 Verification Checklist

Ensure your team knows where to look when things go wrong:

- [ ]  Do they know the `lsof` command to free up ports?
- [ ]  Do they understand that `docker compose down -v` wipes their local data?
- [ ]  Are they aware that `ignoreDeprecations: "6.0"` in the TS config is there to prevent unnecessary build noise?

This completes your high-performance enterprise template. Your team now has the infrastructure to build, the type-safety to scale, and the troubleshooting knowledge to stay unblocked. Since you're running on **Pop!_OS**, these Linux-optimized commands will be your primary toolkit for keeping the environment clean.

**How are you feeling about the setup?** Should we look into automating the **OpenCode Orchestrator** configurations next to start delegating coding tasks?

---

---

**# Project Setup & Architecture Report: Antigravity-Turborepo-Exercise-01**

This report documents the architectural decisions, configuration steps, and troubleshooting actions taken to initialize this enterprise-grade monorepo.

**## 🏗️ 1. Core Architecture (Phase 1 & 2)**

We established a ****Governing Packages**** model to ensure strict type safety and configuration consistency across all applications.

**### 🎒 Governing Packages**

- *****`@repo/typescript-config`*****: Centralized TypeScript rules. Implemented a ***native build strategy**** that decouples type generation, ensuring the workspace remains warning-free in modern IDEs while supporting TS 6.0+ features.
- *****`@repo/validation`*****: The "Golden Thread" for the monorepo. Uses ***Zod**** to define schemas (e.g., `UserRegistrationSchema`) that are shared between the frontend and backend.
- *****`@repo/db`*****: An isolated ***Prisma**** client package that encapsulates all database logic and models, preventing database "leakage" into application code.

**### 🚀 Orchestration**

- ***Turborepo 2.x****: Configured via `turbo.json` with `"ui": "stream"` for granular logging and a persistent task graph for `dev`, `build`, and `lint`.
- ***Workspace Hygiene****: Enforced a single source of truth for dependencies using `pnpm`. Applied a strict rule to delete "rogue" lockfiles and workspace files generated by frameworks.
- --

**## 🛠️ 2. Infrastructure & Application Layer (Phase 3 & 4)**

**### 🐋 Local Environment**

- ***Dockerized PostgreSQL****: Integrated a containerized database with ***Health Checks**** to ensure the DB is ready before apps try to connect.
- ***IPv4 Explicit Strategy****: Using `127.0.0.1` instead of `localhost` in all connection strings to bypass common DNS resolution errors on modern Linux systems.

**### 📱 Applications**

- ***NestJS API (**`@repo/api`**)****: Isolated to ***Port 3001**** to avoid collisions with the frontend. Directly consumes shared validation and database logic.
- ***Next.js Web (**`web`**)****: Cleaned of rogue workspace files and configured with `transpilePackages` to enable raw TypeScript consumption from workspace packages.
- --

**## 🐞 3. Problems Solved (Troubleshooting Log)**

| Problem Encountered | Root Cause | Resolution |

| :--- | :--- | :--- |

| ****Name Validation Error**** | Root package name contained uppercase characters. | Renamed to `antigravity-turborepo-exercise-01` (lowercase). |

| ****DTS Build Errors**** | `tsup` injecting deprecated `baseUrl` flag into the TS compiler. | Decoupled DTS generation from `tsup`; used native `tsc --emitDeclarationOnly` for clean, warning-free builds. |

| ****Missing Type Artifacts**** | Missing `tsconfig.json` in `@repo/db`. | Created the missing configuration file extending the base repo rules. |

| ****Invalid 'ignoreDeprecations' Warning**** | IDE JSON schema flagged the 6.0 patch flag as invalid. | Completely removed the `ignoreDeprecations` flag after resolving the underlying `tsup` argument conflict. |

| ****Port Conflict**** | Both apps defaulting to port 3000. | Hardcoded NestJS to port 3001 in `src/main.ts`. |

| ****Connection Refused (DB)**** | App booting before DB container was ready. | Implemented Docker health checks and health-aware booting. |

| ****The IPv6 Trap**** | NestJS binding to the `[::1]` loopback while DB is on IPv4. | Explicitly bound API to `127.0.0.1` in `src/main.ts`. |

- --

**## ✅ 4. Final Verification**

The project is now in a ****fully operational**** state. The "Golden Thread" of type safety is synchronized across the workspace, and networking mismatches have been eliminated.

**### 🚀 Operational Status**

- ***IPv4 Connectivity****: The NestJS API is successfully bound to `http://127.0.0.1:3001`, ensuring seamless connectivity with the Docker database.
- ***Type Safety Synchronization****: `@repo/validation` generates DTS artifacts in real-time, instantly providing type coverage to both apps during development.
- ***Log Visibility****: Turborepo is configured with `"ui": "stream"` for full backend log transparency.
- ***Master Boot Command:**** `pnpm dev --no-cache --continue`
- ***Setup Sequence:**** `pnpm run setup:env && pnpm turbo run generate && pnpm run build`
- --

**## 📂 5. Folder Structure Diagram**

```text

.

├── apps/

│   ├── api/ (NestJS @ Port 3001)

│   │   ├── src/

│   │   │   └── main.ts (Port 3001 Logic)

│   │   └── package.json (@repo/api)

│   └── web/ (Next.js @ Port 3000)

│       ├── app/

│       ├── next.config.ts (Transpilation Config)

│       └── package.json (web)

├── packages/

│   ├── db/ (Isolated Prisma Client)

│   │   ├── prisma/

│   │   │   └── schema.prisma

│   │   ├── src/

│   │   │   └── index.ts

│   │   └── package.json (@repo/db)

│   ├── typescript-config/ (Governing Rules)

│   │   ├── base.json (TS 6.0 Patch)

│   │   └── package.json (@repo/typescript-config)

│   └── validation/ (Shared Zod Schemas)

│       ├── src/

│       │   └── index.ts (SSOT Schemas)

│       └── package.json (@repo/validation)

├── docker-compose.yml (Postgres + Health Checks)

├── pnpm-workspace.yaml (Monorepo Config)

├── SETUP_REPORT.md (Documentation)

├── turbo.json (Task Orchestrator)

└── package.json (Root Scripts)

```

---

---

Since your workspace is built on **pnpm** and uses a topological dependency graph, running a simple `npm install` would actually break the workspace logic and create conflicting lockfiles.

To get this exact state running after a fresh clone, you and your team must follow the **"Golden Path"** setup sequence we established.

---

## 🚀 The Post-Clone Setup Sequence

Run these commands in order from the root of the project:

### 1. Install Workspace Dependencies

You must use `pnpm` to ensure the monorepo recognizes the internal `@repo/*` packages.

Bash

`pnpm install`

### 2. Synchronize Environment Variables

Run the setup script to copy the `.env.example` templates to local `.env` files, which includes the critical **IPv4 fixes** (`127.0.0.1`) we implemented.

Bash

`pnpm run setup:env`

### 3. Boot Infrastructure

Start the PostgreSQL container and wait for the **Health Check** to return a "healthy" status.

Bash

`docker compose up -d`

### 4. Sync Database & Generate Types

This command pushes your Prisma schema to the Docker container and generates the TypeScript client artifacts in `packages/db`.

Bash

`pnpm run generate`

### 5. Initial Build

Build the shared governing packages (`@repo/validation` and `@repo/db`) so the applications can consume their compiled artifacts.

Bash → ON ROOT

`pnpm run build --filter="./packages/*"`

---

## 🛠️ The Master Boot Command

Once the setup is complete, you only need one command to start the entire engine:

Bash

`pnpm dev`

This triggers **Turborepo** to run the `dev` task across the workspace. It will parallelize the NestJS API (on port **3001**) and the Next.js Web app (on port **3000**), while streaming logs directly to your terminal for easy debugging.

> **Note for the Team:** Remind them never to run `npm install` or `yarn` inside the `apps/` folders. If a rogue `package-lock.json` or `pnpm-lock.yaml` appears in a sub-directory, it must be deleted immediately to maintain the root workspace authority.
>