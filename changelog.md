# TikTok Catalog & Backoffice System Changelog

> บันทึกประวัติการพัฒนา สถาปัตยกรรมระบบ ข้อตกลงทางเทคนิค และคู่มือการรัน เพื่อให้ Agent ตัวถัดไปหรือผู้ร่วมทีมทำงานต่อได้ทันทีโดยไม่ต้องวนอ่านย้อนหลังทั้งหมด

---

## [2026-10-17] - ติดตั้งโครงสร้าง Monorepo, Docker Compose, Viewer, Backoffice และ SSO/RBAC

### 1. วัตถุประสงค์และปัญหาที่แก้ไข (Problem & Scope)
- **ปัญหา:** ครีเอเตอร์ทำช่อง TikTok มีสินค้าและคลิปรีวิวจำนวนมาก แต่ลิงก์บน Bio รวมสินค้าได้จำกัดและไม่เป็นหมวดหมู่
- **โซลูชัน:** สร้างระบบเว็บแบบ Multi-tenant (ระบบแยกข้อมูลตามเจ้าของร้าน) ภายใต้โฟลเดอร์หลัก `tiktok/` แบ่งเป็น 2 ส่วนหลัก:
  1. `tiktok-viewer`: เว็บไซต์หน้าร้านสำหรับให้ผู้ติดตามดูสินค้า จัดหมวดหมู่ ดูคลิปรีวิว และเข้าสู่ระบบก่อนกดซื้อ
  2. `tiktok-backoffice`: แดชบอร์ดจัดการสินค้า, หมวดหมู่, สิทธิ์ทีมงาน (RBAC) และลิงก์ TikTok Shop

---

### 2. เทคโนโลยีและโครงสร้างโปรเจกต์ (Monorepo Layout)
จัดการแบบ Monorepo ผ่าน Yarn Workspaces ภายใต้โฟลเดอร์ `tiktok/`:

```
tiktok/
├── docker-compose.yml          # Local PostgreSQL 16 สำหรับรันฐานข้อมูลในเครื่อง
├── .env.example                # เทมเพลตตัวแปรสภาพแวดล้อม (รองรับทั้ง Local DB และ Supabase Cloud)
├── .env                        # คอนฟิกหลักของระบบ
├── package.json                # Root Yarn Workspaces ควบคุมทุกโมดูล
├── changelog.md                # บันทึกประวัติการทำงานและคู่มือ Handoff
├── docs/
│   ├── specs/                  # เอกสารสถาปัตยกรรมและสเปกระบบ
│   └── plans/                  # Implementation Plan แต่ละ Task
├── packages/
│   ├── types/                  # Shared TypeScript Interfaces, Enums, DTOs
│   ├── database/               # Shared TypeORM Entities (User, Category, Product, ClickTracking) & DataSource
│   └── auth/                   # Shared RBAC Permissions Matrix, JWT Token & Session Verification
├── tiktok-viewer/              # Next.js App Router (Mobile-First Catalog สำหรับ TikTok Bio, Zero-Emoji)
│   ├── src/app/[creatorHandle] # หน้าร้านค้าเฉพาะของ Creator แต่ละคน (เช่น /@pond)
│   ├── src/components/         # CategoryFilter, ProductCard, AuthModal, VideoModal
│   └── src/app/api/            # track-and-buy, auth/login, auth/me, auth/logout
└── tiktok-backoffice/          # Next.js App Router (Dashboard สำหรับ Creator และ Admin, Zero-Emoji)
    ├── src/app/dashboard/      # products, categories, settings, team
    ├── src/components/         # Sidebar, ProductFormModal
    └── src/app/api/            # auth/login, auth/me, auth/logout
```

---

### 3. ข้อมูลทางเทคนิคเกี่ยวกับระบบคลาวด์ ฐานข้อมูล และ Storage
* **BaaS (Backend-as-a-Service):** คือคำเรียกบริการ Backend สำเร็จรูปบน Cloud ที่มีระบบ Database, API และ Auth รวมอยู่ในที่เดียว เช่น **Supabase** หรือ **Firebase**
* **Supabase Auth / Social OAuth Provider:** คือบริการ Identity Provider (IdP) ภายใน Supabase ที่ดูแลระบบการยืนยันตัวตน (Authentication) ผ่าน Google OAuth, TikTok Login, Apple ID และ Email โดยจัดการ Token และ Row Level Security (RLS) ให้เสร็จสรรพ
* **Cloudflare R2 Object Storage (ระบบจัดเก็บไฟล์รูปภาพ):** 
  - ใช้ **Cloudflare R2 (S3-compatible Object Storage)** เพื่อจัดเก็บไฟล์รูปภาพสินค้า และแคชภาพหน้าปกจากคลิป TikTok ถาวร
  - **ข้อดีเด่น:** ไม่มีค่าแบนด์วิดท์ดาวน์โหลด (Zero Egress Fees) ทำให้ประหยัดค่าใช้จ่ายเมื่อมีคนเข้าชมจำนวนมาก
  - **สถาปัตยกรรมเก็บข้อมูล:** ฐานข้อมูล (PostgreSQL / Supabase) จะเก็บเฉพาะ URL Text Path (เช่น `https://media.yourdomain.com/products/xxx.jpg`) เพื่อไม่ให้ฐานข้อมูลมีขนาดใหญ่หรือทำงานหนักเกินไป
* **การต่อยอดใช้งาน (Cloud Migration):**
  - ปัจจุบันระบบใช้ **Docker Compose (`docker-compose.yml`)** รัน PostgreSQL ภายในเครื่อง เพื่อให้รันและทดสอบระบบได้ทันทีโดยไม่ต้องรอ Cloud Key
  - เมื่อได้โปรเจกต์ Supabase และ Cloudflare R2 มาแล้ว เพียงนำ `DATABASE_URL` และ `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` มากุมไว้ใน `.env` ระบบจะทำงานบน Cloud เต็มรูปแบบทันทีโดยไม่ต้องแก้โค้ด

---

### 4. สรุปฟังก์ชันที่พัฒนาแล้วเสร็จ (Completed Features)

#### 4.1 TikTok Viewer (`tiktok-viewer`)
- [x] หน้าร้านค้าแบบ Mobile-First รองรับเปิดผ่านเบราว์เซอร์ของ TikTok ได้รวดเร็ว
- [x] URL เข้าถึงตาม Creator: `http://localhost:3000/[creatorHandle]` (เช่น `/@pond`)
- [x] ช่องค้นหาสินค้า (Search Bar): ค้นหาชื่อสินค้าและรายละเอียดได้แบบ Real-time พร้อมปุ่มล้างคำค้นหาและ Empty State
- [x] ระบบกรองหมวดหมู่สินค้า (CategoryFilter) เลื่อนแนวนอนแบบไม่มี Scrollbar เกะกะ (ทำงานควบคู่กับ Search ได้)
- [x] การแสดงการ์ดสินค้า (ProductCard) พร้อมปุ่ม "ดูคลิปรีวิว" (VideoModal)
- [x] โฟลว์ "Login to Buy": ผู้ชมกดซื้อสินค้า หากยังไม่ล็อกอิน จะมี `AuthModal` แสดงขึ้นมาให้เลือก Google SSO, TikTok Login หรือ Email เมื่อสำเร็จระบบจะบันทึก Click Event และ Redirect ไปยังหน้าร้าน TikTok Shop ของ Creator โดยอัตโนมัติ
- [x] หน้าข้อกำหนดและนโยบายความเป็นส่วนตัว: สร้างหน้า `/terms` (Terms of Service) และ `/privacy` (Privacy Policy) ถูกต้องตามเกณฑ์ของ TikTok Developer Guidelines
- [x] Zero-Emoji Standard: ใช้ Lucide Vector Icons ทั้งหมด 100%

#### 4.2 TikTok Backoffice (`tiktok-backoffice`)
- [x] หน้าล็อกอิน SSO สำหรับ Creator และ Admin (รองรับ Google SSO, TikTok OAuth, Email)
- [x] ระบบสิทธิ์การใช้งาน (RBAC): `SUPER_ADMIN`, `CREATOR`, `STAFF`
- [x] TikTok oEmbed Auto-fetch: ระบบดึงภาพหน้าปกคลิป (Cover Thumbnail) และชื่อคลิปอัตโนมัติจากลิงก์ TikTok ผ่าน `/api/tiktok/oembed` เพียงกดปุ่ม "ดึงภาพปก"
- [x] แดชบอร์ดจัดการสินค้า (Products CRUD): เพิ่ม/แก้ไข/ลบสินค้า, กำหนดราคาปกติ/ลดราคา, ใส่ลิงก์ TikTok Shop และคลิปรีวิว พร้อมพรีวิวรูปภาพ
- [x] แดชบอร์ดจัดหมวดหมู่ (Categories & Sorting): เพิ่มหมวดหมู่ และปุ่มเลื่อนลำดับขึ้น/ลง (Reordering)
- [x] ตั้งค่าร้านค้า (Shop Settings): แก้ไขชื่อร้าน, TikTok Handle, TikTok Shop URL และคำแนะนำเชื่อมต่อ Supabase
- [x] จัดการทีมงาน (Team RBAC): ตารางแจกแจงสิทธิ์ และฟอร์มเชิญทีมงานพร้อมกำหนดบทบาท

#### 4.3 Shared Packages & Database
- [x] `@tiktok/types`: Enums (`UserRole`, `ProductType`, `PermissionAction`), Interfaces และ DTOs
- [x] `@tiktok/database`: TypeORM Entities (`User`, `Category`, `Product`, `ClickTracking`) พร้อม DataSource Singleton รองรับ SSL
- [x] `@tiktok/auth`: Role Permissions Matrix, JWT Token Signing, และ Verification
- [x] Supabase Cloud Database: เชื่อมต่อและเตรียม Schema สะอาด (Clean Schema) บน Supabase PostgreSQL เรียบร้อย 100% พร้อมรองรับ Multi-Tenant (จำนวน 0 rows พร้อมให้ผู้ใช้จริงเข้ามาสร้างข้อมูลของตนเอง)

---

### 5. วิธีการรันระบบ (ทั้งแบบรวมคำสั่งเดียว และแบบแยกย่อย)

#### 5.1 แบบที่ 1: สั่งรันรวมทีเดียวทั้งหมดผ่าน Docker (All-in-One)
คำสั่งเดียวเปิดครบทั้ง 3 บริการ (ฐานข้อมูล PostgreSQL + หน้าร้าน Viewer พอร์ต 3000 + หลังบ้าน Backoffice พอร์ต 3001):
```bash
cd tiktok
docker compose up -d
# หรือใช้ yarn docker:up
```
*เปิดเบราว์เซอร์:*
- หน้าร้าน Viewer: `http://localhost:3000/@pond`
- หลังบ้าน Backoffice: `http://localhost:3001`
- ปิดระบบทั้งหมด: `docker compose down`

---

#### 5.2 แบบที่ 2: สั่งรันแยกย่อยราย Service (Selective Services)
* **รันเฉพาะฐานข้อมูลใน Docker แล้วรันโค้ดเว็บผ่านเครื่อง (แนะนำสำหรับตอนพัฒนาโค้ด):**
  ```bash
  cd tiktok
  docker compose up -d tiktok-postgres    # สตาร์ทเฉพาะฐานข้อมูล
  yarn dev                                # สตาร์ททั้ง 2 เว็บพร้อมกันใน terminal
  ```
* **แยกรันเฉพาะเว็บที่ต้องการผ่าน Yarn:**
  ```bash
  yarn dev:viewer        # รันเฉพาะหน้าร้าน Viewer (พอร์ต 3000)
  yarn dev:backoffice    # รันเฉพาะหลังบ้าน Backoffice (พอร์ต 3001)
  ```
* **แยกรันเฉพาะเว็บที่ต้องการผ่าน Docker:**
  ```bash
  docker compose up -d tiktok-viewer       # รันเฉพาะหน้าร้านใน Docker
  docker compose up -d tiktok-backoffice   # รันเฉพาะหลังบ้านใน Docker
  ```

---

## [2026-10-18] - เชื่อมต่อ Supabase Pooler, Cloudflare R2, TikTok Developer Portal และ Vercel Production Deployment

### 1. ความคืบหน้าและการเชื่อมต่อระบบจริง
* **Supabase PostgreSQL (Database Cloud):**
  - เปลี่ยนจากการเชื่อมต่อแบบ Direct (`db.<ref>.supabase.co` ซึ่ง ISP/WiFi หลายแห่งไม่รองรับ IPv6) มาใช้ **Supabase Connection Pooler** (`aws-0-ap-southeast-1.pooler.supabase.com:5432`) ทำให้รองรับ IPv4 ได้ 100%
  - ตั้งค่า `ssl: { rejectUnauthorized: false }` ใน TypeORM DataSource สำเร็จ
  - ตารางทั้งหมด (`users`, `categories`, `products`, `click_trackings`) ถูกสร้างบน Supabase อย่างสมบูรณ์แบบ โดยคงความสะอาดของฐานข้อมูล (0 mock rows) เพื่อรองรับ Multi-tenant จริง
* **Cloudflare R2 Object Storage (ระบบจัดเก็บรูปภาพ):**
  - ติดตั้งและตั้งค่า `@aws-sdk/client-s3` ใน `tiktok-backoffice/src/app/api/upload/route.ts`
  - รองรับการอัปโหลดไฟล์จากเครื่อง และการแคชรูปภาพจาก TikTok oEmbed ลง Cloudflare R2 อัตโนมัติ
* **TikTok Developer App ("Showcase Catalog Hub"):**
  - สร้างแอปใน TikTok Developer Portal ประเภท Individual / Other เรียบร้อย
  - สร้างภาพไอคอนแอปตามมาตรฐาน TikTok (1024x1024 px, JPEG, < 5MB): `tiktok/app-icon.jpg`
  - เพิ่มหน้าทางกฎหมายสำหรับตรวจสอบสิทธิ์: Terms of Service (`/terms`) และ Privacy Policy (`/privacy`) ใน `tiktok-viewer`
* **Vercel Production Deployment:**
  - เพิ่มคอนฟิก `.yarnrc.yml` (`nodeLinker: node-modules`) และ `"packageManager": "yarn@4.8.1"` ใน root `package.json`
  - ตั้งค่า `transpilePackages: ['@tiktok/types', '@tiktok/database', '@tiktok/auth']` ในทั้งสอง Next.js apps
  - ผูก Git Remote `https://github.com/chairat25/tiktok-hub.git`
* **TikTok URL Verification & Login Kit Integration:**
  - ยืนยันสิทธิ์ความเป็นเจ้าของโดเมนสำเร็จ (URL Prefix Verification) ผ่าน Signature File `tiktokARosiOg4YtW4Zlz8SA097Hd9QvmrnBao.txt` ใน `tiktok-viewer/public/` และใส่ Meta Tag ใน `layout.tsx`
  - พัฒนาและ Deploy Endpoint รองรับ OAuth Redirect: `/api/auth/callback` เพื่อรับ Code/State จาก TikTok Login Kit และพากลับสู่หน้าร้านค้า
  - จัดเตรียมข้อมูล App Submission ครบถ้วน (Category, Description, Login Kit Scope Explanation, Demo Video, Redirect URI)

* **Real Authentication & TikTok Account Linking (SSO):**
  - ยกเลิกระบบ Mock/Bypass Login 100% ป้องกันคนนอกเข้าถึงแดชบอร์ด
  - เพิ่มระบบสมัครเปิดร้านค้าใหม่ (`/api/auth/register`) ด้วย Email + Password (เข้ารหัสด้วย `bcryptjs` Salt & Hash)
  - เพิ่มระบบเข้าสู่ระบบจริง (`/api/auth/login`) ตรวจสอบความถูกต้องกับ Supabase PostgreSQL
  - เพิ่มฟังก์ชัน **TikTok Account Linking** ในหน้า `/dashboard/settings`: ผูกหรือยกเลิกการผูกบัญชี TikTok เข้ากับร้านค้า
  - เชื่อมต่อ TikTok OAuth Authorize & Callback Flow: รองรับทั้งการเข้าสู่ระบบผ่าน TikTok Account (SSO) และการผูกบัญชีจากในหลังบ้าน
  - แก้ไขปัญหา Circular TypeORM Metadata ใน Next.js ด้วย `Relation<T>` และ `import type`
  - รองรับ Zero-Emoji UI มาตรฐานด้วย Lucide Icons

---

### Handoff Block
```
[KEYWORD: tiktok-real-auth-ready]
- Completed:
  1. Real Email + Password Authentication & Creator Registration
  2. TikTok OAuth SSO Login & Account Linking ใน Settings
  3. API Endpoints: /api/auth/register, /api/auth/login, /api/auth/tiktok/authorize, /api/auth/callback, /api/auth/tiktok/unlink, /api/creator/settings
  4. Build ตรวจสอบผ่านทั้ง tiktok-viewer และ tiktok-backoffice (0 errors)
- Pending for Next Steps:
  1. git push origin main เพื่อให้ Vercel Deploy ทั้ง Viewer และ Backoffice อัตโนมัติ
  2. ใส่ TIKTOK_CLIENT_KEY และ TIKTOK_CLIENT_SECRET บน Vercel Environment Variables
  3. เพิ่ม Redirect URI: https://tiktok-hub-backoffice.vercel.app/api/auth/callback บน TikTok Developer Portal
  4. ทดสอบสมัครเปิดร้าน Creator ร้านแรก และทดสอบผูกบัญชี TikTok ใน Settings
- Next Action Prompt: ทดสอบสมัครบัญชีร้านค้าจริงบน Backoffice และทดสอบฟังก์ชันเชื่อมต่อ TikTok ในเมนู Settings
```



