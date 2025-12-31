# Supabase PostgREST Caching Fix Pattern

## The Problem

When using Supabase in a Next.js serverless environment (Vercel), you may encounter a frustrating issue where:

1. You save data to the database (PUT/POST works fine)
2. Database shows the correct updated values
3. But when you fetch the data (GET), you get **stale/old data**

This happens because Supabase's PostgREST layer aggressively caches query results, and this caching can persist across serverless function invocations.

## Symptoms

- Data saves successfully (you can verify in Supabase dashboard)
- `updated_at` timestamps in GET responses are older than what you just saved
- Problem seems to "fix itself" after a deployment (which clears all caches)
- Issue is intermittent and hard to reproduce locally

## Root Causes

### 1. Singleton Supabase Client Caching
```typescript
// BAD: Singleton pattern caches the client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance; // Same instance reused across requests
}
```

In serverless environments, the singleton can persist between function invocations, potentially holding stale connection state.

### 2. PostgREST Query Caching with `.single()`
```typescript
// BAD: .single() results get cached aggressively
const { data } = await supabase
  .from("settings")
  .select("*")
  .eq("id", id)
  .single();
```

The `.single()` method seems to trigger more aggressive caching in PostgREST.

### 3. Fetch API Caching
Next.js and the underlying fetch API can cache responses. Even with `force-dynamic`, the Supabase client's internal fetch calls may be cached.

## The Solution

### Step 1: Create a Fresh Client Per Request

```typescript
export function createFreshAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Create NEW client every time - no singleton
  return createClient(supabaseUrl, key, {
    // Step 2: Override fetch with cache-busting headers
    global: {
      fetch: (url, options = {}) => {
        // Handle Headers object properly
        const existingHeaders = options.headers instanceof Headers
          ? Object.fromEntries(options.headers.entries())
          : (options.headers || {});

        return fetch(url, {
          ...options,
          cache: 'no-store',  // Critical: disable fetch caching
          headers: {
            ...existingHeaders,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
      },
    },
  });
}
```

### Step 2: Use `.limit(1)` Instead of `.single()`

```typescript
// BAD: .single() can return cached results
const { data } = await supabase
  .from("store_settings")
  .select("*")
  .eq("store_id", storeId)
  .single();

// GOOD: .limit(1) with array extraction bypasses some caching
const { data: rows } = await supabase
  .from("store_settings")
  .select("*")
  .eq("store_id", storeId)
  .limit(1);
const data = rows?.[0] || null;
```

### Step 3: Add Response Headers (Belt and Suspenders)

```typescript
function jsonResponseNoCache(data: object, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}
```

### Step 4: Use `force-dynamic` Export

```typescript
// In your API route file
export const dynamic = "force-dynamic";
```

## Complete Working Example

```typescript
// lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function createFreshAdminClient(): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ||
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, key, {
    global: {
      fetch: (url, options = {}) => {
        const existingHeaders = options.headers instanceof Headers
          ? Object.fromEntries(options.headers.entries())
          : (options.headers || {});

        return fetch(url, {
          ...options,
          cache: 'no-store',
          headers: {
            ...existingHeaders,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
      },
    },
  });
}
```

```typescript
// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createFreshAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function jsonResponseNoCache(data: object, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

export async function GET(request: NextRequest) {
  const supabase = createFreshAdminClient();

  // Use .limit(1) instead of .single()
  const { data: rows, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "my-id")
    .limit(1);

  const data = rows?.[0] || null;

  return jsonResponseNoCache({ data });
}
```

## Why This Works

1. **Fresh client per request** - No stale connection state carried over
2. **Custom fetch with `cache: 'no-store'`** - Tells Next.js fetch not to cache
3. **Cache-Control headers on request** - Tells PostgREST not to return cached data
4. **`.limit(1)` instead of `.single()`** - Uses different query path, less aggressive caching
5. **Response headers** - Prevents browser/CDN caching of the response

## Debugging Tips

Add timestamps to your logs to verify data freshness:

```typescript
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`[GET ${timestamp}] Fetching...`);

  const { data: rows } = await supabase
    .from("settings")
    .select("*")
    .eq("id", id)
    .limit(1);

  console.log(`[GET ${timestamp}] Row updated_at:`, rows?.[0]?.updated_at);
  // If this timestamp is old, you have a caching problem
}
```

## When to Use This Pattern

- Any Supabase query in Next.js API routes where fresh data is critical
- Settings/configuration endpoints
- User profile data
- Any data that users expect to update immediately
- Admin dashboards

## When You Don't Need This

- Read-heavy endpoints where slight staleness is acceptable
- Public data that rarely changes
- Analytics/reporting where real-time isn't required

## Key Takeaway

The combination of:
1. Fresh Supabase client (not singleton)
2. Custom fetch with `cache: 'no-store'` and cache-control headers
3. `.limit(1)` instead of `.single()`

...ensures you always get fresh data from Supabase in serverless environments.

---

*Pattern discovered while debugging GoSovereign admin settings persistence issue, December 2025*
