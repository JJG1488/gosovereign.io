import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { getStoreConfig } from "@/lib/store";
import { getThemeById, generateThemeCSS } from "@/lib/themes";
import { getStoreSettingsFromDB } from "@/lib/settings";

// Force dynamic rendering so settings changes appear for all visitors
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const store = getStoreConfig();
  return {
    title: store.name,
    description: store.tagline || "Welcome to " + store.name,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = getStoreConfig();
  const settings = await getStoreSettingsFromDB();
  const theme = getThemeById(settings.themePreset);
  const themeCSS = generateThemeCSS(theme);

  // Override brand color with admin-configurable setting
  // Falls back to wizard-selected color if not set in admin panel
  const brandColorOverride = settings.brandColor
    ? `:root { --brand-color: ${settings.brandColor}; --brand-color-10: ${settings.brandColor}1a; --brand-color-20: ${settings.brandColor}33; }`
    : "";

  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: themeCSS + brandColorOverride,
          }}
        />
      </head>
      <body className={inter.className}>
        <LayoutWrapper settings={settings} storeName={store.name}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
