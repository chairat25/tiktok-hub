# System Specification: TikTok Multi-Tenant Catalog & Backoffice

**Date:** 2026-10-17  
**Status:** Approved  
**Project Workspace:** `/Users/pond/Documents/Goal/tiktok`

---

## 1. Executive Summary
The TikTok Catalog & Backoffice system is an enterprise-grade multi-tenant e-commerce showcase application designed to solve content creator cataloging challenges on TikTok. It enables creators to organize products and related review videos into well-defined categories and present them to audiences via a clean, fast, mobile-first viewer. 

The platform separates responsibilities into two distinct applications:
1. **TikTok Viewer (`apps/tiktok-viewer` or `tiktok-viewer`):** Public-facing mobile-first catalog accessed via creator bio links (e.g., `/@creatorHandle`), featuring seamless category filtering, video review embeds, and a secure "Login to Buy" flow redirecting to the creator's TikTok Shop or affiliate link.
2. **TikTok Backoffice (`apps/tiktok-backoffice` or `tiktok-backoffice`):** Creator and administrative management portal equipped with SSO authentication, Role-Based Access Control (RBAC), product/category management, video review linking, and click analytics.

---

## 2. Architecture & Monorepo Design

### 2.1 Workspace Structure
```
tiktok/
├── tiktok-viewer/              # Next.js App Router (Storefront viewer)
├── tiktok-backoffice/          # Next.js App Router (Admin/Creator portal)
├── packages/
│   ├── database/               # Shared TypeORM Entities, Migrations & DataSource
│   ├── auth/                   # Shared NextAuth / Auth.js configuration & RBAC guards
│   └── types/                  # Shared TypeScript interfaces, DTOs & enums
├── docs/
│   └── specs/                  # Architecture & feature specification docs
├── changelog.md                # Progress history & handoff ledger
└── package.json                # Root Yarn Workspaces configuration
```

### 2.2 Tech Stack
- **Framework:** Next.js (App Router, React 19 / Server Components)
- **Package Manager:** Yarn (Strictly adhering to project rules)
- **Database & ORM:** PostgreSQL + TypeORM (Declarative entities with synchronize/migration safety)
- **Authentication:** Auth.js (NextAuth v5) supporting Google OAuth, Credentials, and TikTok Login Kit
- **Styling & UI:** Tailwind CSS + Vector Icons (Material Icons / Lucide). Strictly zero emojis on UI.

---

## 3. Data Models & Entities (TypeORM)

### 3.1 User (`users`)
- Represents Creators, Administrators, Staff members, and Consumers.
- Fields:
  - `id`: UUID (Primary Key)
  - `email`: VARCHAR(255) UNIQUE
  - `display_name`: VARCHAR(255)
  - `creator_handle`: VARCHAR(100) UNIQUE (e.g. `@pond`)
  - `tiktok_shop_url`: TEXT (Creator's primary TikTok Shop / Affiliate showcase link)
  - `avatar_url`: TEXT
  - `role`: ENUM (`SUPER_ADMIN`, `CREATOR`, `STAFF`, `VIEWER`)
  - `is_active`: BOOLEAN DEFAULT true
  - Timestamps: `created_at`, `updated_at`

### 3.2 Category (`categories`)
- Scoped to a specific creator (Multi-tenancy isolation).
- Fields:
  - `id`: UUID (Primary Key)
  - `creator_id`: UUID (FK -> `users.id`)
  - `name`: VARCHAR(100)
  - `slug`: VARCHAR(120)
  - `sort_order`: INT DEFAULT 0
  - `is_active`: BOOLEAN DEFAULT true

### 3.3 Product (`products`)
- Fields:
  - `id`: UUID (Primary Key)
  - `creator_id`: UUID (FK -> `users.id`)
  - `category_id`: UUID (FK -> `categories.id`)
  - `title`: VARCHAR(255)
  - `description`: TEXT
  - `price`: DECIMAL(10, 2)
  - `discount_price`: DECIMAL(10, 2) NULLABLE
  - `image_url`: TEXT
  - `product_type`: ENUM (`TIKTOK_SHOP`, `TIKTOK_AFFILIATE`, `EXTERNAL_LINK`)
  - `tiktok_product_url`: TEXT
  - `tiktok_video_url`: TEXT (Video review link)
  - `click_count`: INT DEFAULT 0
  - `sort_order`: INT DEFAULT 0
  - `is_active`: BOOLEAN DEFAULT true

### 3.4 ClickTracking (`click_trackings`)
- Attribution log for user purchase clicks.
- Fields:
  - `id`: UUID (Primary Key)
  - `product_id`: UUID (FK -> `products.id`)
  - `creator_id`: UUID (FK -> `users.id`)
  - `viewer_user_id`: UUID NULLABLE (FK -> `users.id`)
  - `ip_address`: VARCHAR(45)
  - `user_agent`: TEXT
  - `created_at`: TIMESTAMP DEFAULT NOW()

---

## 4. Authentication & Authorization (SSO & RBAC)

1. **Viewer Access:**
   - Public can view catalogs freely without login.
   - When clicking "ซื้อสินค้า / ดูบน TikTok" (Buy / View on TikTok):
     - Auth verification check triggered.
     - Unauthenticated users prompted with SSO modal (Google / TikTok / Email).
     - Once authenticated, session cookie set (HttpOnly), click event logged, and user seamlessly redirected to creator's designated TikTok Shop link.
2. **Backoffice Access:**
   - Guarded by Middleware & RBAC guards.
   - Unauthenticated or non-creator/non-staff users redirected to login.
   - Creator sees only their own data (`WHERE creator_id = current_user.id`).
   - SuperAdmin has cross-tenant oversight.

---

## 5. Implementation Roadmap
1. Configure root monorepo `package.json` with Yarn Workspaces.
2. Build `packages/types` (TypeScript interfaces and DTOs).
3. Build `packages/database` (TypeORM entities, DataSource connection helper).
4. Scaffold `tiktok-viewer` (Next.js App Router, Tailwind CSS, Creator Showcase page, SSO Buy Modal, Vector Icons).
5. Scaffold `tiktok-backoffice` (Next.js App Router, Creator Dashboard, Category & Product CRUD, SSO & RBAC guards).
6. Verify build and end-to-end flow.
