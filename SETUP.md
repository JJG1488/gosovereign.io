# GoSovereign Setup Guide

> Complete setup instructions for the GoSovereign store builder wizard with Supabase backend.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Fill in your Supabase and Stripe credentials in .env.local

# 4. Run the Supabase setup SQL (see Database Setup below)

# 5. Create storage buckets in Supabase Dashboard (see Storage Setup below)

# 6. Start development server
npm run dev
```

---

## Environment Variables

Create `.env.local` with these values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # For admin operations

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx  # From Stripe Connect settings
```

### Where to Find These Values

| Variable | Location |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API > service_role |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API keys |
| `STRIPE_CONNECT_CLIENT_ID` | Stripe Dashboard > Settings > Connect > Platform settings |

---

## Database Setup

### Step 1: Run the SQL Script

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `scripts/supabase-setup.sql`
5. Click **Run**

This creates:
- 7 tables: `users`, `stores`, `products`, `orders`, `order_items`, `subscriptions`, `wizard_progress`
- All indexes for performance
- Row Level Security (RLS) policies
- Auto-update triggers for `updated_at`
- Trigger to auto-create user profile on signup

### Step 2: Verify Tables

After running, go to **Table Editor** and confirm these tables exist:
- `users`
- `stores`
- `products`
- `orders`
- `order_items`
- `subscriptions`
- `wizard_progress`

---

## Storage Setup

Storage buckets must be created manually via the Dashboard (the `storage` schema is protected).

### Step 1: Create Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Create these buckets:

| Bucket Name | Public |
|-------------|--------|
| `store-assets` | Yes |
| `product-images` | Yes |

### Step 2: Add Storage Policies

For **each bucket** (`store-assets` and `product-images`):

1. Click the bucket name
2. Go to **Policies** tab
3. Click **New Policy**
4. Create these policies:

**INSERT Policy (Upload):**
```
Name: Users can upload to their folder
Allowed operation: INSERT
Policy definition: (auth.uid()::text = (storage.foldername(name))[1])
```

**SELECT Policy (Read):**
```
Name: Public read access
Allowed operation: SELECT
Policy definition: true
```

**DELETE Policy:**
```
Name: Users can delete their files
Allowed operation: DELETE
Policy definition: (auth.uid()::text = (storage.foldername(name))[1])
```

**UPDATE Policy (optional):**
```
Name: Users can update their files
Allowed operation: UPDATE
Policy definition: (auth.uid()::text = (storage.foldername(name))[1])
```

---

## Stripe Connect Setup

For the store owner payment connection:

1. Go to Stripe Dashboard > **Settings** > **Connect**
2. Enable Connect for your platform
3. In **Platform settings**, note your `client_id` (starts with `ca_`)
4. Add redirect URIs:
   - Development: `http://localhost:3000/api/stripe/callback`
   - Production: `https://yourdomain.com/api/stripe/callback`

---

## Architecture Overview

### User Flow

```
1. Sign up/Login → creates auth.users + public.users (via trigger)
2. Start wizard → creates stores + wizard_progress records
3. Configure store → updates stores.config (branding, about, contact)
4. Add products → creates products records (separate table)
5. Upload images → Supabase Storage → permanent URLs
6. Connect Stripe → stores.stripe_account_id
7. Generate ZIP → all data pulled from DB, template generated
```

### Database Schema

```
users (1) ──────── (many) stores
                          │
stores (1) ─────── (many) products
stores (1) ─────── (1)    wizard_progress
stores (1) ─────── (many) orders
                          │
orders (1) ─────── (many) order_items
```

### File Storage Paths

- Logos: `store-assets/{userId}/{storeId}/logo.{ext}`
- Products: `product-images/{userId}/{storeId}/{productId}/{index}.{ext}`

---

## Key Files Reference

### Authentication

| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Browser client (SSR-compatible) |
| `lib/supabase/server.ts` | Server component client |
| `lib/supabase/middleware.ts` | Session refresh helper |
| `middleware.ts` | Route protection for /wizard, /dashboard |
| `app/auth/login/page.tsx` | Login page |
| `app/auth/signup/page.tsx` | Registration page |
| `app/auth/callback/route.ts` | OAuth callback handler |

### Wizard

| File | Purpose |
|------|---------|
| `components/wizard/WizardContext.tsx` | State management, auto-save |
| `components/wizard/steps/NameStep.tsx` | Store name input |
| `components/wizard/steps/TaglineStep.tsx` | Tagline input |
| `components/wizard/steps/ColorStep.tsx` | Brand color picker |
| `components/wizard/steps/LogoStep.tsx` | Logo upload to Storage |
| `components/wizard/steps/ProductsStep.tsx` | Product management |
| `components/wizard/steps/AboutStep.tsx` | About text |
| `components/wizard/steps/ContactStep.tsx` | Contact email |
| `components/wizard/steps/PaymentsStep.tsx` | Stripe Connect |
| `app/wizard/page.tsx` | Main wizard page |
| `app/wizard/preview/page.tsx` | Preview before download |

### API Routes

| File | Purpose |
|------|---------|
| `app/api/stripe/connect/route.ts` | Initiate Stripe Connect OAuth |
| `app/api/stripe/callback/route.ts` | Handle OAuth callback |
| `app/api/generate/route.ts` | Generate store ZIP file |

### Database Operations

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | All database operations (CRUD) |
| `types/database.ts` | TypeScript interfaces for all tables |

### Template

| File | Purpose |
|------|---------|
| `templates/starter/` | Base template for generated stores |
| `templates/starter/app/api/checkout/route.ts` | Stripe Checkout |
| `templates/starter/app/cart/page.tsx` | Shopping cart |
| `templates/starter/app/checkout/success/page.tsx` | Success page |
| `lib/store-generator.ts` | Template placeholder replacement |

---

## TypeScript Types

All types are defined in `types/database.ts`:

```typescript
// Core types
User, Store, StoreConfig, Product, ProductImage

// Commerce types
Order, OrderItem, Address

// Wizard types
WizardProgress

// Subscription types
Subscription
```

---

## Testing the Flow

1. **Sign up** at `/auth/signup`
2. **Log in** at `/auth/login`
3. **Start wizard** at `/wizard` (auto-creates store)
4. **Complete all 8 steps**:
   - Name, Tagline, Color, Logo
   - Products (add at least one)
   - About, Contact
   - Payments (connect Stripe or skip)
5. **Preview** at `/wizard/preview?store={id}`
6. **Download** the generated ZIP
7. **Run the generated store**:
   ```bash
   cd your-store-name
   npm install
   # Add STRIPE_SECRET_KEY to .env
   npm run dev
   ```

---

## Troubleshooting

### "Store not found" error
- Check that the user is logged in
- Verify the store belongs to the current user
- Check RLS policies are correctly applied

### Images not uploading
- Verify storage buckets exist (`store-assets`, `product-images`)
- Check bucket policies allow INSERT for authenticated users
- Verify folder structure matches `{userId}/{storeId}/...`

### Stripe Connect not working
- Verify `STRIPE_CONNECT_CLIENT_ID` is set
- Check redirect URI is whitelisted in Stripe Dashboard
- Ensure user is authenticated before connecting

### Generated store checkout fails
- Store owner must add `STRIPE_SECRET_KEY` to their `.env`
- Verify products have valid prices (in cents)
- Check browser console for specific errors

---

## Production Deployment

### Vercel Environment Variables

Set these in Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_CONNECT_CLIENT_ID
```

### Update Stripe Redirect URIs

Add your production domain to Stripe Connect redirect URIs:
- `https://gosovereign.io/api/stripe/callback`

---

*Last Updated: December 2024*
