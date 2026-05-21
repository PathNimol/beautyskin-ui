# BS Online Shop

Next.js 15 application (TypeScript, Tailwind CSS, optional Supabase for data and realtime). The app uses **role-based dashboards** (admin, shop owner, staff, customer) with **mock authentication** for demos, plus selected features wired to **Supabase** when environment variables are set.

---

## Mentor guide: test from scratch (after clone)

Use this as a **repeatable QA walkthrough** for anyone validating the repo on a clean machine.

### 1. Prerequisites

- **Node.js** 20 LTS (or compatible; project uses TypeScript 5.9 / Next 15).
- **Yarn** 1.x (see `packageManager` in `package.json`) or **npm**.
- **Git**.
- **Optional but recommended:** a [Supabase](https://supabase.com/) project if you want to exercise **live shops, products, inventory, orders**, and admin product management against a real database.

### 2. Clone and install

```bash
git clone https://github.com/PathNimol/beautyskin-ui.git
cd bsonlineshop
yarn install
# or: npm install
```

### 3. Environment variables (Supabase)

Create **`.env.local`** in the project root (do not commit secrets). Typical keys used by the client:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:4028

# Spring REST API (auth, cart, catalog, etc.) — base URL including `/api`
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

See **`.env.example`** for optional **`API_URL`** alias (resolved in `next.config.mjs` when `NEXT_PUBLIC_API_URL` is unset).

- Without these, **Supabase-backed screens** may show errors or empty data; many **owner/staff/admin customer** UIs still load using **mock data** in the browser.
- With them applied, run SQL migrations on your Supabase project (see step 4).

### 4. Database (optional, for full backend checks)

From the repo root, if you use Supabase CLI linked to your project:

```bash
supabase db push
# or apply files under supabase/migrations/ in order via the Supabase SQL editor
```

Smoke-test that **shops**, **products**, **inventory_items**, and **orders** exist and RLS policies match your expectations before relying on admin product flows.

### 5. Run the app

```bash
yarn dev
# App listens on http://localhost:4028 (see package.json "dev" script)
```

Run **`yarn type-check`** and **`yarn lint`** before sign-off if you are mentoring code quality (lint may report existing issues in some files).

### 6. Authentication (mock users)

Open **`/login`**. The page lists **demo accounts** (email / password / redirect). Sign in as each role and confirm the **post-login landing** and **sidebar** match the role.

| Role   | Example email           | Example password | Typical first screen   |
|--------|-------------------------|------------------|-------------------------|
| Admin  | `admin@beautyskin.com`  | `admin123`       | `/admin/dashboard`     |
| Owner  | `owner@beautyskin.com`  | `owner123`       | `/owner/dashboard`      |
| Staff  | `staff@beautyskin.com`  | `staff123`       | `/staff/dashboard`      |
| Buyer  | `buyer@beautyskin.com`  | `buyer123`       | `/customer/account`     |

**OTP demo (login flow):** when prompted, use **`123456`** as the mock OTP.

Also test **`/register`** and **`/forgot-password`** for basic form and navigation behavior.

### 7. Role-by-role feature checklist

After login, use the **dashboard sidebar** (or admin sidebar for admin) and verify each link **loads without a blank error page**. Spot-check interactions (filters, modals, navigation).

**Admin (`admin` role)**  
- Dashboard, analytics, reports, orders (`/admin/*`).  
- **Shops:** `/admin/all-shops`, `/admin/shops`, `/admin-shops` (legacy URL; same shop management client as `/admin/shops`).  
- **Customers:** `/admin/customers`.  
- **Products (Supabase):** `/admin/products` → pick a shop → `/admin/shops/[shopId]/products` (catalog, soft delete, restore, categories/brands, stock purchases, images).  
- **Per-shop users:** `/admin/shops/[shopId]/users`.  
- **Chat / Direct messages / Settings** where linked from admin UI.

**Owner (`owner` role)**  
- Dashboard, products, inventory, orders, POS, staff, suppliers, purchases, customers, promotions, reports, analytics.  
- Staff page may reuse shop management patterns.

**Staff (`staff` role)**  
- Dashboard, products, inventory, orders, POS, revoke requests.  
- Shared chat, DMs, settings.

**Customer / buyer (`buyer` role)**  
- Account, shop (product listing), cart, chat, direct messages.  
- Also exercise **`/customer-account`** (or `/customer/account` per nav) for profile and order-style tabs if present.

### 8. Public storefront (signed out or extra tabs)

- **`/`** — marketing home.  
- **`/product-listing`**, **`/product-detail/[id]`** — browse product-style pages (often mock-driven).  
- **`/cart`**, **`/checkout`** — checkout flow UI.  
- **`/shops`** — shop listing (same underlying shop client as admin all-shops when authenticated layout differs).

### 9. Sign-off criteria for mentors

- [ ] Install and `yarn dev` succeed on a clean clone.  
- [ ] `.env.local` documented for mentees; Supabase optional path explained.  
- [ ] All four mock roles log in and reach their dashboard.  
- [ ] Each role’s main sidebar destinations load.  
- [ ] If Supabase is configured: at least one **shop** and **admin product** path reads/writes without RLS surprises.  
- [ ] `yarn build` succeeds before merge (production compile).

---

## What this project can do today (capability map)

Use this section to **decide what to extend next**; it reflects the current codebase, not a product roadmap.

### Platform model

- **Multi-role beauty e-commerce platform**: separate experiences for **platform admin**, **shop owner**, **shop staff**, and **customers**.  
- **Auth:** primarily **`MockAuthContext`** (localStorage session + cookie) with fixed demo users in `src/lib/mock/data.ts`. **`AuthContext`** exists for Supabase Auth patterns but is not the main login path for the demo sidebar.  
- **Data:** mix of **mock JSON** (POS, many product UIs, chat content) and **Supabase** (shops, realtime inventory/orders hooks, admin product management, etc., when env vars are present).

### Storefront and customer experience

- Marketing landing, category-style sections, product listing and detail views.  
- Shopping cart and checkout-style pages (including customer-scoped routes under `/customer/*`).  
- Customer account areas: profile-style editing, order history / tracking UI (some data mock or hybrid).

### Shop operations (owner / staff)

- **Dashboards** with KPI-style cards.  
- **Products & inventory** UIs (many views use mock products; align with Supabase when migrating).  
- **Orders** list and detail patterns.  
- **POS** interface (mock products, cart, receipt-style flow).  
- **Staff** management entry points; **revoke requests** for staff.  
- **Suppliers / purchases / promotions / reports / analytics** pages (largely UI + mock or partial integrations—verify per file before assuming backend persistence).

### Platform administration

- Admin dashboard, **shop registry** (list, filter, add shop, change status), **platform orders**, **customers**, **analytics**, **reports**.  
- **Admin products** (per shop): CRUD-style product forms, soft delete / restore, categories and brands per shop, supplier stock events, image URL + optional Storage uploads to a `product-images` bucket.  
- **Per-shop user management** screen for admin (`ShopUsersClient`).

### Collaboration

- **Chat** (room-based) and **direct messages** for internal roles and customers (mock-heavy).

### Backend / infra in repo

- **Supabase SQL migrations** under `supabase/migrations/` (schema for shops, products, inventory, orders, staff, notifications, analytics tables, admin product extensions, etc.).  
- **Edge function** example: `supabase/functions/send-email/`.

### Good candidates for “what to add next”

- Deeper **Supabase Auth** replacing or complementing mock login.  
- **End-to-end** product lifecycle on Supabase for owner/staff (not only admin).  
- **Payment** integration on checkout.  
- **Email / notifications** wired to real providers.  
- **Tests** (Playwright for mentor checklist, Vitest for hooks).  
- **API route** layer (`app/api`) for secrets instead of open RLS demo policies.  
- **i18n** and **accessibility** audit.

---

## Tech stack (high level)

- **Next.js 15** (App Router), **React 19**, **TypeScript**  
- **Tailwind CSS**  
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) for optional live data  
- **Recharts** (analytics-style pages)

---

## Installation (quick reference)

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Start the development server:

   ```bash
   yarn dev
   ```

3. Open [http://localhost:4028](http://localhost:4028) in your browser.

---

## Project structure

Overview of this repository. For more detail, see **`docs/project-structure.md`**.

```
bsonlineshop/
├── src/
│   ├── app/                 # Next.js App Router (URLs, layouts, thin pages)
│   ├── components/          # Shared UI; features under components/features/
│   │   └── features/shop/   # Canonical shop admin + ShopUsersClient + barrel index.ts
│   ├── contexts/            # React context providers
│   ├── hooks/               # Shared hooks (e.g. Supabase realtime)
│   ├── lib/                 # Utilities, Supabase client, mock data
│   ├── styles/              # Global CSS / Tailwind
│   ├── types/               # Shared TypeScript types
│   ├── middleware.ts
│   └── ...
├── supabase/
│   ├── migrations/          # Postgres schema and RLS (apply in order)
│   └── functions/           # Edge Functions (e.g. send-email)
├── docs/                    # Architecture and structure notes
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── image-hosts.config.mjs
├── .editorconfig
└── .vscode/extensions.json
```

**Note:** Admin shop screens use `src/components/features/shop/`. Routes `/admin/shops` and `/admin-shops` both use the same shop management client.

---

## Page editing

Start from `src/app/page.tsx` for the public home page; the dev server hot-reloads on save.

---

## Styling

Tailwind CSS: utility-first styling, custom theme in `tailwind.config.js`, PostCSS pipeline.

---

## Available scripts

| Script            | Description                          |
|-------------------|--------------------------------------|
| `yarn dev`        | Dev server (port **4028**)           |
| `yarn build`      | Production build                     |
| `yarn serve`      | Start production server (`next start`) |
| `yarn lint`       | ESLint                               |
| `yarn lint:fix`   | ESLint with auto-fix                 |
| `yarn format`     | Prettier                             |
| `yarn type-check` | TypeScript (`tsc --noEmit`)          |

---

## Deployment

```bash
yarn build
```

Configure environment variables on the host (see mentor guide above).

---

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)  
- [Learn Next.js](https://nextjs.org/learn)  
- [Next.js GitHub](https://github.com/vercel/next.js)

---

## Acknowledgments

- Built with [Rocket.new](https://rocket.new)  
- Powered by Next.js and React  
- Styled with Tailwind CSS
