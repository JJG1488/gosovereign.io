import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getStoreConfig } from "@/lib/store";
import { getThemePreset, generateThemeCSS } from "@/lib/themes";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const store = getStoreConfig();
  return {
    title: store.name,
    description: `Welcome to ${store.name}`,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = getStoreConfig();
  const theme = getThemePreset(store.themePreset);
  const themeCSS = generateThemeCSS(theme);

  // Override brand color with user's selected color from wizard
  // This ensures the color picker selection takes precedence over theme presets
  const brandColorOverride = store.brandColor
    ? `:root { --brand-color: ${store.brandColor}; --brand-dark: ${store.brandColor}; }`
    : "";

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS + brandColorOverride }} />
      </head>
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
