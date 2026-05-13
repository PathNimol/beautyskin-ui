-- ─── BS Online Shop – Analytics, DM System, Order Tracking ──────────────────
-- Adds: direct_messages, order_status_timeline, analytics_snapshots tables
-- Timestamp: 20260512100000

-- ─── 1. Direct Messages Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  sender_id       TEXT NOT NULL,
  sender_name     TEXT NOT NULL DEFAULT '',
  sender_role     TEXT NOT NULL DEFAULT '',
  sender_avatar   TEXT NOT NULL DEFAULT '',
  recipient_id    TEXT NOT NULL,
  recipient_name  TEXT NOT NULL DEFAULT '',
  recipient_role  TEXT NOT NULL DEFAULT '',
  message         TEXT NOT NULL DEFAULT '',
  message_type    TEXT NOT NULL DEFAULT 'text',
  is_read         BOOLEAN NOT NULL DEFAULT false,
  shop_id         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dm_conversation_id ON public.direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_dm_sender_id ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient_id ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_dm_created_at ON public.direct_messages(created_at DESC);

-- ─── 2. Order Status Timeline ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_status_timeline (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_ref       TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT '',
  note            TEXT NOT NULL DEFAULT '',
  updated_by      TEXT NOT NULL DEFAULT '',
  updated_by_name TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_order_id ON public.order_status_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON public.order_status_timeline(created_at DESC);

-- ─── 3. Analytics Snapshots (daily aggregations cache) ────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date   DATE NOT NULL,
  shop_id         UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  metric_type     TEXT NOT NULL DEFAULT '',
  metric_value    NUMERIC(14,2) NOT NULL DEFAULT 0,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_unique ON public.analytics_snapshots(snapshot_date, COALESCE(shop_id::TEXT, 'platform'), metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_shop_id ON public.analytics_snapshots(shop_id);

-- ─── 4. Enable RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- ─── 5. RLS Policies (open access for platform) ───────────────────────────────
DROP POLICY IF EXISTS "direct_messages_open" ON public.direct_messages;
CREATE POLICY "direct_messages_open" ON public.direct_messages FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "order_timeline_open" ON public.order_status_timeline;
CREATE POLICY "order_timeline_open" ON public.order_status_timeline FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "analytics_snapshots_open" ON public.analytics_snapshots;
CREATE POLICY "analytics_snapshots_open" ON public.analytics_snapshots FOR ALL TO public USING (true) WITH CHECK (true);

-- ─── 6. Enable Realtime ───────────────────────────────────────────────────────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add direct_messages to realtime: %', SQLERRM;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_timeline;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add order_status_timeline to realtime: %', SQLERRM;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_snapshots;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add analytics_snapshots to realtime: %', SQLERRM;
  END;
END $$;

-- ─── 7. Seed Order Timeline for existing orders ───────────────────────────────
DO $$
DECLARE
  ord RECORD;
BEGIN
  FOR ord IN SELECT id, order_ref, order_status, created_at FROM public.orders LOOP
    INSERT INTO public.order_status_timeline (order_id, order_ref, status, note, updated_by, updated_by_name, created_at)
    VALUES (ord.id, ord.order_ref, 'Pending', 'Order placed successfully', 'system', 'System', ord.created_at)
    ON CONFLICT DO NOTHING;

    IF ord.order_status IN ('Confirmed', 'Packing', 'Shipping', 'Delivered') THEN
      INSERT INTO public.order_status_timeline (order_id, order_ref, status, note, updated_by, updated_by_name, created_at)
      VALUES (ord.id, ord.order_ref, 'Confirmed', 'Order confirmed by shop', 'system', 'System', ord.created_at + interval '30 minutes')
      ON CONFLICT DO NOTHING;
    END IF;

    IF ord.order_status IN ('Packing', 'Shipping', 'Delivered') THEN
      INSERT INTO public.order_status_timeline (order_id, order_ref, status, note, updated_by, updated_by_name, created_at)
      VALUES (ord.id, ord.order_ref, 'Packing', 'Items being packed', 'system', 'System', ord.created_at + interval '2 hours')
      ON CONFLICT DO NOTHING;
    END IF;

    IF ord.order_status IN ('Shipping', 'Delivered') THEN
      INSERT INTO public.order_status_timeline (order_id, order_ref, status, note, updated_by, updated_by_name, created_at)
      VALUES (ord.id, ord.order_ref, 'Shipping', 'Order shipped out', 'system', 'System', ord.created_at + interval '1 day')
      ON CONFLICT DO NOTHING;
    END IF;

    IF ord.order_status = 'Delivered' THEN
      INSERT INTO public.order_status_timeline (order_id, order_ref, status, note, updated_by, updated_by_name, created_at)
      VALUES (ord.id, ord.order_ref, 'Delivered', 'Order delivered successfully', 'system', 'System', ord.created_at + interval '3 days')
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Timeline seed failed: %', SQLERRM;
END $$;
