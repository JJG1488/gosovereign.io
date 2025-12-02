// lib/supabase.ts
// Database operations for GoSovereign

import { createClient } from "./supabase/client";
import type {
  Store,
  StoreConfig,
  Product,
  WizardProgress,
} from "@/types/database";

// Re-export client for convenience
export { createClient } from "./supabase/client";

// =============================================================================
// Store Operations
// =============================================================================

export async function createStore(
  userId: string,
  name: string,
  subdomain: string
): Promise<Store | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("stores")
    .insert({
      user_id: userId,
      name,
      subdomain,
      template: "fashion",
      config: {
        branding: {
          primaryColor: "#10b981",
          themePreset: "minimal-light",
        },
        features: {
          shippingEnabled: true,
          taxEnabled: true,
          blogEnabled: false,
          leadgenEnabled: false,
        },
      },
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating store:", error);
    return null;
  }

  return data as Store;
}

export async function getStore(storeId: string): Promise<Store | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (error) {
    console.error("Error fetching store:", error);
    return null;
  }

  return data as Store;
}

export async function getUserStore(userId: string): Promise<Store | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error fetching user store:", error);
    return null;
  }

  return data as Store | null;
}

export async function updateStore(
  storeId: string,
  updates: Partial<Store>
): Promise<Store | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating store:", error);
    return null;
  }

  return data as Store;
}

export async function updateStoreConfig(
  storeId: string,
  configUpdates: Partial<StoreConfig>
): Promise<Store | null> {
  const supabase = createClient();

  // First get current config
  const { data: current, error: fetchError } = await supabase
    .from("stores")
    .select("config")
    .eq("id", storeId)
    .single();

  if (fetchError) {
    console.error("Error fetching store config:", fetchError);
    return null;
  }

  // Merge configs
  const newConfig = deepMerge(current.config || {}, configUpdates);

  const { data, error } = await supabase
    .from("stores")
    .update({ config: newConfig })
    .eq("id", storeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating store config:", error);
    return null;
  }

  return data as Store;
}

// =============================================================================
// Product Operations
// =============================================================================

export async function createProduct(
  storeId: string,
  product: Partial<Product>
): Promise<Product | null> {
  const supabase = createClient();

  const slug = generateSlug(product.name || "product");

  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      name: product.name || "New Product",
      slug,
      description: product.description || null,
      price: product.price || 0,
      images: product.images || [],
      status: "draft",
      track_inventory: false,
      inventory_count: 0,
      allow_backorder: false,
      has_variants: false,
      variants: [],
      variant_options: [],
      requires_shipping: true,
      is_digital: false,
      tags: [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    return null;
  }

  return data as Product;
}

export async function getProduct(productId: string): Promise<Product | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as Product;
}

export async function getStoreProducts(storeId: string): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching store products:", error);
    return [];
  }

  return data as Product[];
}

export async function updateProduct(
  productId: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const supabase = createClient();

  // If name changed, update slug too
  const updateData: Partial<Product> = { ...updates };
  if (updates.name) {
    updateData.slug = generateSlug(updates.name);
  }

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    return null;
  }

  return data as Product;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Error deleting product:", error);
    return false;
  }

  return true;
}

// =============================================================================
// Wizard Progress Operations
// =============================================================================

export async function createWizardProgress(
  storeId: string
): Promise<WizardProgress | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wizard_progress")
    .insert({
      store_id: storeId,
      current_step: 1,
      completed_steps: [],
      answers: {},
      completed: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating wizard progress:", error);
    return null;
  }

  return data as WizardProgress;
}

export async function getWizardProgress(
  storeId: string
): Promise<WizardProgress | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wizard_progress")
    .select("*")
    .eq("store_id", storeId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching wizard progress:", error);
    return null;
  }

  return data as WizardProgress | null;
}

export async function updateWizardProgress(
  storeId: string,
  updates: Partial<WizardProgress>
): Promise<WizardProgress | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wizard_progress")
    .update(updates)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating wizard progress:", error);
    return null;
  }

  return data as WizardProgress;
}

// =============================================================================
// File Upload Operations
// =============================================================================

export async function uploadFile(
  bucket: "store-assets" | "product-images",
  path: string,
  file: File
): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    console.error("Error uploading file:", error);
    return null;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

export async function uploadLogo(
  userId: string,
  storeId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/${storeId}/logo.${ext}`;
  return uploadFile("store-assets", path, file);
}

export async function uploadProductImage(
  userId: string,
  storeId: string,
  productId: string,
  file: File,
  index: number
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${storeId}/${productId}/${index}.${ext}`;
  return uploadFile("product-images", path, file);
}

export async function deleteFile(
  bucket: "store-assets" | "product-images",
  path: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error("Error deleting file:", error);
    return false;
  }

  return true;
}

// =============================================================================
// Auth Helpers
// =============================================================================

export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// =============================================================================
// Utility Functions
// =============================================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[typeof key];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[typeof key];
    }
  }

  return result;
}
