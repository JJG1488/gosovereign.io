/**
 * GoSovereign Store Configuration Types
 *
 * These types define the shape of data collected through the wizard
 * and used to generate the customer's store.
 */

// =============================================================================
// Product Types
// =============================================================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // In cents
  compareAtPrice?: number; // Original price for showing discounts
  images: string[]; // URLs to uploaded images
  category?: string;
  inventory?: number; // Optional for MVP
  isActive: boolean;
}

// =============================================================================
// Store Configuration (Wizard Output)
// =============================================================================

export interface StoreConfig {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Step 1: Store Name
  storeName: string;

  // Step 2: Tagline
  tagline: string;

  // Step 3: Primary Color
  primaryColor: string;

  // Step 4: Logo
  logoUrl?: string;
  useTextLogo: boolean;

  // Step 5: Products
  products: Product[];

  // Step 6: About
  aboutText: string;

  // Step 7: Contact Email
  contactEmail: string;

  // Step 8: Stripe
  stripeAccountId?: string;
  stripeConnected: boolean;

  // Generation Status
  status: StoreStatus;
  downloadUrl?: string;
  generatedAt?: string;
}

export type StoreStatus = "draft" | "generating" | "complete" | "error";

// =============================================================================
// Wizard State
// =============================================================================

export interface WizardState {
  currentStep: number;
  config: Partial<StoreConfig>;
  isSubmitting: boolean;
  error?: string;
}

export type WizardStep = {
  id: number;
  name: string;
  description: string;
  isComplete: (config: Partial<StoreConfig>) => boolean;
};

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    name: "Store Name",
    description: "What's your store called?",
    isComplete: (config) => Boolean(config.storeName?.trim()),
  },
  {
    id: 2,
    name: "Tagline",
    description: "One sentence about what you sell",
    isComplete: (config) => Boolean(config.tagline?.trim()),
  },
  {
    id: 3,
    name: "Brand Color",
    description: "Choose your primary brand color",
    isComplete: (config) => Boolean(config.primaryColor),
  },
  {
    id: 4,
    name: "Logo",
    description: "Upload your logo or use text",
    isComplete: (config) => Boolean(config.logoUrl || config.useTextLogo),
  },
  {
    id: 5,
    name: "Products",
    description: "Add your products",
    isComplete: (config) => Boolean(config.products?.length),
  },
  {
    id: 6,
    name: "About",
    description: "Tell customers about your business",
    isComplete: (config) => Boolean(config.aboutText?.trim()),
  },
  {
    id: 7,
    name: "Contact",
    description: "How can customers reach you?",
    isComplete: (config) => Boolean(config.contactEmail?.trim()),
  },
  {
    id: 8,
    name: "Payments",
    description: "Connect Stripe to accept payments",
    isComplete: (config) => Boolean(config.stripeConnected),
  },
];

// =============================================================================
// Color Presets
// =============================================================================

export interface ColorPreset {
  name: string;
  value: string;
  textColor: string; // For contrast
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Emerald", value: "#10b981", textColor: "#ffffff" },
  { name: "Blue", value: "#3b82f6", textColor: "#ffffff" },
  { name: "Purple", value: "#8b5cf6", textColor: "#ffffff" },
  { name: "Rose", value: "#f43f5e", textColor: "#ffffff" },
  { name: "Amber", value: "#f59e0b", textColor: "#000000" },
  { name: "Slate", value: "#475569", textColor: "#ffffff" },
];

// =============================================================================
// API Types
// =============================================================================

export interface CreateStoreRequest {
  config: StoreConfig;
}

export interface CreateStoreResponse {
  success: boolean;
  storeId: string;
  downloadUrl?: string;
  error?: string;
}

export interface SaveProgressRequest {
  storeId?: string;
  config: Partial<StoreConfig>;
}

export interface SaveProgressResponse {
  success: boolean;
  storeId: string;
  error?: string;
}

// =============================================================================
// Supabase Row Types (matches database schema)
// =============================================================================

export interface StoreConfigRow {
  id: string;
  created_at: string;
  updated_at: string;
  store_name: string | null;
  tagline: string | null;
  primary_color: string | null;
  logo_url: string | null;
  use_text_logo: boolean;
  products: Product[];
  about_text: string | null;
  contact_email: string | null;
  stripe_account_id: string | null;
  stripe_connected: boolean;
  status: StoreStatus;
  download_url: string | null;
  generated_at: string | null;
}

// =============================================================================
// Helpers
// =============================================================================

export function createEmptyConfig(): Partial<StoreConfig> {
  return {
    storeName: "",
    tagline: "",
    primaryColor: COLOR_PRESETS[0].value,
    logoUrl: undefined,
    useTextLogo: true,
    products: [],
    aboutText: "",
    contactEmail: "",
    stripeAccountId: undefined,
    stripeConnected: false,
    status: "draft",
  };
}

export function createEmptyProduct(): Product {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    price: 0,
    images: [],
    isActive: true,
  };
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getCompletedSteps(config: Partial<StoreConfig>): number[] {
  return WIZARD_STEPS.filter((step) => step.isComplete(config)).map(
    (step) => step.id
  );
}

export function getWizardProgress(config: Partial<StoreConfig>): number {
  const completed = getCompletedSteps(config).length;
  return Math.round((completed / WIZARD_STEPS.length) * 100);
}
