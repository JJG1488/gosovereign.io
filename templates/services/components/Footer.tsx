import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import type { RuntimeSettings } from "@/lib/settings";
import { getStoreConfig } from "@/lib/store";

interface FooterProps {
  settings: RuntimeSettings;
  storeName: string;
}

export function Footer({ settings, storeName }: FooterProps) {
  const store = getStoreConfig();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  if (settings.showFaq) {
    quickLinks.push({ href: "/faq", label: "FAQ" });
  }

  const legalLinks = [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ];

  const hasSocialLinks = settings.facebookUrl || settings.instagramUrl || settings.twitterUrl || settings.linkedinUrl;

  // Address from settings takes precedence over store config
  const displayAddress = settings.address || store.address;

  return (
    <footer className="bg-[var(--bg-dark)] text-white">
      {/* Map Embed Section */}
      {settings.showMapEmbed && settings.mapEmbedUrl && (
        <div className="border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Map Info */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-brand">
                  {settings.mapTitle}
                </h3>
                {displayAddress && (
                  <p className="text-gray-400 mb-4 flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    {displayAddress}
                  </p>
                )}
                {settings.serviceAreas && settings.serviceAreas.length > 0 && (
                  <div className="text-gray-400">
                    <p className="font-semibold text-gray-300 mb-2">Service Areas:</p>
                    <p>{settings.serviceAreas.join(", ")}</p>
                  </div>
                )}
              </div>

              {/* Map Embed */}
              <div className="rounded-xl overflow-hidden shadow-lg h-64 lg:h-80">
                <iframe
                  src={settings.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Service Area Map"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {settings.logoUrl && (
                <Image
                  src={settings.logoUrl}
                  alt={storeName}
                  width={40}
                  height={40}
                  className="brightness-100"
                />
              )}
              <span className="font-bold text-xl">{storeName}</span>
            </div>
            <p className="text-gray-400 mb-6">
              {settings.tagline || "Professional services you can trust."}
            </p>

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="flex gap-4">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand hover:text-gray-900 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand hover:text-gray-900 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings.twitterUrl && (
                  <a
                    href={settings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand hover:text-gray-900 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {settings.linkedinUrl && (
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand hover:text-gray-900 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              {settings.phoneNumber && (
                <li>
                  <a
                    href={"tel:" + settings.phoneNumber}
                    className="flex items-center gap-3 text-gray-400 hover:text-brand transition-colors"
                  >
                    <Phone className="w-5 h-5 text-brand" />
                    {settings.phoneNumber}
                  </a>
                </li>
              )}
              {store.contactEmail && (
                <li>
                  <a
                    href={"mailto:" + store.contactEmail}
                    className="flex items-center gap-3 text-gray-400 hover:text-brand transition-colors"
                  >
                    <Mail className="w-5 h-5 text-brand" />
                    {store.contactEmail}
                  </a>
                </li>
              )}
              {displayAddress && !settings.showMapEmbed && (
                <li className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                  <span>{displayAddress}</span>
                </li>
              )}
              {settings.businessHours && (
                <li className="text-gray-400 text-sm mt-4">
                  <strong className="text-gray-300">Hours:</strong>
                  <br />
                  {settings.businessHours}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} {storeName}. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Powered by{" "}
              <a
                href="https://gosovereign.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                GoSovereign
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
