-- ─── Admin product management: soft delete, revoke, gallery, shop catalog, stock events ───
-- Products stay in DB; is_deleted marks removal. Admin can see and restore all rows.

-- ─── 1. Product columns ───────────────────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gallery TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_products_shop_deleted ON public.products (shop_id, is_deleted);

-- ─── 2. Shop-scoped categories & brands ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS shop_categories_shop_name_active
  ON public.shop_categories (shop_id, lower(trim(name)))
  WHERE NOT is_deleted;

CREATE INDEX IF NOT EXISTS idx_shop_categories_shop ON public.shop_categories (shop_id);

CREATE TABLE IF NOT EXISTS public.shop_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS shop_brands_shop_name_active
  ON public.shop_brands (shop_id, lower(trim(name)))
  WHERE NOT is_deleted;

CREATE INDEX IF NOT EXISTS idx_shop_brands_shop ON public.shop_brands (shop_id);

-- ─── 3. Stock received from supplier (purchase) audit ───────────────────────────
CREATE TABLE IF NOT EXISTS public.product_stock_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  quantity_received INTEGER NOT NULL CHECK (quantity_received > 0),
  supplier_name TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  recorded_by_role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_stock_events_product ON public.product_stock_events (product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_events_shop ON public.product_stock_events (shop_id);

-- ─── 4. RLS (open policies — same pattern as supplier_purchases) ───────────────
ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_categories_open" ON public.shop_categories;
CREATE POLICY "shop_categories_open" ON public.shop_categories FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "shop_brands_open" ON public.shop_brands;
CREATE POLICY "shop_brands_open" ON public.shop_brands FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "product_stock_events_open" ON public.product_stock_events;
CREATE POLICY "product_stock_events_open" ON public.product_stock_events FOR ALL TO public USING (true) WITH CHECK (true);

-- Allow anon / demo clients to insert & update products (SELECT already public)
DROP POLICY IF EXISTS "products_open_write" ON public.products;
CREATE POLICY "products_open_write" ON public.products FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "products_open_update" ON public.products;
CREATE POLICY "products_open_update" ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);

-- ─── 5. updated_at triggers for new tables ────────────────────────────────────
DROP TRIGGER IF EXISTS set_shop_categories_updated_at ON public.shop_categories;
CREATE TRIGGER set_shop_categories_updated_at
  BEFORE UPDATE ON public.shop_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_shop_brands_updated_at ON public.shop_brands;
CREATE TRIGGER set_shop_brands_updated_at
  BEFORE UPDATE ON public.shop_brands FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
