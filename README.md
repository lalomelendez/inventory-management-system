


# 🌌 Enterprise Operations MVP

> A highly opinionated, end-to-end type-safe monorepo designed for SME process automation, supply chain logistics mapping, and HR administrative workflows.

This repository serves as the foundational architecture for building robust operational systems. Built on **Turborepo 2.x** and **pnpm workspaces**, it bridges a **Next.js** frontend and a **NestJS** backend using a strict "Governing Packages" model. It features relational data management, custom JWT authentication, and strict Role-Based Access Control (RBAC).



## 🏗️ System Architecture

Our workspace follows a topological dependency graph. The architecture is divided into isolated applications and centralized, immutable logic packages to ensure frontend and backend systems never fall out of sync.

```text
.
├── apps/
│   ├── api/                # NestJS Backend (Strictly Port 3001)
│   └── web/                # Next.js Frontend (Port 3000)
├── packages/
│   ├── db/                 # Isolated Prisma Client, SSOT Schema, and Migrations
│   ├── typescript-config/  # Native TS 6.0+ Governing Rules
│   └── validation/         # Zod SSOT (Single Source of Truth) Schemas
└── docker-compose.yml      # Containerized PostgreSQL with Health Checks
```

### The "Governing Packages" Pattern
* **`@repo/typescript-config`**: Centralizes TS rules using a native `tsc --emitDeclarationOnly` build strategy for clean IDE integration.
* **`@repo/validation`**: The golden thread of the monorepo. Shared Zod schemas guarantee that frontend form validation and backend payload validation are mathematically identical.
* **`@repo/db`**: Encapsulates the Prisma ORM. Applications do not manage database connections directly; they import the compiled `@repo/db` client, preventing connection leaks.

---

## 🔐 Core Features & Domain Logic

* **Spec-Driven Development (SDD):** All data flows begin with strict schema definitions (Prisma/Zod) before any business logic is written, completely eliminating API miscommunication bugs.
* **Relational Inventory Modeling:** Full CRUD and eager-loading capabilities connecting nested entities (e.g., Products and Categories).
* **Custom JWT Authentication:** A fully owned, stateless cryptographic authentication engine protecting the API vault.
* **Role-Based Access Control (RBAC):** Database-enforced role hierarchies (`ADMIN`, `HR`, `LOGISTICS`, `USER`) to ensure strict boundary management across corporate departments.

---

## 🚀 The Golden Path (Local Setup)

To guarantee a deterministic setup, follow this exact sequence when cloning the repository. 

**Prerequisites:**
* Node.js (v18+)
* pnpm (v8+)
* Docker Desktop / Engine

### 1. Install Dependencies
Always run package installations from the root. Never use `npm` or `yarn`.
```bash
pnpm install
```

### 2. Synchronize Environment Variables
Hydrate your local `.env` files from the `.env.example` templates to apply the required IPv4 networking fixes (`127.0.0.1`).
```bash
pnpm run setup:env
```

### 3. Boot Infrastructure
Start the PostgreSQL container. It utilizes `pg_isready` health checks to prevent boot race conditions.
```bash
docker compose up -d
```

### 4. Hydrate the Database
Push the Prisma schema to your container and generate the typed DB client.
```bash
pnpm --filter @repo/db exec prisma db push
```

### 5. Build Governing Packages
Compile the shared validation and database libraries so the applications can digest their artifacts.
```bash
pnpm run build --filter="./packages/*"
```

### 6. Start the Engine
Boot the entire stack. Turborepo will start both the Next.js and NestJS servers in parallel, streaming all logs directly to the terminal.
```bash
pnpm dev
```

---

## 🚑 Troubleshooting & Runbook

In a high-performance monorepo, use these commands to unblock yourself instantly.

### Port Already in Use (`EADDRINUSE: :::3001`)
If a background process is holding a port hostage after a crash (Linux/macOS):
```bash
sudo lsof -i :3001 -t | xargs -r kill -9
```

### Database State Corruption
If your database schema drifts too far or the container fails its health check, perform a clean wipe. **Warning: This deletes local dev data.**
```bash
docker compose down -v
docker compose up -d
pnpm --filter @repo/db exec prisma db push
```

### Stale Monorepo Cache (Type Synchronization Issues)
If code changes aren't reflecting or shared schemas seem out of sync, nuke the Turbo cache and rebuild the governing packages.
```bash
rm -rf .turbo
find . -name "dist" -type d -prune -exec rm -rf '{}' +
pnpm run build --filter="./packages/*"
```

---
*Maintained by the Core Engineering Team.*
```