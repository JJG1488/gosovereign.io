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
 * Trust badge for hero section
 */
export interface TrustBadge {
  text: string;
  icon: string; // 'shield' | 'award' | 'star' | 'check-circle'
}

/**
 * Specialty item (generic materials/products/focuses)
 */
export interface SpecialtyItem {
  id: string;
  name: string;
  description: string;
}

/**
 * Additional service quick item
 */
export interface AdditionalService {
  title: string;
  description: string;
  icon: string; // emoji or lucide icon name
}

/**
 * Commitment badge
 */
export interface CommitmentBadge {
  icon: string;
  title: string;
  description: string;
  color: string; // hex color
}

/**
 * Testimonial/review
 */
export interface Testimonial {
  id: string;
  rating: number; // 1-5
  text: string;
  reviewerName: string;
  date?: string;
}

/**
 * Runtime store settings for services template
 */
export interface RuntimeSettings {
  // Branding
  themePreset: string;
  brandColor: string; // Admin-configurable brand color (hex)
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
  showWhyChooseUs: boolean;
  showSpecialties: boolean;
  showAdditionalServices: boolean;
  showBadges: boolean;
  showMapEmbed: boolean;

  // Process steps (How It Works)
  process: ProcessStep[];
  processTitle: string;
  processSubtitle: string;
  processCTAText: string;

  // Stats section
  stats: StatItem[];

  // Hero configuration
  heroStyle: 'image' | 'video' | 'gradient';
  heroImageUrl: string;
  heroVideoUrl: string;
  heroBadgeText: string;
  heroHeading: string;
  heroHeadingAccent: string;
  heroSubheading: string;
  trustBadges: TrustBadge[];
  heroCTAText: string;
  heroSecondaryCTAText: string;

  // Why Choose Us section
  whyChooseUsTitle: string;
  whyChooseUsHeading: string;
  whyChooseUsText: string;
  emergencyBannerText: string;
  emergencyBannerEnabled: boolean;

  // Specialties section
  specialtiesTitle: string;
  specialties: SpecialtyItem[];

  // Additional Services section
  additionalServicesTitle: string;
  additionalServices: AdditionalService[];

  // Commitment Badges section
  badgesTitle: string;
  badgesSubtitle: string;
  badges: CommitmentBadge[];

  // Testimonials section
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  overallRating: number;
  reviewCount: number;
  googleReviewsUrl: string;
  testimonials: Testimonial[];

  // Footer
  mapEmbedUrl: string;
  mapTitle: string;
  address: string;

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
    // Branding
    themePreset: config.themePreset || "default",
    brandColor: config.primaryColor || "#FFD700",
    logoUrl: config.logoUrl || "",
    tagline: config.tagline || "",
    aboutText: config.aboutText || "",

    // Contact defaults
    contactMode: 'form',
    calendlyUrl: "",
    phoneNumber: config.contactPhone || "",

    // Section defaults
    showProcess: true,
    showStats: true,
    showTeam: false,
    showTestimonials: true,
    showPortfolio: false,
    showFaq: true,
    showWhyChooseUs: true,
    showSpecialties: false,
    showAdditionalServices: false,
    showBadges: true,
    showMapEmbed: false,

    // Process steps
    process: [
      { step: 1, title: "Get a Free Estimate", description: "Contact us for a no-obligation quote", icon: "clipboard" },
      { step: 2, title: "We Recommend Options", description: "Our experts suggest the best solutions", icon: "message-square" },
      { step: 3, title: "We Get It Done", description: "Professional service delivered on time", icon: "check-circle" },
    ],
    processTitle: "Our Simple Process",
    processSubtitle: "From consultation to completion, we make it easy",
    processCTAText: "Get Your Free Estimate",

    // Stats
    stats: [
      { value: "10+", label: "Years Experience" },
      { value: "500+", label: "Happy Customers" },
      { value: "100%", label: "Satisfaction Rate" },
    ],

    // Hero
    heroStyle: 'gradient',
    heroImageUrl: "",
    heroVideoUrl: "",
    heroBadgeText: "Trusted Local Business",
    heroHeading: "Professional Services",
    heroHeadingAccent: "You Can Trust",
    heroSubheading: "",
    trustBadges: [
      { text: "Licensed", icon: "shield" },
      { text: "Insured", icon: "shield-check" },
      { text: "Satisfaction Guaranteed", icon: "star" },
    ],
    heroCTAText: "Get a Free Quote",
    heroSecondaryCTAText: "Our Services",

    // Why Choose Us
    whyChooseUsTitle: "Why Choose Us?",
    whyChooseUsHeading: "Quality You Can Trust",
    whyChooseUsText: "We are committed to providing exceptional service with integrity, professionalism, and attention to detail. Our team of experts brings years of experience to every project.",
    emergencyBannerText: "Available for Emergency Services!",
    emergencyBannerEnabled: false,

    // Specialties
    specialtiesTitle: "Our Specialties",
    specialties: [],

    // Additional Services
    additionalServicesTitle: "Additional Services",
    additionalServices: [],

    // Commitment Badges
    badgesTitle: "Our Commitment to Excellence",
    badgesSubtitle: "Why customers choose us for their service needs",
    badges: [
      { icon: "shield", title: "Fully Insured", description: "Complete protection for your peace of mind", color: "#0ea5e9" },
      { icon: "award", title: "Certified Experts", description: "Licensed professionals you can count on", color: "#10b981" },
      { icon: "wrench", title: "Quality Work", description: "Premium materials and expert craftsmanship", color: "#f59e0b" },
      { icon: "check-circle", title: "Guaranteed", description: "100% satisfaction guaranteed", color: "#8b5cf6" },
    ],

    // Testimonials
    testimonialsTitle: "What Our Customers Say",
    testimonialsSubtitle: "Real reviews from satisfied customers",
    overallRating: 5.0,
    reviewCount: 0,
    googleReviewsUrl: "",
    testimonials: [],

    // Footer
    mapEmbedUrl: "",
    mapTitle: "Our Service Area",
    address: config.address || "",

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
      const s = data.settings;
      // Merge database settings with defaults (DB takes precedence)
      return {
        // Branding
        themePreset: s.themePreset || defaults.themePreset,
        brandColor: s.brandColor || defaults.brandColor,
        logoUrl: s.logoUrl || defaults.logoUrl,
        tagline: s.tagline ?? defaults.tagline,
        aboutText: s.aboutText ?? defaults.aboutText,

        // Contact
        contactMode: s.contactMode || defaults.contactMode,
        calendlyUrl: s.calendlyUrl ?? defaults.calendlyUrl,
        phoneNumber: s.phoneNumber ?? defaults.phoneNumber,

        // Section toggles
        showProcess: s.showProcess ?? defaults.showProcess,
        showStats: s.showStats ?? defaults.showStats,
        showTeam: s.showTeam ?? defaults.showTeam,
        showTestimonials: s.showTestimonials ?? defaults.showTestimonials,
        showPortfolio: s.showPortfolio ?? defaults.showPortfolio,
        showFaq: s.showFaq ?? defaults.showFaq,
        showWhyChooseUs: s.showWhyChooseUs ?? defaults.showWhyChooseUs,
        showSpecialties: s.showSpecialties ?? defaults.showSpecialties,
        showAdditionalServices: s.showAdditionalServices ?? defaults.showAdditionalServices,
        showBadges: s.showBadges ?? defaults.showBadges,
        showMapEmbed: s.showMapEmbed ?? defaults.showMapEmbed,

        // Process steps
        process: s.process || defaults.process,
        processTitle: s.processTitle ?? defaults.processTitle,
        processSubtitle: s.processSubtitle ?? defaults.processSubtitle,
        processCTAText: s.processCTAText ?? defaults.processCTAText,

        // Stats
        stats: s.stats || defaults.stats,

        // Hero
        heroStyle: s.heroStyle || defaults.heroStyle,
        heroImageUrl: s.heroImageUrl ?? defaults.heroImageUrl,
        heroVideoUrl: s.heroVideoUrl ?? defaults.heroVideoUrl,
        heroBadgeText: s.heroBadgeText ?? defaults.heroBadgeText,
        heroHeading: s.heroHeading ?? defaults.heroHeading,
        heroHeadingAccent: s.heroHeadingAccent ?? defaults.heroHeadingAccent,
        heroSubheading: s.heroSubheading ?? defaults.heroSubheading,
        trustBadges: s.trustBadges || defaults.trustBadges,
        heroCTAText: s.heroCTAText ?? defaults.heroCTAText,
        heroSecondaryCTAText: s.heroSecondaryCTAText ?? defaults.heroSecondaryCTAText,

        // Why Choose Us
        whyChooseUsTitle: s.whyChooseUsTitle ?? defaults.whyChooseUsTitle,
        whyChooseUsHeading: s.whyChooseUsHeading ?? defaults.whyChooseUsHeading,
        whyChooseUsText: s.whyChooseUsText ?? defaults.whyChooseUsText,
        emergencyBannerText: s.emergencyBannerText ?? defaults.emergencyBannerText,
        emergencyBannerEnabled: s.emergencyBannerEnabled ?? defaults.emergencyBannerEnabled,

        // Specialties
        specialtiesTitle: s.specialtiesTitle ?? defaults.specialtiesTitle,
        specialties: s.specialties || defaults.specialties,

        // Additional Services
        additionalServicesTitle: s.additionalServicesTitle ?? defaults.additionalServicesTitle,
        additionalServices: s.additionalServices || defaults.additionalServices,

        // Commitment Badges
        badgesTitle: s.badgesTitle ?? defaults.badgesTitle,
        badgesSubtitle: s.badgesSubtitle ?? defaults.badgesSubtitle,
        badges: s.badges || defaults.badges,

        // Testimonials
        testimonialsTitle: s.testimonialsTitle ?? defaults.testimonialsTitle,
        testimonialsSubtitle: s.testimonialsSubtitle ?? defaults.testimonialsSubtitle,
        overallRating: s.overallRating ?? defaults.overallRating,
        reviewCount: s.reviewCount ?? defaults.reviewCount,
        googleReviewsUrl: s.googleReviewsUrl ?? defaults.googleReviewsUrl,
        testimonials: s.testimonials || defaults.testimonials,

        // Footer
        mapEmbedUrl: s.mapEmbedUrl ?? defaults.mapEmbedUrl,
        mapTitle: s.mapTitle ?? defaults.mapTitle,
        address: s.address ?? defaults.address,

        // Business info
        businessHours: s.businessHours ?? defaults.businessHours,
        serviceAreas: s.serviceAreas || defaults.serviceAreas,

        // Social
        instagramUrl: s.instagramUrl ?? defaults.instagramUrl,
        facebookUrl: s.facebookUrl ?? defaults.facebookUrl,
        twitterUrl: s.twitterUrl ?? defaults.twitterUrl,
        linkedinUrl: s.linkedinUrl ?? defaults.linkedinUrl,
      };
    }
  } catch (error) {
    console.error("Failed to fetch settings from DB:", error);
  }

  return defaults;
}
