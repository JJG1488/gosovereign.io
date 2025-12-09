# GoSovereign Code Debt & Security Cleanup

> **Last Updated:** December 2024
> **Status:** Pending Implementation
> **Estimated Time:** 6-8 hours total

This document tracks all identified security vulnerabilities, UX gaps, and technical debt. Use this to pick up work in any future session.

---

## Quick Reference: Priority Items

| # | Issue | Severity | Status | Est. Time |
|---|-------|----------|--------|-----------|
| 1.1 | Exposed secrets in .env.example | CRITICAL | [ ] Pending | 15 min |
| 1.2 | Unauthenticated session endpoint | CRITICAL | [ ] Pending | 30 min |
| 1.3 | Weak OAuth state validation | CRITICAL | [ ] Pending | 30 min |
| 2.1 | Debug endpoint exposes data | MEDIUM | [ ] Pending | 15 min |
| 2.2 | No input validation | MEDIUM | [ ] Pending | 30 min |
| 2.3 | No webhook amount validation | MEDIUM | [ ] Pending | 15 min |
| 2.4 | No file upload validation | MEDIUM | [ ] Pending | 30 min |
| 3.1 | No email resend on signup | UX | [ ] Pending | 45 min |
| 3.2 | Silent save failures | UX | [ ] Pending | 30 min |
| 3.3 | Empty store can generate | UX | [ ] Pending | 15 min |
| 3.4 | Product limit not enforced | UX | [ ] Pending | 15 min |
| 3.5 | No error boundaries | UX | [ ] Pending | 30 min |
| 3.6 | No magic link resend | UX | [ ] Pending | 45 min |
| 4.1 | Stripe client duplicated 3x | DEBT | [ ] Pending | 20 min |
| 4.2 | Supabase admin duplicated | DEBT | [ ] Pending | 15 min |
| 4.3 | O(n) email lookup | DEBT | [ ] Pending | 20 min |
| 4.4 | No products pagination | DEBT | [ ] Pending | 20 min |
| 4.5 | Missing DB constraints | DEBT | [ ] Pending | 15 min |

---

## Phase 1: Critical Security (30-45 min)

### 1.1 Fix Exposed Secrets in .env.example
**Status:** [ ] Pending
**File:** `.env.example`
**Risk:** CRITICAL - Live production keys visible in git history

**Current Problem:**
The `.env.example` file contains LIVE production secrets:
- Supabase anon key (eyJ...)
- Supabase service role key
- Stripe live keys (sk_live_..., pk_live_...)
- Stripe webhook secret (whsec_...)

**Fix:**
Replace the entire file with placeholders:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key-here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
STRIPE_CONNECT_CLIENT_ID=ca_your-client-id-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Post-Fix Actions:**
1. Rotate ALL Stripe keys in Stripe Dashboard
2. Rotate Supabase service role key
3. Update Vercel environment variables with new keys
4. Consider purging git history (keys already compromised)

---

### 1.2 Add Authentication to Session Endpoint
**Status:** [ ] Pending
**File:** `/app/api/checkout/session/route.ts`
**Risk:** CRITICAL - Anyone can enumerate checkout sessions and retrieve customer PII

**Current Problem:**
```typescript
// No auth check - anyone can call this
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  // Returns email, plan, amount to anyone
}
```

**Fix:**
Add authentication and ownership verification:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Require authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify user owns this session
    if (session.metadata?.user_id && session.metadata.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      email: session.customer_details?.email,
      plan: session.metadata?.plan,
      amount: session.amount_total,
      status: session.payment_status,
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }
}
```

---

### 1.3 Strengthen OAuth State Validation
**Status:** [ ] Pending
**Files:**
- `/app/api/stripe/connect/route.ts` (generate state)
- `/app/api/stripe/callback/route.ts` (verify state)
**Risk:** CRITICAL - OAuth state can be forged, potentially linking attacker's Stripe to victim's store

**Current Problem:**
State is just base64 encoded JSON - no cryptographic signature:
```typescript
const state = Buffer.from(JSON.stringify({ storeId, userId })).toString("base64");
// Anyone can decode and re-encode with different values
```

**Fix - Part 1: Generate Signed State** (`/app/api/stripe/connect/route.ts`):

```typescript
import crypto from 'crypto';

function signState(data: { storeId: string; userId: string }): string {
  const payload = JSON.stringify(data);
  const signature = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64');
}

// In the handler, replace:
// const state = Buffer.from(JSON.stringify({ storeId, userId })).toString("base64");
// With:
const state = signState({ storeId: store.id, userId: user.id });
```

**Fix - Part 2: Verify Signed State** (`/app/api/stripe/callback/route.ts`):

```typescript
import crypto from 'crypto';

function verifyState(state: string): { storeId: string; userId: string } | null {
  try {
    const decoded = Buffer.from(state, 'base64').toString();
    const lastDotIndex = decoded.lastIndexOf('.');

    if (lastDotIndex === -1) return null;

    const payload = decoded.substring(0, lastDotIndex);
    const signature = decoded.substring(lastDotIndex + 1);

    const expected = crypto
      .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// In the handler, replace the existing state parsing with:
const stateData = verifyState(state);
if (!stateData) {
  return NextResponse.redirect(`${origin}/wizard?error=invalid_state`);
}
const { storeId, userId } = stateData;
```

---

## Phase 2: Medium Security (45-60 min)

### 2.1 Remove/Gate Debug Endpoint
**Status:** [ ] Pending
**File:** `/app/api/debug/route.ts`
**Risk:** MEDIUM - Exposes payment status, Stripe customer IDs, recent purchases

**Fix:**
Add environment check at the top of the handler:

```typescript
export async function GET(request: NextRequest): Promise<Response> {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ... rest of existing handler
}
```

**Alternative:** Delete the file entirely if not needed for debugging.

---

### 2.2 Add Input Validation
**Status:** [ ] Pending
**File:** `/lib/supabase.ts`
**Risk:** MEDIUM - XSS via store/product names, invalid data in database

**Add these validation functions at the top of the file:**

```typescript
// =============================================================================
// Input Validation
// =============================================================================

function validateStoreName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error("Store name is required");
  }
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    throw new Error("Store name must be 1-100 characters");
  }
  // Strip HTML tags to prevent XSS
  return trimmed.replace(/<[^>]*>/g, '');
}

function validateSubdomain(subdomain: string): string {
  if (!subdomain || typeof subdomain !== 'string') {
    throw new Error("Subdomain is required");
  }
  const lower = subdomain.toLowerCase().trim();
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(lower)) {
    throw new Error("Subdomain can only contain lowercase letters, numbers, and hyphens (cannot start or end with hyphen)");
  }
  if (lower.length > 63) {
    throw new Error("Subdomain cannot exceed 63 characters");
  }
  return lower;
}

function validateHexColor(color: string): string {
  if (!color) return '#10b981'; // Default emerald
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error("Invalid hex color format (expected #RRGGBB)");
  }
  return color.toLowerCase();
}

function validateProductName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error("Product name is required");
  }
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 200) {
    throw new Error("Product name must be 1-200 characters");
  }
  return trimmed.replace(/<[^>]*>/g, '');
}

function validatePrice(price: number): number {
  if (typeof price !== 'number' || isNaN(price)) {
    throw new Error("Price must be a number");
  }
  if (price < 0) {
    throw new Error("Price cannot be negative");
  }
  if (price > 999999.99) {
    throw new Error("Price cannot exceed $999,999.99");
  }
  return Math.round(price * 100) / 100; // Round to 2 decimal places
}
```

**Apply validation in createStore:**
```typescript
export async function createStore(
  userId: string,
  name: string,
  subdomain: string
): Promise<Store | null> {
  const validatedName = validateStoreName(name);
  const validatedSubdomain = validateSubdomain(subdomain);

  const { data, error } = await supabase
    .from("stores")
    .insert({
      user_id: userId,
      name: validatedName,
      subdomain: validatedSubdomain,
      // ...
    })
  // ...
}
```

**Apply validation in createProduct:**
```typescript
export async function createProduct(
  storeId: string,
  product: Partial<Product>
): Promise<Product | null> {
  const validatedName = validateProductName(product.name || "");
  const validatedPrice = validatePrice(product.price || 0);

  // ...
}
```

---

### 2.3 Validate Webhook Payment Amount
**Status:** [ ] Pending
**File:** `/app/api/webhooks/stripe/route.ts`
**Risk:** MEDIUM - Could accept underpayments if checkout session is somehow manipulated

**Add price constants and validation:**

```typescript
// Add near the top of the file
const PLAN_PRICES: Record<PaymentTier, number> = {
  starter: 14900,  // $149.00 in cents
  pro: 29900,      // $299.00 in cents
  hosted: 14900,   // $149.00 setup fee in cents
};

// Inside the checkout.session.completed handler, after extracting plan:
const plan = session.metadata?.plan as PaymentTier;

if (plan && PLAN_PRICES[plan]) {
  const expectedAmount = PLAN_PRICES[plan];
  if (session.amount_total !== expectedAmount) {
    console.error(`[WEBHOOK] Amount mismatch for plan ${plan}: expected ${expectedAmount}, got ${session.amount_total}`);
    // Log to monitoring but continue processing - payment already succeeded
    // Consider: create support ticket, flag for manual review
  }
}
```

---

### 2.4 Add File Upload Validation
**Status:** [ ] Pending
**File:** `/lib/supabase.ts`
**Risk:** MEDIUM - Disk exhaustion, potential malware upload

**Add validation function:**

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

function validateImageUpload(file: File): void {
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`);
  }

  // Additional check: verify file extension matches type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
  };

  if (!extension || !validExtensions[file.type]?.includes(extension)) {
    throw new Error("File extension doesn't match file type");
  }
}
```

**Apply in uploadStoreLogo and uploadProductImage:**
```typescript
export async function uploadStoreLogo(storeId: string, file: File): Promise<string | null> {
  try {
    validateImageUpload(file);
    // ... rest of function
  } catch (error) {
    console.error("Logo upload validation failed:", error);
    return null;
  }
}
```

---

## Phase 3: UX Gaps (2-3 hours)

### 3.1 Add Email Resend on Signup
**Status:** [ ] Pending
**File:** `/app/auth/signup/page.tsx`
**Impact:** Users stuck if email doesn't arrive (10-20% abandonment risk)

**Add state for resend functionality:**

```typescript
// Add to existing state declarations
const [canResend, setCanResend] = useState(false);
const [resendCountdown, setResendCountdown] = useState(60);
const [resendError, setResendError] = useState<string | null>(null);
const [isResending, setIsResending] = useState(false);

// Add countdown effect after successful submission
useEffect(() => {
  if (!isSubmitted) return;

  if (resendCountdown > 0) {
    const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  } else {
    setCanResend(true);
  }
}, [isSubmitted, resendCountdown]);

// Add resend handler
const handleResend = async () => {
  if (!email || isResending) return;

  setIsResending(true);
  setResendError(null);

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/wizard`,
      },
    });

    if (error) throw error;

    // Reset countdown
    setCanResend(false);
    setResendCountdown(60);
  } catch (err) {
    setResendError(err instanceof Error ? err.message : "Failed to resend email");
  } finally {
    setIsResending(false);
  }
};
```

**Update the success UI:**
```tsx
{isSubmitted && (
  <div className="text-center space-y-4">
    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
      <Mail className="w-8 h-8 text-emerald-400" />
    </div>
    <h2 className="text-xl font-semibold text-white">Check your email</h2>
    <p className="text-gray-400">
      We sent a magic link to <span className="text-white">{email}</span>
    </p>

    {/* Resend section */}
    <div className="pt-4 border-t border-navy-700">
      {canResend ? (
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Didn't receive it? Resend email"}
        </button>
      ) : (
        <p className="text-gray-500 text-sm">
          Resend available in {resendCountdown}s
        </p>
      )}
      {resendError && (
        <p className="text-red-400 text-sm mt-2">{resendError}</p>
      )}
    </div>

    {/* Spam folder notice */}
    <p className="text-gray-500 text-sm">
      Can't find it? Check your spam folder.
    </p>
  </div>
)}
```

---

### 3.2 Add Save Failure Notifications
**Status:** [ ] Pending
**File:** `/components/wizard/WizardContext.tsx`
**Impact:** Users lose data without knowing, causes frustration

**Add error state to the reducer:**

```typescript
// In WizardState interface
interface WizardState {
  // ... existing fields
  saveError: string | null;
}

// In initialState
const initialState: WizardState = {
  // ... existing fields
  saveError: null,
};

// Add action type
type WizardAction =
  | // ... existing actions
  | { type: "SET_SAVE_ERROR"; payload: string | null };

// In reducer
case "SET_SAVE_ERROR":
  return { ...state, saveError: action.payload };
```

**Modify the saveToDb function:**

```typescript
const saveToDb = async () => {
  if (!state.store?.id) return;

  try {
    dispatch({ type: "SET_SAVE_ERROR", payload: null });

    // ... existing save logic

  } catch (error) {
    console.error("Error saving to DB:", error);
    dispatch({
      type: "SET_SAVE_ERROR",
      payload: "Couldn't save changes. Retrying..."
    });

    // Auto-retry after 3 seconds
    setTimeout(() => {
      dispatch({ type: "SET_SAVE_ERROR", payload: null });
      saveToDb();
    }, 3000);
  }
};
```

**Add toast display in WizardShell or WizardContainer:**

```tsx
// In WizardContainer.tsx or create a new SaveStatusToast component
{state.saveError && (
  <div className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
    <AlertCircle className="w-5 h-5" />
    <span>{state.saveError}</span>
  </div>
)}
```

---

### 3.3 Add Product Validation Before Generate
**Status:** [ ] Pending
**File:** `/app/wizard/page.tsx`
**Impact:** Users can pay $149 and download an empty/incomplete store

**Modify handleGenerate in WizardContent:**

```typescript
const handleGenerate = async () => {
  // Validate store has products
  if (!products || products.length === 0) {
    // You'll need to add setError to the component state or use a toast
    alert("Please add at least one product before generating your store.");
    // Or better: show a styled error message
    return;
  }

  // Check payment status before allowing generation
  if (!isPaid) {
    setShowUpgradeModal(true);
    return;
  }

  try {
    await saveProgress();
    router.push(`/wizard/preview?store=${storeId}`);
  } catch (err) {
    console.error("Error generating store:", err);
  }
};
```

**Note:** The products are available via WizardContext - you may need to import them or pass them to WizardContent.

---

### 3.4 Enforce Product Limit
**Status:** [ ] Pending
**File:** `/components/wizard/steps/ProductsStep.tsx`
**Impact:** Misleading "MVP limit" message, inconsistent UX

**Add constant and update button:**

```typescript
const MAX_PRODUCTS = 10;

// In the component
const canAddProduct = products.length < MAX_PRODUCTS;

// Update the Add Product button
<Button
  onClick={() => setIsAddingProduct(true)}
  disabled={!canAddProduct || isAdding}
  className={!canAddProduct ? "opacity-50 cursor-not-allowed" : ""}
>
  <Plus className="w-4 h-4 mr-2" />
  {canAddProduct
    ? "Add Another Product"
    : `Limit Reached (${MAX_PRODUCTS} products)`}
</Button>

// Update the product counter display
<span className="text-sm text-gray-400">
  {products.length}/{MAX_PRODUCTS} products
</span>
```

---

### 3.5 Add Error Boundaries
**Status:** [ ] Pending
**New Files:** `/app/error.tsx`, `/app/not-found.tsx`
**Impact:** White screen crashes, poor SEO for missing pages

**Create `/app/error.tsx`:**

```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-400 mb-8">
          We encountered an unexpected error. Our team has been notified.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-navy-700 text-white rounded-lg font-semibold hover:bg-navy-600 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Create `/app/not-found.tsx`:**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-emerald-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
```

---

### 3.6 Add Magic Link Resend on Success Page
**Status:** [ ] Pending
**Files:** `/app/success/page.tsx`, `/app/api/auth/resend-magic-link/route.ts` (new)
**Impact:** Direct purchase buyers can't access their purchase if email fails

**Create `/app/api/auth/resend-magic-link/route.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/wizard`,
      },
    });

    if (error) {
      console.error("Error sending magic link:", error);
      return NextResponse.json(
        { error: "Failed to send magic link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Magic link resend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Update `/app/success/page.tsx`:**

Add state and handler:
```typescript
const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

const handleResendMagicLink = async () => {
  if (!sessionData?.email || resendStatus === 'sending') return;

  setResendStatus('sending');

  try {
    const response = await fetch('/api/auth/resend-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sessionData.email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send');
    }

    setResendStatus('sent');
  } catch {
    setResendStatus('error');
  }
};
```

Add to the UI (in the email instructions section):
```tsx
<div className="mt-4 text-center">
  {resendStatus === 'idle' && (
    <button
      onClick={handleResendMagicLink}
      className="text-emerald-400 hover:text-emerald-300 text-sm"
    >
      Didn't receive the email? Click to resend
    </button>
  )}
  {resendStatus === 'sending' && (
    <span className="text-gray-400 text-sm">Sending...</span>
  )}
  {resendStatus === 'sent' && (
    <span className="text-emerald-400 text-sm">Email sent! Check your inbox.</span>
  )}
  {resendStatus === 'error' && (
    <button
      onClick={handleResendMagicLink}
      className="text-red-400 hover:text-red-300 text-sm"
    >
      Failed to send. Click to try again.
    </button>
  )}
</div>
```

---

## Phase 4: Technical Debt (1-2 hours)

### 4.1 Extract Shared Stripe Client
**Status:** [ ] Pending
**New File:** `/lib/stripe.ts`
**Files to Update:** 3 API routes
**Impact:** Code duplication, inconsistent API versions

**Create `/lib/stripe.ts`:**

```typescript
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.acacia",
      typescript: true,
    });
  }
  return stripeInstance;
}

// For client-side usage (if needed)
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
  }
  return key;
}
```

**Update these files to import from `/lib/stripe`:**
- `/app/api/checkout/route.ts`
- `/app/api/checkout/session/route.ts`
- `/app/api/webhooks/stripe/route.ts`

Remove the local `getStripe()` function from each file and replace with:
```typescript
import { getStripe } from "@/lib/stripe";
```

---

### 4.2 Extract Supabase Admin Client
**Status:** [ ] Pending
**New File:** `/lib/supabase/admin.ts`
**Files to Update:** `/app/api/webhooks/stripe/route.ts`
**Impact:** Code duplication, potential for inconsistent configuration

**Create `/lib/supabase/admin.ts`:**

```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("Supabase admin credentials not configured");
    }

    adminInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminInstance;
}
```

**Update `/app/api/webhooks/stripe/route.ts`:**

Replace:
```typescript
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

With:
```typescript
import { getSupabaseAdmin } from "@/lib/supabase/admin";
```

---

### 4.3 Fix Email Lookup Performance
**Status:** [ ] Pending
**File:** `/app/api/webhooks/stripe/route.ts`
**Impact:** O(n) lookup loads all users into memory

**Current Problem:**
```typescript
const existingUsers = await supabase.auth.admin.listUsers();
const existingUser = existingUsers?.users?.find(u => u.email === email);
```

**Fix with direct query:**

```typescript
// Replace the listUsers call with a direct query
const { data: existingUserProfile } = await supabaseAdmin
  .from('users')
  .select('id')
  .eq('email', email)
  .single();

const existingUserId = existingUserProfile?.id || null;
```

**Note:** This assumes the `users` table has an `email` column. If not, you can still use `auth.admin.listUsers()` but with pagination:

```typescript
// Alternative: Use Supabase auth admin API more efficiently
const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({
  perPage: 1,
  page: 1,
});
// Then filter - but this is still suboptimal
```

**Best solution:** Query the `users` table directly since it mirrors auth.users.

---

### 4.4 Add Pagination to Products Query
**Status:** [ ] Pending
**File:** `/lib/supabase.ts`
**Impact:** Memory issues with large product counts

**Update `getStoreProducts`:**

```typescript
export async function getStoreProducts(
  storeId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<Product[]> {
  const { limit = 50, offset = 0 } = options;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as Product[];
}

// Add a count function for pagination UI
export async function getStoreProductsCount(storeId: string): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId);

  if (error) {
    console.error("Error counting products:", error);
    return 0;
  }

  return count || 0;
}
```

---

### 4.5 Add Database CHECK Constraints
**Status:** [ ] Pending
**File:** `/scripts/supabase-setup.sql`
**Impact:** Invalid data can be inserted (negative prices, invalid statuses)

**Add these ALTER statements to the SQL file (or run directly in Supabase SQL editor):**

```sql
-- =============================================================================
-- CHECK Constraints for Data Integrity
-- =============================================================================

-- Products: price must be positive
ALTER TABLE products
  ADD CONSTRAINT check_price_positive
  CHECK (price > 0);

-- Orders: amounts must be non-negative
ALTER TABLE orders
  ADD CONSTRAINT check_order_amounts
  CHECK (subtotal >= 0 AND shipping_cost >= 0 AND total >= 0);

-- Purchases: amount must be positive
ALTER TABLE purchases
  ADD CONSTRAINT check_purchase_amount_positive
  CHECK (amount > 0);

-- Stores: status enum validation
ALTER TABLE stores
  ADD CONSTRAINT check_store_status
  CHECK (status IN ('pending', 'configuring', 'deploying', 'deployed', 'error'));

-- Products: status enum validation
ALTER TABLE products
  ADD CONSTRAINT check_product_status
  CHECK (status IN ('draft', 'active', 'archived'));

-- Orders: status enum validation
ALTER TABLE orders
  ADD CONSTRAINT check_order_status
  CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- Purchases: status enum validation
ALTER TABLE purchases
  ADD CONSTRAINT check_purchase_status
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

-- Order Items: quantity must be positive
ALTER TABLE order_items
  ADD CONSTRAINT check_quantity_positive
  CHECK (quantity > 0);
```

**Note:** Run these in Supabase SQL Editor. They may fail if existing data violates constraints - clean up data first.

---

## Post-Implementation Checklist

After completing all phases:

- [ ] Rotate Stripe API keys (Dashboard → Developers → API keys)
- [ ] Rotate Supabase service role key (Project Settings → API)
- [ ] Update all Vercel environment variables with new keys
- [ ] Run database constraints SQL in Supabase
- [ ] Test all user flows:
  - [ ] Free trial signup → wizard → payment → download
  - [ ] Direct purchase → magic link → wizard → download
  - [ ] Email resend functionality
  - [ ] Error pages (404, general errors)
- [ ] Deploy to Vercel
- [ ] Verify webhook is receiving events in Stripe Dashboard
- [ ] Monitor error logs for any issues

---

## Files Summary

### Files to Modify
| File | Phase | Changes |
|------|-------|---------|
| `.env.example` | 1 | Replace live secrets with placeholders |
| `/app/api/checkout/session/route.ts` | 1 | Add authentication |
| `/app/api/stripe/connect/route.ts` | 1 | Sign OAuth state with HMAC |
| `/app/api/stripe/callback/route.ts` | 1 | Verify HMAC signature |
| `/app/api/debug/route.ts` | 2 | Gate to development only |
| `/lib/supabase.ts` | 2, 4 | Add validation, file upload checks, pagination |
| `/app/api/webhooks/stripe/route.ts` | 2, 4 | Add amount validation, fix email lookup |
| `/app/auth/signup/page.tsx` | 3 | Add email resend functionality |
| `/components/wizard/WizardContext.tsx` | 3 | Add save error state |
| `/components/wizard/steps/ProductsStep.tsx` | 3 | Enforce product limit |
| `/app/wizard/page.tsx` | 3 | Validate products before generate |
| `/app/success/page.tsx` | 3 | Add magic link resend |
| `/scripts/supabase-setup.sql` | 4 | Add CHECK constraints |

### New Files to Create
| File | Phase | Purpose |
|------|-------|---------|
| `/lib/stripe.ts` | 4 | Shared Stripe client |
| `/lib/supabase/admin.ts` | 4 | Shared Supabase admin client |
| `/app/error.tsx` | 3 | Global error boundary |
| `/app/not-found.tsx` | 3 | 404 page |
| `/app/api/auth/resend-magic-link/route.ts` | 3 | Magic link resend endpoint |

---

## Version History

| Date | Changes |
|------|---------|
| Dec 2024 | Initial audit and plan creation |

