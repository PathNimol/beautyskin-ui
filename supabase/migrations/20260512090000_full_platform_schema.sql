-- ─── BS Online Shop – Full Platform Schema ───────────────────────────────────
-- Adds: user_profiles, chat_messages, pos_receipts, receipt_cancellations,
--       supplier_purchases, product_revoke_requests, customer_shop_ownership
-- Timestamp: 20260512090000

-- ─── 1. New ENUMs ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.user_platform_role AS ENUM ('admin', 'owner', 'staff', 'buyer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.receipt_status AS ENUM ('active', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.purchase_status AS ENUM ('pending', 'received', 'partial', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.revoke_reason AS ENUM ('expired', 'broken', 'tester', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.revoke_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 2. User Profiles ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_user_id  TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  role          public.user_platform_role NOT NULL DEFAULT 'buyer',
  shop_id       TEXT,
  avatar        TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. Chat Messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       TEXT NOT NULL,
  sender_id     TEXT NOT NULL,
  sender_name   TEXT NOT NULL DEFAULT '',
  sender_role   TEXT NOT NULL DEFAULT '',
  sender_avatar TEXT NOT NULL DEFAULT '',
  message       TEXT NOT NULL DEFAULT '',
  message_type  TEXT NOT NULL DEFAULT 'text',
  shop_id       TEXT,
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sender_id ON public.chat_messages(sender_id);

-- ─── 4. POS Receipts ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_receipts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_ref     TEXT NOT NULL UNIQUE,
  shop_id         UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  shop_name       TEXT NOT NULL DEFAULT '',
  staff_id        TEXT NOT NULL DEFAULT '',
  staff_name      TEXT NOT NULL DEFAULT '',
  customer_name   TEXT NOT NULL DEFAULT '',
  customer_phone  TEXT NOT NULL DEFAULT '',
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax             NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method  TEXT NOT NULL DEFAULT 'Cash',
  receipt_status  public.receipt_status NOT NULL DEFAULT 'active',
  cancelled_by    TEXT,
  cancel_reason   TEXT,
  cancelled_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_receipts_shop_id ON public.pos_receipts(shop_id);
CREATE INDEX IF NOT EXISTS idx_pos_receipts_staff_id ON public.pos_receipts(staff_id);
CREATE INDEX IF NOT EXISTS idx_pos_receipts_created_at ON public.pos_receipts(created_at DESC);

-- ─── 5. Receipt Cancellations (daily limit tracking) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.receipt_cancellations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id    UUID REFERENCES public.pos_receipts(id) ON DELETE CASCADE,
  staff_id      TEXT NOT NULL,
  staff_name    TEXT NOT NULL DEFAULT '',
  shop_id       UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  cancel_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  reason        TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cancellations_staff_date ON public.receipt_cancellations(staff_id, cancel_date);
CREATE INDEX IF NOT EXISTS idx_cancellations_shop_id ON public.receipt_cancellations(shop_id);

-- ─── 6. Supplier Purchases (restock from supplier) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_ref    TEXT NOT NULL UNIQUE,
  shop_id         UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  shop_name       TEXT NOT NULL DEFAULT '',
  supplier_id     TEXT NOT NULL DEFAULT '',
  supplier_name   TEXT NOT NULL DEFAULT '',
  ordered_by      TEXT NOT NULL DEFAULT '',
  ordered_by_name TEXT NOT NULL DEFAULT '',
  items           JSONB NOT NULL DEFAULT '[]',
  total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  status          public.purchase_status NOT NULL DEFAULT 'pending',
  expected_date   DATE,
  received_date   DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_purchases_shop_id ON public.supplier_purchases(shop_id);
CREATE INDEX IF NOT EXISTS idx_supplier_purchases_created_at ON public.supplier_purchases(created_at DESC);

-- ─── 7. Product Revoke Requests ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_revoke_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  shop_name       TEXT NOT NULL DEFAULT '',
  requested_by    TEXT NOT NULL DEFAULT '',
  requester_name  TEXT NOT NULL DEFAULT '',
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL DEFAULT '',
  sku             TEXT NOT NULL DEFAULT '',
  quantity        INTEGER NOT NULL DEFAULT 0,
  reason          public.revoke_reason NOT NULL DEFAULT 'expired',
  reason_detail   TEXT NOT NULL DEFAULT '',
  status          public.revoke_status NOT NULL DEFAULT 'pending',
  reviewed_by     TEXT,
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revoke_shop_id ON public.product_revoke_requests(shop_id);
CREATE INDEX IF NOT EXISTS idx_revoke_status ON public.product_revoke_requests(status);

-- ─── 8. Customer Feedback / Ratings ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id     TEXT NOT NULL DEFAULT '',
  customer_name   TEXT NOT NULL DEFAULT '',
  customer_avatar TEXT NOT NULL DEFAULT '',
  rating          INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title           TEXT NOT NULL DEFAULT '',
  body            TEXT NOT NULL DEFAULT '',
  verified        BOOLEAN NOT NULL DEFAULT false,
  helpful_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_product_id ON public.customer_feedback(product_id);
CREATE INDEX IF NOT EXISTS idx_feedback_shop_id ON public.customer_feedback(shop_id);

-- ─── 9. Enable RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_revoke_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- ─── 10. RLS Policies (open access for platform) ─────────────────────────────
DROP POLICY IF EXISTS "user_profiles_open" ON public.user_profiles;
CREATE POLICY "user_profiles_open" ON public.user_profiles FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "chat_messages_open" ON public.chat_messages;
CREATE POLICY "chat_messages_open" ON public.chat_messages FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "pos_receipts_open" ON public.pos_receipts;
CREATE POLICY "pos_receipts_open" ON public.pos_receipts FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "receipt_cancellations_open" ON public.receipt_cancellations;
CREATE POLICY "receipt_cancellations_open" ON public.receipt_cancellations FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "supplier_purchases_open" ON public.supplier_purchases;
CREATE POLICY "supplier_purchases_open" ON public.supplier_purchases FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "product_revoke_requests_open" ON public.product_revoke_requests;
CREATE POLICY "product_revoke_requests_open" ON public.product_revoke_requests FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "customer_feedback_open" ON public.customer_feedback;
CREATE POLICY "customer_feedback_open" ON public.customer_feedback FOR ALL TO public USING (true) WITH CHECK (true);

-- ─── 11. updated_at triggers ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS pos_receipts_updated_at ON public.pos_receipts;
CREATE TRIGGER pos_receipts_updated_at BEFORE UPDATE ON public.pos_receipts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS supplier_purchases_updated_at ON public.supplier_purchases;
CREATE TRIGGER supplier_purchases_updated_at BEFORE UPDATE ON public.supplier_purchases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS product_revoke_updated_at ON public.product_revoke_requests;
CREATE TRIGGER product_revoke_updated_at BEFORE UPDATE ON public.product_revoke_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS customer_feedback_updated_at ON public.customer_feedback;
CREATE TRIGGER customer_feedback_updated_at BEFORE UPDATE ON public.customer_feedback FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 12. Enable Realtime for new tables ──────────────────────────────────────
DO $$
BEGIN
  PERFORM pg_catalog.set_config('search_path', 'public', false);
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add chat_messages to realtime: %', SQLERRM;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_receipts;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add pos_receipts to realtime: %', SQLERRM;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_purchases;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add supplier_purchases to realtime: %', SQLERRM;
  END;
END $$;

-- ─── 13. Seed POS Receipts ────────────────────────────────────────────────────
DO $$
DECLARE
  shop1_id UUID;
BEGIN
  SELECT id INTO shop1_id FROM public.shops ORDER BY created_at ASC LIMIT 1;

  IF shop1_id IS NOT NULL THEN
    INSERT INTO public.pos_receipts (receipt_ref, shop_id, shop_name, staff_id, staff_name, customer_name, customer_phone, items, subtotal, discount, tax, total, payment_method, receipt_status)
    VALUES
      ('RCP-2026-001', shop1_id, 'GlowSkin Store', 'usr-004', 'Mia Johnson', 'Walk-in Customer', '', '[{"name":"Glow Essence Serum","qty":1,"price":28.99},{"name":"UV Shield SPF 50+","qty":1,"price":19.99}]'::jsonb, 48.98, 0, 4.90, 53.88, 'Cash', 'active'),
      ('RCP-2026-002', shop1_id, 'GlowSkin Store', 'usr-004', 'Mia Johnson', 'Emma Rodriguez', '+1 555-0101', '[{"name":"Hydra Barrier Cream","qty":2,"price":34.00}]'::jsonb, 68.00, 5.00, 6.30, 69.30, 'Card', 'active'),
      ('RCP-2026-003', shop1_id, 'GlowSkin Store', 'usr-004', 'Mia Johnson', 'Walk-in Customer', '', '[{"name":"Rice Water Brightener","qty":1,"price":31.00}]'::jsonb, 31.00, 0, 3.10, 34.10, 'QR', 'cancelled', 'Mia Johnson', 'Customer changed mind')
    ON CONFLICT (receipt_ref) DO NOTHING;

    INSERT INTO public.supplier_purchases (purchase_ref, shop_id, shop_name, supplier_id, supplier_name, ordered_by, ordered_by_name, items, total_amount, status, expected_date)
    VALUES
      ('PO-2026-001', shop1_id, 'GlowSkin Store', 'sup-001', 'GlowLab Korea', 'usr-002', 'Sarah Chen', '[{"product":"Glow Essence Serum","sku":"GLS-SER-001","qty":100,"unit_cost":14.50,"total":1450.00}]'::jsonb, 1450.00, 'received', '2026-05-10'),
      ('PO-2026-002', shop1_id, 'GlowSkin Store', 'sup-002', 'SunGuard Japan', 'usr-002', 'Sarah Chen', '[{"product":"UV Shield SPF 50+","sku":"SGD-SUN-001","qty":150,"unit_cost":9.99,"total":1498.50}]'::jsonb, 1498.50, 'pending', '2026-05-20')
    ON CONFLICT (purchase_ref) DO NOTHING;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data failed: %', SQLERRM;
END $$;
