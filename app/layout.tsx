import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GoSovereign — Own Your Store, Not a Subscription",
  description:
    "Launch a beautiful, fully-owned e-commerce store in 15 minutes. One price. No subscriptions. No code. No permission needed.",
  keywords: [
    "ecommerce",
    "shopify alternative",
    "online store",
    "no subscription",
    "own your store",
  ],
  authors: [{ name: "GoSovereign" }],
  openGraph: {
    title: "GoSovereign — Own Your Store, Not a Subscription",
    description:
      "Launch a beautiful, fully-owned e-commerce store in 15 minutes. One price. No subscriptions. No code.",
    url: "https://gosovereign.io",
    siteName: "GoSovereign",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoSovereign — Own Your Store, Not a Subscription",
    description:
      "Launch a beautiful, fully-owned e-commerce store in 15 minutes. One price. No subscriptions. No code.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-navy-900 font-sans text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
