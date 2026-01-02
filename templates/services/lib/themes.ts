// Theme presets for services template
// Inspired by the reference Pointer Roofing project (gold accent)

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    brand: string;
    brandDark: string;
    bgPrimary: string;
    bgSecondary: string;
    bgDark: string;
    textPrimary: string;
    textSecondary: string;
  };
  isPremium: boolean;
}

export const themes: Theme[] = [
  {
    id: "default",
    name: "Professional Gold",
    description: "Classic gold accent, inspired by trusted service businesses",
    colors: {
      brand: "#FFD700",
      brandDark: "#e6c200",
      bgPrimary: "#ffffff",
      bgSecondary: "#f9fafb",
      bgDark: "#1a1a1a",
      textPrimary: "#111827",
      textSecondary: "#4b5563",
    },
    isPremium: false,
  },
  {
    id: "modern-blue",
    name: "Modern Blue",
    description: "Clean, professional blue theme",
    colors: {
      brand: "#3b82f6",
      brandDark: "#2563eb",
      bgPrimary: "#ffffff",
      bgSecondary: "#f8fafc",
      bgDark: "#0f172a",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
    },
    isPremium: false,
  },
  {
    id: "elegant-green",
    name: "Elegant Green",
    description: "Fresh, eco-friendly appearance",
    colors: {
      brand: "#10b981",
      brandDark: "#059669",
      bgPrimary: "#ffffff",
      bgSecondary: "#f0fdf4",
      bgDark: "#064e3b",
      textPrimary: "#064e3b",
      textSecondary: "#047857",
    },
    isPremium: true,
  },
  {
    id: "bold-orange",
    name: "Bold Orange",
    description: "Energetic and attention-grabbing",
    colors: {
      brand: "#f97316",
      brandDark: "#ea580c",
      bgPrimary: "#ffffff",
      bgSecondary: "#fff7ed",
      bgDark: "#7c2d12",
      textPrimary: "#1c1917",
      textSecondary: "#57534e",
    },
    isPremium: true,
  },
  {
    id: "luxe-purple",
    name: "Luxe Purple",
    description: "Premium, sophisticated feel",
    colors: {
      brand: "#8b5cf6",
      brandDark: "#7c3aed",
      bgPrimary: "#ffffff",
      bgSecondary: "#faf5ff",
      bgDark: "#2e1065",
      textPrimary: "#1e1b4b",
      textSecondary: "#4338ca",
    },
    isPremium: true,
  },
  {
    id: "trust-teal",
    name: "Trust Teal",
    description: "Calm, reliable, trustworthy",
    colors: {
      brand: "#14b8a6",
      brandDark: "#0d9488",
      bgPrimary: "#ffffff",
      bgSecondary: "#f0fdfa",
      bgDark: "#134e4a",
      textPrimary: "#0f172a",
      textSecondary: "#0f766e",
    },
    isPremium: true,
  },
];

export function getThemeById(themeId: string): Theme {
  return themes.find((t) => t.id === themeId) || themes[0];
}

export function generateThemeCSS(theme: Theme): string {
  return `
    :root {
      --brand-color: ${theme.colors.brand};
      --brand-color-dark: ${theme.colors.brandDark};
      --brand-color-10: ${theme.colors.brand}1a;
      --brand-color-20: ${theme.colors.brand}33;
      --bg-primary: ${theme.colors.bgPrimary};
      --bg-secondary: ${theme.colors.bgSecondary};
      --bg-dark: ${theme.colors.bgDark};
      --text-primary: ${theme.colors.textPrimary};
      --text-secondary: ${theme.colors.textSecondary};
    }
  `;
}
