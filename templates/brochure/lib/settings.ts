import { getSupabaseAdmin, getStoreId } from "./supabase";

export interface StoreSettings {
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroCtaLink: string;
  heroImage: string;
  // About section
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  showAbout: boolean;
  // Contact
  phoneNumber: string;
  address: string;
  businessHours: string;
  showContactForm: boolean;
  // Social
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  // SEO
  seoTitle: string;
  seoDescription: string;
}

const defaultSettings: StoreSettings = {
  heroTitle: "Welcome to Our Site",
  heroSubtitle: "Showcasing our work and expertise",
  heroCta: "View Portfolio",
  heroCtaLink: "#portfolio",
  heroImage: "",
  aboutTitle: "About Us",
  aboutText: "We are passionate about what we do and committed to delivering excellence.",
  aboutImage: "",
  showAbout: true,
  phoneNumber: "",
  address: "",
  businessHours: "",
  showContactForm: true,
  socialLinks: {},
  seoTitle: "",
  seoDescription: "",
};

/**
 * Get store settings from the database
 */
export async function getStoreSettingsFromDB(): Promise<StoreSettings> {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return defaultSettings;
  }

  try {
    const { data } = await supabase
      .from("store_settings")
      .select("settings")
      .eq("store_id", storeId)
      .single();

    if (data?.settings) {
      return { ...defaultSettings, ...data.settings };
    }
  } catch {
    // Settings table might not exist yet
  }

  return defaultSettings;
}

/**
 * Update store settings in the database
 */
export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) return false;

  try {
    const { error } = await supabase
      .from("store_settings")
      .upsert({
        store_id: storeId,
        settings,
        updated_at: new Date().toISOString(),
      });

    return !error;
  } catch {
    return false;
  }
}
