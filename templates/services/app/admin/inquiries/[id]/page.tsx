"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Clock, Trash2, Save } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
  services: { name: string } | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchInquiry() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("/api/admin/inquiries/" + id, {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          const data = await res.json();
          setInquiry(data);
          setStatus(data.status);
          setNotes(data.notes || "");
        }
      } catch (error) {
        console.error("Error fetching inquiry:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInquiry();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/inquiries/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving inquiry:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/inquiries/" + id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        router.push("/admin/inquiries");
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Inquiry not found</p>
        <Link href="/admin/inquiries" className="text-brand hover:underline mt-4 inline-block">
          Back to Inquiries
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/inquiries"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Inquiry from {inquiry.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={"mailto:" + inquiry.email} className="text-brand hover:underline">
                  {inquiry.email}
                </a>
              </div>
              {inquiry.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={"tel:" + inquiry.phone} className="text-brand hover:underline">
                    {inquiry.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{formatDate(inquiry.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Message</h2>
            {inquiry.services?.name && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium">Service Interest:</span> {inquiry.services.name}
              </p>
            )}
            <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Add internal notes..."
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full bg-brand text-gray-900 font-semibold py-3 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 w-full text-red-600 hover:text-red-700 font-medium py-3"
            >
              <Trash2 className="w-5 h-5" />
              Delete Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
