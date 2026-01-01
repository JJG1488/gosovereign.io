# CLAUDE.md — GoSovereign Project Context

> **IMPORTANT:** This file is the source of truth for active development.
> For version history and session logs, see `CLAUDE-HISTORY.md`.

**Current Version: 9.14** | **Last Updated: January 1, 2026**

---

## Project Identity

**Product Name:** GoSovereign
**Domain:** gosovereign.io
**Tagline:** "Go Sovereign. Own Everything."
**One-Liner:** Private e-commerce stores for a one-time price. No subscriptions. No code. No landlords.

---

## Current State (January 2026)

### Phase: LAUNCHED + FEATURE EXPANSION (v9.14)

**Core Platform:**
- Landing page with A/B variants (`/a`, `/b`)
- 8-step configuration wizard (`/wizard`)
- Supabase Auth (signup/login with magic links)
- Image uploads to Supabase Storage
- Stripe Connect OAuth for store owners
- One-click deployment to platform Vercel
- Download ZIP for self-hosting
- Documentation site (`/docs`) with MDX pages

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

**Admin Features:**
- Platform Admin Dashboard (`/platform-admin`)
- Store admin with mobile-optimized UX
- Runtime settings (no redeploy needed)
- Low stock email alerts
- Bulk store redeploy
- Bulk product import via CSV
- Shopify import (auto-detect format, variant support, image download)
- Abandoned Carts page (view abandoned carts, send recovery emails)
- Gift Cards management (list, detail, manual issuance, resend emails)

**User Account Features:**
- Account Settings page (`/account/settings`)
- Change email with re-verification
- Change password (requires current password)
- Delete account with GDPR compliance (cascading deletion)

**Recent Changes (v9.8-9.14):**
- v9.8: Account Settings Page - email/password change, account deletion
- v9.9: Customer Accounts - login, registration, order history, saved addresses
- v9.10: Checkout Address Pre-fill - logged-in customers use saved addresses, email pre-fill
- v9.11: Documentation Site - `/docs` with MDX, 12 pages covering all features
- v9.12: Abandoned Cart Recovery - server sync for logged-in customers, admin page, recovery emails
- v9.13: Gift Cards - purchase page, checkout redemption, balance check, admin management, email delivery
- v9.14: Shopify Import - auto-detect Shopify CSV, variant support, image download, format selector

**Known Tech Debt:**
- `WizardContext.tsx:455` - React hooks ref mutation pattern (non-blocking)
- `ContactStep.tsx:17` - setState in useEffect (non-blocking)

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
```

### Implementation Files

| File | Purpose |
|------|---------|
| `/lib/vercel.ts` | `buildEnvironmentVariables()` - Sets tier env vars during deployment |
| `/templates/hosted/hooks/useFeatureFlags.ts` | React hook to access feature flags |
| `/templates/hosted/lib/products.ts` | Product limit enforcement functions |

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
├── templates/hosted/       # PRIMARY store template (synced to GitHub)
│   ├── app/admin/          # Store admin dashboard
│   ├── components/         # Store components (Cart, Variants, etc.)
│   ├── lib/                # Store utilities (email.ts, settings.ts)
│   └── data/               # Data fetching (products.ts)
├── scripts/                # Database setup SQL
└── CLAUDE-HISTORY.md       # Version history & session logs
```

**Template Sync:** `templates/hosted/` syncs to `gosovereign/storefront-template` on GitHub.

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

### Remaining Tasks

1. **Order Detail Page Mobile** - Minor polish for shipping notification button
2. **Multi-currency** - International store support
3. **WooCommerce Import** - Extend migration support beyond Shopify
4. **Advanced Analytics** - Conversion funnels, cohorts

**Note:** Storefront Search is already implemented (`SearchModal.tsx` + `/api/products/search`)
**Note:** Shopify Import completed in v9.14 (`/admin/products/import` with auto-detect)

### Storage Setup Reminder

- `store-videos` bucket for video uploads
- `digital-products` bucket for digital downloads (private)

---

*Version: 9.14 | Status: LAUNCHED + FEATURE EXPANSION*
*See CLAUDE-HISTORY.md for version history and session details.*
