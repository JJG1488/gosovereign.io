-- ============================================================================
-- COLLECTIONS FEATURE - SUPABASE SCHEMA
-- ============================================================================
--
-- Adds collections/categories to organize products.
-- Products can belong to multiple collections (many-to-many).
--
-- Run this in Supabase SQL Editor after the main setup script.
--
-- ============================================================================

-- ----------------------------------------------------------------------------
-- COLLECTIONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(store_id, slug)
);

-- Index for querying collections by store
CREATE INDEX IF NOT EXISTS idx_collections_store_id ON public.collections(store_id);
CREATE INDEX IF NOT EXISTS idx_collections_position ON public.collections(store_id, position);

-- ----------------------------------------------------------------------------
-- PRODUCT_COLLECTIONS JUNCTION TABLE (Many-to-Many)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.product_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(product_id, collection_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_product_collections_product ON public.product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection ON public.product_collections(collection_id);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent runs)
DROP POLICY IF EXISTS "Collections are viewable by everyone" ON public.collections;
DROP POLICY IF EXISTS "Collections are manageable by store owner" ON public.collections;
DROP POLICY IF EXISTS "Product collections are viewable by everyone" ON public.product_collections;
DROP POLICY IF EXISTS "Product collections are manageable by store owner" ON public.product_collections;

-- Collections: Anyone can view active collections (for storefront)
CREATE POLICY "Collections are viewable by everyone"
  ON public.collections FOR SELECT
  USING (is_active = true);

-- Collections: Store owners can manage their collections
CREATE POLICY "Collections are manageable by store owner"
  ON public.collections FOR ALL
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

-- Product collections: Anyone can view (for storefront queries)
CREATE POLICY "Product collections are viewable by everyone"
  ON public.product_collections FOR SELECT
  USING (true);

-- Product collections: Store owners can manage
CREATE POLICY "Product collections are manageable by store owner"
  ON public.product_collections FOR ALL
  USING (
    collection_id IN (
      SELECT c.id FROM public.collections c
      JOIN public.stores s ON c.store_id = s.id
      WHERE s.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for collections
DROP TRIGGER IF EXISTS update_collections_updated_at ON public.collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- DONE!
-- ============================================================================
