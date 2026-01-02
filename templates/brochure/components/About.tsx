import type { StoreSettings } from "@/lib/settings";

interface AboutProps {
  settings: StoreSettings;
}

export function About({ settings }: AboutProps) {
  const paragraphs = (settings.aboutText || "").split("\n\n").filter(Boolean);

  return (
    <section id="about" className="py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {settings.aboutTitle || "About Us"}
        </h2>
        <div className="prose prose-gray mx-auto">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, i) => (
              <p key={i} className="text-gray-600 mb-4">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-gray-600">
              We are passionate about what we do and committed to delivering excellence.
            </p>
          )}
        </div>
        {settings.aboutImage && (
          <div className="mt-8">
            <img
              src={settings.aboutImage}
              alt="About"
              className="rounded-xl mx-auto max-w-md"
            />
          </div>
        )}
      </div>
    </section>
  );
}
