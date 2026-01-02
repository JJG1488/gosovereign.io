import type { StatItem } from "@/lib/settings";

interface StatsProps {
  stats: StatItem[];
}

export function Stats({ stats }: StatsProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[var(--bg-dark)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={"text-center stagger-" + (index + 1)}
            >
              <p className="text-4xl md:text-5xl font-bold text-brand mb-2">
                {stat.value}
              </p>
              <p className="text-gray-400 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
