# CLAUDE.md — GoSovereign Project Context

> **IMPORTANT:** This file is the source of truth. Update before context compaction.

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

---

## Project Identity

**Product Name:** GoSovereign
**Domain:** gosovereign.io
**Tagline:** "Go Sovereign. Own Everything."
**One-Liner:** Private e-commerce stores for a one-time price. No subscriptions. No code. No landlords.

---

## Current State (December 2025)

### Phase: Production Ready (v7.0)

**What's Built:**
- [x] Landing page with A/B variants (`/a`, `/b`)
- [x] 8-step configuration wizard (`/wizard`)
- [x] Supabase Auth (signup/login with magic links)
- [x] Database schema (8 tables with RLS, including purchases)
- [x] Image uploads to Supabase Storage
- [x] Stripe Connect OAuth for store owners
- [x] ZIP generation from database
- [x] Template with Stripe Checkout
- [x] **Enterprise Payment Flow**
  - [x] Stripe Checkout Sessions API
  - [x] Stripe Webhook handler for payment verification
  - [x] Payment gating on wizard generate + preview download
  - [x] Server-side payment verification (402 response)
  - [x] UpgradeModal with 3-tier pricing
  - [x] PaymentStatusBadge (Free Trial / Paid tier display)
  - [x] Magic link auto-send after purchase
- [x] **One-Click Deployment**
  - [x] Platform-hosted deployment (stores deploy to OUR Vercel)
  - [x] Single "Deploy Now" button on preview page
  - [x] Automatic subdomain aliasing (`store.gosovereign.io`)
  - [x] Real-time deployment status polling
  - [x] Removed user OAuth requirements (no GitHub/Vercel auth needed)
  - [x] Download ZIP as secondary option for self-hosting
- [x] **Tier-Based Feature Gating** (Dec 22, 2024, FIXED Dec 28, 2025)
  - [x] Tier environment variables in `vercel.ts` (uses `NEXT_PUBLIC_*` prefix for client access)
  - [x] `useFeatureFlags()` hook in template (reads `NEXT_PUBLIC_*` env vars)
  - [x] `canAddProduct()` and related functions in `lib/products.ts`
  - [x] `UpgradePrompt` component for tier upsells
  - [x] Password reset email bug fix (proper error handling)
- [x] **Payment Tier Propagation** (NEW - Dec 23, 2024)
  - [x] Webhook updates `store.payment_tier` (not just `user.payment_tier`)
  - [x] Store selection for multi-store users during checkout
  - [x] Tier propagation when store created after purchase
  - [x] `store_id` passed in checkout metadata
- [x] **Subdomain Auto-Naming** (NEW - Dec 23, 2024)
  - [x] `slugifyStoreName()` utility for URL-safe subdomains
  - [x] Real-time subdomain availability check API (`/api/subdomain/check`)
  - [x] Green checkmark / red X availability indicator in wizard
  - [x] Subdomain updates in database when store name changes
  - [x] Reserved subdomain blocking (www, api, admin, etc.)
- [x] **Subscription Management** (NEW - Dec 23, 2024)
  - [x] `subscription_status`, `subscription_ends_at`, `can_deploy` columns on stores
  - [x] Webhook handlers for: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`
  - [x] Subscription records created for hosted tier purchases
  - [x] Grace period for cancelled subscriptions (store works, can't deploy)
  - [x] `useSubscriptionStatus` hook for UI warnings
  - [x] Deployment restriction for past_due/cancelled subscriptions
- [x] **BOGO Store Selection** (NEW - Dec 23, 2024)
  - [x] `StoreSelector` component for multi-store users
  - [x] Store limit enforcement (2 stores until Feb 1, 2026)
  - [x] UpgradeModal with store selection step
  - [x] Tier badges showing existing plans per store
- [x] **Static Pages for GoSovereign Homepage** (Dec 27, 2024)
  - [x] FAQ page (`/faq`) reusing landing FAQ component
  - [x] Terms of Service page (`/terms`) with legal content
  - [x] Privacy Policy page (`/privacy`) with legal content
  - [x] Contact page (`/contact`) with form
  - [x] Contact form API (`/api/contact`) with Resend integration
  - [x] Footer links fixed (anchor → Next.js Link routes)
  - [x] Legal content module (`/content/legal.ts`)
- [x] **Wishlist Implementation** (Dec 27, 2024)
  - [x] `WishlistContext` with localStorage persistence
  - [x] Wishlist page (`/wishlist`) with product grid
  - [x] `ProductCard` updated to use WishlistContext (was local state)
  - [x] Add to Cart from wishlist, Clear All functionality
- [x] **Stripe Shipping Address Collection** (Dec 27, 2024)
  - [x] `shippingCountries` config in `lib/store.ts`
  - [x] `shipping_address_collection` in checkout route
  - [x] `SHIPPING_COUNTRIES` env var in deployments
- [x] **Admin Enhancements** (Dec 27, 2024)
  - [x] Guides tab in Settings with custom domain documentation
  - [x] Downloadable markdown guide for DNS setup
  - [x] Reviews page product dropdown fix (was calling wrong API)
- [x] **Create Another Store UX** (Dec 27, 2024)
  - [x] Store count indicator on button (`1/2`)
  - [x] Button disabled when at limit
- [x] **Analytics Dashboard** (NEW - Dec 28, 2024)
  - [x] `/admin/analytics` page with Recharts visualizations
  - [x] `/api/admin/analytics` endpoint with comprehensive data
  - [x] Revenue trend line chart (7/30/90 day periods)
  - [x] Daily orders bar chart
  - [x] Top 5 products by revenue
  - [x] Order status distribution pie chart
  - [x] CSV export functionality
  - [x] Gated behind `analyticsEnabled` feature flag
- [x] **Premium Themes** (Dec 28, 2024)
  - [x] Theme presets system with 6 themes (1 free, 5 Pro)
  - [x] `lib/themes.ts` with color definitions and CSS generation
  - [x] Expanded CSS variables in `globals.css`
  - [x] Runtime theme injection in `layout.tsx`
  - [x] Appearance tab in admin Settings page
  - [x] Theme selection grid with preview swatches
  - [x] Gated behind `premiumThemesEnabled` feature flag
  - [x] Upgrade prompt for Starter tier users
- [x] **Codebase Cleanup** (Dec 27, 2025)
  - [x] Removed debug console.logs (webhook secrets, profile logging)
  - [x] Removed 12+ unused imports across wizard, layout, and step components
  - [x] Fixed unescaped apostrophes in JSX (cancel, payments pages)
  - [x] Replaced `<a>` tags with Next.js `<Link>` for proper client-side navigation
  - [x] ESLint error count reduced significantly
- [x] **Pre-Launch Polish** (Dec 28, 2025)
  - [x] Password visibility toggle (eye icon) on signup
  - [x] Confirm password field with match validation
  - [x] Spam folder warning on signup and purchase success screens
  - [x] Stripe Connect URL modal (explains subdomain, copy button)
  - [x] Terms & Privacy pages in template (`/terms`, `/privacy`)
  - [x] Store-specific legal content module (`content/legal.ts`)
  - [x] Testimonials component for featured store-wide reviews
  - [x] `/api/reviews/featured` endpoint with dynamic caching
  - [x] Reviews admin product dropdown fixed (auth token)
  - [x] Footer logo brightness fix (removed `brightness-0`)
  - [x] Apple Pay icon SVG fix
- [x] **Custom Domain Settings UI** (Dec 28, 2025)
  - [x] Domain tab in `/admin/settings` (Pro/Hosted only)
  - [x] `/api/admin/domain` endpoint (GET/POST/DELETE)
  - [x] Current subdomain URL display
  - [x] Custom domain input with save functionality
  - [x] DNS configuration instructions inline
  - [x] Domain status indicator (pending/configured)
  - [x] Gated behind `customDomainEnabled` feature flag

**In Progress:**
- [x] End-to-end tier flow testing - Pro tier verified working ✅
- [x] Custom domain settings UI (Pro tier) ✅ DONE (v8.3)
- [x] ~~Investigate tier not propagating~~ - FIXED (NEXT_PUBLIC_ prefix + unit_price column)

**Known Tech Debt:**
- `WizardContext.tsx:455` - React hooks ref mutation pattern (non-blocking)
- `ContactStep.tsx:17` - setState in useEffect (non-blocking, works correctly)

---

## Known Issues

### ~~CRITICAL: Payment Tier Not Propagating to Stores~~ ✅ FIXED (Dec 23, 2024)

**Status:** RESOLVED

The webhook now properly updates `store.payment_tier` in addition to `user.payment_tier`. Multi-store users can select which store receives the tier during checkout via `store_id` in metadata.

---

## Payment Tiers

### Pricing Structure

| Tier | Price | Product Limit | Features |
|------|-------|---------------|----------|
| **Starter** | $149 (one-time) | 10 products | Core features, 3 basic themes |
| **Pro** | $299 (one-time) | Unlimited | Analytics, premium themes, custom domain, priority support |
| **Hosted** | $149 + $19/mo | Unlimited | All Pro features + managed hosting, auto-updates, backups |

### Feature Flags (Environment Variables)

Set during deployment based on `store.payment_tier`.
**IMPORTANT:** All use `NEXT_PUBLIC_` prefix so they're accessible in client components:

```env
NEXT_PUBLIC_PAYMENT_TIER=starter|pro|hosted
NEXT_PUBLIC_MAX_PRODUCTS=10|unlimited
NEXT_PUBLIC_CUSTOM_DOMAIN_ENABLED=true|false
NEXT_PUBLIC_ANALYTICS_ENABLED=true|false
NEXT_PUBLIC_PREMIUM_THEMES_ENABLED=true|false
```

### Implementation Files

| File | Purpose |
|------|---------|
| `/lib/vercel.ts` | `buildEnvironmentVariables()` - Sets tier env vars during deployment |
| `/templates/hosted/hooks/useFeatureFlags.ts` | React hook to access feature flags |
| `/templates/hosted/lib/products.ts` | Product limit enforcement functions |
| `/templates/hosted/components/UpgradePrompt.tsx` | Upgrade prompts for gated features |

---

## User Journey (Simplified)

### New Flow (One-Click Deploy)
```
Landing → "Try Free" CTA → /auth/signup → Email verification → /wizard
  → Complete all 8 steps (including Stripe Connect)
  → Click "Generate Store" → [PAYMENT GATE MODAL]
  → Select tier → Stripe Checkout → Payment
  → Preview page → Click "Deploy Now"
  → Store live at subdomain.gosovereign.io in ~60 seconds
```

### Alternative: Self-Host (Download ZIP)
```
Same flow as above, but instead of "Deploy Now":
  → Click "Download ZIP"
  → Extract, npm install, deploy manually
```

---

## Technical Architecture

### Stack
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe + Stripe Connect + Stripe Checkout Sessions
- **Email:** Resend (transactional emails)
- **Deployment (Platform):** Vercel (stores deploy to platform account)
- **Icons:** Lucide React

### Project Structure (Current)
```
gosovereign/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Homepage
│   ├── a/page.tsx                  # Landing variant A
│   ├── b/page.tsx                  # Landing variant B
│   ├── faq/page.tsx                # FAQ page (v5.0)
│   ├── contact/page.tsx            # Contact form page (v5.0)
│   ├── terms/page.tsx              # Terms of Service (v5.0)
│   ├── privacy/page.tsx            # Privacy Policy (v5.0)
│   ├── success/page.tsx            # Post-payment success
│   ├── cancel/page.tsx             # Checkout cancelled
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Registration
│   │   └── callback/route.ts       # OAuth callback
│   ├── wizard/
│   │   ├── page.tsx                # Main wizard (with payment gate)
│   │   └── preview/page.tsx        # Preview + One-Click Deploy
│   ├── api/
│   │   ├── checkout/
│   │   │   ├── route.ts            # Create Checkout Session
│   │   │   └── session/route.ts    # Get session details
│   │   ├── contact/route.ts        # Contact form API (v5.0)
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts     # Stripe webhook handler
│   │   ├── stripe/
│   │   │   ├── connect/route.ts    # Initiate Stripe Connect
│   │   │   └── callback/route.ts   # Stripe Connect callback
│   │   ├── deploy/
│   │   │   ├── execute/route.ts    # One-click deploy endpoint
│   │   │   └── status/route.ts     # Deployment status polling
│   │   ├── subdomain/
│   │   │   └── check/route.ts      # Subdomain availability check
│   │   ├── generate/route.ts       # Generate store ZIP
│   │   └── debug/route.ts          # Debug endpoint
│   └── globals.css
├── components/
│   ├── landing/                    # Landing page sections
│   ├── contact/ContactForm.tsx     # Contact form component (v5.0)
│   ├── payment/                    # Payment UI components
│   ├── wizard/                     # Wizard steps & context
│   └── ui/                         # Reusable components
├── content/
│   ├── copy.ts                     # Landing page copy
│   └── legal.ts                    # Terms & Privacy content (v5.0)
├── hooks/
│   ├── usePaymentStatus.ts         # Payment status hook
│   └── useSubscriptionStatus.ts    # Subscription status for hosted tier
├── lib/
│   ├── supabase/                   # Supabase clients
│   ├── supabase.ts                 # Database operations
│   ├── vercel.ts                   # Vercel deployment (with tier env vars)
│   ├── checkout.ts                 # Checkout utilities
│   ├── store-generator.ts          # Template replacement
│   ├── slugify.ts                  # Subdomain slugification utility
│   └── utils.ts
├── types/
│   └── database.ts                 # TypeScript interfaces
├── templates/
│   └── hosted/                     # Primary store template (PRODUCTION)
│       ├── app/
│       │   ├── admin/              # Admin dashboard
│       │   │   ├── analytics/      # Analytics dashboard (Pro) (v6.0)
│       │   │   ├── settings/       # Settings with Appearance + Guides tabs
│       │   │   ├── reviews/        # Reviews management
│       │   │   └── reset-password/ # Password reset
│       │   ├── wishlist/page.tsx   # Wishlist page
│       │   └── api/
│       │       └── admin/analytics/ # Analytics API (v6.0)
│       ├── hooks/
│       │   └── useFeatureFlags.ts  # Feature flag access
│       ├── lib/
│       │   ├── themes.ts           # Theme presets and CSS generation (v6.0)
│       │   ├── products.ts         # Product limit enforcement
│       │   └── store.ts            # Store config
│       └── components/
│           ├── UpgradePrompt.tsx   # Tier upgrade prompts
│           ├── WishlistContext.tsx # Wishlist state
│           └── ProductCard.tsx     # Product cards with wishlist
├── scripts/
│   └── supabase-setup.sql          # Database setup
├── middleware.ts                   # Route protection
├── PROMPTS.md                      # Implementation prompts (v3.0)
├── PROMPTS_v2.md                   # Architecture documentation
└── .env.example
```

### Template Structure

**IMPORTANT:** The `templates/hosted/` folder is the PRIMARY production template. This folder is synced to `gosovereign/storefront-template` on GitHub for Vercel deployments.

```
templates/
├── hosted/         # PRIMARY - Full production template with admin dashboard
├── goods/          # E-commerce for physical products (variant)
├── services/       # Service-based business template (variant)
├── brochure/       # Portfolio/information site template (variant)
└── starter/        # LEGACY - Basic template (deprecated)
```

### Files Removed (One-Click Deployment Migration)
- `/app/api/deploy/github/route.ts` - No longer needed
- `/app/api/auth/github/callback/route.ts` - No longer needed
- `/app/api/deploy/vercel/route.ts` - No longer needed
- `/app/api/auth/vercel/callback/route.ts` - No longer needed
- `/app/dashboard/deploy/page.tsx` - Merged into preview page
- `/lib/github.ts` - No longer needed

---

## One-Click Deployment Architecture

### How It Works
1. User clicks "Deploy Now" on preview page
2. Frontend calls `POST /api/deploy/execute`
3. Backend uses **platform's** `VERCEL_API_TOKEN` (not user OAuth)
4. Creates Vercel project from template repo
5. Sets environment variables (store config, Supabase, Stripe, **tier flags**)
6. Adds subdomain alias (`store.gosovereign.io`)
7. Triggers deployment
8. Frontend polls `/api/deploy/status` until READY
9. Shows live store URL

### Key Files
- `/lib/vercel.ts` - `deployStore()` and `buildEnvironmentVariables()` functions
- `/app/api/deploy/execute/route.ts` - One-click deploy endpoint
- `/app/api/deploy/status/route.ts` - Status polling endpoint
- `/app/wizard/preview/page.tsx` - Deploy UI with status polling

### Environment Variables (Platform)
```env
# Vercel Platform Deployment (Required)
VERCEL_API_TOKEN=xxx              # Your Vercel API token (full account scope)
VERCEL_TEAM_ID=team_xxx           # Optional, if using team account

# Store Configuration
STORE_DOMAIN=gosovereign.io       # Base domain for customer stores
GITHUB_TEMPLATE_REPO=gosovereign/storefront-template  # Template to deploy

# Email (Required for password reset)
RESEND_API_KEY=re_xxx             # Resend API key for transactional email
```

### External Dependencies
1. **Template Repository** - `gosovereign/storefront-template` must exist on GitHub (synced from `/templates/hosted/`)
2. **Vercel-GitHub Connection** - Vercel account must have access to template repo
3. **DNS** - `*.gosovereign.io` should CNAME to Vercel (or use auto-generated URLs)

---

## Database Schema

### Tables (Supabase)
```
users           - Extended auth.users profile (with payment_tier field)
stores          - One per user, config JSONB, deployment status, payment_tier
products        - Separate table, linked to store_id
orders          - Customer orders
order_items     - Line items
subscriptions   - Hosted tier recurring billing
wizard_progress - Tracks wizard state
purchases       - Platform purchases (payment records)
deployment_logs - Deployment history and status
```

### Payment Tier Fields
```sql
users.payment_tier         TEXT     -- 'starter', 'pro', 'hosted' (set by webhook)
stores.payment_tier        TEXT     -- Synced from user during checkout ✅ FIXED
```

### Store Deployment Fields
```sql
stores.status              TEXT     -- 'draft', 'deploying', 'deployed', 'failed'
stores.deployment_url      TEXT     -- Live URL (e.g., https://store.gosovereign.io)
stores.vercel_project_id   TEXT     -- Vercel project ID
stores.vercel_deployment_id TEXT    -- Current deployment ID
stores.deployed_at         TIMESTAMPTZ
stores.subdomain           TEXT     -- Auto-generated from store name (slugified)
```

### Subscription Fields (Hosted Tier)
```sql
stores.subscription_status  TEXT    -- 'active', 'past_due', 'cancelled', 'none'
stores.subscription_ends_at TIMESTAMPTZ  -- Grace period end for cancelled
stores.can_deploy           BOOLEAN -- Restricts deployment for lapsed subscriptions
```

---

## Environment Variables (Complete)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
NEXT_PUBLIC_APP_URL=https://gosovereign.io

# Vercel Platform Deployment
VERCEL_API_TOKEN=xxx
VERCEL_TEAM_ID=team_xxx

# Store Configuration
STORE_DOMAIN=gosovereign.io
GITHUB_TEMPLATE_REPO=gosovereign/storefront-template

# Email (Required for password reset and contact form)
RESEND_API_KEY=re_xxx
PLATFORM_EMAIL=info@gosovereign.io  # Contact form recipient (v5.0)

# Shipping (v5.0 - set during store deployment)
SHIPPING_COUNTRIES=US,CA,GB,AU      # Comma-separated ISO codes for Stripe checkout
```

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

---

## Next Steps

### Recommended for Next Session (High Priority)

1. **End-to-End Tier Testing** ⚠️ CRITICAL
   - Deploy a Starter store and verify `MAX_PRODUCTS=10` is set
   - Deploy a Pro store and verify `MAX_PRODUCTS=unlimited` is set
   - Test that Analytics page shows/hides based on tier
   - Test that premium themes are locked for Starter, unlocked for Pro
   - Test product limit enforcement (Starter: 11th product blocked)

2. **Custom Domain Settings UI** (Pro Feature)
   - Currently documented in Guides tab as markdown
   - Build in-app UI at `/admin/settings` for Pro users to:
     - Add custom domain
     - See DNS verification status
     - Request SSL provisioning via Vercel API

### Medium Priority

3. **Email Notifications in Template**
   - Order confirmation emails via Resend
   - Shipping update notifications
   - Infrastructure already exists (`lib/email.ts` in template)

4. **Account Settings Page**
   - User profile management on platform side
   - Email change, password update
   - Account deletion (GDPR)

5. **Inventory Alerts**
   - Low stock notifications in admin dashboard
   - Configurable threshold per product

### Lower Priority (Future Growth)

6. **Digital Products Support** - Download delivery for digital goods
7. **Customer Accounts** - Optional login for order history
8. **Multi-currency** - International store support
9. **Platform Admin Dashboard** - Internal tool for managing all stores
10. **Coupon/Discount System** - Promo codes for stores
11. **Store Migration** - Import from Shopify/WooCommerce

### Tech Debt (Non-Blocking)

- Fix React hooks pattern in `WizardContext.tsx:455` (ref mutation after hook)
- Fix setState in useEffect in `ContactStep.tsx:17` (use useMemo instead)
- Consider migrating `<img>` to Next.js `<Image>` for optimization (7 instances)

---

## Testing Checklist

### Payment Tier Flow
- [x] Purchase Starter tier → `user.payment_tier` = "starter"
- [x] Purchase Starter tier → `store.payment_tier` = "starter" ✅ FIXED
- [ ] Deploy Starter store → `MAX_PRODUCTS=10` env var set
- [ ] Deploy Pro store → `MAX_PRODUCTS=unlimited` env var set
- [ ] Starter store → Adding 11th product shows upgrade prompt
- [x] Pro store → Analytics page accessible (not gated) ✅ VERIFIED
- [x] Pro store → All 6 themes available in Appearance tab ✅ VERIFIED
- [ ] Starter store → Premium themes locked with upgrade prompt

### Subdomain Naming
- [x] New store gets slugified subdomain (e.g., "Goobers Movers" → `goobers-movers`)
- [x] Availability check shows green checkmark / red X
- [x] Reserved words blocked (www, api, admin, etc.)
- [x] Subdomain updates in database when store name changes

### Subscription Lifecycle (Hosted Tier)
- [ ] Monthly renewal → `subscription_status: 'active'`
- [ ] Payment failure → `can_deploy: false`, store still works
- [ ] Cancellation → grace period until `subscription_ends_at`
- [ ] Resubscribe → `can_deploy: true` restored

### BOGO Store Selection
- [ ] Before Feb 1, 2026: Users can create 2 stores
- [ ] Multi-store user sees store selector during checkout
- [ ] Selected store receives payment tier

### One-Click Deploy Flow
- [x] Complete wizard with Stripe Connect
- [x] Click "Deploy Now" on preview
- [x] See deployment progress
- [x] Store goes live at `subdomain.gosovereign.io`
- [x] Verify store loads correctly

### Download ZIP Flow
- [ ] Click "Download ZIP" on preview
- [ ] Extract and run locally
- [ ] Deploy manually to Vercel

### Password Reset (Fixed)
- [ ] Request password reset
- [ ] Email sends successfully (requires RESEND_API_KEY)
- [ ] If email fails, API returns 500 error (not success)
- [ ] Reset link works and password updates

### Edge Cases
- [ ] Store already deployed (should show existing URL)
- [ ] Deployment fails (should show error, allow retry)
- [ ] Network timeout during polling

---

## Documentation Files

| File | Purpose | Last Updated |
|------|---------|--------------|
| `CLAUDE.md` | Project context and version history (this file) | Dec 27, 2025 |
| `PROMPTS.md` | Granular implementation prompts (v3.0) | Dec 22, 2024 |
| `PROMPTS_v2.md` | Architecture documentation and runbook | Dec 22, 2024 |

---

## Session Summary (Dec 28, 2025)

### Session 4 - Custom Domain Settings UI (v8.3)

**What was done:**
- Built Custom Domain Settings UI for Pro/Hosted tier users
  - New "Domain" tab in `/admin/settings` page (only visible for Pro/Hosted)
  - `/api/admin/domain` endpoint with GET/POST/DELETE methods
  - Saves `custom_domain` to `stores` table in database
  - Current subdomain URL display with external link
  - Custom domain input with validation and save functionality
  - Domain status indicator (pending configuration)
  - Inline DNS configuration instructions (CNAME and A records)
  - Download guide button (reuses existing markdown guide)
  - Feature gated behind `customDomainEnabled` flag

**Files created:**
- `templates/hosted/app/api/admin/domain/route.ts` - Domain management API

**Files modified:**
- `templates/hosted/app/admin/settings/page.tsx` - Added Domain tab with full UI

**Testing:**
- TypeScript check passed on both template and main project

### Session 3 - Analytics Fix (v8.2)

**What was done:**
- Fixed Analytics API 500 error - database query used wrong column name
  - Changed `price_at_time` → `unit_price` to match actual `order_items` schema
  - File: `templates/hosted/app/api/admin/analytics/route.ts`
- Added `export const dynamic = "force-dynamic"` to prevent static rendering errors:
  - `templates/hosted/app/api/products/search/route.ts`
  - `templates/hosted/app/api/admin/analytics/route.ts`
- **Pro tier fully verified working**: Analytics page loads, premium themes unlocked

**Commits:**
- `dff9809` - fix: Use correct column name in analytics query
- `6575bb2` - chore: Update hosted template submodule

### Session 2 - Tier Fix (v8.1)

**What was done:**
- **CRITICAL FIX:** Tier feature flags now accessible in client components
  - Root cause: `useFeatureFlags()` was reading `process.env.PAYMENT_TIER` but this env var was NOT prefixed with `NEXT_PUBLIC_`, making it undefined on the client side
  - All tier env vars in `lib/vercel.ts` now use `NEXT_PUBLIC_` prefix
  - Updated `useFeatureFlags()` hook in template to read `NEXT_PUBLIC_*` vars

**Files changed:**
- `lib/vercel.ts` - Changed all tier env var keys to use `NEXT_PUBLIC_` prefix
- `templates/hosted/hooks/useFeatureFlags.ts` - Updated to read `NEXT_PUBLIC_*` env vars

### Session 1 - Pre-Launch Polish (v8.0)

**What was done:**
- Password UX improvements (visibility toggle, confirm field)
- Spam folder warnings on signup and purchase success screens
- Stripe Connect URL modal with subdomain explanation and copy button
- Template Terms & Privacy pages with store-specific legal content
- Testimonials component displaying featured store-wide reviews
- Reviews admin product dropdown fix (was missing auth token)
- Footer logo brightness fix and Apple Pay icon SVG fix
- Dynamic caching for featured reviews API

---

## Recommendations for Next Session

### High Priority (Launch Blockers)

1. **Deploy a Starter Tier Store** - Verify product limits work
   - Deploy store with `payment_tier: starter`
   - Confirm `NEXT_PUBLIC_MAX_PRODUCTS=10` is set
   - Test adding 11th product shows upgrade prompt
   - Confirm premium themes are locked

2. **Redeploy Platform (gosovereign.io)** - If not done already
   - The `lib/vercel.ts` changes need to be live on the platform
   - New store deployments will then get correct `NEXT_PUBLIC_*` env vars automatically
   - Existing stores need manual env var updates OR redeploy

### Medium Priority (Post-Launch)

3. **Email Notifications**
   - Order confirmation emails (infrastructure exists in `lib/email.ts`)
   - Shipping update notifications
   - Low stock alerts

4. **Platform Admin Dashboard**
   - Internal tool to manage all deployed stores
   - View deployment status, tier breakdown, revenue

### Lower Priority (Future)

5. Digital products support
6. Customer accounts
7. Multi-currency
8. Coupon/discount system
9. Store migration (Shopify/WooCommerce import)

---

*Last Updated: December 28, 2025*
*Version: 8.3*
*Status: Production Ready (Pro Tier Verified, Custom Domain UI Complete)*
*Next: Email notifications, Platform admin dashboard*
*This file is the source of truth for all project context.*
