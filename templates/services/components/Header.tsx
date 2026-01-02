"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import type { RuntimeSettings } from "@/lib/settings";

interface HeaderProps {
  settings: RuntimeSettings;
  storeName: string;
}

export function Header({ settings, storeName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  if (settings.showFaq) {
    navLinks.push({ href: "/faq", label: "FAQ" });
  }

  return (
    <header
      className={"fixed top-0 left-0 right-0 z-50 transition-all duration-300 " + (
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={storeName}
                width={scrolled ? 36 : 44}
                height={scrolled ? 36 : 44}
                className="transition-all duration-300"
              />
            ) : null}
            <span
              className={"font-bold transition-all duration-300 " + (
                scrolled ? "text-lg text-gray-900" : "text-xl text-white"
              )}
            >
              {storeName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={"font-medium transition-colors hover:text-brand " + (
                  scrolled ? "text-gray-700" : "text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {settings.phoneNumber && (
              <a
                href={"tel:" + settings.phoneNumber}
                className={"flex items-center gap-2 font-medium transition-colors " + (
                  scrolled ? "text-gray-700 hover:text-brand" : "text-white hover:text-brand"
                )}
              >
                <Phone className="w-4 h-4" />
                {settings.phoneNumber}
              </a>
            )}
            <Link
              href="/contact"
              className="bg-brand text-gray-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors btn-glow"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={"md:hidden p-2 " + (scrolled ? "text-gray-900" : "text-white")}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {settings.phoneNumber && (
              <a
                href={"tel:" + settings.phoneNumber}
                className="flex items-center gap-2 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                <Phone className="w-4 h-4" />
                {settings.phoneNumber}
              </a>
            )}
            <Link
              href="/contact"
              className="block w-full text-center bg-brand text-gray-900 font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
