import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Get the Supabase admin client (uses service role for full access)
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing Supabase credentials");
    return null;
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseAdmin;
}

/**
 * Get the store ID from environment
 */
export function getStoreId(): string | null {
  return process.env.NEXT_PUBLIC_STORE_ID || null;
}

/**
 * Create a public Supabase client (anon key, for client-side)
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, anonKey);
}
