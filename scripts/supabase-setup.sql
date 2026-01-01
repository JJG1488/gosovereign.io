-- ============================================================================
-- GOSOVEREIGN SUPABASE SETUP SCRIPT (IDEMPOTENT)
-- ============================================================================
--
-- This script can be run multiple times safely. It will:
-- - Create tables if they don't exist
-- - Update policies (drop and recreate)
-- - Update functions and triggers
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Paste this entire script
-- 5. Click "Run" to execute
--
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLES (IF NOT EXISTS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USERS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  -- Payment tracking
  has_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  payment_tier TEXT, -- 'starter', 'pro', 'hosted'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add columns if table already exists (for migrations)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_tier TEXT;

-- Deployment OAuth columns (for GitHub/Vercel integration)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_access_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_token_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vercel_access_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vercel_team_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vercel_token_expires_at TIMESTAMPTZ;

-- ----------------------------------------------------------------------------
-- STORES TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  template TEXT NOT NULL DEFAULT 'fashion',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  stripe_account_id TEXT,
  deployment_id TEXT,
  deployment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add deployment columns to stores (for GitHub/Vercel integration)
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS github_repo TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS vercel_project_id TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS vercel_deployment_id TEXT;

-- Admin password management (allows resetting password without redeploying)
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS admin_password_reset_token TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS admin_password_reset_expires TIMESTAMPTZ;

-- Rate limiting for password reset (max 3 attempts per hour)
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS password_reset_attempts INTEGER DEFAULT 0;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS password_reset_window_start TIMESTAMPTZ;

-- Payment tier for feature gating
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS payment_tier TEXT; -- 'starter', 'pro', 'hosted'

-- Subscription tracking for Hosted tier
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS subscription_status TEXT; -- 'active', 'past_due', 'cancelled', 'none'
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS can_deploy BOOLEAN DEFAULT true;

-- Index for subscription queries
CREATE INDEX IF NOT EXISTS idx_stores_payment_tier ON public.stores(payment_tier);
CREATE INDEX IF NOT EXISTS idx_stores_subscription_status ON public.stores(subscription_status);

-- ----------------------------------------------------------------------------
-- PRODUCTS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),
  track_inventory BOOLEAN DEFAULT false,
  inventory_count INTEGER DEFAULT 0,
  allow_backorder BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]'::jsonb,
  has_variants BOOLEAN DEFAULT false,
  variants JSONB DEFAULT '[]'::jsonb,
  variant_options JSONB DEFAULT '[]'::jsonb,
  requires_shipping BOOLEAN DEFAULT true,
  weight DECIMAL(10,2),
  is_digital BOOLEAN DEFAULT false,
  digital_file_url TEXT,
  download_limit INTEGER,
  category TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(store_id, slug)
);

-- ----------------------------------------------------------------------------
-- ORDERS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_number SERIAL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  coupon_code TEXT,
  total DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  customer_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- ORDER ITEMS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_info JSONB,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  download_url TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- SUBSCRIPTIONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- WIZARD PROGRESS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.wizard_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID UNIQUE NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  answers JSONB DEFAULT '{}'::jsonb,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- PURCHASES TABLE (Platform purchases, not store orders)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  stripe_checkout_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  plan TEXT NOT NULL, -- 'starter', 'pro', 'hosted'
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  variant TEXT, -- A/B test variant
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- DEPLOYMENT LOGS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.deployment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- STORE SETTINGS TABLE (for admin-configurable content)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.store_settings (
  store_id UUID PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  UNIQUE(store_id, email)
);

-- ----------------------------------------------------------------------------
-- ADMIN SESSIONS TABLE (replaces in-memory token storage)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ----------------------------------------------------------------------------
-- PRODUCT REVIEWS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- COUPONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value INTEGER NOT NULL, -- percentage (0-100) or cents
  minimum_order_amount INTEGER DEFAULT 0, -- in cents
  max_uses INTEGER, -- null = unlimited
  current_uses INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, code)
);

-- ----------------------------------------------------------------------------
-- PRODUCT VARIANTS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Combined option values, e.g., "Small / Black"
  sku TEXT, -- Optional SKU for this variant
  price_adjustment INTEGER DEFAULT 0, -- In cents, can be negative (e.g., -500 = $5 less)
  inventory_count INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  options JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"Size": "Small", "Color": "Black"}
  position INTEGER DEFAULT 0, -- For ordering variants
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 3. INDEXES (IF NOT EXISTS)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stores_user ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_subdomain ON public.stores(subdomain);
CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores(status);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_store ON public.subscriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON public.purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session ON public.purchases(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);

-- Deployment
CREATE INDEX IF NOT EXISTS idx_users_github_username ON public.users(github_username);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_store ON public.deployment_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_created ON public.deployment_logs(created_at DESC);

-- Store Settings
CREATE INDEX IF NOT EXISTS idx_store_settings_store ON public.store_settings(store_id);

-- Newsletter Subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_store ON public.newsletter_subscribers(store_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

-- Admin Sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_store ON public.admin_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- Product Reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_store ON public.product_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON public.product_reviews(product_id);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_store ON public.coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(store_id, code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active) WHERE is_active = true;

-- Product Variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON public.product_variants(is_active) WHERE is_active = true;

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wizard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Users Policies (drop and recreate)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- Stores Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can insert own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can update own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can delete own stores" ON public.stores;
DROP POLICY IF EXISTS "Public can view deployed stores" ON public.stores;

CREATE POLICY "Users can view own stores"
  ON public.stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stores"
  ON public.stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stores"
  ON public.stores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stores"
  ON public.stores FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view deployed stores"
  ON public.stores FOR SELECT
  USING (status = 'deployed');

-- ----------------------------------------------------------------------------
-- Products Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

CREATE POLICY "Users can view own products"
  ON public.products FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (status = 'active');

-- ----------------------------------------------------------------------------
-- Orders Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own store orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own store orders" ON public.orders;

CREATE POLICY "Users can view own store orders"
  ON public.orders FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own store orders"
  ON public.orders FOR UPDATE
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Order Items Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- Subscriptions Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Wizard Progress Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own wizard progress" ON public.wizard_progress;

CREATE POLICY "Users can manage own wizard progress"
  ON public.wizard_progress FOR ALL
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Purchases Policies
-- Note: Purchases are created by webhook using service role (bypasses RLS)
-- Users can only view their own purchases
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;

CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Deployment Logs Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own deployment logs" ON public.deployment_logs;

CREATE POLICY "Users can view own deployment logs"
  ON public.deployment_logs FOR SELECT
  USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- Store Settings Policies
-- Note: Deployed stores use service role to access these
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Users can view own store settings" ON public.store_settings;

CREATE POLICY "Service role full access to store_settings"
  ON public.store_settings FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Users can view own store settings"
  ON public.store_settings FOR SELECT
  USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- Newsletter Subscribers Policies
-- Note: Deployed stores use service role to insert subscribers
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to newsletter_subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Service role full access to newsletter_subscribers"
  ON public.newsletter_subscribers FOR ALL
  TO service_role
  USING (true);

-- ----------------------------------------------------------------------------
-- Admin Sessions Policies
-- Note: Deployed stores use service role for session management
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to admin_sessions" ON public.admin_sessions;

CREATE POLICY "Service role full access to admin_sessions"
  ON public.admin_sessions FOR ALL
  TO service_role
  USING (true);

-- ----------------------------------------------------------------------------
-- Product Reviews Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to product_reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public can view reviews" ON public.product_reviews;

CREATE POLICY "Service role full access to product_reviews"
  ON public.product_reviews FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can view reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

-- ----------------------------------------------------------------------------
-- Coupons Policies
-- Note: Deployed stores use service role for CRUD, public can validate codes
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public can validate active coupons" ON public.coupons;

CREATE POLICY "Service role full access to coupons"
  ON public.coupons FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can validate active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

-- ----------------------------------------------------------------------------
-- Product Variants Policies
-- Note: Deployed stores use service role for CRUD, public can view active variants
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public can view active variants" ON public.product_variants;

CREATE POLICY "Service role full access to product_variants"
  ON public.product_variants FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can view active variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- 5. FUNCTIONS (CREATE OR REPLACE)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. TRIGGERS (DROP AND RECREATE)
-- ============================================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_wizard_progress_updated_at ON public.wizard_progress;
DROP TRIGGER IF EXISTS update_purchases_updated_at ON public.purchases;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wizard_progress_updated_at
  BEFORE UPDATE ON public.wizard_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- DONE!
-- ============================================================================
--
-- After running this script, manually create storage buckets:
-- 1. Go to Dashboard > Storage > New Bucket
-- 2. Create "store-assets" (Public: ON)
-- 3. Create "product-images" (Public: ON)
--
-- For each bucket, add these policies:
-- - INSERT: (auth.uid()::text = (storage.foldername(name))[1])
-- - SELECT: true
-- - DELETE: (auth.uid()::text = (storage.foldername(name))[1])
--
-- ============================================================================
