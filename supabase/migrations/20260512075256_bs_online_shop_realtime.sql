-- ─── BS Online Shop – Real-time Schema Migration ─────────────────────────────
-- Tables: shops, products, inventory_items, orders
-- Enables real-time subscriptions for stock, orders, and low-stock alerts

-- ─── 1. ENUM TYPES ────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS public.shop_status CASCADE;
CREATE TYPE public.shop_status AS ENUM ('active', 'pending', 'suspended');

DROP TYPE IF EXISTS public.shop_plan CASCADE;
CREATE TYPE public.shop_plan AS ENUM ('starter', 'growth', 'enterprise');

DROP TYPE IF EXISTS public.product_status CASCADE;
CREATE TYPE public.product_status AS ENUM ('active', 'low_stock', 'out_of_stock', 'expiring_soon', 'expired');

DROP TYPE IF EXISTS public.inventory_status CASCADE;
CREATE TYPE public.inventory_status AS ENUM ('healthy', 'low', 'critical', 'out_of_stock', 'expiring_soon', 'expired');

DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered', 'Cancelled', 'Returned');

DROP TYPE IF EXISTS public.payment_status CASCADE;
CREATE TYPE public.payment_status AS ENUM ('Paid', 'Pending', 'Refunded');

-- ─── 2. CORE TABLES ───────────────────────────────────────────────────────────

-- Shops
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID,
  owner_name TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  logo_alt TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  shop_status public.shop_status NOT NULL DEFAULT 'active',
  plan public.shop_plan NOT NULL DEFAULT 'starter',
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  products_count INTEGER NOT NULL DEFAULT 0,
  customers_count INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  sold INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  image_alt TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  how_to_use TEXT NOT NULL DEFAULT '',
  skin_type TEXT[] NOT NULL DEFAULT '{}',
  expiry_date TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL DEFAULT '',
  product_status public.product_status NOT NULL DEFAULT 'active',
  tags TEXT[] NOT NULL DEFAULT '{}',
  weight TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 100,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  last_restocked TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date TEXT NOT NULL DEFAULT '',
  batch_number TEXT NOT NULL DEFAULT '',
  supplier_id TEXT NOT NULL DEFAULT '',
  supplier_name TEXT NOT NULL DEFAULT '',
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  inv_status public.inventory_status NOT NULL DEFAULT 'healthy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT NOT NULL UNIQUE,
  customer_id UUID,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  customer_avatar TEXT NOT NULL DEFAULT '',
  customer_avatar_alt TEXT NOT NULL DEFAULT '',
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  shop_name TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  order_status public.order_status NOT NULL DEFAULT 'Pending',
  payment_method TEXT NOT NULL DEFAULT '',
  pay_status public.payment_status NOT NULL DEFAULT 'Pending',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. INDEXES ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(product_status);
CREATE INDEX IF NOT EXISTS idx_inventory_shop_id ON public.inventory_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory_items(inv_status);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ─── 4. ENABLE ROW LEVEL SECURITY ─────────────────────────────────────────────
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ─── 5. RLS POLICIES (open read for all, write for authenticated) ──────────────

-- Shops: public read
DROP POLICY IF EXISTS "shops_public_read" ON public.shops;
CREATE POLICY "shops_public_read" ON public.shops FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "shops_auth_write" ON public.shops;
CREATE POLICY "shops_auth_write" ON public.shops FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products: public read
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "products_auth_write" ON public.products;
CREATE POLICY "products_auth_write" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inventory: public read
DROP POLICY IF EXISTS "inventory_public_read" ON public.inventory_items;
CREATE POLICY "inventory_public_read" ON public.inventory_items FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "inventory_auth_write" ON public.inventory_items;
CREATE POLICY "inventory_auth_write" ON public.inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders: public read
DROP POLICY IF EXISTS "orders_public_read" ON public.orders;
CREATE POLICY "orders_public_read" ON public.orders FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "orders_auth_write" ON public.orders;
CREATE POLICY "orders_auth_write" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── 6. UPDATED_AT TRIGGER ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_shops_updated_at ON public.shops;
CREATE TRIGGER set_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_inventory_updated_at ON public.inventory_items;
CREATE TRIGGER set_inventory_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 7. SEED DATA ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  shop1_id UUID := gen_random_uuid();
  shop2_id UUID := gen_random_uuid();
  shop3_id UUID := gen_random_uuid();
  prod1_id UUID := gen_random_uuid();
  prod2_id UUID := gen_random_uuid();
  prod3_id UUID := gen_random_uuid();
  prod4_id UUID := gen_random_uuid();
  prod5_id UUID := gen_random_uuid();
  prod6_id UUID := gen_random_uuid();
BEGIN
  -- Shops
  INSERT INTO public.shops (id, name, slug, owner_name, logo, logo_alt, description, shop_status, plan, revenue, orders_count, products_count, customers_count, category)
  VALUES
    (shop1_id, 'GlowSkin Store', 'glowskin-store', 'Sarah Kim', 'https://img.rocket.new/generatedImages/rocket_gen_img_1b953edb4-1772690319677.png', 'GlowSkin Store logo', 'Premium Korean skincare essentials', 'active', 'enterprise', 124500.00, 1284, 87, 3247, 'Korean Skincare'),
    (shop2_id, 'K-Beauty Hub', 'k-beauty-hub', 'Ji-Yeon Park', 'https://img.rocket.new/generatedImages/rocket_gen_img_18ca1e79a-1773058034288.png', 'K-Beauty Hub logo', 'Authentic K-beauty products', 'active', 'growth', 89200.00, 967, 64, 2108, 'K-Beauty'),
    (shop3_id, 'Pure Beauty Co', 'pure-beauty-co', 'Emma Chen', 'https://img.rocket.new/generatedImages/rocket_gen_img_1d570eb07-1772731577599.png', 'Pure Beauty Co logo', 'Natural and organic skincare', 'active', 'starter', 45600.00, 512, 43, 1034, 'Natural Skincare')
  ON CONFLICT (slug) DO NOTHING;

  -- Products
  INSERT INTO public.products (id, shop_id, name, brand, category, price, original_price, stock, sold, rating, review_count, image, image_alt, description, ingredients, how_to_use, skin_type, expiry_date, sku, product_status, tags, weight, origin)
  VALUES
    (prod1_id, shop1_id, 'Glow Essence Serum', 'GlowLab', 'Serums', 28.99, 35.00, 45, 312, 4.8, 128, 'https://img.rocket.new/generatedImages/rocket_gen_img_1b953edb4-1772690319677.png', 'Glow Essence Serum bottle', 'Brightening serum with niacinamide and vitamin C for radiant skin.', ARRAY['Niacinamide 10%', 'Vitamin C', 'Hyaluronic Acid', 'Centella Asiatica'], 'Apply 2-3 drops to clean skin morning and evening.', ARRAY['All', 'Oily', 'Combination'], '2027-06-30', 'GLS-SER-001', 'active', ARRAY['brightening', 'serum', 'niacinamide'], '30ml', 'South Korea'),
    (prod2_id, shop1_id, 'UV Shield SPF 50+', 'SunGuard', 'Sunscreen', 19.99, 24.00, 8, 445, 4.7, 203, 'https://img.rocket.new/generatedImages/rocket_gen_img_18ca1e79a-1773058034288.png', 'UV Shield sunscreen tube', 'Lightweight daily sunscreen with PA++++ protection.', ARRAY['Zinc Oxide', 'Titanium Dioxide', 'Niacinamide', 'Green Tea Extract'], 'Apply generously 15 minutes before sun exposure.', ARRAY['All', 'Sensitive'], '2026-12-31', 'SGD-SUN-001', 'low_stock', ARRAY['sunscreen', 'spf50', 'daily'], '50ml', 'Japan'),
    (prod3_id, shop2_id, 'Snail Mucin Essence', 'COSRX', 'Serums', 22.50, 28.00, 0, 567, 4.9, 342, 'https://img.rocket.new/generatedImages/rocket_gen_img_1d570eb07-1772731577599.png', 'Snail Mucin Essence bottle', '96% snail secretion filtrate for intense hydration and repair.', ARRAY['Snail Secretion Filtrate 96%', 'Betaine', 'Sodium Hyaluronate'], 'Apply after toner, pat gently until absorbed.', ARRAY['All', 'Dry', 'Sensitive'], '2027-03-31', 'CSX-ESS-001', 'out_of_stock', ARRAY['snail', 'essence', 'hydrating'], '100ml', 'South Korea'),
    (prod4_id, shop2_id, 'Ceramide Repair Toner', 'Klairs', 'Toners', 42.00, 48.00, 23, 189, 4.6, 97, 'https://img.rocket.new/generatedImages/rocket_gen_img_1e5fc8214-1763301847577.png', 'Ceramide Repair Toner bottle', 'Barrier-strengthening toner with ceramides and peptides.', ARRAY['Ceramide NP', 'Ceramide AP', 'Phytosphingosine', 'Cholesterol'], 'Apply with cotton pad or hands after cleansing.', ARRAY['Dry', 'Sensitive', 'Mature'], '2026-09-30', 'KLR-TON-001', 'expiring_soon', ARRAY['ceramide', 'toner', 'barrier'], '200ml', 'South Korea'),
    (prod5_id, shop3_id, 'Hydra Barrier Cream', 'Naturium', 'Moisturizers', 34.00, 40.00, 67, 234, 4.5, 156, 'https://img.rocket.new/generatedImages/rocket_gen_img_1189b0c6b-1763296107547.png', 'Hydra Barrier Cream jar', 'Rich moisturizer with hyaluronic acid and ceramides.', ARRAY['Hyaluronic Acid', 'Ceramide', 'Shea Butter', 'Squalane'], 'Apply morning and evening to clean skin.', ARRAY['Dry', 'Normal', 'Sensitive'], '2027-08-31', 'NAT-CRM-001', 'active', ARRAY['moisturizer', 'hydrating', 'ceramide'], '60ml', 'USA'),
    (prod6_id, shop3_id, 'Rice Water Brightener', 'I am From', 'Serums', 31.00, 38.00, 3, 178, 4.7, 89, 'https://img.rocket.new/generatedImages/rocket_gen_img_1f73eebdf-1773114809765.png', 'Rice Water Brightener bottle', 'Brightening serum with 77.78% rice water for luminous skin.', ARRAY['Rice Water 77.78%', 'Niacinamide', 'Adenosine', 'Allantoin'], 'Apply 2-3 drops after toner, morning and evening.', ARRAY['All', 'Dull', 'Uneven'], '2026-07-31', 'IAF-SER-001', 'low_stock', ARRAY['brightening', 'rice', 'serum'], '30ml', 'South Korea')
  ON CONFLICT (id) DO NOTHING;

  -- Inventory Items
  INSERT INTO public.inventory_items (product_id, product_name, sku, shop_id, current_stock, min_stock, max_stock, reorder_point, expiry_date, batch_number, supplier_name, cost_price, inv_status)
  VALUES
    (prod1_id, 'Glow Essence Serum', 'GLS-SER-001', shop1_id, 45, 20, 200, 30, '2027-06-30', 'BATCH-2024-001', 'GlowLab Korea', 14.50, 'healthy'),
    (prod2_id, 'UV Shield SPF 50+', 'SGD-SUN-001', shop1_id, 8, 20, 150, 25, '2026-12-31', 'BATCH-2024-002', 'SunGuard Japan', 9.99, 'low'),
    (prod3_id, 'Snail Mucin Essence', 'CSX-ESS-001', shop2_id, 0, 15, 120, 20, '2027-03-31', 'BATCH-2024-003', 'COSRX Direct', 11.25, 'out_of_stock'),
    (prod4_id, 'Ceramide Repair Toner', 'KLR-TON-001', shop2_id, 23, 10, 100, 15, '2026-09-30', 'BATCH-2024-004', 'Klairs Official', 21.00, 'expiring_soon'),
    (prod5_id, 'Hydra Barrier Cream', 'NAT-CRM-001', shop3_id, 67, 25, 180, 35, '2027-08-31', 'BATCH-2024-005', 'Naturium US', 17.00, 'healthy'),
    (prod6_id, 'Rice Water Brightener', 'IAF-SER-001', shop3_id, 3, 15, 100, 20, '2026-07-31', 'BATCH-2024-006', 'I am From Korea', 15.50, 'critical')
  ON CONFLICT (id) DO NOTHING;

  -- Orders
  INSERT INTO public.orders (order_ref, customer_name, customer_email, customer_phone, customer_avatar, customer_avatar_alt, shop_id, shop_name, items, total, subtotal, shipping, discount, order_status, payment_method, pay_status, address, city, country)
  VALUES
    ('#ORD-2847', 'Emma Rodriguez', 'emma.r@email.com', '+1 555-0101', 'https://img.rocket.new/generatedImages/rocket_gen_img_1b953edb4-1772690319677.png', 'Young woman with warm smile', shop1_id, 'GlowSkin Store', '[{"name":"Glow Essence Serum","qty":2,"price":28.99},{"name":"UV Shield SPF 50+","qty":1,"price":19.99}]'::jsonb, 77.97, 77.97, 0, 0, 'Delivered', 'Credit Card', 'Paid', '123 Maple St', 'New York', 'USA'),
    ('#ORD-2846', 'Mei-Lin Tanaka', 'meilin@email.com', '+1 555-0102', 'https://img.rocket.new/generatedImages/rocket_gen_img_18ca1e79a-1773058034288.png', 'Asian woman with clear skin', shop2_id, 'K-Beauty Hub', '[{"name":"Snail Mucin Essence","qty":1,"price":22.50}]'::jsonb, 22.50, 22.50, 0, 0, 'Packing', 'QR Payment', 'Paid', '45 Cherry Blossom Ave', 'Los Angeles', 'USA'),
    ('#ORD-2845', 'Priya Sharma', 'priya.s@email.com', '+1 555-0103', 'https://img.rocket.new/generatedImages/rocket_gen_img_1d570eb07-1772731577599.png', 'South Asian woman confident', shop1_id, 'GlowSkin Store', '[{"name":"UV Shield SPF 50+","qty":2,"price":19.99},{"name":"Ceramide Repair Toner","qty":1,"price":42.00}]'::jsonb, 81.98, 81.98, 0, 0, 'Shipping', 'Credit Card', 'Paid', '78 Sunset Blvd', 'Miami', 'USA'),
    ('#ORD-2844', 'Sophie Williams', 'sophie.w@email.com', '+1 555-0104', 'https://img.rocket.new/generatedImages/rocket_gen_img_1e5fc8214-1763301847577.png', 'Woman with friendly expression', shop3_id, 'Pure Beauty Co', '[{"name":"Hydra Barrier Cream","qty":1,"price":34.00}]'::jsonb, 34.00, 34.00, 0, 0, 'Pending', 'Bank Transfer', 'Pending', '12 Oak Lane', 'Chicago', 'USA'),
    ('#ORD-2843', 'Aiko Nakamura', 'aiko.n@email.com', '+1 555-0105', 'https://img.rocket.new/generatedImages/rocket_gen_img_1189b0c6b-1763296107547.png', 'Japanese woman with professional style', shop2_id, 'K-Beauty Hub', '[{"name":"Ceramide Repair Toner","qty":1,"price":42.00},{"name":"Eye Peptide Cream","qty":1,"price":55.00}]'::jsonb, 97.00, 97.00, 0, 0, 'Delivered', 'Credit Card', 'Paid', '99 Sakura St', 'San Francisco', 'USA'),
    ('#ORD-2842', 'Fatima Al-Hassan', 'fatima.ah@email.com', '+1 555-0106', 'https://img.rocket.new/generatedImages/rocket_gen_img_1f73eebdf-1773114809765.png', 'Middle Eastern woman with elegant style', shop3_id, 'Pure Beauty Co', '[{"name":"Rice Water Brightener","qty":1,"price":31.00}]'::jsonb, 31.00, 31.00, 0, 0, 'Cancelled', 'Credit Card', 'Refunded', '34 Desert Rose Rd', 'Houston', 'USA'),
    ('#ORD-2841', 'Lily Chen', 'lily.c@email.com', '+1 555-0107', 'https://images.unsplash.com/photo-1680049113650-4a1c24f61d71', 'Young woman with bright smile', shop1_id, 'GlowSkin Store', '[{"name":"Niacinamide 10% Serum","qty":3,"price":11.90},{"name":"Gentle Foam Cleanser","qty":2,"price":15.99}]'::jsonb, 67.68, 67.68, 0, 0, 'Confirmed', 'QR Payment', 'Paid', '56 Lotus Ave', 'Seattle', 'USA'),
    ('#ORD-2840', 'Nadia Petrov', 'nadia.p@email.com', '+1 555-0108', 'https://images.unsplash.com/photo-1585335559291-f94d268f8b17', 'European woman with sophisticated look', shop3_id, 'Pure Beauty Co', '[{"name":"Honey Clay Mask","qty":2,"price":24.00},{"name":"Cica Recovery Cream","qty":1,"price":38.50}]'::jsonb, 86.50, 86.50, 0, 0, 'Shipping', 'Credit Card', 'Paid', '22 Birch Blvd', 'Boston', 'USA')
  ON CONFLICT (order_ref) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
