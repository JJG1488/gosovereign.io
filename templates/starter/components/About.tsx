import { store } from "@/data/store";

export function About() {
  return (
    <section id="about" className="bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">About Us</h2>
        <div className="prose prose-gray mx-auto">
          {store.aboutText.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-gray-600 mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
