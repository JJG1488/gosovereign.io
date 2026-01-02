# CLAUDE.md — GoSovereign Project Context

> **IMPORTANT:** This file is the source of truth for active development.
> For version history and session logs, see `CLAUDE-HISTORY.md`.

**Current Version: 9.29** | **Last Updated: January 2, 2026**

---

## Project Identity

**Product Name:** GoSovereign
**Domain:** gosovereign.io
**Tagline:** "Go Sovereign. Own Everything."
**One-Liner:** Private e-commerce stores for a one-time price. No subscriptions. No code. No landlords.

---

## Current State (January 2026)

### Phase: LAUNCHED + FEATURE EXPANSION (v9.19)

**Core Platform:**
- Landing page with A/B variants (`/a`, `/b`)
- **Mini-Wizard in Hero** (3-step interactive preview with live mockup)
- **Screenshot Gallery** ("What You'll Build" section)
- **Video placeholder** in How It Works (ready for walkthrough)
- 8-step configuration wizard (`/wizard`) with prefill param support
- Supabase Auth (signup/login with magic links)
- Image uploads to Supabase Storage
- Stripe Connect OAuth for store owners
- One-click deployment to platform Vercel
- Download ZIP for self-hosting
- Documentation site (`/docs`) with MDX pages
- **Multi-template architecture** (Products, Services, Brochure)

**Payment & Tiers:**
- Stripe Checkout Sessions with webhook verification
- 3-tier pricing (Starter $149, Pro $299, Hosted $149+$19/mo)
- Tier-based feature gating via `NEXT_PUBLIC_*` env vars
- Subscription management for Hosted tier

**Store Features (Template):**
- Product catalog with variants (Size, Color, etc.)
- Per-variant inventory tracking
- Digital products with signed download URLs
- Coupon/discount system
- Shopping cart with variant support
- Stripe Checkout with shipping address collection
- Order management with email notifications
- Customer reviews and ratings
- Wishlist functionality
- Analytics dashboard (Pro)
- Premium themes (Pro)
- Custom domain settings (Pro)
- AI product copywriting
- Media banner (YouTube/video/image)
- Customer accounts (optional login, order history, saved addresses)
- Checkout address pre-fill (logged-in customers can use saved addresses)
- Abandoned cart recovery (manual trigger from admin, recovery emails)
- Gift cards (purchase, redeem at checkout, balance check, stackable with coupons)
- Multi-currency support (60+ Stripe currencies, zero-decimal handling)
- Collections/Categories (products can belong to multiple collections)

**Admin Features:**
- Platform Admin Dashboard (`/platform-admin`)
- Store admin with mobile-optimized UX
- Runtime settings (no redeploy needed)
- Low stock email alerts
- Bulk store redeploy
- Bulk product import via CSV
- Shopify import (auto-detect format, variant support, image download)
- WooCommerce import (variable products, variations, up to 10 attributes)
- BigCommerce import (Item Type detection, SKU variants, 10 image columns)
- Abandoned Carts page (view abandoned carts, send recovery emails)
- Gift Cards management (list, detail, manual issuance, resend emails)
- Collections management (create, edit, assign products, reorder)

**User Account Features:**
- Account Settings page (`/account/settings`)
- Change email with re-verification
- Change password (requires current password)
- Delete account with GDPR compliance (cascading deletion)

**Recent Changes (v9.8-9.17):**
- v9.8: Account Settings Page - email/password change, account deletion
- v9.9: Customer Accounts - login, registration, order history, saved addresses
- v9.10: Checkout Address Pre-fill - logged-in customers use saved addresses, email pre-fill
- v9.11: Documentation Site - `/docs` with MDX, 12 pages covering all features
- v9.12: Abandoned Cart Recovery - server sync for logged-in customers, admin page, recovery emails
- v9.13: Gift Cards - purchase page, checkout redemption, balance check, admin management, email delivery
- v9.14: Shopify Import - auto-detect Shopify CSV, variant support, image download, format selector
- v9.15: Order Detail Mobile Polish - 44px touch targets, Lucide icons, responsive spacing
- v9.16: Multi-Currency - 60+ currencies grouped by region, zero-decimal handling, admin selector
- v9.17: WooCommerce Import - variable products, variations, Parent linking, up to 10 attributes
- v9.18: BigCommerce Import - Item Type/SKU row detection, variant support, 10 image columns
- v9.19: Services Template MVP - complete services template, multi-template deployment, repo mapping fixes
- v9.20: Brochure Template - complete portfolio/information site template, env-var approach, admin dashboard
- v9.21: Visitor Education Initiative - documented 5-phase plan to educate visitors (market validation confirmed)
- v9.22: Visitor Education Phase 1 + Mini-Wizard - Screenshot gallery, video placeholder, interactive 3-step mini-wizard with live preview

**Known Tech Debt:**
- `WizardContext.tsx:455` - React hooks ref mutation pattern (non-blocking)
- `ContactStep.tsx:17` - setState in useEffect (non-blocking)

---

## Active Bug Tracker (v9.23)

### CRITICAL: Template Deployment Bugs (Blocks All Template Users)

| # | Issue | Root Cause | Status |
|---|-------|------------|--------|
| **BUG-1** | Brochure deploys with Goods template look | Brochure template not consuming `NEXT_PUBLIC_BRAND_COLOR` | **FIXED** ✅ |
| **BUG-2** | Custom color not carrying to brochure site | Same as BUG-1 - CSS vars not wired | **FIXED** ✅ |
| **BUG-3** | Services template - colors and services not showing | Env vars not consumed in services template | **FIXED** ✅ |
| **BUG-4** | Services stores don't create | Wizard was resuming existing store instead of creating new with urlTemplate | **FIXED** ✅ |

### HIGH: Wizard UX Issues

| # | Issue | Status |
|---|-------|--------|
| **WIZ-1** | Template selector shows "Coming Soon" for brochure/services | **FIXED** ✅ |
| **WIZ-2** | Brochure Step 2 asks "what do you sell" (wrong copy) | **FIXED** ✅ (TaglineStep now template-aware) |
| **WIZ-3** | Brochure Step 5 asks to "add a product" (verify PortfolioStep routing) | **VERIFIED** ✅ (PortfolioStep exists and routes correctly) |
| **WIZ-4** | Add AI "Enhance" button to TaglineStep (Step 2) | **DONE** ✅ |
| **WIZ-5** | Add AI "Enhance" button to AboutStep (Step 6) | **DONE** ✅ |

### MEDIUM: Feature Requests

| # | Issue | Details | Status |
|---|-------|---------|--------|
| **FEAT-1** | Collections/Categories admin page | Products can belong to multiple collections. Admin creates collections, assigns products via dropdown. Customer sees `/collections` page with grouped products. | **DONE** ✅ |
| **FEAT-2** | Order confirmation emails not sending | Root cause: stores needed STRIPE_WEBHOOK_SECRET. Fixed with fallback order creation on success page. | **FIXED** ✅ |

### DEFERRED: Questions Answered

| # | Question | Answer |
|---|----------|--------|
| **Q1** | What if no Stripe before deploy? | Brochure has no Payments step. Goods/Services require it for wizard completion. |
| **Q2** | Need captchas? | Defer to V2. Add Cloudflare Turnstile if spam becomes an issue. |

### Execution Priority

1. ~~**Session 1:** BUG-1, BUG-2, BUG-3 (template deployment fixes)~~ ✅ DONE
2. ~~**Session 2:** BUG-4, WIZ-2, WIZ-3 (services creation, template-conditional UX)~~ ✅ DONE
3. ~~**Session 3:** WIZ-4, WIZ-5 (AI enhance buttons)~~ ✅ DONE
4. ~~**Session 4:** FEAT-2 (order emails - fallback order creation)~~ ✅ DONE
5. ~~**Session 5:** FEAT-1 (collections)~~ ✅ DONE

---

## Payment Tiers

| Tier | Price | Product Limit | Features |
|------|-------|---------------|----------|
| **Starter** | $149 (one-time) | 10 products | Core features, 3 basic themes |
| **Pro** | $299 (one-time) | Unlimited | Analytics, premium themes, custom domain, priority support |
| **Hosted** | $149 + $19/mo | Unlimited | All Pro features + managed hosting, auto-updates, backups |

### Feature Flags (Environment Variables)

**IMPORTANT:** All use `NEXT_PUBLIC_` prefix for client-side access:

```env
NEXT_PUBLIC_PAYMENT_TIER=starter|pro|hosted
NEXT_PUBLIC_MAX_PRODUCTS=10|unlimited
NEXT_PUBLIC_CUSTOM_DOMAIN_ENABLED=true|false
NEXT_PUBLIC_ANALYTICS_ENABLED=true|false
NEXT_PUBLIC_PREMIUM_THEMES_ENABLED=true|false
NEXT_PUBLIC_STORE_CURRENCY=USD|EUR|GBP|JPY|...
```

### Implementation Files

| File | Purpose |
|------|---------|
| `/lib/vercel.ts` | `buildEnvironmentVariables()` - Sets tier env vars during deployment |
| `/templates/hosted/hooks/useFeatureFlags.ts` | React hook to access feature flags |
| `/templates/hosted/lib/products.ts` | Product limit enforcement functions |
| `/templates/hosted/lib/currencies.ts` | Currency data, formatPrice(), zero-decimal handling |
| `/templates/hosted/lib/shopify-csv-parser.ts` | Shopify CSV format detection and parsing |
| `/templates/hosted/lib/woocommerce-csv-parser.ts` | WooCommerce CSV format detection and parsing |
| `/templates/hosted/lib/bigcommerce-csv-parser.ts` | BigCommerce CSV format detection and parsing |

---

## Technical Architecture

### Stack
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe + Stripe Connect + Stripe Checkout Sessions
- **Email:** Resend (transactional emails)
- **Deployment:** Vercel (stores deploy to platform account)
- **Icons:** Lucide React

### Key Directories
```
gosovereign/
├── app/                    # Platform pages (landing, wizard, auth)
├── components/             # Platform components
├── lib/                    # Platform utilities (vercel.ts, supabase.ts)
├── templates/
│   ├── hosted/             # E-commerce template (products) → JJG1488/storefront-template
│   ├── services/           # Services business template → JJG1488/services-template
│   └── brochure/           # Brochure/portfolio template → JJG1488/brochure-template
├── scripts/                # Database setup SQL
└── CLAUDE-HISTORY.md       # Version history & session logs
```

**Template Sync:**
- `templates/hosted/` syncs to `JJG1488/storefront-template` on GitHub
- `templates/services/` syncs to `JJG1488/services-template` on GitHub
- `templates/brochure/` syncs to `JJG1488/brochure-template` on GitHub
- Template selection based on `store.template` field ("goods", "services", "brochure")

### Checkout Address Pre-fill (v9.10)
Key files for saved address checkout:
- `templates/hosted/components/AddressSelector.tsx` - Address selection UI
- `templates/hosted/app/cart/page.tsx` - Cart with address selector for logged-in users
- `templates/hosted/app/api/checkout/route.ts` - Accepts savedAddressId, pre-fills email
- `templates/hosted/app/api/webhooks/stripe/route.ts` - Uses saved address from metadata

---

## One-Click Deployment

### How It Works
1. User clicks "Deploy Now" on preview page
2. Backend uses platform's `VERCEL_API_TOKEN`
3. Creates Vercel project from template repo
4. Sets environment variables (store config, tier flags)
5. Adds subdomain alias (`store.gosovereign.io`)
6. Frontend polls until READY

### Key Files
- `/lib/vercel.ts` - `deployStore()` and `buildEnvironmentVariables()`
- `/app/api/deploy/execute/route.ts` - Deploy endpoint
- `/app/api/deploy/status/route.ts` - Status polling

---

## Database Schema

### Core Tables
```
users           - Extended auth.users profile (payment_tier)
stores          - Store config JSONB, deployment status, payment_tier
products        - Product catalog linked to store_id
product_variants - Per-variant inventory and pricing
orders          - Customer orders with discount tracking
order_items     - Line items with variant_info
coupons         - Promo codes with usage limits
subscriptions   - Hosted tier recurring billing
abandoned_carts - Cart sync for logged-in customers (recovery emails)
gift_cards      - Gift card codes, balances, recipient info
gift_card_transactions - Redemption history for gift cards
```

### Key Fields
```sql
stores.payment_tier        TEXT     -- 'starter', 'pro', 'hosted'
stores.status              TEXT     -- 'draft', 'deploying', 'deployed', 'failed'
stores.deployment_url      TEXT     -- Live URL
stores.subdomain           TEXT     -- Auto-generated from store name
```

---

## Environment Variables

### Platform (gosovereign.io)
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

# Vercel Deployment
VERCEL_API_TOKEN=xxx
VERCEL_TEAM_ID=team_xxx
STORE_DOMAIN=gosovereign.io
GITHUB_TEMPLATE_REPO=gosovereign/storefront-template

# Email
RESEND_API_KEY=re_xxx
PLATFORM_EMAIL=info@gosovereign.io

# Admin
PLATFORM_ADMIN_EMAILS=info@gosovereign.io
```

---

## Testing Checklist

### Payment Tier Flow
- [x] Purchase Starter tier → `store.payment_tier` = "starter"
- [ ] Deploy Starter store → `MAX_PRODUCTS=10` env var set
- [ ] Starter store → Adding 11th product shows upgrade prompt
- [x] Pro store → Analytics page accessible
- [x] Pro store → All 6 themes available

### One-Click Deploy Flow
- [x] Complete wizard with Stripe Connect
- [x] Click "Deploy Now" on preview
- [x] Store goes live at `subdomain.gosovereign.io`

### Subscription Lifecycle (Hosted Tier) ✅ VERIFIED
- [x] Monthly renewal → `subscription_status: 'active'`, `can_deploy: true`
- [x] Payment failure → `subscription_status: 'past_due'`, `can_deploy: false`
- [x] Cancellation → `subscription_status: 'cancelled'`, grace period until `subscription_ends_at`
- [x] Resubscription → restores `active` status and `can_deploy: true`
- [x] Deploy flow checks `can_deploy` and returns appropriate error messages

---

## Documentation Site (`/docs`)

MDX-based documentation at `gosovereign.io/docs`:

```
app/docs/
├── layout.tsx              # Sidebar navigation
├── page.mdx                # Introduction
├── getting-started/        # First 15 minutes guide
├── tiers/                  # Pricing comparison
└── features/
    ├── products/           # Products, variants, inventory
    ├── orders/             # Order management
    ├── coupons/            # Discount codes
    ├── themes/             # Appearance (Pro)
    ├── analytics/          # Dashboard (Pro)
    ├── domains/            # Custom domains (Pro)
    ├── digital-products/   # Downloadable files
    ├── customer-accounts/  # Account system
    └── settings/           # Store configuration
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Active project context (this file) |
| `CLAUDE-HISTORY.md` | Version history, key decisions, session logs |
| `PROMPTS.md` | Implementation prompts (v3.0) |
| `PROMPTS_v2.md` | Architecture documentation |

---

## Recommendations for Next Session

### Completed (v9.7)

All major e-commerce features built:
- Tier-based feature gating
- Custom domain settings (Pro)
- Analytics dashboard (Pro)
- Premium themes (Pro)
- Email notifications
- Platform Admin Dashboard
- Media Banner
- Mobile UX (admin + storefront)
- Runtime settings
- Digital Products
- AI Copywriting
- Inventory Management
- Domain Verification
- Coupon/Discount System
- Product Variants
- Bulk Product Import
- **Subscription Billing (Verified)**
- **Account Settings Page (v9.8)**
- **Customer Accounts (v9.9)**
- **Checkout Address Pre-fill (v9.10)**
- **Documentation Site (v9.11)**
- **Abandoned Cart Recovery (v9.12)**
- **Gift Cards (v9.13)**
- **Shopify Import (v9.14)**
- **Multi-Currency (v9.16)**
- **WooCommerce Import (v9.17)**
- **BigCommerce Import (v9.18)**
- **Services Template MVP (v9.19)**
- **Brochure Template (v9.20)**
- **Visitor Education Phase 1 (v9.22)** - Screenshot gallery, video placeholder, demo links
- **Mini-Wizard (v9.22)** - 3-step interactive preview with live mockup, prefill to full wizard

### Remaining Tasks

1. **Advanced Analytics** - Conversion funnels, cohorts

**Note:** Storefront Search is already implemented (`SearchModal.tsx` + `/api/products/search`)
**Note:** Store migration now supports Shopify (v9.14), WooCommerce (v9.17), and BigCommerce (v9.18)
**Note:** All three templates now complete: Products (goods), Services, Brochure

### Storage Setup Reminder

- `store-videos` bucket for video uploads
- `digital-products` bucket for digital downloads (private)

---

## Visitor Education Initiative (v9.21)

> **Market Validation:** People WANT this product but don't fully understand what it is.
> The landing page communicates WHY (cost savings, ownership) but fails to show WHAT (the actual product, wizard, finished stores).

### Current Gaps Identified

1. **No Visual Proof** - Zero screenshots of wizard, admin, or finished stores
2. **No Live Examples** - No demo store links to browse
3. **No Wizard Preview** - Can't see the experience before committing
4. **Template Confusion** - 3 templates mentioned but no visual differentiation
5. **High Commitment Required** - Must complete 8 steps + payment before seeing anything
6. **No Social Proof with Links** - Testimonials exist but no actual store links

### Implementation Phases

#### Phase 1: Quick Wins - COMPLETED (v9.22)
| Item | Status |
|------|--------|
| Link existing demo stores in Hero | ✅ Done |
| Screenshot gallery section ("What You'll Build") | ✅ Done |
| Video embed placeholder in How It Works | ✅ Done (placeholder, ready for video URL) |

**Files created/modified:**
- `/components/landing/Hero.tsx` - "See Live Examples" link added
- `/components/landing/ScreenshotGallery.tsx` - New component with 3 placeholder cards
- `/components/landing/HowItWorks.tsx` - Video placeholder with play button

#### Phase 2: Template Showcase (1-2 Days)
| Item | Effort | Impact |
|------|--------|--------|
| Template preview page (`/templates`) | 4-6 hrs | Medium |
| Template gallery on landing page | 2-3 hrs | Medium |
| Deploy demo stores (demo-products, demo-services, demo-portfolio) | 2 hrs | Medium |

**Files to modify:**
- New: `/app/templates/page.tsx` - Enhanced with live previews
- New: `/components/landing/TemplateShowcase.tsx`

#### Phase 3: Interactive Experience - PARTIALLY COMPLETED (v9.22)
| Item | Status |
|------|--------|
| Landing page mini-wizard (3 questions, instant preview) | ✅ Done |
| Wizard preview mode (anonymous until Stripe Connect) | Pending |
| Admin dashboard tour (interactive walkthrough) | Pending |

**Files created/modified:**
- `/components/landing/MiniWizard.tsx` - New 3-step interactive wizard with live preview
- `/components/landing/Hero.tsx` - MiniWizard embedded, replaced HeroCTA
- `/app/wizard/page.tsx` - Accepts prefill_name and prefill_color params

#### Phase 4: Social Proof & Trust (Ongoing)
| Item | Effort | Impact |
|------|--------|--------|
| Customer store gallery (`/showcase`) | 4-6 hrs | Medium |
| Success stories section on landing | 2-3 hrs | Medium |
| Trust badges (Stripe, SSL, "X stores deployed") | 1 hr | Low |

**Files to modify:**
- New: `/app/showcase/page.tsx` - Customer gallery
- New: `/components/landing/SuccessStories.tsx`

#### Phase 5: Advanced Education (Week+)
| Item | Effort | Impact |
|------|--------|--------|
| ROI Calculator (interactive savings calculator) | 4-6 hrs | Medium |
| Feature deep-dive pages (`/features/*`) | 1-2 days | Medium |
| FAQ video answers (30-sec clips) | 2-3 hrs | Low |
| Comparison tool (paste your store URL) | 1 day | Medium |

### Success Metrics

- Bounce rate reduction on landing page
- Wizard completion rate increase
- Time on site increase
- Conversion rate: visitor → paid customer
- Demo store click-through rate

### Execution Priority

1. ~~**Phase 1** - Quick wins with screenshots and demo links~~ ✅ DONE
2. ~~**Phase 3 Item 1** - Mini-wizard on landing (highest impact)~~ ✅ DONE
3. **Deploy demo stores** - Make "See Live Examples" link work (demo-products, demo-services, demo-portfolio)
4. **Real screenshots + video** - Replace placeholders with actual assets
5. **Phase 2** - Template showcase differentiation
6. **Phase 3 Item 2** - Wizard preview mode (anonymous until Stripe Connect)
7. **Phase 4** - Social proof (ongoing as customers deploy)

---

*Version: 9.24 | Status: TEMPLATE FIXES COMPLETE - PUSH TO REPOS REQUIRED*
*See CLAUDE-HISTORY.md for version history and session details.*
