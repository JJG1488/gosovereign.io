"use client";

import Link from "next/link";
import { Container } from "@/components/ui";

interface FooterProps {
  logo: string;
  links: string[];
  copyright: string;
}

// Map link labels to actual routes
const linkRoutes: Record<string, string> = {
  FAQ: "/faq",
  Contact: "/contact",
  Terms: "/terms",
  Privacy: "/privacy",
};

export function Footer({ logo, links, copyright }: FooterProps): React.ReactElement {
  return (
    <footer className="py-12 bg-navy-950 border-t border-navy-800">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-gray-100 hover:text-emerald-400 transition-colors"
          >
            {logo}
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link}
                href={linkRoutes[link] || `#${link.toLowerCase()}`}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                {link}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-600">{copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
