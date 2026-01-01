# CLAUDE-HISTORY.md — GoSovereign Version History & Session Logs

> **Reference file for historical context.** See `CLAUDE.md` for active project context.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial one-click deployment architecture |
| 2.0 | Dec 2024 | Enterprise payment flow with 3-tier pricing |
| 3.0 | Dec 22, 2024 | Tier-based feature gating system, template updates |
| 4.0 | Dec 23, 2024 | Payment tier propagation fix, subscription management, subdomain auto-naming, BOGO store selection |
| 5.0 | Dec 27, 2024 | Static pages (FAQ, Contact, Terms, Privacy), Wishlist, Stripe shipping, Custom domain docs, Reviews fix |
| 6.0 | Dec 28, 2024 | Analytics dashboard (Pro), Premium themes (6 presets), GitHub template sync verified |
| 7.0 | Dec 27, 2025 | Codebase cleanup: removed debug logs, unused imports, ESLint fixes, Next.js Link migration |
| 8.0 | Dec 28, 2025 | Pre-launch polish: password UX, spam warnings, Stripe URL modal, template legal pages, testimonials, reviews fixes |
| 8.1 | Dec 28, 2025 | **CRITICAL FIX:** Tier feature flags now use NEXT_PUBLIC_ prefix for client-side access |
| 8.2 | Dec 28, 2025 | Analytics API fix (`unit_price` column), force-dynamic on API routes, Pro tier verified working |
| 8.3 | Dec 28, 2025 | Custom Domain Settings UI (Pro feature) - Domain tab in admin Settings |
| 8.4 | Dec 28, 2025 | Email notifications verified complete - order confirmations, shipping notifications, all wired up |
| 8.5 | Dec 28, 2025 | Platform Admin Dashboard - internal tool for managing all deployed stores, revenue tracking |
| 8.6 | Dec 29, 2025 | Media Banner feature - YouTube/video/image support, admin settings UI, autoplay muted + loop |
| 8.7 | Dec 29, 2025 | Admin Mobile UX - hamburger nav, settings tab dropdown, clickable product rows, natural aspect ratios |
| 8.8 | Dec 29, 2025 | Storefront Mobile UX - reviews/orders mobile layouts, cart optimization, centered nav store name, footer fixes |
| 8.9 | Dec 30, 2025 | Reviews mobile fix, **Runtime Settings System** - all store settings now update without redeploy |
| 9.0 | Dec 30, 2025 | Trust Badges moved below Reviews, initial Supabase caching investigation |
| 9.1 | Dec 31, 2025 | **CRITICAL FIX:** Supabase PostgREST caching - custom fetch with cache-busting headers, settings now persist correctly |
| 9.2 | Jan 1, 2026 | Digital goods support, AI product copywriting, video mute/unmute, Platform Admin redeploy stores feature |
| 9.3 | Jan 1, 2026 | **Inventory Management** - Low stock email alerts, configurable thresholds, auto-hide out-of-stock products |
| 9.4 | Jan 1, 2026 | **Automated Domain Verification** - Platform API proxies Vercel Domains, DNS records in Settings UI, verification status |
| 9.5 | Jan 1, 2026 | **Coupon/Discount System** - Promo codes, percentage/fixed discounts, usage limits, Stripe integration, admin CRUD |
| 9.6 | Jan 1, 2026 | **Product Variants** - Size/Color/etc options, per-variant inventory, admin VariantEditor, storefront selector, cart+checkout integration |
| 9.7 | Jan 1, 2026 | **Bulk Product Import** - CSV upload with column mapping, image URL download, progress tracking, error handling |

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12 | Supabase for backend | Auth + DB + Storage in one, RLS for security |
| 2024-12 | Products in separate table | Not embedded JSONB, allows future features |
| 2024-12 | Stripe Connect destination charges | Store owner gets 100% minus Stripe fees |
| 2024-12 | Auto-save with debounce | Better UX, no explicit save buttons |
| 2024-12 | Stripe Checkout Sessions API | Replaces Payment Links for webhook integration |
| 2024-12 | Free trial with gate | Wizard accessible, generation gated behind payment |
| 2024-12 | Magic link after purchase | Seamless account creation for direct buyers |
| 2024-12 | **Platform-hosted deployment** | One-click deploy to our Vercel, no user OAuth needed |
| 2024-12 | **Separate Vercel projects** | Each store = own project, better isolation than wildcard |
| 2024-12 | **Subdomain aliasing** | `store.gosovereign.io` via Vercel domains API |
| 2024-12 | **Download ZIP as fallback** | Preserves sovereignty for users who want to self-host |
| 2024-12-22 | **Single template + feature flags** | Maintain one codebase, gate features via env vars |
| 2024-12-22 | **Environment variable tier gating** | Simpler than multiple templates, easy to update |
| 2024-12-27 | **localStorage for wishlist** | Simple persistence, follows CartContext pattern |
| 2024-12-27 | **Stripe shipping_address_collection** | Native Stripe UI for address collection, configurable countries |
| 2024-12-27 | **Downloadable domain docs** | Markdown guide in admin Settings, works offline |
| 2024-12-28 | **Recharts for analytics** | Lightweight, React-native API, good Tailwind integration |
| 2024-12-28 | **Preset-based themes** | 6 curated palettes vs custom color picker - simpler, more polished |
| 2025-12-30 | **Use `.limit(1)` not `.single()` for Supabase** | `.single()` causes PostgREST caching issues returning stale data |
| 2025-12-30 | **Fresh Supabase client for settings API** | Singleton pattern can cache stale data in serverless environments |
| 2025-12-31 | **Custom fetch with cache-busting headers** | Override Supabase client's fetch to add `cache: 'no-store'` and `Cache-Control` headers - the definitive fix for PostgREST caching |

---

## Session Summaries

### Session 18 - Bulk Product Import (v9.7) - Jan 1, 2026

**What was done:**

Complete bulk product import feature allowing store owners to import products via CSV file.

**Files Created:**
- `lib/csv-parser.ts` - CSV parsing with auto-detect column mapping
- `app/admin/products/import/page.tsx` - 5-step import wizard
- `app/api/admin/products/import/route.ts` - Import endpoint with image handling

**Files Modified:**
- `app/admin/products/page.tsx` - Added "Import CSV" button

**Features:**
- 5-step wizard: Upload → Mapping → Preview → Importing → Complete
- Drag-drop CSV upload with file validation
- Auto-detect column mapping from header names (name, title, price, etc.)
- Column mapping interface with sample data preview
- Image URL download and Supabase Storage upload
- Real-time progress bar during import
- Validation warnings before import
- Error handling with row-specific messages
- Product limit enforcement for Starter tier

**CSV Format Support:**
- Handles quoted values and commas within quotes
- Converts price from dollars to cents automatically
- Supports comma-separated image URLs
- Flexible column naming (name/title, price/cost, etc.)

---

### Session 17 - Product Variants (v9.6) - Jan 1, 2026

**What was done:**

Complete product variants system allowing stores to sell products with options like Size (S/M/L/XL), Color (Black/White/Gold), etc.

**Database Schema:**
- Added `product_variants` table with:
  - `name` - Human-readable variant name (e.g., "Small / Black")
  - `sku` - Optional SKU per variant
  - `price_adjustment` - Price difference from base (positive or negative)
  - `inventory_count` - Per-variant stock tracking
  - `track_inventory` - Enable/disable inventory per variant
  - `options` - JSONB with option values (e.g., `{"Size": "Small", "Color": "Black"}`)
  - `position` - Sort order
  - `is_active` - Enable/disable variant
- Added `has_variants` and `variant_options` columns to products table

**Admin UI:**
- `VariantEditor` component on product edit page:
  - Option type management (Size, Color, Material, etc.)
  - Values per option type (S, M, L, XL for Size)
  - Auto-generates cartesian product of all combinations
  - Bulk pricing/inventory table for all variants
  - Individual variant SKU, price adjustment, inventory fields
- Product edit page hides standard inventory when variants enabled

**Storefront:**
- `VariantSelector` component on product pages:
  - Button groups for each option type
  - Grayed out unavailable combinations
  - Stock warnings for low inventory variants
  - SKU display for selected variant
- `ProductWithVariants` wrapper for dynamic price display
- Price updates in real-time based on variant selection

**Cart Integration:**
- `CartContext` updated with VariantInfo interface
- Cart items keyed by `productId:variantId` for uniqueness
- `addItem`, `removeItem`, `updateQuantity` all variant-aware
- Cart page shows variant name under product name
- Total calculation includes variant price adjustments

**Checkout & Webhook:**
- Checkout API validates variant stock server-side
- Stripe metadata includes `variant_id` and `variant_name`
- Webhook extracts variant info and saves to `order_items.variant_info`
- `decrementVariantInventory()` function for variant stock
- Low stock alerts work for variant inventory

**Files created:**
- `templates/hosted/components/VariantEditor.tsx`
- `templates/hosted/components/VariantSelector.tsx`
- `templates/hosted/components/ProductWithVariants.tsx`
- `templates/hosted/app/api/admin/products/[id]/variants/route.ts`
- `templates/hosted/app/api/products/[id]/variants/route.ts`

**Files modified:**
- `scripts/supabase-setup.sql` - product_variants table
- `templates/hosted/app/admin/products/[id]/page.tsx` - VariantEditor integration
- `templates/hosted/app/api/admin/products/[id]/route.ts` - has_variants handling
- `templates/hosted/components/CartContext.tsx` - Variant-aware cart
- `templates/hosted/components/AddToCartButton.tsx` - Variant props
- `templates/hosted/app/cart/page.tsx` - Variant display
- `templates/hosted/app/products/[id]/page.tsx` - ProductWithVariants
- `templates/hosted/data/products.ts` - has_variants field
- `templates/hosted/app/api/checkout/route.ts` - Variant stock validation
- `templates/hosted/app/api/webhooks/stripe/route.ts` - Variant inventory decrement

---

### Session 16 - Coupon/Discount System (v9.5) - Jan 1, 2026

**What was done:**

Complete coupon/discount system with admin CRUD, cart integration, and Stripe checkout support.

**Database Schema:**
- Added `coupons` table with:
  - `code` - Unique coupon code per store
  - `discount_type` - "percentage" or "fixed"
  - `discount_value` - Percentage (0-100) or cents
  - `minimum_order_amount` - Minimum cart total required
  - `max_uses` / `current_uses` - Usage limit tracking
  - `starts_at` / `expires_at` - Date range validity
  - `is_active` - Enable/disable toggle
- Added `coupon_code` and `stripe_session_id` columns to orders table

**Admin Interface:**
- `/admin/coupons` - List all coupons with status badges
- `/admin/coupons/new` - Create coupons with auto-generate code
- `/admin/coupons/[id]` - Edit with usage statistics display

**Cart Integration:**
- `CouponInput` component with apply/remove functionality
- Cart shows discount amount and final total

**Checkout Flow:**
- Server-side validation via `validateAndGetCoupon()`
- Creates Stripe coupon on-the-fly with matching discount
- Increments `current_uses` after session creation

**Commits:**
- Template: `54c54d9` - feat: Add coupon/discount system (v9.5)
- Main: `82cffcd` - feat: Add coupons table and order discount columns

---

### Session 15 - Automated Domain Verification (v9.4) - Jan 1, 2026

**What was done:**

Automated custom domain verification using Vercel Domains API, replacing manual "contact support" flow.

**Platform API:**
- Created `/api/stores/[storeId]/domain/route.ts`
  - POST: Add domain to store's Vercel project, return DNS records
  - GET: Check domain verification status from Vercel
  - DELETE: Remove domain from Vercel project

**Settings UI Enhancements:**
- Status indicators with colors: pending (amber), verifying (blue), configured (green)
- Displays DNS verification records from Vercel response
- Refresh button to check DNS propagation

---

### Session 14 - Inventory Management (v9.3) - Jan 1, 2026

**What was done:**

Complete inventory management system with configurable thresholds, email alerts, and auto-hide functionality.

**Key Features:**
- `sendLowStockAlert()` function in `lib/email.ts`
- Configurable low stock threshold in Settings
- "Email me on low stock" toggle
- "Hide out of stock products" toggle for storefront
- All admin pages use configurable threshold

---

### Session 13 - Feature Expansion (v9.2) - Jan 1, 2026

**What was done:**

1. **Digital Products Support** - File uploads, signed download URLs, email links
2. **AI Product Copywriting** - Claude 3.5 Haiku description generation
3. **Video Banner Sound Toggle** - Mute/unmute for uploaded videos and YouTube
4. **Platform Admin Redeploy** - Single store + bulk redeploy from admin dashboard

---

### Session 12 - Supabase Caching FINAL Fix (v9.1) - Dec 31, 2025

**CRITICAL FIX:** Custom Fetch with Cache-Busting Headers

Override Supabase client's internal fetch function to inject cache-busting headers:
```typescript
cache: 'no-store',
headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
```

---

### Session 11 - Supabase Caching Investigation (v9.0) - Dec 30, 2025

- Trust Badges moved below Reviews
- Initial caching fix attempts (incomplete)

---

### Session 10 - Runtime Settings System (v8.9) - Dec 30, 2025

**Major Feature:** All settings now update at runtime without redeploy.

Created `RuntimeSettings` interface and `getStoreSettingsFromDB()` to fetch from database.

---

### Session 9 - Storefront Mobile UX (v8.8) - Dec 29, 2025

Comprehensive mobile UX audit and fixes:
- Reviews/Orders mobile layouts
- Header 3-column grid with centered store name
- Cart page optimization
- Footer payment icons fix

---

### Session 8 - Admin Mobile UX (v8.7) - Dec 29, 2025

- Hamburger menu in admin layout
- Settings tab dropdown for mobile
- Clickable product rows
- Natural aspect ratios for media banner

---

### Session 7 - Media Banner Feature (v8.6) - Dec 29, 2025

- YouTube embed + HTML5 video + image support
- Videos autoplay muted + loop
- Settings UI in Appearance tab

---

### Session 6 - Platform Admin Dashboard (v8.5) - Dec 28, 2025

- Dashboard overview with stats
- Stores list with search/filters
- Store detail view with deployment logs
- Revenue page with tier breakdown

---

### Session 5 - Email Notifications Audit (v8.4) - Dec 28, 2025

Audited email system - discovered it was ALREADY FULLY IMPLEMENTED. No code changes needed.

---

### Session 4 - Custom Domain Settings UI (v8.3) - Dec 28, 2025

- Domain tab in `/admin/settings` (Pro/Hosted only)
- `/api/admin/domain` endpoint
- DNS configuration instructions

---

### Session 3 - Analytics Fix (v8.2) - Dec 28, 2025

- Fixed `price_at_time` → `unit_price` column name
- Added `force-dynamic` to API routes
- Pro tier fully verified working

---

### Session 2 - Tier Fix (v8.1) - Dec 28, 2025

**CRITICAL FIX:** Tier feature flags now use `NEXT_PUBLIC_` prefix for client-side access.

---

### Session 1 - Pre-Launch Polish (v8.0) - Dec 28, 2025

- Password UX improvements
- Spam folder warnings
- Stripe Connect URL modal
- Template Terms & Privacy pages
- Testimonials component
- Reviews admin product dropdown fix

---

*Last Updated: January 1, 2026*
