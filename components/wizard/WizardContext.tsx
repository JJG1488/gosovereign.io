"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  Store,
  StoreConfig,
  Product,
  WizardProgress,
  StoreTemplate,
  WizardStep,
} from "@/types/database";
import { getWizardStepsForTemplate } from "@/types/database";
import {
  getStore,
  updateStore,
  updateStoreConfig,
  getStoreProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getWizardProgress,
  updateWizardProgress,
  getCurrentUser,
} from "@/lib/supabase";

// =============================================================================
// Local State Types (for UI)
// =============================================================================

export interface WizardLocalConfig {
  storeName: string;
  tagline: string;
  primaryColor: string;
  logoUrl?: string;
  useTextLogo: boolean;
  aboutText: string;
  contactEmail: string;
  stripeConnected: boolean;
  stripeAccountId?: string;
}

interface WizardState {
  currentStep: number;
  config: WizardLocalConfig;
  products: Product[];
  isSubmitting: boolean;
  isLoading: boolean;
  error?: string;
}

type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "UPDATE_CONFIG"; config: Partial<WizardLocalConfig> }
  | { type: "SET_PRODUCTS"; products: Product[] }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; productId: string; updates: Partial<Product> }
  | { type: "REMOVE_PRODUCT"; productId: string }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | undefined }
  | { type: "LOAD_DATA"; config: WizardLocalConfig; products: Product[]; step: number }
  | { type: "RESET" };

// =============================================================================
// Default Values
// =============================================================================

export const COLOR_PRESETS = [
  { name: "Emerald", value: "#10b981", textColor: "#ffffff" },
  { name: "Blue", value: "#3b82f6", textColor: "#ffffff" },
  { name: "Purple", value: "#8b5cf6", textColor: "#ffffff" },
  { name: "Rose", value: "#f43f5e", textColor: "#ffffff" },
  { name: "Amber", value: "#f59e0b", textColor: "#000000" },
  { name: "Slate", value: "#475569", textColor: "#ffffff" },
];

function createEmptyConfig(): WizardLocalConfig {
  return {
    storeName: "",
    tagline: "",
    primaryColor: COLOR_PRESETS[0].value,
    logoUrl: undefined,
    useTextLogo: true,
    aboutText: "",
    contactEmail: "",
    stripeConnected: false,
    stripeAccountId: undefined,
  };
}

// =============================================================================
// Reducer
// =============================================================================

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "UPDATE_CONFIG":
      return {
        ...state,
        config: { ...state.config, ...action.config },
      };

    case "SET_PRODUCTS":
      return { ...state, products: action.products };

    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.product] };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId ? { ...p, ...action.updates } : p
        ),
      };

    case "REMOVE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.productId),
      };

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.isSubmitting };

    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "LOAD_DATA":
      return {
        ...state,
        config: action.config,
        products: action.products,
        currentStep: action.step,
        isLoading: false,
      };

    case "RESET":
      return {
        currentStep: 1,
        config: createEmptyConfig(),
        products: [],
        isSubmitting: false,
        isLoading: false,
        error: undefined,
      };

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

interface WizardContextValue {
  state: WizardState;
  storeId: string | undefined;
  userId: string | undefined;
  template: StoreTemplate;
  wizardSteps: WizardStep[];
  currentStepKey: string;

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastStep: boolean;

  // Config updates
  updateConfig: (config: Partial<WizardLocalConfig>) => void;

  // Product management
  addProduct: (product?: Partial<Product>) => Promise<Product | null>;
  updateProductData: (productId: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;

  // Status
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | undefined) => void;

  // Progress
  completedSteps: number[];
  progressPercent: number;

  // Sync
  saveProgress: () => Promise<void>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface WizardProviderProps {
  children: ReactNode;
  storeId?: string;
  template?: StoreTemplate;
}

export function WizardProvider({ children, storeId, template = "goods" }: WizardProviderProps) {
  const wizardSteps = getWizardStepsForTemplate(template);
  const [state, dispatch] = useReducer(wizardReducer, {
    currentStep: 1,
    config: createEmptyConfig(),
    products: [],
    isSubmitting: false,
    isLoading: true,
    error: undefined,
  });

  const userIdRef = useRef<string | undefined>(undefined);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load store data on mount
  useEffect(() => {
    async function loadData() {
      if (!storeId) {
        dispatch({ type: "SET_LOADING", isLoading: false });
        return;
      }

      try {
        const user = await getCurrentUser();
        if (user) {
          userIdRef.current = user.id;
        }

        // Load store, products, and wizard progress in parallel
        const [store, products, wizardProgress] = await Promise.all([
          getStore(storeId),
          getStoreProducts(storeId),
          getWizardProgress(storeId),
        ]);

        if (store) {
          const config: WizardLocalConfig = {
            storeName: store.name,
            tagline: store.config?.branding?.tagline || "",
            primaryColor: store.config?.branding?.primaryColor || COLOR_PRESETS[0].value,
            logoUrl: store.config?.branding?.logoUrl,
            useTextLogo: !store.config?.branding?.logoUrl,
            aboutText: store.config?.branding?.aboutText || "",
            contactEmail: store.config?.branding?.contactEmail || "",
            stripeConnected: Boolean(store.stripe_account_id),
            stripeAccountId: store.stripe_account_id || undefined,
          };

          dispatch({
            type: "LOAD_DATA",
            config,
            products: products || [],
            step: wizardProgress?.current_step || 1,
          });
        } else {
          dispatch({ type: "SET_LOADING", isLoading: false });
        }
      } catch (error) {
        console.error("Error loading wizard data:", error);
        dispatch({ type: "SET_ERROR", error: "Failed to load store data" });
        dispatch({ type: "SET_LOADING", isLoading: false });
      }
    }

    loadData();
  }, [storeId]);

  // Debounced save to DB
  const saveToDb = useCallback(async () => {
    if (!storeId) return;

    try {
      // Update store name
      await updateStore(storeId, { name: state.config.storeName });

      // Update store config (branding fields)
      await updateStoreConfig(storeId, {
        branding: {
          primaryColor: state.config.primaryColor,
          themePreset: "minimal-light",
          tagline: state.config.tagline,
          logoUrl: state.config.logoUrl,
          aboutText: state.config.aboutText,
          contactEmail: state.config.contactEmail,
        },
      });

      // Update wizard progress
      await updateWizardProgress(storeId, {
        current_step: state.currentStep,
        completed_steps: completedStepsRef.current,
      });
    } catch (error) {
      console.error("Error saving to DB:", error);
    }
  }, [storeId, state.config, state.currentStep]);

  // Track completed steps for ref
  const completedStepsRef = useRef<number[]>([]);

  // Auto-save on config changes (debounced)
  useEffect(() => {
    if (!storeId || state.isLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToDb();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.config, state.currentStep, storeId, state.isLoading, saveToDb]);

  // Navigation
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= wizardSteps.length) {
      dispatch({ type: "SET_STEP", step });
    }
  }, [wizardSteps.length]);

  const nextStep = useCallback(() => {
    if (state.currentStep < wizardSteps.length) {
      dispatch({ type: "SET_STEP", step: state.currentStep + 1 });
    }
  }, [state.currentStep, wizardSteps.length]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: "SET_STEP", step: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  // Config updates
  const updateConfig = useCallback((config: Partial<WizardLocalConfig>) => {
    dispatch({ type: "UPDATE_CONFIG", config });
  }, []);

  // Product management
  const addProduct = useCallback(
    async (productData?: Partial<Product>): Promise<Product | null> => {
      if (!storeId) return null;

      const newProduct = await createProduct(storeId, {
        name: productData?.name || "New Product",
        description: productData?.description || "",
        price: productData?.price || 0,
        images: productData?.images || [],
      });

      if (newProduct) {
        dispatch({ type: "ADD_PRODUCT", product: newProduct });
      }

      return newProduct;
    },
    [storeId]
  );

  const updateProductData = useCallback(
    async (productId: string, updates: Partial<Product>) => {
      // Update locally first for responsiveness
      dispatch({ type: "UPDATE_PRODUCT", productId, updates });

      // Then persist to DB
      await updateProduct(productId, updates);
    },
    []
  );

  const removeProduct = useCallback(async (productId: string) => {
    // Remove locally first
    dispatch({ type: "REMOVE_PRODUCT", productId });

    // Then delete from DB
    await deleteProduct(productId);
  }, []);

  // Status
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", isSubmitting });
  }, []);

  const setError = useCallback((error: string | undefined) => {
    dispatch({ type: "SET_ERROR", error });
  }, []);

  // Manual save
  const saveProgress = useCallback(async () => {
    await saveToDb();
  }, [saveToDb]);

  // Computed values - check step completion by key (not step number)
  const isStepCompleteByKey = useCallback(
    (stepKey: string): boolean => {
      switch (stepKey) {
        case "storeName":
          return Boolean(state.config.storeName?.trim());
        case "tagline":
          return Boolean(state.config.tagline?.trim());
        case "primaryColor":
          return Boolean(state.config.primaryColor);
        case "logo":
          return Boolean(state.config.logoUrl || state.config.useTextLogo);
        case "products":
        case "services":
        case "portfolio":
          return state.products.length > 0;
        case "testimonials":
          // Testimonials are optional for now - always complete
          return true;
        case "about":
          return Boolean(state.config.aboutText?.trim());
        case "contact":
          return Boolean(state.config.contactEmail?.trim());
        case "payments":
          return Boolean(state.config.stripeConnected);
        default:
          return false;
      }
    },
    [state.config, state.products]
  );

  // Get current step key based on step number
  const currentStepKey = wizardSteps[state.currentStep - 1]?.key || "storeName";

  // Check if current step is complete
  const isCurrentStepComplete = isStepCompleteByKey(currentStepKey);

  const completedSteps = wizardSteps.map((s) => s.id).filter((id) => {
    const step = wizardSteps.find((ws) => ws.id === id);
    return step ? isStepCompleteByKey(step.key) : false;
  });
  completedStepsRef.current = completedSteps;

  const progressPercent = Math.round(
    (completedSteps.length / wizardSteps.length) * 100
  );

  const canGoNext =
    state.currentStep < wizardSteps.length && isCurrentStepComplete;
  const canGoPrev = state.currentStep > 1;
  const isLastStep = state.currentStep === wizardSteps.length;

  const value: WizardContextValue = {
    state,
    storeId,
    userId: userIdRef.current,
    template,
    wizardSteps,
    currentStepKey,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    updateConfig,
    addProduct,
    updateProductData,
    removeProduct,
    setSubmitting,
    setError,
    completedSteps,
    progressPercent,
    saveProgress,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}

// =============================================================================
// Helpers (re-exported for backward compatibility)
// =============================================================================

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function createEmptyProduct(): Partial<Product> {
  return {
    name: "",
    description: "",
    price: 0,
    images: [],
  };
}
