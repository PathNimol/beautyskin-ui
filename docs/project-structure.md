# BS Online Shop — project structure

This document describes how the repository is organized today. It is a **map of the codebase**, not a prescription to move files. Relocating routes or components without updating every import will break the build.

## Top level

| Path | Role |
|------|------|
| `src/` | Application source (Next.js App Router, components, hooks, lib). |
| `supabase/` | SQL migrations and Edge Functions (for example `send-email`). |
| `next.config.mjs` | Next.js configuration. |
| `tailwind.config.js`, `postcss.config.js` | Styling pipeline. |
| `package.json` | Scripts and dependencies. |
| `.eslintrc.json`, `.prettierrc`, `.prettierignore` | Lint and format. |

## `src/app/` (routes)

Next.js uses the **App Router**: folders define URLs. Typical patterns in this repo:

- **`page.tsx`** — Server or client entry for a route.
- **`layout.tsx`** — Shared layout when present.
- **Dynamic segments** — Folders like `[id]` or `[shopId]` for parameterized routes.
- **Colocated clients** — Some routes keep a `*Client.tsx` next to `page.tsx`; others import from `src/components/features/...`. Both patterns are valid here.

### Route areas (conceptual)

- **Marketing / storefront** — `page.tsx`, `components/` under `app` (for example `HeroSection`, `CategoriesSection`).
- **Auth** — `login`, `register`, `forgot-password`.
- **Customer** — under `customer/` (cart, checkout, shop, chat, and so on).
- **Owner / staff** — `owner/*`, `staff/*` (dashboard, POS, inventory, orders, products).
- **Admin** — `admin/*` (dashboard, shops, orders, analytics, per-shop users and products). The route **`admin-shops/`** is a legacy alternate URL that uses the same shop UI as `admin/shops`; both import from `src/components/features/shop/`.
- **Thin route wrappers** — Prefer `src/components/features/...` for large client modules; keep `page.tsx` small.

## Shop feature (`src/components/features/shop/`)

| Module | Role |
|--------|------|
| `ShopManagementClient.tsx` | Single canonical UI for listing shops, registering shops, status, staff modal, product catalog link, and user-management links. |
| `ShopsClient.tsx` | Re-export of `ShopManagementClient` for routes named “shops” (`/shops`, admin all-shops). |
| `ShopUsersClient.tsx` | Per-shop user management for `/admin/shops/[shopId]/users`. |
| `index.ts` | Barrel: `ShopManagementClient`, `ShopsClient`, `ShopUsersClient` (optional import style for new code). |

## `src/components/`

| Area | Purpose |
|------|---------|
| `components/ui/` | Reusable primitives (`AppIcon`, `AppImage`, `AppLogo`). |
| `components/features/` | Larger feature UIs (dashboard, admin, POS, customers, and so on). |
| Root of `components/` | Shared shell pieces (`DashboardLayout`, `Header`, modals). |

## `src/lib/`

Shared non-UI code: Supabase browser client, mock data, email helpers, and similar.

## `src/hooks/`

React hooks used across the app (for example realtime Supabase subscriptions, shop product management).

## `src/contexts/`

React context providers (`MockAuthContext`, `AuthContext`).

## `src/types/`

Shared TypeScript types.

## `src/styles/`

Global CSS and Tailwind entry points.

## `supabase/migrations/`

Ordered SQL migrations. Apply them in sequence on your database; new tables and policies are defined here.

## Conventions when extending the project

1. **Prefer the same folder as sibling files** for a given route (either colocated `*Client.tsx` or `components/features/...` — match the surrounding pattern).
2. **Shop admin UI** — Add behavior in `src/components/features/shop/ShopManagementClient.tsx` (or `ShopUsersClient.tsx` for per-shop users). Avoid duplicating another `ShopManagementClient` under `app/`.
3. **Environment variables** stay outside this doc; configure Supabase and other keys in your deployment environment and local `.env` (not committed if secrets).

For day-to-day commands, see the root `README.md`.
