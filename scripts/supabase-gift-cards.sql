-- Gift Card System Schema for GoSovereign
-- Version: 9.13 (Gift Cards)

-- Create gift_cards table
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  original_amount INTEGER NOT NULL,
  current_balance INTEGER NOT NULL,
  purchased_by_email TEXT NOT NULL,
  purchased_by_name TEXT,
  order_id UUID REFERENCES orders(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  gift_message TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, code)
);

-- Create gift_card_transactions table for tracking usage
CREATE TABLE IF NOT EXISTS public.gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast code lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_gift_cards_store_code
  ON public.gift_cards(store_id, code);

-- Index for finding gift cards by recipient email
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient
  ON public.gift_cards(store_id, recipient_email)
  WHERE status = 'active';

-- Index for admin listing (recent gift cards)
CREATE INDEX IF NOT EXISTS idx_gift_cards_store_created
  ON public.gift_cards(store_id, created_at DESC);

-- Index for transaction history by gift card
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_card
  ON public.gift_card_transactions(gift_card_id, created_at DESC);

-- RLS Policies
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for admin APIs and webhooks)
CREATE POLICY "Service role has full access to gift_cards"
  ON public.gift_cards
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to gift_card_transactions"
  ON public.gift_card_transactions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to auto-update updated_at on gift_cards
CREATE OR REPLACE FUNCTION update_gift_card_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gift_card_timestamp
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_card_timestamp();

-- Comments for documentation
COMMENT ON TABLE public.gift_cards IS 'Digital gift cards purchased by customers. Supports partial redemption with balance tracking.';
COMMENT ON COLUMN public.gift_cards.code IS 'Unique gift card code in format GC-XXXX-XXXX-XXXX';
COMMENT ON COLUMN public.gift_cards.original_amount IS 'Original purchase amount in cents';
COMMENT ON COLUMN public.gift_cards.current_balance IS 'Remaining balance in cents';
COMMENT ON COLUMN public.gift_cards.status IS 'active, disabled, or exhausted';
COMMENT ON COLUMN public.gift_cards.email_sent_at IS 'When the gift card email was sent to recipient';

COMMENT ON TABLE public.gift_card_transactions IS 'Transaction history for gift card usage. Each redemption creates a record.';
COMMENT ON COLUMN public.gift_card_transactions.amount IS 'Amount redeemed in this transaction (positive number)';
