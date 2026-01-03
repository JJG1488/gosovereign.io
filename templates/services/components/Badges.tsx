"use client";

import {
  Shield,
  Award,
  Wrench,
  CheckCircle,
  Clock,
  Users,
  Star,
  ShieldCheck,
  BadgeCheck,
  Hammer,
  Heart,
  ThumbsUp,
} from "lucide-react";
import type { RuntimeSettings, CommitmentBadge, StatItem } from "@/lib/settings";

interface BadgesProps {
  settings: RuntimeSettings;
}

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  "shield-check": ShieldCheck,
  award: Award,
  wrench: Wrench,
  hammer: Hammer,
  "check-circle": CheckCircle,
  "badge-check": BadgeCheck,
  star: Star,
  clock: Clock,
  users: Users,
  heart: Heart,
  "thumbs-up": ThumbsUp,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || Shield;
}

export function Badges({ settings }: BadgesProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-brand/15 text-brand-dark px-4 py-2 rounded-full text-sm font-semibold tracking-wide mb-4">
            WHY CHOOSE US
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {settings.badgesTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {settings.badgesSubtitle}
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {settings.badges.map((badge: CommitmentBadge, index: number) => {
            const IconComponent = getIcon(badge.icon);
            return (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-gray-50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:bg-white group"
                style={{
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = badge.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                {/* Icon Container */}
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${badge.color}15 0%, ${badge.color}30 100%)`,
                  }}
                >
                  <IconComponent
                    className="w-10 h-10"
                    style={{ color: badge.color }}
                  />
                </div>

                {/* Title */}
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {badge.title}
                </h4>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        {settings.showStats && settings.stats && settings.stats.length > 0 && (
          <div className="bg-gray-800 rounded-3xl p-8 lg:p-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
              {settings.stats.map((stat: StatItem, index: number) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-brand mb-2">
                    {index === 0 && <Clock className="w-9 h-9" />}
                    {index === 1 && <Users className="w-9 h-9" />}
                    {index === 2 && <CheckCircle className="w-9 h-9" />}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold text-brand mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-300 text-lg">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
