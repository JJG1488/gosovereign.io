"use client";

import { useState } from "react";
import { Send, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setFormState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formState === "error") {
      setFormState("idle");
      setErrorMessage("");
    }
  };

  if (formState === "success") {
    return (
      <div className="bg-emerald-900/20 border border-emerald-700 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">
          Message Sent!
        </h3>
        <p className="text-gray-400 mb-6">
          Thanks for reaching out. We&apos;ll get back to you soon.
        </p>
        <Button
          variant="secondary"
          onClick={() => setFormState("idle")}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formState === "error" && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Failed to send message</p>
            <p className="text-red-400/80 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={100}
            className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-gray-100 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-gray-100 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
        >
          <option value="">Select a topic</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Sales Question">Sales Question</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Billing Issue">Billing Issue</option>
          <option value="Partnership">Partnership</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-gray-100 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
          placeholder="How can we help you?"
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.message.length}/5000 characters
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={formState === "submitting"}
        className="w-full md:w-auto"
      >
        <Send className="w-4 h-4 mr-2" />
        Send Message
      </Button>
    </form>
  );
}
