-- ─── Staff & Notifications Migration ─────────────────────────────────────────
-- Adds: public.staff, public.notifications
-- Timestamp: 20260512080100

-- ─── 1. Types ─────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS public.staff_role CASCADE;
CREATE TYPE public.staff_role AS ENUM ('Owner', 'Manager', 'Staff', 'Cashier');

DROP TYPE IF EXISTS public.staff_status CASCADE;
CREATE TYPE public.staff_status AS ENUM ('Active', 'Inactive');

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM ('new_order', 'low_stock', 'expiry_alert', 'promotion', 'review', 'system');

-- ─── 2. Tables ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL DEFAULT '',
  role        public.staff_role NOT NULL DEFAULT 'Staff'::public.staff_role,
  avatar      TEXT NOT NULL DEFAULT '',
  avatar_alt  TEXT NOT NULL DEFAULT '',
  status      public.staff_status NOT NULL DEFAULT 'Active'::public.staff_status,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  type        public.notification_type NOT NULL DEFAULT 'system'::public.notification_type,
  title       TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL DEFAULT '',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_staff_shop_id ON public.staff(shop_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);
CREATE INDEX IF NOT EXISTS idx_notifications_shop_id ON public.notifications(shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ─── 4. updated_at trigger function (reuse if exists) ─────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── 5. Triggers ──────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS staff_updated_at ON public.staff;
CREATE TRIGGER staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-notify on new order insert
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (shop_id, type, title, message, metadata)
  VALUES (
    NEW.shop_id,
    'new_order'::public.notification_type,
    'New Order Received',
    'Order ' || NEW.order_ref || ' placed by ' || NEW.customer_name || ' — $' || NEW.total::TEXT,
    jsonb_build_object('order_id', NEW.id, 'order_ref', NEW.order_ref, 'total', NEW.total)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_order_notify ON public.orders;
CREATE TRIGGER on_new_order_notify
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();

-- Auto-notify on low stock update
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.inv_status IN ('low', 'critical', 'out_of_stock') AND OLD.inv_status = 'healthy' THEN
    INSERT INTO public.notifications (shop_id, type, title, message, metadata)
    VALUES (
      NEW.shop_id,
      'low_stock'::public.notification_type,
      'Low Stock Alert',
      NEW.product_name || ' is running low — only ' || NEW.current_stock::TEXT || ' units left',
      jsonb_build_object('item_id', NEW.id, 'product_name', NEW.product_name, 'current_stock', NEW.current_stock, 'inv_status', NEW.inv_status)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_low_stock_notify ON public.inventory_items;
CREATE TRIGGER on_low_stock_notify
  AFTER UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.notify_low_stock();

-- ─── 6. Enable RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ─── 7. RLS Policies ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "staff_open_access" ON public.staff;
CREATE POLICY "staff_open_access" ON public.staff FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_open_access" ON public.notifications;
CREATE POLICY "notifications_open_access" ON public.notifications FOR ALL TO public USING (true) WITH CHECK (true);

-- ─── 8. Seed Data ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  shop1_id UUID;
  shop2_id UUID;
  shop3_id UUID;
BEGIN
  SELECT id INTO shop1_id FROM public.shops ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO shop2_id FROM public.shops ORDER BY created_at ASC OFFSET 1 LIMIT 1;
  SELECT id INTO shop3_id FROM public.shops ORDER BY created_at ASC OFFSET 2 LIMIT 1;

  IF shop1_id IS NOT NULL THEN
    INSERT INTO public.staff (shop_id, name, email, phone, role, avatar, avatar_alt, status) VALUES
      (shop1_id, 'Emma Rodriguez', 'emma@glowskin.com', '+1 555-0201', 'Owner', 'https://img.rocket.new/generatedImages/rocket_gen_img_1111f9b59-1763294080175.png', 'Emma Rodriguez owner avatar', 'Active'),
      (shop1_id, 'Lily Chen', 'lily@glowskin.com', '+1 555-0202', 'Manager', 'https://img.rocket.new/generatedImages/rocket_gen_img_11b3df0b3-1772952555612.png', 'Lily Chen manager avatar', 'Active'),
      (shop1_id, 'Jake Park', 'jake@glowskin.com', '+1 555-0203', 'Staff', 'https://img.rocket.new/generatedImages/rocket_gen_img_15d75124c-1772213059804.png', 'Jake Park staff avatar', 'Active')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.notifications (shop_id, type, title, message, is_read, metadata) VALUES
      (shop1_id, 'new_order', 'New Order Received', 'Order #ORD-2026-001 placed by Sarah Kim — $89.50', false, '{"order_ref": "ORD-2026-001", "total": 89.50}'::jsonb),
      (shop1_id, 'low_stock', 'Low Stock Alert', 'Vitamin C Serum is running low — only 5 units left', false, '{"product_name": "Vitamin C Serum", "current_stock": 5}'::jsonb),
      (shop1_id, 'promotion', 'Flash Sale Active', 'Summer Glow promotion is now live — 20% off serums', true, '{"promotion": "Summer Glow"}'::jsonb)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF shop2_id IS NOT NULL THEN
    INSERT INTO public.staff (shop_id, name, email, phone, role, avatar, avatar_alt, status) VALUES
      (shop2_id, 'Aiko Nakamura', 'aiko@kbeautyhub.com', '+1 555-0301', 'Owner', 'https://img.rocket.new/generatedImages/rocket_gen_img_1111f9b59-1763294080175.png', 'Aiko Nakamura owner avatar', 'Active'),
      (shop2_id, 'Mei-Lin Tanaka', 'meilin@kbeautyhub.com', '+1 555-0302', 'Cashier', 'https://img.rocket.new/generatedImages/rocket_gen_img_1c0b7f7a5-1773033919679.png', 'Mei-Lin Tanaka cashier avatar', 'Active')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.notifications (shop_id, type, title, message, is_read, metadata) VALUES
      (shop2_id, 'new_order', 'New Order Received', 'Order #ORD-2026-009 placed by Yuki Tanaka — $124.00', false, '{"order_ref": "ORD-2026-009", "total": 124.00}'::jsonb),
      (shop2_id, 'expiry_alert', 'Expiry Alert', 'Snail Mucin Essence batch expires in 14 days', false, '{"product_name": "Snail Mucin Essence"}'::jsonb)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF shop3_id IS NOT NULL THEN
    INSERT INTO public.staff (shop_id, name, email, phone, role, avatar, avatar_alt, status) VALUES
      (shop3_id, 'Sophie Williams', 'sophie@purebeauty.com', '+1 555-0401', 'Owner', 'https://img.rocket.new/generatedImages/rocket_gen_img_19170c7b8-1772742079176.png', 'Sophie Williams owner avatar', 'Active'),
      (shop3_id, 'Nadia Petrov', 'nadia@purebeauty.com', '+1 555-0402', 'Staff', 'https://img.rocket.new/generatedImages/rocket_gen_img_1ccfe0794-1772147307895.png', 'Nadia Petrov staff avatar', 'Inactive')
    ON CONFLICT (id) DO NOTHING;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;
