Here is a master `README.md` crafted specifically for an enterprise-level template. It highlights not just *how* to use the repository, but *why* the architecture is built this way, emphasizing the defensive engineering decisions we established.

You can copy and paste this directly into your project root.

***

```markdown
# 🌌 Enterprise Turborepo Fullstack Template

Welcome to the Enterprise Turborepo Template. This is not a standard "getting started" scaffold; it is a battle-tested, highly opinionated monorepo architecture designed for scale, team velocity, and strict type safety.

Built on **Turborepo 2.x** and **pnpm workspaces**, this template bridges a **Next.js** frontend and a **NestJS** backend using a shared "Governing Packages" model. It includes built-in defenses against common monorepo pitfalls, including strict workspace hygiene, IPv4-enforced Docker networking, and deterministic type generation.

---

## 🏗️ System Architecture

Our workspace follows a topological dependency graph. The architecture is divided into isolated applications and centralized, immutable logic packages.

```text
.
├── apps/
│   ├── api/                # NestJS Backend (Strictly Port 3001)
│   └── web/                # Next.js Frontend (Port 3000)
├── packages/
│   ├── db/                 # Isolated Prisma Client & Schema
│   ├── typescript-config/  # Native TS 6.0+ Governing Rules
│   └── validation/         # Zod SSOT (Single Source of Truth) Schemas
└── docker-compose.yml      # Containerized PostgreSQL with Health Checks
```

### The "Governing Packages" Pattern

Rather than duplicating configurations, the `apps/` consume logic from the `packages/`:
* **`@repo/typescript-config`**: Centralizes TS rules using a native `tsc --emitDeclarationOnly` build strategy to ensure clean, warning-free IDE integration.
* **`@repo/validation`**: The golden thread of the monorepo. Shared Zod schemas guarantee that the frontend form validation and backend payload validation are mathematically identical and inherently synced.
* **`@repo/db`**: Encapsulates the Prisma ORM. Applications do not manage database connections directly; they import the compiled `@repo/db` client, preventing connection leaks and scope pollution.

---

## 🛡️ Enterprise Robustness & Defensive Engineering

This template is pre-configured to solve the most common bottlenecks in local development:

1. **The IPv4 DNS Bypass:** Modern Node.js versions default to resolving `localhost` to the IPv6 loopback (`::1`), which frequently fails to connect to Dockerized databases mapping to IPv4. All connection strings here explicitly target `127.0.0.1` to eliminate silent network drops.
2. **Health-Aware Boot Sequences:** The Docker Compose file utilizes `pg_isready` health checks. Turborepo orchestration relies on this to ensure the database is fully initialized before the applications attempt to connect, eliminating `Connection Refused` race conditions.
3. **Strict Port Isolation:** The NestJS API is hardcoded to port `3001`, and Next.js to `3000`. This prevents `EADDRINUSE` conflicts during parallel boot sequences.
4. **Workspace Hygiene Lock:** Framework generators (like `create-next-app`) often spawn rogue lockfiles. This environment relies strictly on a single root `pnpm-lock.yaml` to prevent dependency fragmentation.

---

## 🚀 The Golden Path (Local Setup)

To guarantee a deterministic setup, follow this exact sequence when cloning the repository for the first time. 

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
Hydrate your local `.env` files from the `.env.example` templates to apply the IPv4 networking fixes.
```bash
pnpm run setup:env
```

### 3. Boot Infrastructure
Start the PostgreSQL container. It will run in the background.
```bash
docker compose up -d
```

### 4. Hydrate the Database
Push the Prisma schema to your container and generate the typed DB client.
```bash
pnpm run generate
```

### 5. Build Governing Packages
Compile the shared validation and database libraries so the applications can digest their artifacts.
```bash
pnpm run build --filter="./packages/*"
```

### 6. Start the Engine
Boot the entire stack. Turborepo will start both the Next.js and NestJS servers in parallel, streaming all logs directly to this terminal.
```bash
pnpm dev
```

---

## 🚑 Troubleshooting & Runbook

In a high-performance monorepo, processes can occasionally hang or caches can false-positive. Use these commands to unblock yourself instantly.

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
pnpm run generate
```

### Stale Monorepo Cache
If code changes aren't reflecting or Zod schemas seem out of sync, nuke the Turbo cache and rebuild.
```bash
rm -rf .turbo
pnpm run build --filter="./packages/*"
```

---
* Maintained by @lalomelendez *
```