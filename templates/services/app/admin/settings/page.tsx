"use client";

import { useState, useEffect } from "react";
import { Save, Plus, X, GripVertical, Star } from "lucide-react";
import type {
  ProcessStep,
  StatItem,
  TrustBadge,
  SpecialtyItem,
  AdditionalService,
  CommitmentBadge,
  Testimonial,
} from "@/lib/settings";

interface Settings {
  // General
  tagline: string;
  aboutText: string;
  businessHours: string;
  serviceAreas: string[];

  // Contact
  contactMode: string;
  calendlyUrl: string;
  phoneNumber: string;

  // Section toggles
  showProcess: boolean;
  showStats: boolean;
  showTeam: boolean;
  showTestimonials: boolean;
  showFaq: boolean;
  showWhyChooseUs: boolean;
  showSpecialties: boolean;
  showAdditionalServices: boolean;
  showBadges: boolean;
  showMapEmbed: boolean;

  // Process
  process: ProcessStep[];
  processTitle: string;
  processSubtitle: string;
  processCTAText: string;

  // Stats
  stats: StatItem[];

  // Hero
  themePreset: string;
  heroStyle: string;
  heroImageUrl: string;
  heroVideoUrl: string;
  heroBadgeText: string;
  heroHeading: string;
  heroHeadingAccent: string;
  heroSubheading: string;
  trustBadges: TrustBadge[];
  heroCTAText: string;
  heroSecondaryCTAText: string;

  // Why Choose Us
  whyChooseUsTitle: string;
  whyChooseUsHeading: string;
  whyChooseUsText: string;
  emergencyBannerText: string;
  emergencyBannerEnabled: boolean;

  // Specialties
  specialtiesTitle: string;
  specialties: SpecialtyItem[];

  // Additional Services
  additionalServicesTitle: string;
  additionalServices: AdditionalService[];

  // Badges
  badgesTitle: string;
  badgesSubtitle: string;
  badges: CommitmentBadge[];

  // Testimonials
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  overallRating: number;
  reviewCount: number;
  googleReviewsUrl: string;
  testimonials: Testimonial[];

  // Footer
  mapEmbedUrl: string;
  mapTitle: string;
  address: string;
}

const defaultSettings: Settings = {
  tagline: "",
  aboutText: "",
  businessHours: "Mon-Fri 9am-5pm",
  serviceAreas: [],
  contactMode: "form",
  calendlyUrl: "",
  phoneNumber: "",
  showProcess: true,
  showStats: true,
  showTeam: false,
  showTestimonials: true,
  showFaq: true,
  showWhyChooseUs: true,
  showSpecialties: false,
  showAdditionalServices: false,
  showBadges: true,
  showMapEmbed: false,
  process: [
    { step: 1, title: "Get a Free Estimate", description: "Contact us for a no-obligation quote", icon: "clipboard" },
    { step: 2, title: "We Recommend Options", description: "Our experts suggest the best solutions", icon: "message-square" },
    { step: 3, title: "We Get It Done", description: "Professional service delivered on time", icon: "check-circle" },
  ],
  processTitle: "Our Simple Process",
  processSubtitle: "From consultation to completion, we make it easy",
  processCTAText: "Get Your Free Estimate",
  stats: [
    { value: "10+", label: "Years Experience" },
    { value: "500+", label: "Happy Customers" },
    { value: "100%", label: "Satisfaction Rate" },
  ],
  themePreset: "default",
  heroStyle: "gradient",
  heroImageUrl: "",
  heroVideoUrl: "",
  heroBadgeText: "Trusted Local Business",
  heroHeading: "Professional Services",
  heroHeadingAccent: "You Can Trust",
  heroSubheading: "",
  trustBadges: [
    { text: "Licensed", icon: "shield" },
    { text: "Insured", icon: "shield-check" },
    { text: "Satisfaction Guaranteed", icon: "star" },
  ],
  heroCTAText: "Get a Free Quote",
  heroSecondaryCTAText: "Our Services",
  whyChooseUsTitle: "Why Choose Us?",
  whyChooseUsHeading: "Quality You Can Trust",
  whyChooseUsText: "",
  emergencyBannerText: "Available for Emergency Services!",
  emergencyBannerEnabled: false,
  specialtiesTitle: "Our Specialties",
  specialties: [],
  additionalServicesTitle: "Additional Services",
  additionalServices: [],
  badgesTitle: "Our Commitment to Excellence",
  badgesSubtitle: "Why customers choose us for their service needs",
  badges: [
    { icon: "shield", title: "Fully Insured", description: "Complete protection for your peace of mind", color: "#0ea5e9" },
    { icon: "award", title: "Certified Experts", description: "Licensed professionals you can count on", color: "#10b981" },
    { icon: "wrench", title: "Quality Work", description: "Premium materials and expert craftsmanship", color: "#f59e0b" },
    { icon: "check-circle", title: "Guaranteed", description: "100% satisfaction guaranteed", color: "#8b5cf6" },
  ],
  testimonialsTitle: "What Our Customers Say",
  testimonialsSubtitle: "Real reviews from satisfied customers",
  overallRating: 5.0,
  reviewCount: 0,
  googleReviewsUrl: "",
  testimonials: [],
  mapEmbedUrl: "",
  mapTitle: "Our Service Area",
  address: "",
};

const iconOptions = [
  { value: "shield", label: "Shield" },
  { value: "shield-check", label: "Shield Check" },
  { value: "award", label: "Award" },
  { value: "star", label: "Star" },
  { value: "check-circle", label: "Check Circle" },
  { value: "wrench", label: "Wrench" },
  { value: "hammer", label: "Hammer" },
  { value: "users", label: "Users" },
  { value: "clock", label: "Clock" },
  { value: "heart", label: "Heart" },
  { value: "thumbs-up", label: "Thumbs Up" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [newArea, setNewArea] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("/api/admin/settings", {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  }

  function updateProcess(index: number, field: keyof ProcessStep, value: string | number) {
    setSettings((prev) => ({
      ...prev,
      process: prev.process.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      ),
    }));
  }

  function updateStat(index: number, field: keyof StatItem, value: string) {
    setSettings((prev) => ({
      ...prev,
      stats: prev.stats.map((stat, i) =>
        i === index ? { ...stat, [field]: value } : stat
      ),
    }));
  }

  function updateTrustBadge(index: number, field: keyof TrustBadge, value: string) {
    setSettings((prev) => ({
      ...prev,
      trustBadges: prev.trustBadges.map((badge, i) =>
        i === index ? { ...badge, [field]: value } : badge
      ),
    }));
  }

  function addTrustBadge() {
    setSettings((prev) => ({
      ...prev,
      trustBadges: [...prev.trustBadges, { text: "", icon: "check-circle" }],
    }));
  }

  function removeTrustBadge(index: number) {
    setSettings((prev) => ({
      ...prev,
      trustBadges: prev.trustBadges.filter((_, i) => i !== index),
    }));
  }

  function updateSpecialty(index: number, field: keyof SpecialtyItem, value: string) {
    setSettings((prev) => ({
      ...prev,
      specialties: prev.specialties.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addSpecialty() {
    setSettings((prev) => ({
      ...prev,
      specialties: [...prev.specialties, { id: Date.now().toString(), name: "", description: "" }],
    }));
  }

  function removeSpecialty(index: number) {
    setSettings((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  }

  function updateAdditionalService(index: number, field: keyof AdditionalService, value: string) {
    setSettings((prev) => ({
      ...prev,
      additionalServices: prev.additionalServices.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addAdditionalService() {
    setSettings((prev) => ({
      ...prev,
      additionalServices: [...prev.additionalServices, { title: "", description: "", icon: "🔧" }],
    }));
  }

  function removeAdditionalService(index: number) {
    setSettings((prev) => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index),
    }));
  }

  function updateBadge(index: number, field: keyof CommitmentBadge, value: string) {
    setSettings((prev) => ({
      ...prev,
      badges: prev.badges.map((badge, i) =>
        i === index ? { ...badge, [field]: value } : badge
      ),
    }));
  }

  function updateTestimonial(index: number, field: keyof Testimonial, value: string | number) {
    setSettings((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addTestimonial() {
    setSettings((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { id: Date.now().toString(), rating: 5, text: "", reviewerName: "", date: "" },
      ],
    }));
  }

  function removeTestimonial(index: number) {
    setSettings((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }));
  }

  function addServiceArea() {
    if (newArea.trim()) {
      setSettings((prev) => ({
        ...prev,
        serviceAreas: [...(prev.serviceAreas || []), newArea.trim()],
      }));
      setNewArea("");
    }
  }

  function removeServiceArea(index: number) {
    setSettings((prev) => ({
      ...prev,
      serviceAreas: (prev.serviceAreas || []).filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "hero", label: "Hero" },
    { id: "contact", label: "Contact" },
    { id: "sections", label: "Sections" },
    { id: "process", label: "Process" },
    { id: "whychooseus", label: "Why Choose Us" },
    { id: "specialties", label: "Specialties" },
    { id: "badges", label: "Badges" },
    { id: "testimonials", label: "Testimonials" },
    { id: "footer", label: "Footer" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={"px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors " + (
              activeTab === tab.id
                ? "bg-brand text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings((prev) => ({ ...prev, tagline: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Quality workmanship, reliable service"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Text
            </label>
            <textarea
              value={settings.aboutText}
              onChange={(e) => setSettings((prev) => ({ ...prev, aboutText: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Tell your customers about your business..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Hours
            </label>
            <input
              type="text"
              value={settings.businessHours}
              onChange={(e) => setSettings((prev) => ({ ...prev, businessHours: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Mon-Fri 9am-5pm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Areas
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addServiceArea())}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Add a service area..."
              />
              <button
                type="button"
                onClick={addServiceArea}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {settings.serviceAreas && settings.serviceAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {settings.serviceAreas.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => removeServiceArea(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Tab */}
      {activeTab === "hero" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badge Text (above heading)
              </label>
              <input
                type="text"
                value={settings.heroBadgeText}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroBadgeText: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Trusted Since 2010"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Style
              </label>
              <select
                value={settings.heroStyle}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroStyle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="gradient">Gradient Background</option>
                <option value="image">Background Image</option>
                <option value="video">Background Video</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Heading
              </label>
              <input
                type="text"
                value={settings.heroHeading}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroHeading: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Professional Services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading Accent (colored)
              </label>
              <input
                type="text"
                value={settings.heroHeadingAccent}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroHeadingAccent: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="You Can Trust"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subheading / Secondary Text
            </label>
            <input
              type="text"
              value={settings.heroSubheading}
              onChange={(e) => setSettings((prev) => ({ ...prev, heroSubheading: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Quality workmanship, reliable service, and complete customer satisfaction guaranteed."
            />
          </div>

          {settings.heroStyle === "image" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image URL
              </label>
              <input
                type="url"
                value={settings.heroImageUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="https://example.com/hero-image.jpg"
              />
            </div>
          )}

          {settings.heroStyle === "video" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Video URL
              </label>
              <input
                type="url"
                value={settings.heroVideoUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroVideoUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="https://example.com/hero-video.mp4"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary CTA Text
              </label>
              <input
                type="text"
                value={settings.heroCTAText}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroCTAText: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Get a Free Quote"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary CTA Text
              </label>
              <input
                type="text"
                value={settings.heroSecondaryCTAText}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroSecondaryCTAText: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Our Services"
              />
            </div>
          </div>

          {/* Trust Badges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Trust Badges (shown below heading)
              </label>
              <button
                type="button"
                onClick={addTrustBadge}
                className="flex items-center gap-1 text-sm text-brand hover:text-brand-dark"
              >
                <Plus className="w-4 h-4" /> Add Badge
              </button>
            </div>
            <div className="space-y-3">
              {settings.trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={badge.icon}
                    onChange={(e) => updateTrustBadge(index, "icon", e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={badge.text}
                    onChange={(e) => updateTrustBadge(index, "text", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                    placeholder="Badge text"
                  />
                  <button
                    type="button"
                    onClick={() => removeTrustBadge(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Mode
            </label>
            <select
              value={settings.contactMode}
              onChange={(e) => setSettings((prev) => ({ ...prev, contactMode: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="form">Contact Form</option>
              <option value="calendly">Calendly Scheduling</option>
              <option value="phone">Phone Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phoneNumber}
              onChange={(e) => setSettings((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="(555) 123-4567"
            />
          </div>

          {settings.contactMode === "calendly" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendly URL
              </label>
              <input
                type="url"
                value={settings.calendlyUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, calendlyUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="https://calendly.com/yourbusiness"
              />
            </div>
          )}
        </div>
      )}

      {/* Sections Tab */}
      {activeTab === "sections" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Toggle which sections appear on your homepage
          </p>

          {[
            { key: "showProcess", label: "How It Works / Process Steps" },
            { key: "showWhyChooseUs", label: "Why Choose Us" },
            { key: "showSpecialties", label: "Specialties / Materials" },
            { key: "showAdditionalServices", label: "Additional Services" },
            { key: "showBadges", label: "Commitment Badges" },
            { key: "showStats", label: "Stats / Counters" },
            { key: "showTestimonials", label: "Testimonials" },
            { key: "showTeam", label: "Team Members" },
            { key: "showFaq", label: "FAQ Section" },
            { key: "showMapEmbed", label: "Footer Map Embed" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={settings[item.key as keyof Settings] as boolean}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [item.key]: e.target.checked }))
                }
                className="w-5 h-5 text-brand focus:ring-brand rounded"
              />
              <span className="text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Process Tab */}
      {activeTab === "process" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={settings.processTitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, processTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Our Simple Process"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={settings.processCTAText}
                onChange={(e) => setSettings((prev) => ({ ...prev, processCTAText: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Get Your Free Estimate"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Subtitle
            </label>
            <input
              type="text"
              value={settings.processSubtitle}
              onChange={(e) => setSettings((prev) => ({ ...prev, processSubtitle: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="From consultation to completion, we make it easy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Process Steps
            </label>
            <div className="space-y-4">
              {settings.process.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <GripVertical className="w-5 h-5 text-gray-400 mt-3" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Step {index + 1} Title
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateProcess(index, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => updateProcess(index, "description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Why Choose Us Tab */}
      {activeTab === "whychooseus" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={settings.whyChooseUsTitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, whyChooseUsTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Why Choose Us?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Heading
              </label>
              <input
                type="text"
                value={settings.whyChooseUsHeading}
                onChange={(e) => setSettings((prev) => ({ ...prev, whyChooseUsHeading: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Quality You Can Trust"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Text
            </label>
            <textarea
              value={settings.whyChooseUsText}
              onChange={(e) => setSettings((prev) => ({ ...prev, whyChooseUsText: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Tell customers why they should choose your business..."
            />
          </div>

          <div className="border-t pt-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={settings.emergencyBannerEnabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, emergencyBannerEnabled: e.target.checked }))}
                className="w-5 h-5 text-brand focus:ring-brand rounded"
              />
              <span className="text-gray-700 font-medium">Show Emergency Services Banner</span>
            </label>

            {settings.emergencyBannerEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Text
                </label>
                <input
                  type="text"
                  value={settings.emergencyBannerText}
                  onChange={(e) => setSettings((prev) => ({ ...prev, emergencyBannerText: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Available for Emergency Services!"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Specialties Tab */}
      {activeTab === "specialties" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={settings.specialtiesTitle}
              onChange={(e) => setSettings((prev) => ({ ...prev, specialtiesTitle: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Our Specialties"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Specialty Items
              </label>
              <button
                type="button"
                onClick={addSpecialty}
                className="flex items-center gap-1 text-sm text-brand hover:text-brand-dark"
              >
                <Plus className="w-4 h-4" /> Add Specialty
              </button>
            </div>

            <div className="space-y-4">
              {settings.specialties.map((item, index) => (
                <div key={item.id || index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Item {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateSpecialty(index, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      placeholder="Specialty name"
                    />
                    <textarea
                      value={item.description}
                      onChange={(e) => updateSpecialty(index, "description", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      placeholder="Description"
                    />
                  </div>
                </div>
              ))}

              {settings.specialties.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">
                  No specialties added yet. Click &quot;Add Specialty&quot; to add one.
                </p>
              )}
            </div>
          </div>

          {/* Additional Services */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Additional Services (with icons/emojis)
              </label>
              <button
                type="button"
                onClick={addAdditionalService}
                className="flex items-center gap-1 text-sm text-brand hover:text-brand-dark"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>

            <div className="space-y-4">
              {settings.additionalServices.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Service {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAdditionalService(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => updateAdditionalService(index, "icon", e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm text-center text-2xl"
                      placeholder="🔧"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateAdditionalService(index, "title", e.target.value)}
                      className="md:col-span-3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      placeholder="Service title"
                    />
                  </div>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateAdditionalService(index, "description", e.target.value)}
                    rows={2}
                    className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                    placeholder="Description"
                  />
                </div>
              ))}

              {settings.additionalServices.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No additional services added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={settings.badgesTitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, badgesTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Our Commitment to Excellence"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Subtitle
              </label>
              <input
                type="text"
                value={settings.badgesSubtitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, badgesSubtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Why customers choose us"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Commitment Badges
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.badges.map((badge, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                      <select
                        value={badge.icon}
                        onChange={(e) => updateBadge(index, "icon", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                      <input
                        type="color"
                        value={badge.color}
                        onChange={(e) => updateBadge(index, "color", e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={badge.title}
                      onChange={(e) => updateBadge(index, "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      placeholder="Badge title"
                    />
                    <input
                      type="text"
                      value={badge.description}
                      onChange={(e) => updateBadge(index, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      placeholder="Badge description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Statistics (shown in dark bar below badges)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {settings.stats.map((stat, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateStat(index, "value", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      placeholder="10+"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStat(index, "label", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      placeholder="Years Experience"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === "testimonials" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={settings.testimonialsTitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, testimonialsTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="What Our Customers Say"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Subtitle
              </label>
              <input
                type="text"
                value={settings.testimonialsSubtitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, testimonialsSubtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Real reviews from satisfied customers"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={settings.overallRating}
                onChange={(e) => setSettings((prev) => ({ ...prev, overallRating: parseFloat(e.target.value) || 5 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Review Count
              </label>
              <input
                type="number"
                min="0"
                value={settings.reviewCount}
                onChange={(e) => setSettings((prev) => ({ ...prev, reviewCount: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Reviews Link
              </label>
              <input
                type="url"
                value={settings.googleReviewsUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, googleReviewsUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="https://g.page/..."
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Testimonials
              </label>
              <button
                type="button"
                onClick={addTestimonial}
                className="flex items-center gap-1 text-sm text-brand hover:text-brand-dark"
              >
                <Plus className="w-4 h-4" /> Add Testimonial
              </button>
            </div>

            <div className="space-y-4">
              {settings.testimonials.map((item, index) => (
                <div key={item.id || index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Review {index + 1}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateTestimonial(index, "rating", star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= item.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTestimonial(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      value={item.text}
                      onChange={(e) => updateTestimonial(index, "text", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                      placeholder="Customer review text..."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={item.reviewerName}
                        onChange={(e) => updateTestimonial(index, "reviewerName", e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                        placeholder="Reviewer name"
                      />
                      <input
                        type="text"
                        value={item.date || ""}
                        onChange={(e) => updateTestimonial(index, "date", e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                        placeholder="Date (optional)"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {settings.testimonials.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">
                  No testimonials added yet. Click &quot;Add Testimonial&quot; to add one.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Tab */}
      {activeTab === "footer" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="123 Main Street, City, State 12345"
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Map Embed</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Section Title
              </label>
              <input
                type="text"
                value={settings.mapTitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, mapTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Our Service Area"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps Embed URL
              </label>
              <input
                type="url"
                value={settings.mapEmbedUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, mapEmbedUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Go to Google Maps → Share → Embed a map → Copy the src URL from the iframe
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
