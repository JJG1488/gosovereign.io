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
| 9.7 | Jan 1, 2026 | **Subscription Billing Verified** - All webhook handlers confirmed working, deploy flow checks can_deploy |
| 9.8 | Jan 1, 2026 | **Account Settings Page** - Email change, password update, GDPR account deletion, cascading data removal |
| 9.9 | Jan 1, 2026 | **Customer Accounts** - Optional customer login, order history, saved addresses, profile management |
| 9.10 | Jan 1, 2026 | **Checkout Address Pre-fill** - Logged-in customers use saved addresses, AddressSelector component |
| 9.11 | Jan 1, 2026 | **Documentation Site** - MDX-based `/docs` with 12 pages covering all features |
| 9.12 | Jan 1, 2026 | **Abandoned Cart Recovery** - Server sync, admin page, recovery emails with cart links |
| 9.13 | Jan 1, 2026 | **Gift Cards** - Purchase, redemption, balance check, admin management, email delivery |
| 9.14 | Jan 1, 2026 | **Shopify Import** - Auto-detect Shopify CSV format, variant support, image download, format selector |
| 9.15 | Jan 1, 2026 | **Order Detail Mobile Polish** - 44px touch targets, Lucide icons, responsive spacing |
| 9.16 | Jan 1, 2026 | **Multi-Currency** - 60+ Stripe currencies, zero-decimal handling, grouped by region, admin selector |
| 9.17 | Jan 1, 2026 | **WooCommerce Import** - Variable products, Parent linking, up to 10 attributes |
| 9.18 | Jan 1, 2026 | **BigCommerce Import** - Item Type/SKU row detection, variant support, 10 image columns |
| 9.19 | Jan 2, 2026 | **Services Template MVP** - Complete services template, multi-template deployment, repo mapping fix, bulk redeploy |
| 9.20 | Jan 2, 2026 | **Brochure Template** - Complete portfolio/information site template, env-var approach, admin dashboard |
| 9.21 | Jan 2, 2026 | **Visitor Education Initiative** - Documented 5-phase plan to educate visitors (market validation confirmed) |
| 9.22 | Jan 2, 2026 | **Visitor Education Phase 1 + Mini-Wizard** - Screenshot gallery, video placeholder, demo links, interactive 3-step mini-wizard with live preview |
| 9.23 | Jan 2, 2026 | Screenshot gallery fixes, double-payment bug fix, template brand color propagation |
| 9.24 | Jan 2, 2026 | Bug tracker created, wizard template-aware prep |
| 9.25 | Jan 2, 2026 | **Template-Aware Wizard** - TaglineStep template-specific content, services store creation fix |
| 9.26 | Jan 2, 2026 | **AI Enhance Buttons** - Claude 3.5 Haiku integration for tagline and about step enhancement |
| 9.27 | Jan 2, 2026 | **Order Email Fallback** - Fallback order creation on success page ensures emails send without webhook |

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
| 2026-01-02 | **Multi-template architecture** | Separate GitHub repos per template (goods, services, brochure), template selected via `store.template` field |
| 2026-01-02 | **JJG1488 repo namespace** | All template repos under `JJG1488/` organization (storefront-template, services-template) |
| 2026-01-02 | **Mini-wizard prefill via URL params** | Simpler than context/localStorage, allows direct linking, full wizard automatically applies prefill values |

---

## Session Summaries

### Session 32 - AI Enhance + Order Email Fallback (v9.25-9.27) - Jan 2, 2026

**What was done:**

Completed wizard template-aware copy, AI enhancement buttons, and fixed order confirmation emails.

**Template-Aware Wizard (v9.25):**
- `TaglineStep.tsx` now shows template-specific content:
  - Goods: "Describe what you sell" with product-focused examples
  - Services: "Describe what you do" with service-focused examples
  - Brochure: "Describe your work" with portfolio-focused examples
- Fixed services store creation bug - wizard was resuming existing store instead of creating new one when `?template=services` URL param was set

**AI Enhance Buttons (v9.26):**
- Created `/api/wizard/enhance/route.ts` - API endpoint using Claude 3.5 Haiku
- Created `components/wizard/EnhanceButton.tsx` - Reusable button component with loading states
- Integrated into TaglineStep and AboutStep
- Template-aware prompts (goods/services/brochure context)
- Improves existing text or generates fresh copy from scratch
- Requires authentication (prevents anonymous API abuse)
- Added `@anthropic-ai/sdk` dependency

**Order Email Fallback (v9.27):**
- Root cause: Deployed stores don't have `STRIPE_WEBHOOK_SECRET`, so webhooks don't create orders
- Solution: Fallback order creation on checkout success page
- Created `templates/hosted/app/api/orders/from-session/route.ts`:
  - Called from success page when `session_id` present
  - Idempotent - checks if order already exists (webhook may have created it)
  - Retrieves checkout session from Stripe API
  - Creates order and order_items in database
  - Sends order confirmation and new order alert emails
- Modified `templates/hosted/app/checkout/success/page.tsx`:
  - Added useEffect to call fallback API on page load
  - Uses ref to prevent duplicate calls

**Files Created:**
- `app/api/wizard/enhance/route.ts` - AI enhance endpoint
- `components/wizard/EnhanceButton.tsx` - Reusable enhance button
- `templates/hosted/app/api/orders/from-session/route.ts` - Fallback order creation

**Files Modified:**
- `components/wizard/steps/TaglineStep.tsx` - Template-aware content + AI enhance
- `components/wizard/steps/AboutStep.tsx` - AI enhance button
- `app/wizard/page.tsx` - Fixed services store creation logic
- `templates/hosted/app/checkout/success/page.tsx` - Calls fallback API
- `package.json` - Added @anthropic-ai/sdk

**Key Decisions:**
- Use Claude 3.5 Haiku for AI enhance (fast, cost-effective)
- Fallback order creation instead of requiring webhook configuration (better DX for store owners)
- Idempotent order creation allows webhook and fallback to coexist

---

### Session 31 - Visitor Education Phase 1 + Mini-Wizard (v9.22) - Jan 2, 2026

**What was done:**

Implemented the highest-impact items from the Visitor Education Initiative to help visitors understand what GoSovereign is.

**Phase 1: Quick Wins**
- Added "See Live Examples" link in Hero section (links to demo.gosovereign.io placeholder)
- Created `ScreenshotGallery.tsx` component - 3-card grid showing Wizard, Admin, Storefront
- Added video placeholder in HowItWorks section (play button with "coming soon" text)

**Mini-Wizard (Highest Impact)**
- Created `MiniWizard.tsx` - 3-step interactive wizard embedded in Hero
- Step 1: Template selection (Products/Services/Portfolio) with icons
- Step 2: Store name input with live subdomain preview
- Step 3: Color picker with 6 presets + custom color
- Live preview panel (desktop) showing store mockup with selected name/color
- "Continue to Full Wizard" passes data via URL params (`prefill_name`, `prefill_color`)
- Full wizard now accepts and applies prefill params automatically

**Files created:**
- `components/landing/MiniWizard.tsx` (320 lines)
- `components/landing/ScreenshotGallery.tsx`

**Files modified:**
- `components/landing/Hero.tsx` - Replaced HeroCTA with MiniWizard, removed unused props
- `components/landing/HowItWorks.tsx` - Added video placeholder section
- `components/landing/index.ts` - Exported new components
- `app/page.tsx` - Added ScreenshotGallery, removed cta prop from Hero
- `app/wizard/page.tsx` - Added prefill param handling

**Key Decision:**
- Mini-wizard data passes via URL query params rather than context/localStorage for simplicity

---

### Session 30 - Services Template MVP (v9.19) - Jan 2, 2026

**What was done:**

Completed the services template MVP and fixed deployment propagation issues.

**Services Template (`templates/services/`):**
- Full Next.js 15 template for service-based businesses
- Homepage with hero, services grid, about section, contact form
- Services pages with slug-based routing (`/services/[slug]`)
- Contact form with Resend email notifications
- Admin dashboard with services CRUD, inquiries management, settings
- Database schema: `services`, `contact_submissions` tables

**Multi-Template Deployment:**
- Added `TEMPLATE_REPOS` mapping in `lib/vercel.ts`:
  - `goods` → `JJG1488/storefront-template`
  - `services` → `JJG1488/services-template`
  - `brochure` → `JJG1488/brochure-template` (future)
- `deployStore()` selects repo based on `store.template` field
- Added services-specific env vars: `NEXT_PUBLIC_TEMPLATE_TYPE`, `NEXT_PUBLIC_MAX_SERVICES`, `NEXT_PUBLIC_CALENDLY_ENABLED`

**Bug Fixes:**
- Fixed Resend API property: `replyTo` → `reply_to` (snake_case)
- Fixed repo mismatch: Platform was pointing to `gosovereign/` but submodules use `JJG1488/`
- All template repos now correctly mapped to `JJG1488/` namespace

**Bulk Redeploy:**
- Triggered via Platform Admin UI at `/platform-admin/stores`
- All existing stores redeployed with fixed template repo mapping

**Key Files Modified:**
- `lib/vercel.ts` - Template repo selection logic
- `templates/services/lib/email.ts` - Fixed `reply_to` property

**Commits:**
- Services template pushed to `JJG1488/services-template`
- Platform deployed with repo mapping fix

**Result:** Services template fully functional, all stores redeployed with correct template repos.

---

### Session 29 - BigCommerce Import (v9.18) - Jan 1, 2026

**What was done:**

Added BigCommerce CSV import to complete the e-commerce platform migration trifecta.

**Parser Implementation:**
- Created `bigcommerce-csv-parser.ts` (~340 lines)
- `isBigCommerceFormat()` - detects via unique `Item Type` column
- Sequential row parsing: `Item Type = "Product"` creates parent, `Item Type = "SKU"` adds variants
- Supports up to 10 image columns (`Product Image File - 1` through `10`)
- Sale price support, digital product detection (`Product Type = D`)
- Categories via semicolon-separated values
- Parses option values from various formats: `[Size=Small]`, `Size: Small, Color: Red`

**Import Page Updates:**
- Added BigCommerce to format selector dropdown
- Auto-detection prioritizes BigCommerce before WooCommerce
- Blue info banner when BigCommerce selected
- BigCommerce badge in preview step
- Updated grid layout for 4 format columns

**Commits:**
- Template: `94a0add` - feat: Add BigCommerce CSV import support (v9.18)
- Main: `7c06a3c` - docs: Update CLAUDE.md for v9.18 (BigCommerce Import)

**Result:** Store migration now supports Shopify, WooCommerce, and BigCommerce.

---

### Session 28 - WooCommerce Import (v9.17) - Jan 1, 2026

**What was done:**

Added WooCommerce CSV import with support for variable products and variations.

**Parser Implementation:**
- Created `woocommerce-csv-parser.ts`
- Two-pass parsing: first collect products/variations, then link by Parent column
- Type detection: `simple`, `variable`, `variation`, `grouped`, `external`
- Dynamic attribute support (up to 10 attributes per product)
- Sale price priority over regular price

**Key Files:**
- `templates/hosted/lib/woocommerce-csv-parser.ts`
- Updated `templates/hosted/app/admin/products/import/page.tsx`

---

### Session 27 - Multi-Currency (v9.16) - Jan 1, 2026

**What was done:**

Added multi-currency support with 60+ Stripe-supported currencies.

**Features:**
- Currency selector in admin Settings (General tab)
- Currencies grouped by region (Americas, Europe, Asia-Pacific, etc.)
- Zero-decimal currency handling (JPY, KRW, etc.)
- `formatPrice()` utility with proper locale formatting
- Currency stored in store settings, propagated to checkout

**Key Files:**
- `templates/hosted/lib/currencies.ts` - Currency data and utilities
- Updated Settings page, checkout, and all price displays

---

### Session 26 - Order Detail Mobile Polish (v9.15) - Jan 1, 2026

**What was done:**

Mobile UX improvements for order detail admin page.

- 44px minimum touch targets for all interactive elements
- Replaced text with Lucide icons for status actions
- Responsive spacing and layout adjustments
- Improved button grouping on mobile

---

### Session 25 - Shopify Import (v9.14) - Jan 1, 2026

**What was done:**

Added Shopify CSV import as the first platform-specific import format.

**Parser Implementation:**
- Created `shopify-csv-parser.ts`
- Groups rows by Handle column (one product, multiple variant rows)
- Up to 3 option levels (Option1 Name/Value, Option2, Option3)
- Image collection from all variant rows
- HTML description preservation

**Import Page Updates:**
- Format selector dropdown: Auto-detect, Standard, Shopify
- Auto-detection based on Shopify-specific columns
- Platform imports skip column mapping step

**Key Files:**
- `templates/hosted/lib/shopify-csv-parser.ts`
- Updated `templates/hosted/app/admin/products/import/page.tsx`

---

### Session 24 - Gift Cards (v9.13) - Jan 1, 2026

**What was done:**

Implemented a complete digital gift card system for store owners.

**Customer Features:**
- Gift card purchase page (`/gift-cards`) with fixed denominations ($25, $50, $100, $200)
- Recipient details form (email, name, personal message)
- Balance check page (`/gift-cards/check`)
- Gift card redemption at checkout via `GiftCardInput` component
- Stackable with coupons (gift card applied after coupon discount)
- Full gift card coverage skips Stripe payment

**Admin Features:**
- Gift cards list page (`/admin/gift-cards`) with status, balance, recipient info
- Gift card detail page with transaction history, enable/disable, resend email
- Manual gift card issuance (`/admin/gift-cards/new`) for promotions/customer service
- Custom amounts for manual issuance

**Email Notifications:**
- Purchase confirmation to buyer
- Gift card delivery to recipient with code and message

**Database:**
- `gift_cards` table - codes, balances, recipient info, status
- `gift_card_transactions` table - redemption history

**Key Files:**
- `scripts/supabase-gift-cards.sql` - Database schema
- `templates/hosted/lib/gift-cards.ts` - Core utilities
- `templates/hosted/app/gift-cards/page.tsx` - Purchase page
- `templates/hosted/app/gift-cards/check/page.tsx` - Balance check
- `templates/hosted/components/GiftCardInput.tsx` - Checkout integration
- `templates/hosted/app/admin/gift-cards/` - Admin pages
- `templates/hosted/app/api/admin/gift-cards/` - Admin APIs
- `templates/hosted/app/api/gift-cards/` - Customer APIs

---

### Session 19 - Subscription Billing Verification (v9.7) - Jan 1, 2026

**What was done:**

Verified the complete subscription billing system for the Hosted tier ($149 + $19/mo).

**Webhook Handlers Verified:**
1. `checkout.session.completed` - Creates subscription record, sets `subscription_status: 'active'`
2. `invoice.paid` - Monthly renewal restores `subscription_status: 'active'`, `can_deploy: true`
3. `invoice.payment_failed` - Sets `subscription_status: 'past_due'`, `can_deploy: false`
4. `customer.subscription.deleted` - Sets `subscription_status: 'cancelled'`, grace period via `subscription_ends_at`
5. `customer.subscription.updated` - Resubscription restores active status

**Database Schema Verified:**
- `stores.subscription_status` - 'active', 'past_due', 'cancelled', 'none'
- `stores.subscription_ends_at` - Grace period end date
- `stores.can_deploy` - Boolean restricting deployments
- `subscriptions` table with Stripe subscription tracking

**Deploy Flow Verified:**
- `/api/deploy/execute` checks `can_deploy` before allowing deployment
- Returns appropriate error messages for past_due and cancelled states
- Store continues working during payment issues (just can't redeploy)

**Key Files:**
- `app/api/webhooks/stripe/route.ts` - All subscription handlers (lines 384-586)
- `app/api/deploy/execute/route.ts` - Deploy restriction check (lines 59-74)
- `scripts/supabase-setup.sql` - Schema with subscription columns

**Result:** No code changes needed - subscription billing was already complete!

---

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

*Last Updated: January 2, 2026 (v9.27)*
