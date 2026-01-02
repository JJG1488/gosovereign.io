-- ============================================================================
-- GOSOVEREIGN SERVICES TEMPLATE - DATABASE SETUP (IDEMPOTENT)
-- ============================================================================
--
-- This script adds tables and policies for the services template.
-- Run this AFTER supabase-setup.sql has been executed.
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
-- 1. ADD TEMPLATE TYPE TO STORES TABLE
-- ============================================================================

-- Add template_type column to stores (defaults to 'hosted' for e-commerce)
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'hosted';

-- Index for filtering by template type
CREATE INDEX IF NOT EXISTS idx_stores_template_type ON public.stores(template_type);

-- ============================================================================
-- 2. SERVICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  short_description TEXT,
  description TEXT,  -- Full description (can include markdown)
  price INTEGER,  -- In cents, NULL means "Contact for pricing"
  price_type TEXT DEFAULT 'fixed',  -- 'fixed', 'starting_at', 'hourly', 'custom'
  duration TEXT,  -- e.g., "2-4 hours", "Same day", "1-2 weeks"
  images JSONB DEFAULT '[]'::jsonb,
  icon TEXT,  -- Lucide icon name (e.g., 'wrench', 'home', 'hammer')
  features JSONB DEFAULT '[]'::jsonb,  -- Array of feature strings
  category TEXT,
  tags TEXT[],
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(store_id, slug)
);

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_store ON public.services(store_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_order ON public.services(display_order);

-- ============================================================================
-- 3. CONTACT SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  message TEXT,
  preferred_contact TEXT DEFAULT 'email',  -- 'email', 'phone', 'either'
  preferred_time TEXT,  -- e.g., "Morning", "Afternoon", "Evening"
  status TEXT DEFAULT 'new',  -- 'new', 'contacted', 'converted', 'closed'
  notes TEXT,  -- Admin notes
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for contact submissions
CREATE INDEX IF NOT EXISTS idx_contact_submissions_store ON public.contact_submissions(store_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_service ON public.contact_submissions(service_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);

-- ============================================================================
-- 4. TEAM MEMBERS TABLE (Optional feature)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for team members
CREATE INDEX IF NOT EXISTS idx_team_members_store ON public.team_members(store_id);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_team_members_order ON public.team_members(display_order);

-- ============================================================================
-- 5. TESTIMONIALS TABLE (Optional feature)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_title TEXT,  -- e.g., "CEO at Company"
  author_company TEXT,
  author_photo_url TEXT,
  quote TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_store ON public.testimonials(store_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_service ON public.testimonials(service_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON public.testimonials(display_order);

-- ============================================================================
-- 6. PORTFOLIO ITEMS TABLE (Pro feature)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  client_name TEXT,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,  -- YouTube URL or uploaded video
  results TEXT,  -- Outcome metrics/description
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(store_id, slug)
);

-- Indexes for portfolio items
CREATE INDEX IF NOT EXISTS idx_portfolio_items_store ON public.portfolio_items(store_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_slug ON public.portfolio_items(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_service ON public.portfolio_items(service_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_active ON public.portfolio_items(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_items_featured ON public.portfolio_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_items_order ON public.portfolio_items(display_order);

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Services Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to services" ON public.services;
DROP POLICY IF EXISTS "Public can view active services" ON public.services;

CREATE POLICY "Service role full access to services"
  ON public.services FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

-- ----------------------------------------------------------------------------
-- Contact Submissions Policies
-- Note: Deployed stores use service role for CRUD
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON public.contact_submissions;

CREATE POLICY "Service role full access to contact_submissions"
  ON public.contact_submissions FOR ALL
  TO service_role
  USING (true);

-- Allow public to submit contact forms
CREATE POLICY "Public can insert contact submissions"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Team Members Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to team_members" ON public.team_members;
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;

CREATE POLICY "Service role full access to team_members"
  ON public.team_members FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can view active team members"
  ON public.team_members FOR SELECT
  USING (is_active = true);

-- ----------------------------------------------------------------------------
-- Testimonials Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;

CREATE POLICY "Service role full access to testimonials"
  ON public.testimonials FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (is_active = true);

-- ----------------------------------------------------------------------------
-- Portfolio Items Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to portfolio_items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Public can view active portfolio items" ON public.portfolio_items;

CREATE POLICY "Service role full access to portfolio_items"
  ON public.portfolio_items FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can view active portfolio items"
  ON public.portfolio_items FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- 8. TRIGGERS FOR UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON public.contact_submissions;
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON public.portfolio_items;

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- DONE!
-- ============================================================================
--
-- Tables created:
-- - services (service listings)
-- - contact_submissions (inquiry/contact form submissions)
-- - team_members (optional team section)
-- - testimonials (optional testimonials section)
-- - portfolio_items (optional portfolio/case studies, Pro tier)
--
-- Added column:
-- - stores.template_type (default 'hosted', can be 'services')
--
-- ============================================================================
