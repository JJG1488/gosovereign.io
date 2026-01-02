import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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

  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: themeCSS,
          }}
        />
      </head>
      <body className={inter.className}>
        <Header settings={settings} storeName={store.name} />
        <main className="min-h-screen">{children}</main>
        <Footer settings={settings} storeName={store.name} />
      </body>
    </html>
  );
}
