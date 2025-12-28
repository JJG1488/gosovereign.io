// types/database.ts
// Database types matching DATA_MODEL.md schema

export type PaymentTier = "starter" | "pro" | "hosted";

// Template types
export type StoreTemplate = "goods" | "services" | "brochure";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  // Payment tracking
  has_paid: boolean;
  paid_at: string | null;
  payment_tier: PaymentTier | null;
  // Deployment OAuth tokens
  github_access_token: string | null;
  github_username: string | null;
  github_token_expires_at: string | null;
  vercel_access_token: string | null;
  vercel_team_id: string | null;
  vercel_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  template: StoreTemplate;
  config: StoreConfig;
  stripe_account_id: string | null;
  deployment_id: string | null;
  deployment_url: string | null;
  // Payment tier for feature gating
  payment_tier: PaymentTier | null;
  // Subscription tracking for Hosted tier
  subscription_status: "active" | "past_due" | "cancelled" | "none" | null;
  subscription_ends_at: string | null;
  can_deploy: boolean;
  // GitHub/Vercel deployment
  github_repo: string | null;
  vercel_project_id: string | null;
  vercel_deployment_id: string | null;
  status: "pending" | "configuring" | "deploying" | "deployed" | "failed" | "error";
  deployed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreConfig {
  branding: {
    logoUrl?: string;
    primaryColor: string;
    themePreset: string;
    tagline?: string;
    aboutText?: string;
    contactEmail?: string;
  };
  features: {
    shippingEnabled: boolean;
    shippingCountries?: string; // Comma-separated ISO country codes (e.g., "US,CA,GB")
    taxEnabled: boolean;
    blogEnabled: boolean;
    leadgenEnabled: boolean;
  };
  shipping?: {
    zones: string[];
    rates: ShippingRate[];
  };
  social?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
  seo?: {
    title?: string;
    description?: string;
  };
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  minWeight?: number;
  maxWeight?: number;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_per_item: number | null;
  track_inventory: boolean;
  inventory_count: number;
  allow_backorder: boolean;
  images: ProductImage[];
  has_variants: boolean;
  variants: ProductVariant[];
  variant_options: VariantOption[];
  requires_shipping: boolean;
  weight: number | null;
  is_digital: boolean;
  digital_file_url: string | null;
  download_limit: number | null;
  category: string | null;
  tags: string[];
  status: "draft" | "active" | "archived";
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  inventory: number;
  options: Record<string, string>;
}

export interface VariantOption {
  name: string;
  values: string[];
}

export interface Order {
  id: string;
  store_id: string;
  order_number: number;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: Address | null;
  billing_address: Address | null;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  fulfillment_status: "unfulfilled" | "partial" | "fulfilled";
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  customer_notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  variant_info: Record<string, string> | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  download_url: string | null;
  download_count: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  store_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan: "hosted_monthly" | "hosted_yearly";
  status: "active" | "past_due" | "cancelled" | "paused";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface WizardProgress {
  id: string;
  store_id: string;
  current_step: number;
  completed_steps: number[];
  answers: Record<string, unknown>;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PurchaseStatus = "pending" | "completed" | "failed" | "refunded";

export interface Purchase {
  id: string;
  user_id: string | null;
  email: string;
  stripe_checkout_session_id: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  plan: PaymentTier;
  amount: number; // in cents
  currency: string;
  status: PurchaseStatus;
  variant: string | null; // A/B test variant
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type DeploymentLogStatus = "started" | "completed" | "failed";

export interface DeploymentLog {
  id: string;
  store_id: string;
  step: string;
  status: DeploymentLogStatus;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Helper type for creating new records (omit server-generated fields)
export type NewStore = Omit<
  Store,
  "id" | "created_at" | "updated_at" | "deployed_at"
>;
export type NewProduct = Omit<Product, "id" | "created_at" | "updated_at">;

// Default values for new stores
export const defaultStoreConfig: StoreConfig = {
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
};

// Wizard step definitions per template type
export interface WizardStep {
  id: number;
  name: string;
  key: string;
}

export const GOODS_WIZARD_STEPS: WizardStep[] = [
  { id: 1, name: "Store Name", key: "storeName" },
  { id: 2, name: "Tagline", key: "tagline" },
  { id: 3, name: "Brand Color", key: "primaryColor" },
  { id: 4, name: "Logo", key: "logo" },
  { id: 5, name: "Products", key: "products" },
  { id: 6, name: "About", key: "about" },
  { id: 7, name: "Contact", key: "contact" },
  { id: 8, name: "Payments", key: "payments" },
];

export const SERVICES_WIZARD_STEPS: WizardStep[] = [
  { id: 1, name: "Business Name", key: "storeName" },
  { id: 2, name: "Tagline", key: "tagline" },
  { id: 3, name: "Brand Color", key: "primaryColor" },
  { id: 4, name: "Logo", key: "logo" },
  { id: 5, name: "Services", key: "services" },
  { id: 6, name: "About", key: "about" },
  { id: 7, name: "Contact", key: "contact" },
  { id: 8, name: "Payments", key: "payments" },
];

export const BROCHURE_WIZARD_STEPS: WizardStep[] = [
  { id: 1, name: "Site Name", key: "storeName" },
  { id: 2, name: "Tagline", key: "tagline" },
  { id: 3, name: "Brand Color", key: "primaryColor" },
  { id: 4, name: "Logo", key: "logo" },
  { id: 5, name: "Portfolio", key: "portfolio" },
  { id: 6, name: "Testimonials", key: "testimonials" },
  { id: 7, name: "About", key: "about" },
  { id: 8, name: "Contact", key: "contact" },
];

// Helper to get wizard steps for a template
export function getWizardStepsForTemplate(template: StoreTemplate): WizardStep[] {
  switch (template) {
    case "goods":
      return GOODS_WIZARD_STEPS;
    case "services":
      return SERVICES_WIZARD_STEPS;
    case "brochure":
      return BROCHURE_WIZARD_STEPS;
    default:
      return GOODS_WIZARD_STEPS;
  }
}

// Legacy export for backward compatibility
export const WIZARD_STEPS = GOODS_WIZARD_STEPS;

export type WizardStepKey =
  | "storeName"
  | "tagline"
  | "primaryColor"
  | "logo"
  | "products"
  | "services"
  | "portfolio"
  | "testimonials"
  | "about"
  | "contact"
  | "payments";
