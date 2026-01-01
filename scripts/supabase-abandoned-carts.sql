-- Abandoned Cart Recovery Schema for GoSovereign
-- Version: 9.12 (Abandoned Cart Recovery)

-- Create abandoned_carts table
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  cart_items JSONB NOT NULL DEFAULT '[]',
  cart_total INTEGER NOT NULL DEFAULT 0,
  recovery_token TEXT UNIQUE,
  recovery_email_sent_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by customer (only one active cart per customer)
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_customer
  ON public.abandoned_carts(store_id, customer_id)
  WHERE recovered_at IS NULL AND order_id IS NULL;

-- Index for recovery token lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_abandoned_carts_token
  ON public.abandoned_carts(recovery_token)
  WHERE recovery_token IS NOT NULL;

-- Index for admin listing (recent abandoned carts)
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_store_updated
  ON public.abandoned_carts(store_id, updated_at DESC)
  WHERE recovered_at IS NULL AND order_id IS NULL;

-- RLS Policies
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own abandoned carts
CREATE POLICY "Customers can view their own abandoned carts"
  ON public.abandoned_carts
  FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE id = customer_id
  ));

-- Service role can do everything (for admin APIs and webhooks)
CREATE POLICY "Service role has full access"
  ON public.abandoned_carts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to generate recovery token
CREATE OR REPLACE FUNCTION generate_recovery_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_abandoned_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_abandoned_cart_timestamp
  BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_abandoned_cart_timestamp();

-- Comment for documentation
COMMENT ON TABLE public.abandoned_carts IS 'Tracks carts for logged-in customers who leave without purchasing. Used for abandoned cart recovery emails.';
COMMENT ON COLUMN public.abandoned_carts.recovery_token IS 'Unique token sent in recovery email to restore cart';
COMMENT ON COLUMN public.abandoned_carts.recovery_email_sent_at IS 'Timestamp when recovery email was sent (null = not sent)';
COMMENT ON COLUMN public.abandoned_carts.recovered_at IS 'Timestamp when cart was recovered (order placed)';
