import { createFreshAdminClient, getStoreId, isBuildTime } from "@/lib/supabase";
import { getStoreConfig } from "@/lib/store";

/**
 * Process step for the "How It Works" section
 */
export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

/**
 * Stat/counter for the stats section
 */
export interface StatItem {
  value: string;
  label: string;
}

/**
 * Runtime store settings for services template
 */
export interface RuntimeSettings {
  // Branding
  themePreset: string;
  logoUrl: string;

  // Content
  tagline: string;
  aboutText: string;

  // Contact configuration
  contactMode: 'form' | 'calendly' | 'phone';
  calendlyUrl: string;
  phoneNumber: string;

  // Section toggles
  showProcess: boolean;
  showStats: boolean;
  showTeam: boolean;
  showTestimonials: boolean;
  showPortfolio: boolean;
  showFaq: boolean;

  // Process steps (How It Works)
  process: ProcessStep[];

  // Stats section
  stats: StatItem[];

  // Hero configuration
  heroStyle: 'image' | 'video' | 'gradient';
  heroImageUrl: string;
  heroVideoUrl: string;

  // Business info
  businessHours: string;
  serviceAreas: string[];

  // Social links
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
}

/**
 * Default settings from environment variables
 */
function getDefaultSettings(): RuntimeSettings {
  const config = getStoreConfig();
  return {
    themePreset: config.themePreset || "default",
    logoUrl: config.logoUrl || "",
    tagline: config.tagline || "",
    aboutText: config.aboutText || "",
    // Contact defaults
    contactMode: 'form',
    calendlyUrl: "",
    phoneNumber: config.contactPhone || "",
    // Section defaults - all enabled by default except portfolio (Pro only)
    showProcess: true,
    showStats: true,
    showTeam: false,
    showTestimonials: true,
    showPortfolio: false,
    showFaq: true,
    // Default process steps
    process: [
      { step: 1, title: "Get a Free Estimate", description: "Contact us for a no-obligation quote", icon: "clipboard" },
      { step: 2, title: "We Recommend Options", description: "Our experts suggest the best solutions", icon: "message-square" },
      { step: 3, title: "We Get It Done", description: "Professional service delivered on time", icon: "check-circle" },
    ],
    // Default stats
    stats: [
      { value: "10+", label: "Years Experience" },
      { value: "500+", label: "Happy Customers" },
      { value: "100%", label: "Satisfaction Rate" },
    ],
    // Hero defaults
    heroStyle: 'gradient',
    heroImageUrl: "",
    heroVideoUrl: "",
    // Business info
    businessHours: "Mon-Fri 9am-5pm",
    serviceAreas: [],
    // Social links
    instagramUrl: config.instagramUrl || "",
    facebookUrl: config.facebookUrl || "",
    twitterUrl: config.twitterUrl || "",
    linkedinUrl: config.linkedinUrl || "",
  };
}

/**
 * Fetches all runtime settings from the database.
 * Falls back to environment variables if database is unavailable.
 */
export async function getStoreSettingsFromDB(): Promise<RuntimeSettings> {
  const defaults = getDefaultSettings();

  if (isBuildTime()) {
    return defaults;
  }

  try {
    const supabase = createFreshAdminClient();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return defaults;
    }

    const { data: rows } = await supabase
      .from("store_settings")
      .select("settings")
      .eq("store_id", storeId)
      .limit(1);
    const data = rows?.[0] || null;

    if (data?.settings) {
      // Merge database settings with defaults (DB takes precedence)
      return {
        themePreset: data.settings.themePreset || defaults.themePreset,
        logoUrl: data.settings.logoUrl || defaults.logoUrl,
        tagline: data.settings.tagline ?? defaults.tagline,
        aboutText: data.settings.aboutText ?? defaults.aboutText,
        // Contact
        contactMode: data.settings.contactMode || defaults.contactMode,
        calendlyUrl: data.settings.calendlyUrl ?? defaults.calendlyUrl,
        phoneNumber: data.settings.phoneNumber ?? defaults.phoneNumber,
        // Sections
        showProcess: data.settings.showProcess ?? defaults.showProcess,
        showStats: data.settings.showStats ?? defaults.showStats,
        showTeam: data.settings.showTeam ?? defaults.showTeam,
        showTestimonials: data.settings.showTestimonials ?? defaults.showTestimonials,
        showPortfolio: data.settings.showPortfolio ?? defaults.showPortfolio,
        showFaq: data.settings.showFaq ?? defaults.showFaq,
        // Process steps
        process: data.settings.process || defaults.process,
        // Stats
        stats: data.settings.stats || defaults.stats,
        // Hero
        heroStyle: data.settings.heroStyle || defaults.heroStyle,
        heroImageUrl: data.settings.heroImageUrl ?? defaults.heroImageUrl,
        heroVideoUrl: data.settings.heroVideoUrl ?? defaults.heroVideoUrl,
        // Business info
        businessHours: data.settings.businessHours ?? defaults.businessHours,
        serviceAreas: data.settings.serviceAreas || defaults.serviceAreas,
        // Social
        instagramUrl: data.settings.instagramUrl ?? defaults.instagramUrl,
        facebookUrl: data.settings.facebookUrl ?? defaults.facebookUrl,
        twitterUrl: data.settings.twitterUrl ?? defaults.twitterUrl,
        linkedinUrl: data.settings.linkedinUrl ?? defaults.linkedinUrl,
      };
    }
  } catch (error) {
    console.error("Failed to fetch settings from DB:", error);
  }

  return defaults;
}
