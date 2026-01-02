"use client";

import { useState, useEffect } from "react";
import { Save, Plus, X, GripVertical } from "lucide-react";
import type { ProcessStep, StatItem } from "@/lib/settings";

interface Settings {
  contactMode: string;
  calendlyUrl: string;
  phoneNumber: string;
  showProcess: boolean;
  showStats: boolean;
  showTeam: boolean;
  showTestimonials: boolean;
  showFaq: boolean;
  process: ProcessStep[];
  stats: StatItem[];
  tagline: string;
  aboutText: string;
  businessHours: string;
  serviceAreas: string[];
  themePreset: string;
  heroStyle: string;
  heroImageUrl: string;
  heroVideoUrl: string;
}

const defaultSettings: Settings = {
  contactMode: "form",
  calendlyUrl: "",
  phoneNumber: "",
  showProcess: true,
  showStats: true,
  showTeam: false,
  showTestimonials: true,
  showFaq: true,
  process: [
    { step: 1, title: "Get a Free Estimate", description: "Contact us for a no-obligation quote", icon: "clipboard" },
    { step: 2, title: "We Recommend Options", description: "Our experts suggest the best solutions", icon: "message-square" },
    { step: 3, title: "We Get It Done", description: "Professional service delivered on time", icon: "check-circle" },
  ],
  stats: [
    { value: "10+", label: "Years Experience" },
    { value: "500+", label: "Happy Customers" },
    { value: "100%", label: "Satisfaction Rate" },
  ],
  tagline: "",
  aboutText: "",
  businessHours: "Mon-Fri 9am-5pm",
  serviceAreas: [],
  themePreset: "default",
  heroStyle: "gradient",
  heroImageUrl: "",
  heroVideoUrl: "",
};

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
    { id: "contact", label: "Contact" },
    { id: "sections", label: "Sections" },
    { id: "process", label: "Process" },
    { id: "stats", label: "Stats" },
    { id: "appearance", label: "Appearance" },
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
            { key: "showStats", label: "Stats / Counters" },
            { key: "showTeam", label: "Team Members" },
            { key: "showTestimonials", label: "Testimonials" },
            { key: "showFaq", label: "FAQ Section" },
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-6">
            Configure the steps shown in the &quot;How It Works&quot; section
          </p>
          
          <div className="space-y-6">
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
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-6">
            Configure the statistics shown on your homepage
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
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
        </div>
      )}
    </div>
  );
}
