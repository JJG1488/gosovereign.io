# PROMPTS_v2.md — GoSovereign AI Development Runbook

> **Purpose:** Comprehensive prompts for AI-assisted development of GoSovereign platform.
> **Last Updated:** December 2024
> **Version:** 2.0

Each prompt provides complete context for autonomous task execution including:
- Background and rationale
- All relevant file paths
- Expected outcomes and testing criteria
- Edge cases and error handling

---

## Part A: Architecture Documentation Prompts

---

## Prompt 1: System Overview

### Context

GoSovereign is a multi-tenant SaaS platform that enables users to create and deploy private e-commerce stores. The architecture follows a **platform + storefront** separation pattern where:

- **Platform** (`/gosovereign/`): Handles user onboarding, payment processing, store configuration wizard, and deployment orchestration
- **Storefronts** (`/templates/hosted/`): The actual store applications deployed to customers

This prompt documents the complete system architecture for any developer who needs to understand how GoSovereign works.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GOSOVEREIGN PLATFORM                         │
│                     (gosovereign.io / localhost:3000)                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────────────┐  │
│  │ Landing │ →  │ Signup  │ →  │ Wizard  │ →  │ Deploy to Vercel │  │
│  │ Pages   │    │ /Login  │    │ 8 Steps │    │ (One-Click)      │  │
│  └─────────┘    └─────────┘    └─────────┘    └──────────────────┘  │
│                                      ↓                               │
│                              ┌──────────────┐                        │
│                              │  Supabase    │                        │
│                              │  (Shared DB) │                        │
│                              └──────────────┘                        │
│                                      ↓                               │
└─────────────────────────────────────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      DEPLOYED CUSTOMER STORES                        │
│                   (subdomain.gosovereign.io)                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │ Store A     │    │ Store B     │    │ Store C     │              │
│  │ (Starter)   │    │ (Pro)       │    │ (Hosted)    │              │
│  │ 10 products │    │ Unlimited   │    │ Managed     │              │
│  └─────────────┘    └─────────────┘    └─────────────┘              │
│         ↓                   ↓                   ↓                    │
│                     Same Supabase DB                                 │
│                     (RLS isolates data)                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Files Involved

| File | Purpose |
|------|---------|
| `/app/page.tsx` | Homepage/landing page |
| `/app/wizard/page.tsx` | 8-step configuration wizard |
| `/app/wizard/preview/page.tsx` | Preview and deploy page |
| `/app/api/deploy/execute/route.ts` | One-click deployment endpoint |
| `/lib/vercel.ts` | Vercel deployment functions |
| `/lib/supabase.ts` | Database operations |
| `/middleware.ts` | Route protection and auth |

### Data Flow: User Signup to Live Store

```
1. User lands on gosovereign.io
         ↓
2. Clicks "Try Free" → /auth/signup
         ↓
3. Email verification via Supabase Auth
         ↓
4. Redirected to /wizard (8 steps)
   - Step 1: Store Name
   - Step 2: Tagline
   - Step 3: Brand Color
   - Step 4: Logo Upload
   - Step 5: Products
   - Step 6: About
   - Step 7: Contact Email
   - Step 8: Stripe Connect
         ↓
5. Auto-save to Supabase (debounced)
         ↓
6. Click "Generate Store" → [PAYMENT GATE]
         ↓
7. Select tier → Stripe Checkout
         ↓
8. Payment success → Preview page
         ↓
9. Click "Deploy Now"
         ↓
10. POST /api/deploy/execute
    - Uses platform VERCEL_API_TOKEN
    - Creates Vercel project
    - Sets environment variables
    - Triggers deployment
         ↓
11. Frontend polls /api/deploy/status
         ↓
12. Store live at subdomain.gosovereign.io
```

### Multi-Tenant Isolation

All stores share a single Supabase database. Isolation is achieved through:

1. **Row Level Security (RLS)**: Every table has policies ensuring users only see their own data
2. **Store ID Filtering**: All queries include `WHERE store_id = X`
3. **Environment Variables**: Each deployed store has `NEXT_PUBLIC_STORE_ID` set

**Example RLS Policy:**
```sql
CREATE POLICY "Users can only view their own store products"
ON products FOR SELECT
USING (store_id IN (
  SELECT id FROM stores WHERE user_id = auth.uid()
));
```

### Requirements

- [ ] Understand platform vs storefront separation
- [ ] Know how data flows from wizard to deployment
- [ ] Understand RLS isolation pattern
- [ ] Know key files for each system component

### Testing Checklist

- [ ] Can explain the full user journey from signup to live store
- [ ] Can identify which codebase handles which functionality
- [ ] Can describe how multi-tenant isolation works
- [ ] Can locate key files for any given feature

---

## Prompt 2: Template System

### Context

Templates are pre-built Next.js storefront applications. There are 5 templates in `/templates/`, but only `hosted/` is actively deployed to production.

**Critical Understanding**: The **GitHub repository** gets deployed, NOT the local `/templates/` folder. Changes to local templates must be pushed to GitHub to affect deployed stores.

### Available Templates

| Template | Purpose | Target User | Admin Dashboard | Status |
|----------|---------|-------------|-----------------|--------|
| `hosted/` | Full production storefront | All paying customers | Yes | **Primary** |
| `goods/` | E-commerce for physical products | Product sellers | No | Legacy |
| `services/` | Service-based bookings | Consultants | No | Legacy |
| `brochure/` | Portfolio/information site | Creatives | No | Legacy |
| `starter/` | Baseline template | Development | No | Legacy |

### Hosted Template Structure

```
templates/hosted/
├── app/
│   ├── admin/               # Admin dashboard
│   │   ├── orders/          # Order management
│   │   ├── products/        # Product CRUD
│   │   ├── settings/        # Store settings
│   │   └── reset-password/  # Password reset
│   ├── api/
│   │   ├── admin/           # Admin API routes
│   │   ├── checkout/        # Stripe integration
│   │   └── orders/          # Order processing
│   └── (storefront)/        # Public pages
├── components/              # UI components
├── hooks/
│   └── useFeatureFlags.ts   # Tier-based feature flags
├── lib/
│   ├── email.ts             # Resend integration
│   ├── products.ts          # Product limit utilities
│   ├── store.ts             # Store configuration
│   └── supabase.ts          # Database client
└── types/                   # TypeScript definitions
```

### Deployment Flow

```
User clicks "Deploy Now"
         ↓
Platform calls Vercel API
         ↓
Vercel clones gosovereign/storefront-template from GitHub
         ↓
Vercel sets environment variables (from buildEnvironmentVariables())
         ↓
Vercel builds and deploys
         ↓
Store is live at subdomain.gosovereign.io
```

### Files Involved

| File | Purpose |
|------|---------|
| `/templates/hosted/` | Source template (development) |
| `gosovereign/storefront-template` (GitHub) | Deployed template |
| `/lib/vercel.ts` | `buildEnvironmentVariables()` function |
| `/app/api/deploy/execute/route.ts` | Deployment orchestration |

### Syncing Templates

Local changes must be pushed to GitHub:

```bash
cd templates/hosted
git init  # If not already a repo
git remote add origin https://github.com/gosovereign/storefront-template.git
git add .
git commit -m "Sync template from platform"
git push -u origin main
```

### Requirements

- [ ] Understand why GitHub repo is deployed, not local folder
- [ ] Know the hosted template structure
- [ ] Can sync local changes to GitHub

### Testing Checklist

- [ ] Verify GitHub repo exists: `gosovereign/storefront-template`
- [ ] Compare local `/templates/hosted/` with GitHub
- [ ] Confirm sync process works

---

## Prompt 3: Environment Variables Reference

### Context

Environment variables customize each deployed store without changing source code. They're the bridge between the GoSovereign platform and individual customer stores.

### Variable Categories

**Public Variables (`NEXT_PUBLIC_*`)**:
- Exposed to browser JavaScript
- Safe for display values, IDs, URLs
- Never contain secrets

**Server-Only Variables**:
- Only available in API routes and server components
- Used for secrets (API keys, passwords)

**Encrypted Variables**:
- Stored encrypted at rest by Vercel
- Used for highly sensitive values

### Complete Reference

#### Always Set (Every Deployment)

| Variable | Source | Purpose | Type |
|----------|--------|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Platform `.env` | Database connection | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Platform `.env` | Client-side DB access | Public |
| `NEXT_PUBLIC_STORE_ID` | `store.id` | Identifies store in shared DB | Public |
| `NEXT_PUBLIC_STORE_NAME` | `store.name` | Display name in UI | Public |
| `NEXT_PUBLIC_BRAND_COLOR` | `store.config.branding.primaryColor` | Theme customization | Public |
| `NEXT_PUBLIC_THEME_PRESET` | `store.config.branding.themePreset` | Theme selection | Public |
| `NEXT_PUBLIC_APP_URL` | Computed | Full URL for links | Public |
| `ADMIN_PASSWORD` | Auto-generated | Store admin access | Encrypted |
| `SHIPPING_ENABLED` | `store.config.features` | Feature flag | Plain |
| `TAX_ENABLED` | `store.config.features` | Feature flag | Plain |

#### Tier-Based Variables

| Variable | Starter | Pro | Hosted | Purpose |
|----------|---------|-----|--------|---------|
| `PAYMENT_TIER` | "starter" | "pro" | "hosted" | Tier identifier |
| `MAX_PRODUCTS` | "10" | "unlimited" | "unlimited" | Product limit |
| `CUSTOM_DOMAIN_ENABLED` | "false" | "true" | "true" | Feature flag |
| `ANALYTICS_ENABLED` | "false" | "true" | "true" | Feature flag |
| `PREMIUM_THEMES_ENABLED` | "false" | "true" | "true" | Feature flag |

#### Conditionally Set

| Variable | Condition | Source |
|----------|-----------|--------|
| `STORE_OWNER_EMAIL` | If contact email entered | Wizard Step 7 |
| `STRIPE_ACCOUNT_ID` | If Stripe Connect completed | Wizard Step 8 |
| `STRIPE_SECRET_KEY` | If platform has key | Platform `.env` |
| `RESEND_API_KEY` | If platform has key | Platform `.env` |
| `SUPER_ADMIN_PASSWORD` | If platform has password | Platform `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | If platform has key | Platform `.env` |
| `NEXT_PUBLIC_LOGO_URL` | If logo uploaded | Wizard Step 4 |

### Data Flow Example: Contact Email

```
User enters email in Wizard Step 7
         ↓
WizardContext.tsx receives update
         ↓
Auto-save after 1 second debounce
         ↓
Supabase stores: config.branding.contactEmail
         ↓
User clicks "Deploy Now"
         ↓
buildEnvironmentVariables() reads store from DB
         ↓
if (store.config.branding?.contactEmail) {
  envVars.push({ key: "STORE_OWNER_EMAIL", ... })
}
         ↓
Vercel API sets environment variable
         ↓
Deployed store has process.env.STORE_OWNER_EMAIL
```

### Files Involved

| File | Purpose |
|------|---------|
| `/lib/vercel.ts` | `buildEnvironmentVariables()` function |
| `/templates/hosted/hooks/useFeatureFlags.ts` | Reading tier flags |
| `/components/wizard/steps/ContactStep.tsx` | Contact email input |

### Debugging Missing Variables

1. **Check platform .env**: `grep RESEND_API_KEY .env`
2. **Check database**: `SELECT config FROM stores WHERE id = 'xxx'`
3. **Check Vercel dashboard**: Project → Settings → Environment Variables
4. **Check deployed code**: `console.log(!!process.env.VARIABLE_NAME)`

### Requirements

- [ ] Know all environment variables and their sources
- [ ] Understand public vs server-only vs encrypted types
- [ ] Can trace variable flow from wizard to deployed store
- [ ] Can debug missing variables

### Testing Checklist

- [ ] Verify all tier-based variables are set correctly
- [ ] Check conditional variables appear when configured
- [ ] Confirm encrypted variables are protected

---

## Prompt 4: Payment & Tier System

### Context

GoSovereign uses a Good-Better-Best pricing model with three tiers. Research shows 66% of customers choose the middle tier, which is why "Pro" is marked as "Most Popular."

### Pricing Structure

| Tier | Price | Model | Target Customer |
|------|-------|-------|-----------------|
| Starter | $149 | One-time | First-time entrepreneurs |
| Pro | $299 | One-time | Growing businesses |
| Hosted | $149 + $19/mo | Setup + subscription | Non-technical users |

### Feature Matrix

| Feature | Starter | Pro | Hosted |
|---------|---------|-----|--------|
| Full store ownership | Yes | Yes | Yes |
| Core features | Yes | Yes | Yes |
| Products | 10 max | Unlimited | Unlimited |
| Basic themes (3) | Yes | Yes | Yes |
| Premium themes (5+) | No | Yes | Yes |
| Custom domain | No | Yes | Yes |
| Analytics dashboard | No | Yes | Yes |
| Email support | Yes | Yes | Yes |
| Priority support | No | Yes | Yes |
| Managed hosting | No | No | Yes |
| Auto updates | No | No | Yes |
| Daily backups | No | No | Yes |

### Payment Flow

```
User clicks "Generate Store" (payment gated)
         ↓
UpgradeModal shows 3 tiers
         ↓
User selects tier → "Get [Tier]" button
         ↓
POST /api/checkout (creates Stripe Checkout Session)
         ↓
Redirect to Stripe Checkout
         ↓
User completes payment
         ↓
Stripe webhook: POST /api/webhooks/stripe
         ↓
purchase_completed → updates user.has_paid, user.payment_tier
         ↓
Redirect to /success
         ↓
User can now deploy
```

### Files Involved

| File | Purpose |
|------|---------|
| `/app/api/checkout/route.ts` | Create Checkout Session |
| `/app/api/webhooks/stripe/route.ts` | Handle payment events |
| `/components/payment/UpgradeModal.tsx` | Tier selection UI |
| `/hooks/usePaymentStatus.ts` | Payment status check |
| `/types/database.ts` | PaymentTier type |

### Stripe Integration

**Platform Purchases (Checkout Sessions)**:
```typescript
// /app/api/checkout/route.ts
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${appUrl}/cancel`,
});
```

**Store Payments (Connect)**:
```typescript
// Destination charges - store owner gets funds minus Stripe fees
const paymentIntent = await stripe.paymentIntents.create({
  amount: orderTotal,
  currency: 'usd',
  transfer_data: {
    destination: storeStripeAccountId,
  },
});
```

### Requirements

- [ ] Understand three-tier pricing psychology
- [ ] Know complete payment flow
- [ ] Understand Stripe Checkout vs Connect difference
- [ ] Can locate all payment-related files

### Testing Checklist

- [ ] Complete purchase flow for each tier
- [ ] Verify webhook updates database correctly
- [ ] Confirm tier-specific features are gated

---

## Part B: Implementation Prompts

---

## Prompt 5: Implement Tier Feature Flags

### Context

This prompt documents the feature flag implementation that gates premium features based on payment tier.

### Implementation Status: COMPLETE

The following files have been created/modified:

### File 1: `/lib/vercel.ts`

Added tier-based environment variables to `buildEnvironmentVariables()`:

```typescript
// Payment tier for feature gating
const paymentTier = store.payment_tier || "starter";
envVars.push({
  key: "PAYMENT_TIER",
  value: paymentTier,
  target: ["production", "preview", "development"],
  type: "plain",
});

// Tier-specific product limits
const maxProducts = paymentTier === "starter" ? "10" : "unlimited";
envVars.push({
  key: "MAX_PRODUCTS",
  value: maxProducts,
  target: ["production", "preview", "development"],
  type: "plain",
});

// Feature flags based on tier
const isPro = paymentTier === "pro" || paymentTier === "hosted";

envVars.push({
  key: "CUSTOM_DOMAIN_ENABLED",
  value: isPro ? "true" : "false",
  target: ["production", "preview", "development"],
  type: "plain",
});

envVars.push({
  key: "ANALYTICS_ENABLED",
  value: isPro ? "true" : "false",
  target: ["production", "preview", "development"],
  type: "plain",
});

envVars.push({
  key: "PREMIUM_THEMES_ENABLED",
  value: isPro ? "true" : "false",
  target: ["production", "preview", "development"],
  type: "plain",
});
```

### File 2: `/templates/hosted/hooks/useFeatureFlags.ts`

```typescript
export type PaymentTier = "starter" | "pro" | "hosted";

export interface FeatureFlags {
  tier: PaymentTier;
  maxProducts: number;
  isUnlimitedProducts: boolean;
  customDomainEnabled: boolean;
  analyticsEnabled: boolean;
  premiumThemesEnabled: boolean;
  isPro: boolean;
  isHosted: boolean;
}

export function useFeatureFlags(): FeatureFlags {
  const tier = (process.env.PAYMENT_TIER as PaymentTier) || "starter";
  const maxProductsEnv = process.env.MAX_PRODUCTS || "10";
  const isUnlimited = maxProductsEnv === "unlimited";

  return {
    tier,
    maxProducts: isUnlimited ? Infinity : parseInt(maxProductsEnv, 10),
    isUnlimitedProducts: isUnlimited,
    customDomainEnabled: process.env.CUSTOM_DOMAIN_ENABLED === "true",
    analyticsEnabled: process.env.ANALYTICS_ENABLED === "true",
    premiumThemesEnabled: process.env.PREMIUM_THEMES_ENABLED === "true",
    isPro: tier === "pro" || tier === "hosted",
    isHosted: tier === "hosted",
  };
}

export function getFeatureFlags(): FeatureFlags {
  return useFeatureFlags();
}
```

### File 3: `/templates/hosted/lib/products.ts`

```typescript
import { getFeatureFlags } from "@/hooks/useFeatureFlags";

export function canAddProduct(currentCount: number): boolean {
  const { isUnlimitedProducts, maxProducts } = getFeatureFlags();
  if (isUnlimitedProducts) return true;
  return currentCount < maxProducts;
}

export function getProductLimit(): number | null {
  const { isUnlimitedProducts, maxProducts } = getFeatureFlags();
  if (isUnlimitedProducts) return null;
  return maxProducts;
}

export function getRemainingProductSlots(currentCount: number): number | null {
  const { isUnlimitedProducts, maxProducts } = getFeatureFlags();
  if (isUnlimitedProducts) return null;
  return Math.max(0, maxProducts - currentCount);
}

export function getProductLimitMessage(currentCount: number): string {
  const { isUnlimitedProducts, maxProducts } = getFeatureFlags();
  if (isUnlimitedProducts) return `${currentCount} products`;
  const remaining = maxProducts - currentCount;
  if (remaining <= 0) return `${maxProducts}/${maxProducts} products (limit reached)`;
  if (remaining <= 3) return `${currentCount}/${maxProducts} products (${remaining} remaining)`;
  return `${currentCount}/${maxProducts} products`;
}
```

### File 4: `/templates/hosted/components/UpgradePrompt.tsx`

Components: `UpgradePrompt`, `UpgradeBanner`, `ProductLimitPrompt`

### Usage Examples

**Gating Product Creation:**
```typescript
import { canAddProduct } from "@/lib/products";
import { ProductLimitPrompt } from "@/components/UpgradePrompt";

function AddProductButton({ currentCount }) {
  if (!canAddProduct(currentCount)) {
    return <ProductLimitPrompt />;
  }
  return <button>Add Product</button>;
}
```

**Gating Analytics Page:**
```typescript
import { getFeatureFlags } from "@/hooks/useFeatureFlags";
import { UpgradePrompt } from "@/components/UpgradePrompt";

export default function AnalyticsPage() {
  const { analyticsEnabled } = getFeatureFlags();

  if (!analyticsEnabled) {
    return <UpgradePrompt feature="Analytics Dashboard" />;
  }

  return <AnalyticsDashboard />;
}
```

### Testing Checklist

- [ ] Starter store has `MAX_PRODUCTS=10`
- [ ] Pro store has `MAX_PRODUCTS=unlimited`
- [ ] Adding 11th product shows upgrade prompt (Starter)
- [ ] Analytics page shows content (Pro) or upgrade prompt (Starter)
- [ ] Premium themes only available on Pro/Hosted

---

## Prompt 6: Fix Password Reset Email

### Context

The password reset API had a bug where it returned `success: true` even when the email failed to send. This misled users into thinking the email was sent.

### Implementation Status: COMPLETE

### File: `/templates/hosted/app/api/admin/reset-password/route.ts`

**Before (Buggy):**
```typescript
const emailSent = await sendPasswordResetEmail(ownerEmail, resetUrl);

if (!emailSent) {
  console.warn("Failed to send reset email, but token was created");
}

return NextResponse.json({
  success: true,
  message: "Password reset email sent",
});
```

**After (Fixed):**
```typescript
const emailSent = await sendPasswordResetEmail(ownerEmail, resetUrl);

if (!emailSent) {
  console.error("Failed to send reset email - RESEND_API_KEY may not be configured");
  return NextResponse.json(
    {
      success: false,
      error: "Unable to send password reset email. Please contact support."
    },
    { status: 500 }
  );
}

return NextResponse.json({
  success: true,
  message: "Password reset email sent",
});
```

### Root Cause

The email fails when:
1. `RESEND_API_KEY` is not set in environment variables
2. `STORE_OWNER_EMAIL` is not configured
3. Resend API returns an error

### For Deployed Stores Missing Variables

**Quick Fix via Vercel Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the store's project
3. Navigate to Settings → Environment Variables
4. Add:
   - `RESEND_API_KEY` = [copy from platform .env]
   - `STORE_OWNER_EMAIL` = [store owner's email]
5. Click "Redeploy" on the Deployments tab

### Testing Checklist

- [ ] With RESEND_API_KEY: Email sends, returns 200 success
- [ ] Without RESEND_API_KEY: Returns 500 error with message
- [ ] Frontend shows appropriate error message on failure
- [ ] User can retry password reset after fixing configuration

---

## Prompt 7: Sync GitHub Template

### Context

Deployed stores use code from GitHub repository `gosovereign/storefront-template`, NOT the local `/templates/hosted/` folder. Local changes must be pushed to GitHub to affect production.

### Verification Steps

```bash
# 1. Check if GitHub repo exists
curl -s https://api.github.com/repos/gosovereign/storefront-template | jq .full_name

# 2. Navigate to local template
cd templates/hosted

# 3. Check if it's a git repo
git status

# 4. Check remote configuration
git remote -v

# 5. Compare with GitHub
git fetch origin
git diff origin/main

# 6. Push changes if different
git add .
git commit -m "Sync template from platform"
git push origin main
```

### Initial Setup (If Not a Repo)

```bash
cd templates/hosted
git init
git remote add origin https://github.com/gosovereign/storefront-template.git
git add .
git commit -m "Initial template sync"
git push -u origin main
```

### Automation (GitHub Actions)

Create `.github/workflows/sync-template.yml` in platform repo:

```yaml
name: Sync Template
on:
  push:
    paths:
      - 'templates/hosted/**'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Push to template repo
        run: |
          cd templates/hosted
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git push https://${{ secrets.GITHUB_TOKEN }}@github.com/gosovereign/storefront-template.git HEAD:main
```

### Files Involved

| File | Purpose |
|------|---------|
| `/templates/hosted/` | Local development template |
| `github.com/gosovereign/storefront-template` | Production deployment source |
| `/lib/vercel.ts` | References `GITHUB_TEMPLATE_REPO` |

### Testing Checklist

- [ ] GitHub repo exists and is accessible
- [ ] Local and remote are in sync (no diff)
- [ ] New deployment uses latest code

---

## Prompt 8: Add Analytics Dashboard (Pro Feature)

### Context

The Analytics Dashboard is a Pro-tier feature that shows store performance metrics. It should be gated behind the `ANALYTICS_ENABLED` environment variable.

### Implementation Status: PENDING

### Proposed Structure

```
templates/hosted/app/admin/analytics/
├── page.tsx           # Main analytics page
├── components/
│   ├── RevenueChart.tsx
│   ├── OrdersChart.tsx
│   ├── PopularProducts.tsx
│   └── CustomerGeography.tsx
└── lib/
    └── analytics.ts   # Data fetching functions
```

### Page Component

```typescript
// templates/hosted/app/admin/analytics/page.tsx
import { getFeatureFlags } from "@/hooks/useFeatureFlags";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { RevenueChart } from "./components/RevenueChart";
import { OrdersChart } from "./components/OrdersChart";
import { PopularProducts } from "./components/PopularProducts";

export default async function AnalyticsPage() {
  const { analyticsEnabled } = getFeatureFlags();

  if (!analyticsEnabled) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <UpgradePrompt
          feature="Analytics Dashboard"
          description="Get insights into your store's performance with detailed charts and metrics."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <OrdersChart />
      </div>

      <div className="mt-6">
        <PopularProducts />
      </div>
    </div>
  );
}
```

### Data Sources

```typescript
// templates/hosted/app/admin/analytics/lib/analytics.ts
import { createClient } from "@/lib/supabase/server";

export async function getRevenueData(storeId: string, days: number = 30) {
  const supabase = createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("store_id", storeId)
    .eq("payment_status", "paid")
    .gte("created_at", startDate.toISOString())
    .order("created_at");

  return data;
}

export async function getPopularProducts(storeId: string, limit: number = 5) {
  const supabase = createClient();

  const { data } = await supabase
    .from("order_items")
    .select("product_name, quantity")
    .eq("store_id", storeId)
    .order("quantity", { ascending: false })
    .limit(limit);

  return data;
}
```

### Chart Library

Recommended: **Recharts** (lightweight, React-native, well-maintained)

```bash
npm install recharts
```

### Implementation Steps

1. Create analytics page with feature gate check
2. Create RevenueChart component with Recharts
3. Create OrdersChart component
4. Create PopularProducts component
5. Add analytics link to admin sidebar (with lock icon for Starter)
6. Test feature gating

### Testing Checklist

- [ ] Analytics link visible in admin sidebar
- [ ] Starter tier sees UpgradePrompt
- [ ] Pro tier sees actual analytics
- [ ] Charts render correctly with data
- [ ] Charts handle empty data gracefully

---

## Supporting Documentation

### Architecture & Patterns
- [Multi-Tenant SaaS Architecture](https://www.makeitsimple.co.uk/blog/saas-multi-tenant-architecture)
- [Vercel for Platforms](https://vercel.com/platforms/docs/multi-project-platforms/concepts)
- [Supabase RLS Patterns](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Pricing & Business
- [Stripe Tiered Pricing Guide](https://stripe.com/resources/more/tiered-pricing-101-a-guide-for-a-strategic-approach)
- [Good-Better-Best Strategy](https://www.togai.com/blog/saas-3-tier-pricing-strategy/)

### Feature Flags
- [LaunchDarkly Feature Flags](https://launchdarkly.com/)
- [Vercel Edge Config](https://dev.to/hexshift/zero-cost-feature-flags-using-vercel-edge-config-no-saas-needed-394a)

### Security
- [OWASP Password Reset Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [Resend Documentation](https://resend.com/docs)

---

*Document Version: 2.0*
*Last Updated: December 2024*
*Maintained by: GoSovereign Engineering*
