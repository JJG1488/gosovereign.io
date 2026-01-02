export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    brand: string;
    brandDark: string;
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    textSecondary: string;
  };
  isPremium: boolean;
}

export const themePresets: ThemePreset[] = [
  {
    id: "default",
    name: "Emerald",
    colors: {
      brand: "#10b981",
      brandDark: "#059669",
      bgPrimary: "#ffffff",
      bgSecondary: "#f9fafb",
      textPrimary: "#111827",
      textSecondary: "#6b7280",
    },
    isPremium: false,
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      brand: "#0ea5e9",
      brandDark: "#0284c7",
      bgPrimary: "#ffffff",
      bgSecondary: "#f0f9ff",
      textPrimary: "#0c4a6e",
      textSecondary: "#64748b",
    },
    isPremium: true,
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: {
      brand: "#f97316",
      brandDark: "#ea580c",
      bgPrimary: "#ffffff",
      bgSecondary: "#fff7ed",
      textPrimary: "#1c1917",
      textSecondary: "#78716c",
    },
    isPremium: true,
  },
  {
    id: "midnight",
    name: "Midnight",
    colors: {
      brand: "#8b5cf6",
      brandDark: "#7c3aed",
      bgPrimary: "#0f172a",
      bgSecondary: "#1e293b",
      textPrimary: "#f8fafc",
      textSecondary: "#94a3b8",
    },
    isPremium: true,
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      brand: "#22c55e",
      brandDark: "#16a34a",
      bgPrimary: "#ffffff",
      bgSecondary: "#f0fdf4",
      textPrimary: "#14532d",
      textSecondary: "#4b5563",
    },
    isPremium: true,
  },
  {
    id: "rose",
    name: "Rose",
    colors: {
      brand: "#f43f5e",
      brandDark: "#e11d48",
      bgPrimary: "#ffffff",
      bgSecondary: "#fff1f2",
      textPrimary: "#1f2937",
      textSecondary: "#6b7280",
    },
    isPremium: true,
  },
];

/**
 * Get theme preset by ID
 */
export function getThemePreset(id: string): ThemePreset {
  return themePresets.find((t) => t.id === id) || themePresets[0];
}

/**
 * Generate CSS variables for a theme
 */
export function generateThemeCSS(theme: ThemePreset): string {
  return `
    :root {
      --brand-color: ${theme.colors.brand};
      --brand-dark: ${theme.colors.brandDark};
      --bg-primary: ${theme.colors.bgPrimary};
      --bg-secondary: ${theme.colors.bgSecondary};
      --text-primary: ${theme.colors.textPrimary};
      --text-secondary: ${theme.colors.textSecondary};
    }
  `;
}
