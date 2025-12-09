import type { Store, Product, ProductImage, StoreTemplate } from "@/types/database";

// =============================================================================
// Template Placeholders
// =============================================================================

interface TemplatePlaceholders {
  STORE_NAME: string;
  STORE_NAME_SLUG: string;
  TAGLINE: string;
  PRIMARY_COLOR: string;
  PRIMARY_COLOR_DARK: string;
  LOGO_URL: string;
  USE_TEXT_LOGO: string;
  // Template-specific placeholders
  PRODUCTS_JSON: string;       // For goods template
  SERVICES_JSON: string;       // For services template
  PORTFOLIO_JSON: string;      // For brochure template
  TESTIMONIALS_JSON: string;   // For brochure template
  ABOUT_TEXT: string;
  CONTACT_EMAIL: string;
  STRIPE_ACCOUNT_ID: string;
  STRIPE_PUBLISHABLE_KEY: string;
}

// =============================================================================
// Helpers
// =============================================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function darkenColor(hex: string): string {
  // Simple darkening by reducing RGB values by 20%
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const darken = (c: number) => Math.max(0, Math.floor(c * 0.8));

  const dr = darken(r).toString(16).padStart(2, "0");
  const dg = darken(g).toString(16).padStart(2, "0");
  const db = darken(b).toString(16).padStart(2, "0");

  return `#${dr}${dg}${db}`;
}

function escapeForJS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
}

// =============================================================================
// Product Transformation for Template
// =============================================================================

interface TemplateProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // In cents for template
  images: string[];
  category?: string;
}

function transformProductsForTemplate(products: Product[]): TemplateProduct[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || "",
    price: Math.round(p.price * 100), // Convert dollars to cents
    images: p.images?.map((img: ProductImage) => img.url) || [],
    category: p.category || undefined,
  }));
}

// =============================================================================
// Service Transformation for Template
// =============================================================================

interface TemplateService {
  id: string;
  name: string;
  description: string;
  price: number; // In cents for template (starting price)
  images: string[];
}

function transformServicesForTemplate(products: Product[]): TemplateService[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: Math.round(p.price * 100), // Convert dollars to cents
    images: p.images?.map((img: ProductImage) => img.url) || [],
  }));
}

// =============================================================================
// Portfolio Transformation for Template
// =============================================================================

interface TemplatePortfolioItem {
  id: string;
  name: string;
  description: string;
  images: string[];
}

function transformPortfolioForTemplate(products: Product[]): TemplatePortfolioItem[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    images: p.images?.map((img: ProductImage) => img.url) || [],
  }));
}

// =============================================================================
// Testimonial Type for Template
// =============================================================================

interface TemplateTestimonial {
  id: string;
  name: string;
  quote: string;
  company?: string;
  role?: string;
  photoUrl?: string;
}

// =============================================================================
// Placeholder Creation
// =============================================================================

export function createPlaceholders(
  store: Store,
  products: Product[]
): TemplatePlaceholders {
  const config = store.config || {};
  const branding = config.branding || {};

  // Transform products for all template types (each template uses what it needs)
  const transformedProducts = transformProductsForTemplate(products);
  const transformedServices = transformServicesForTemplate(products);
  const transformedPortfolio = transformPortfolioForTemplate(products);

  // Get testimonials from config (for brochure template)
  const testimonials: TemplateTestimonial[] = ((config as unknown) as { testimonials?: TemplateTestimonial[] }).testimonials || [];

  return {
    STORE_NAME: store.name,
    STORE_NAME_SLUG: slugify(store.name),
    TAGLINE: branding.tagline || "",
    PRIMARY_COLOR: branding.primaryColor || "#10b981",
    PRIMARY_COLOR_DARK: darkenColor(branding.primaryColor || "#10b981"),
    LOGO_URL: branding.logoUrl || "",
    USE_TEXT_LOGO: String(!branding.logoUrl),
    // Template-specific JSON data
    PRODUCTS_JSON: JSON.stringify(transformedProducts, null, 2),
    SERVICES_JSON: JSON.stringify(transformedServices, null, 2),
    PORTFOLIO_JSON: JSON.stringify(transformedPortfolio, null, 2),
    TESTIMONIALS_JSON: JSON.stringify(testimonials, null, 2),
    ABOUT_TEXT: escapeForJS(branding.aboutText || ""),
    CONTACT_EMAIL: branding.contactEmail || "",
    STRIPE_ACCOUNT_ID: store.stripe_account_id || "",
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  };
}

// =============================================================================
// Placeholder Replacement
// =============================================================================

export function replacePlaceholders(
  content: string,
  placeholders: TemplatePlaceholders
): string {
  let result = content;

  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  }

  return result;
}

// =============================================================================
// Legacy support for old types (backwards compatibility)
// =============================================================================

interface LegacyStoreConfig {
  storeName: string;
  tagline: string;
  primaryColor: string;
  logoUrl?: string;
  useTextLogo: boolean;
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category?: string;
  }>;
  aboutText: string;
  contactEmail: string;
  stripeAccountId?: string;
}

export function createPlaceholdersFromLegacy(
  config: LegacyStoreConfig
): TemplatePlaceholders {
  // Legacy function uses same products for all template types
  const productsJson = JSON.stringify(config.products, null, 2);

  return {
    STORE_NAME: config.storeName,
    STORE_NAME_SLUG: slugify(config.storeName),
    TAGLINE: config.tagline,
    PRIMARY_COLOR: config.primaryColor,
    PRIMARY_COLOR_DARK: darkenColor(config.primaryColor),
    LOGO_URL: config.logoUrl || "",
    USE_TEXT_LOGO: String(config.useTextLogo),
    PRODUCTS_JSON: productsJson,
    SERVICES_JSON: productsJson,       // Same as products for legacy
    PORTFOLIO_JSON: productsJson,      // Same as products for legacy
    TESTIMONIALS_JSON: "[]",           // No testimonials in legacy format
    ABOUT_TEXT: escapeForJS(config.aboutText),
    CONTACT_EMAIL: config.contactEmail,
    STRIPE_ACCOUNT_ID: config.stripeAccountId || "",
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  };
}
