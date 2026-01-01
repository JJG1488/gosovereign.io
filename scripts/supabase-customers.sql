-- ============================================================================
-- GOSOVEREIGN CUSTOMER ACCOUNTS SCHEMA
-- ============================================================================
--
-- This script adds customer account tables for store customers.
-- Customers are SEPARATE from store owners (users table).
--
-- Run this AFTER the main supabase-setup.sql script.
--
-- ============================================================================

-- ============================================================================
-- 1. CUSTOMERS TABLE
-- ============================================================================
-- Customer accounts for each store. A customer can have accounts at multiple stores.

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  accepts_marketing BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(store_id, email)
);

-- Password reset fields
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- ============================================================================
-- 2. CUSTOMER ADDRESSES TABLE
-- ============================================================================
-- Saved addresses for customers

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label TEXT, -- e.g., "Home", "Work", "Mom's House"
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  is_default_shipping BOOLEAN DEFAULT false,
  is_default_billing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 3. CUSTOMER SESSIONS TABLE
-- ============================================================================
-- Session tokens for customer authentication (separate from admin sessions)

CREATE TABLE IF NOT EXISTS public.customer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ============================================================================
-- 4. LINK ORDERS TO CUSTOMERS (optional)
-- ============================================================================
-- Add customer_id to orders table for logged-in customers

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customers_store ON public.customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(store_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_password_reset ON public.customers(password_reset_token) WHERE password_reset_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON public.customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default_shipping ON public.customer_addresses(customer_id, is_default_shipping) WHERE is_default_shipping = true;
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default_billing ON public.customer_addresses(customer_id, is_default_billing) WHERE is_default_billing = true;

CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON public.customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_token ON public.customer_sessions(token);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_expires ON public.customer_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id) WHERE customer_id IS NOT NULL;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

-- Customers table - service role only (no direct customer access to manage own account)
-- All customer operations go through API routes using service role
DROP POLICY IF EXISTS "Service role full access to customers" ON public.customers;
CREATE POLICY "Service role full access to customers"
  ON public.customers FOR ALL
  TO service_role
  USING (true);

-- Customer addresses - service role only
DROP POLICY IF EXISTS "Service role full access to customer_addresses" ON public.customer_addresses;
CREATE POLICY "Service role full access to customer_addresses"
  ON public.customer_addresses FOR ALL
  TO service_role
  USING (true);

-- Customer sessions - service role only
DROP POLICY IF EXISTS "Service role full access to customer_sessions" ON public.customer_sessions;
CREATE POLICY "Service role full access to customer_sessions"
  ON public.customer_sessions FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_customer_addresses_updated_at ON public.customer_addresses;
CREATE TRIGGER update_customer_addresses_updated_at
  BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- DONE!
-- ============================================================================
--
-- After running this script, customer accounts will be available.
-- Customers can:
-- - Register and login with email/password
-- - View their order history
-- - Save shipping/billing addresses
-- - Use saved addresses at checkout
--
-- ============================================================================
