-- ============================================================================
-- GOSOVEREIGN SUPABASE SETUP SCRIPT
-- ============================================================================
--
-- This script creates all tables, indexes, RLS policies, functions, and
-- triggers for the GoSovereign application.
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Paste this entire script
-- 5. Click "Run" to execute
--
-- AFTER RUNNING THIS SCRIPT:
-- You must manually create storage buckets via Dashboard > Storage.
-- See the comments at the end of this file for instructions.
--
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USERS TABLE
-- Extended profile for auth.users
-- ----------------------------------------------------------------------------

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- STORES TABLE
-- One store per user (for now), contains all configuration
-- ----------------------------------------------------------------------------

CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,

  -- Template & Theming
  template TEXT NOT NULL DEFAULT 'fashion', -- 'fashion', 'services', 'digital'
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
    config structure:
    {
      "branding": {
        "logoUrl": "https://...",
        "primaryColor": "#e11d48",
        "themePreset": "minimal-light",
        "tagline": "...",
        "aboutText": "...",
        "contactEmail": "..."
      },
      "features": {
        "shippingEnabled": true,
        "taxEnabled": true,
        "blogEnabled": false,
        "leadgenEnabled": true
      },
      "shipping": {
        "zones": ["US", "CA"],
        "rates": [...]
      },
      "social": {
        "instagram": "https://...",
        "twitter": "https://..."
      },
      "seo": {
        "title": "...",
        "description": "..."
      }
    }
  */

  -- Payment
  stripe_account_id TEXT, -- Connected Stripe account

  -- Deployment
  deployment_id TEXT,
  deployment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'configuring', 'deploying', 'deployed', 'error'
  deployed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- PRODUCTS TABLE
-- Products for each store
-- ----------------------------------------------------------------------------

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- Original price for "sale" display
  cost_per_item DECIMAL(10,2), -- For profit tracking

  -- Inventory
  track_inventory BOOLEAN DEFAULT false,
  inventory_count INTEGER DEFAULT 0,
  allow_backorder BOOLEAN DEFAULT false,

  -- Media
  images JSONB DEFAULT '[]'::jsonb,
  /*
    images structure:
    [
      { "url": "https://...", "alt": "Product front", "position": 0 },
      { "url": "https://...", "alt": "Product back", "position": 1 }
    ]
  */

  -- Variants (for fashion: size, color)
  has_variants BOOLEAN DEFAULT false,
  variants JSONB DEFAULT '[]'::jsonb,
  /*
    variants structure:
    [
      {
        "id": "var_001",
        "name": "Small / Red",
        "sku": "SHIRT-S-RED",
        "price": 29.99,
        "inventory": 10,
        "options": { "size": "S", "color": "Red" }
      }
    ]
  */
  variant_options JSONB DEFAULT '[]'::jsonb,
  /*
    variant_options structure:
    [
      { "name": "Size", "values": ["S", "M", "L", "XL"] },
      { "name": "Color", "values": ["Red", "Blue", "Black"] }
    ]
  */

  -- Shipping
  requires_shipping BOOLEAN DEFAULT true,
  weight DECIMAL(10,2), -- in oz or grams

  -- Digital Products
  is_digital BOOLEAN DEFAULT false,
  digital_file_url TEXT,
  download_limit INTEGER,

  -- Organization
  category TEXT,
  tags TEXT[],

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived'

  -- SEO
  seo_title TEXT,
  seo_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Unique slug per store
  UNIQUE(store_id, slug)
);

-- ----------------------------------------------------------------------------
-- ORDERS TABLE
-- Customer orders
-- ----------------------------------------------------------------------------

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

  -- Order Number (human-readable)
  order_number SERIAL,

  -- Customer Info
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,

  -- Addresses
  shipping_address JSONB,
  /*
    shipping_address structure:
    {
      "line1": "123 Main St",
      "line2": "Apt 4",
      "city": "Austin",
      "state": "TX",
      "postal_code": "78701",
      "country": "US"
    }
  */
  billing_address JSONB,

  -- Totals
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'

  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'unfulfilled', -- 'unfulfilled', 'partial', 'fulfilled'
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,

  -- Order Status
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'

  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- ORDER ITEMS TABLE
-- Line items for each order
-- ----------------------------------------------------------------------------

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,

  -- Product Snapshot (in case product changes/deleted)
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_info JSONB, -- e.g., {"size": "M", "color": "Blue"}

  -- Pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,

  -- Digital Fulfillment
  download_url TEXT,
  download_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- SUBSCRIPTIONS TABLE
-- Hosted tier subscriptions
-- ----------------------------------------------------------------------------

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

  -- Stripe
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,

  -- Plan
  plan TEXT NOT NULL, -- 'hosted_monthly', 'hosted_yearly'

  -- Status
  status TEXT NOT NULL, -- 'active', 'past_due', 'cancelled', 'paused'

  -- Billing Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- WIZARD PROGRESS TABLE
-- Tracks wizard completion state
-- ----------------------------------------------------------------------------

CREATE TABLE public.wizard_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID UNIQUE NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

  -- Progress
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',

  -- Answers (temporary storage during wizard)
  answers JSONB DEFAULT '{}'::jsonb,

  -- Status
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);

-- Stores
CREATE INDEX idx_stores_user ON public.stores(user_id);
CREATE INDEX idx_stores_subdomain ON public.stores(subdomain);
CREATE INDEX idx_stores_status ON public.stores(status);

-- Products
CREATE INDEX idx_products_store ON public.products(store_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_slug ON public.products(store_id, slug);

-- Orders
CREATE INDEX idx_orders_store ON public.orders(store_id);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- Subscriptions
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_store ON public.subscriptions(store_id);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- Stores RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

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

-- Public read for storefronts (filtered by store_id in app)
CREATE POLICY "Public can view deployed stores"
  ON public.stores FOR SELECT
  USING (status = 'deployed');

-- ----------------------------------------------------------------------------
-- Products RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their products
CREATE POLICY "Users can view own products"
  ON public.products FOR SELECT
  USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

-- Public can view active products (for storefronts)
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (status = 'active');

-- ----------------------------------------------------------------------------
-- Orders RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own store orders"
  ON public.orders FOR SELECT
  USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own store orders"
  ON public.orders FOR UPDATE
  USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

-- Storefronts can insert orders (via service role key, not anon)
-- This will be handled via API with service role

-- ----------------------------------------------------------------------------
-- Order Items RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- Subscriptions RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Wizard Progress RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.wizard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wizard progress"
  ON public.wizard_progress FOR ALL
  USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate slug from product name
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
-- 6. TRIGGERS
-- ============================================================================

-- Updated_at triggers for all tables
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

-- Auto-create user profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- MANUAL STEPS REQUIRED AFTER RUNNING THIS SCRIPT
-- ============================================================================
--
-- The storage schema is managed by Supabase and cannot be modified via SQL.
-- You must create storage buckets and policies via the Dashboard.
--
-- STEP 1: CREATE STORAGE BUCKETS
-- ------------------------------
-- Go to: Dashboard > Storage > New Bucket
--
-- Create these buckets:
--   1. Name: store-assets    | Public: ON
--   2. Name: product-images  | Public: ON
--
-- STEP 2: ADD STORAGE POLICIES
-- ----------------------------
-- Go to: Dashboard > Storage > [bucket name] > Policies > New Policy
--
-- For BOTH buckets (store-assets and product-images), create these policies:
--
-- Policy 1 - INSERT (Upload):
--   Name: Users can upload to their folder
--   Allowed operation: INSERT
--   Policy definition: (auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy 2 - SELECT (Read):
--   Name: Public read access
--   Allowed operation: SELECT
--   Policy definition: true
--
-- Policy 3 - DELETE:
--   Name: Users can delete their files
--   Allowed operation: DELETE
--   Policy definition: (auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy 4 - UPDATE (optional, for replacing files):
--   Name: Users can update their files
--   Allowed operation: UPDATE
--   Policy definition: (auth.uid()::text = (storage.foldername(name))[1])
--
-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
