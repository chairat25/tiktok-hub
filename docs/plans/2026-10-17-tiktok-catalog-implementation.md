# TikTok Multi-Tenant Catalog & Backoffice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete multi-tenant TikTok catalog showcase (`tiktok-viewer`) and creator/admin management portal (`tiktok-backoffice`) in a Yarn Workspaces monorepo, backed by a local PostgreSQL Docker Compose environment and TypeORM entities, with SSO authentication readiness and RBAC.

**Architecture:** Monorepo using Yarn Workspaces with two Next.js fullstack applications (`tiktok-viewer`, `tiktok-backoffice`) sharing core packages (`packages/types`, `packages/database`, `packages/auth`). Local isolated PostgreSQL instance configured via `docker-compose.yml`.

**Tech Stack:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, PostgreSQL 16, TypeORM, Auth.js / NextAuth, Docker Compose, Yarn.

**Spec:** [tiktok/docs/specs/2026-10-17-tiktok-catalog-system-design.md](file:///Users/pond/Documents/Goal/tiktok/docs/specs/2026-10-17-tiktok-catalog-system-design.md)

## Global Constraints
- **Zero-Emoji Standard:** Strictly no emojis on any UI screens or buttons; use vector icons (Lucide / Material Icons) exclusively.
- **Package Manager:** Strictly `yarn` (`yarn install`, `yarn build`, `yarn dev`); never use `npm`, `pnpm`, or `bun`.
- **Git Operations:** Strictly NEVER run `git push`; local commits only.
- **DRY Principle:** All database entities, DTOs, and common types must reside in `packages/` to prevent duplicate definitions.

---

### Task 1: Docker Compose & Local Infrastructure Setup

**Files:**
- Create: `tiktok/docker-compose.yml`
- Create: `tiktok/.env.example`
- Create: `tiktok/.gitignore`

**Interfaces:**
- Produces: Local PostgreSQL database service `tiktok-postgres` accessible on `localhost:5432`, database `tiktok_catalog`, user `postgres`, password `postgres`.

- [ ] **Step 1: Create `.gitignore` to prevent committing secrets and node_modules**
- [ ] **Step 2: Create `.env.example` with local database connection string and Auth secret templates**
- [ ] **Step 3: Create `docker-compose.yml` defining PostgreSQL 16 Alpine with healthcheck**
- [ ] **Step 4: Verify Docker Compose syntax and start local database**
- [ ] **Step 5: Commit changes locally**

---

### Task 2: Shared Types Package (`packages/types`)

**Files:**
- Create: `tiktok/packages/types/package.json`
- Create: `tiktok/packages/types/tsconfig.json`
- Create: `tiktok/packages/types/src/index.ts`
- Create: `tiktok/packages/types/src/user.ts`
- Create: `tiktok/packages/types/src/catalog.ts`
- Create: `tiktok/packages/types/src/auth.ts`

**Interfaces:**
- Produces: `UserRole` (`SUPER_ADMIN`, `CREATOR`, `STAFF`, `VIEWER`), `ProductType` (`TIKTOK_SHOP`, `TIKTOK_AFFILIATE`, `EXTERNAL_LINK`), `IUser`, `ICategory`, `IProduct`, `IClickTracking`, `AuthSession` interfaces.

- [ ] **Step 1: Create package.json and tsconfig.json for `@tiktok/types`**
- [ ] **Step 2: Implement User & Role types in `src/user.ts`**
- [ ] **Step 3: Implement Category, Product, ClickTracking types in `src/catalog.ts`**
- [ ] **Step 4: Implement Auth and Session DTOs in `src/auth.ts` and export from `src/index.ts`**
- [ ] **Step 5: Verify types compile without errors**
- [ ] **Step 6: Commit changes locally**

---

### Task 3: Shared Database Package (`packages/database`)

**Files:**
- Create: `tiktok/packages/database/package.json`
- Create: `tiktok/packages/database/tsconfig.json`
- Create: `tiktok/packages/database/src/entities/User.ts`
- Create: `tiktok/packages/database/src/entities/Category.ts`
- Create: `tiktok/packages/database/src/entities/Product.ts`
- Create: `tiktok/packages/database/src/entities/ClickTracking.ts`
- Create: `tiktok/packages/database/src/data-source.ts`
- Create: `tiktok/packages/database/src/index.ts`

**Interfaces:**
- Consumes: `@tiktok/types` (`UserRole`, `ProductType`)
- Produces: TypeORM Entities `User`, `Category`, `Product`, `ClickTracking`, and `getDataSource()` connection helper.

- [ ] **Step 1: Create package.json and tsconfig.json with `reflect-metadata` and `typeorm`**
- [ ] **Step 2: Implement `User` entity with UUID primary key, creator_handle, and role enum**
- [ ] **Step 3: Implement `Category` entity with creator relationship and sort_order**
- [ ] **Step 4: Implement `Product` entity with category & creator relationships, prices, and links**
- [ ] **Step 5: Implement `ClickTracking` entity for viewer referral analytics**
- [ ] **Step 6: Implement `data-source.ts` with TypeORM DataSource configuration**
- [ ] **Step 7: Verify database package build and compilation**
- [ ] **Step 8: Commit changes locally**

---

### Task 4: Shared Auth & Mock Provider Package (`packages/auth`)

**Files:**
- Create: `tiktok/packages/auth/package.json`
- Create: `tiktok/packages/auth/tsconfig.json`
- Create: `tiktok/packages/auth/src/roles.ts`
- Create: `tiktok/packages/auth/src/session.ts`
- Create: `tiktok/packages/auth/src/index.ts`

**Interfaces:**
- Consumes: `@tiktok/types`, `@tiktok/database`
- Produces: `hasPermission(role, action)`, `verifySessionToken()`, `createSessionPayload()`.

- [ ] **Step 1: Create package.json and tsconfig.json for `@tiktok/auth`**
- [ ] **Step 2: Implement RBAC permission matrix and role guard helpers in `src/roles.ts`**
- [ ] **Step 3: Implement JWT / Session token encoder & verification helpers in `src/session.ts`**
- [ ] **Step 4: Export auth utilities from `src/index.ts`**
- [ ] **Step 5: Verify auth package build**
- [ ] **Step 6: Commit changes locally**

---

### Task 5: TikTok Viewer App (`tiktok-viewer`)

**Files:**
- Create: `tiktok/tiktok-viewer/package.json`
- Create: `tiktok/tiktok-viewer/tsconfig.json`
- Create: `tiktok/tiktok-viewer/tailwind.config.ts`
- Create: `tiktok/tiktok-viewer/src/app/layout.tsx`
- Create: `tiktok/tiktok-viewer/src/app/page.tsx`
- Create: `tiktok/tiktok-viewer/src/app/[creatorHandle]/page.tsx`
- Create: `tiktok/tiktok-viewer/src/app/api/track-and-buy/route.ts`
- Create: `tiktok/tiktok-viewer/src/components/ProductCard.tsx`
- Create: `tiktok/tiktok-viewer/src/components/CategoryFilter.tsx`
- Create: `tiktok/tiktok-viewer/src/components/AuthModal.tsx`

**Interfaces:**
- Consumes: `@tiktok/types`, `@tiktok/database`, `@tiktok/auth`
- Produces: Public storefront with route `/[creatorHandle]`, category filter tabs, video review modal, and "Login to Buy" flow redirecting to the creator's TikTok Shop.

- [ ] **Step 1: Set up package.json, Next.js config, Tailwind CSS for `tiktok-viewer`**
- [ ] **Step 2: Implement root layout with vector icons and mobile-first container**
- [ ] **Step 3: Implement `CategoryFilter` component with horizontal scroll**
- [ ] **Step 4: Implement `ProductCard` component displaying thumbnail, price, video review link, and buy button**
- [ ] **Step 5: Implement `AuthModal` triggering SSO / email sign-in when guest clicks buy**
- [ ] **Step 6: Implement `/[creatorHandle]/page.tsx` fetching creator profile and categorized products**
- [ ] **Step 7: Implement API route `/api/track-and-buy` to log click tracking and return target TikTok Shop URL**
- [ ] **Step 8: Verify build passes with zero linter errors**
- [ ] **Step 9: Commit changes locally**

---

### Task 6: TikTok Backoffice App (`tiktok-backoffice`)

**Files:**
- Create: `tiktok/tiktok-backoffice/package.json`
- Create: `tiktok/tiktok-backoffice/tsconfig.json`
- Create: `tiktok/tiktok-backoffice/tailwind.config.ts`
- Create: `tiktok/tiktok-backoffice/src/app/layout.tsx`
- Create: `tiktok/tiktok-backoffice/src/app/page.tsx`
- Create: `tiktok/tiktok-backoffice/src/app/dashboard/layout.tsx`
- Create: `tiktok/tiktok-backoffice/src/app/dashboard/products/page.tsx`
- Create: `tiktok/tiktok-backoffice/src/app/dashboard/categories/page.tsx`
- Create: `tiktok/tiktok-backoffice/src/app/dashboard/settings/page.tsx`
- Create: `tiktok/tiktok-backoffice/src/components/Sidebar.tsx`
- Create: `tiktok/tiktok-backoffice/src/components/ProductTable.tsx`
- Create: `tiktok/tiktok-backoffice/src/components/ProductFormModal.tsx`

**Interfaces:**
- Consumes: `@tiktok/types`, `@tiktok/database`, `@tiktok/auth`
- Produces: Admin/Creator dashboard with Sidebar, Product CRUD with TikTok Shop / Video link fields, Category reordering, and Shop settings.

- [ ] **Step 1: Set up package.json, Next.js config, Tailwind CSS for `tiktok-backoffice`**
- [ ] **Step 2: Implement Admin Dashboard Layout with responsive Sidebar and Header**
- [ ] **Step 3: Implement Category Management screen with sort order and active toggle**
- [ ] **Step 4: Implement Product Management screen with filtering, add/edit modal, and link configurations**
- [ ] **Step 5: Implement Shop Settings screen to update TikTok Shop URL and Creator Handle**
- [ ] **Step 6: Verify build passes with zero linter errors**
- [ ] **Step 7: Commit changes locally**

---

### Task 7: Verification, Documentation & Agent Handoff

**Files:**
- Modify: `tiktok/changelog.md`
- Test: Verify monorepo build with `yarn build`
- Test: Verify local dev commands

- [ ] **Step 1: Run full monorepo build check**
- [ ] **Step 2: Update `changelog.md` with completed tasks, configuration details, and handoff instructions**
- [ ] **Step 3: Commit all files locally**
