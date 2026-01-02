import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

/**
 * Format price in cents to display string.
 * Returns "Contact for pricing" if price is null.
 */
export function formatPrice(priceInCents: number | null, priceType: string = "fixed"): string {
  if (priceInCents === null) return "Contact for pricing";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(priceInCents / 100);

  switch (priceType) {
    case "starting_at":
      return `Starting at ${formatted}`;
    case "hourly":
      return `${formatted}/hr`;
    case "custom":
      return "Custom pricing";
    default:
      return formatted;
  }
}

export interface Service {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  price_type: string;
  duration: string | null;
  images: string[];
  icon: string | null;
  features: string[];
  category: string | null;
  tags: string[] | null;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getServices(): Promise<Service[]> {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return [];
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("store_id", storeId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return data || [];
}

export async function getActiveServices(): Promise<Service[]> {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return [];
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching active services:", error);
    return [];
  }

  return data || [];
}

export async function getFeaturedServices(): Promise<Service[]> {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return [];
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching featured services:", error);
    return [];
  }

  return data || [];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return null;
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("store_id", storeId)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching service:", error);
    return null;
  }

  return data;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return null;
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("store_id", storeId)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching service:", error);
    return null;
  }

  return data;
}
