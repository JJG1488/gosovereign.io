"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail, Phone, Clock, CheckCircle } from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, status: status as ContactSubmission["status"] } : m)));
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status: status as ContactSubmission["status"] });
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Contact form submissions</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500">
            When visitors submit the contact form, messages will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="bg-white rounded-xl border divide-y max-h-[600px] overflow-auto">
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === message.id ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {message.name}
                      </h3>
                      {message.status === "new" && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{message.email}</p>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {message.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(message.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Message Detail */}
          {selectedMessage ? (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedMessage.name}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="flex items-center gap-1 hover:text-brand"
                    >
                      <Mail className="w-4 h-4" />
                      {selectedMessage.email}
                    </a>
                    {selectedMessage.phone && (
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="flex items-center gap-1 hover:text-brand"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedMessage.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(selectedMessage.created_at)}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    selectedMessage.status === "new"
                      ? "bg-blue-100 text-blue-700"
                      : selectedMessage.status === "contacted"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedMessage.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Your inquiry`}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Reply by Email
                </a>
                {selectedMessage.status !== "closed" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        selectedMessage.id,
                        selectedMessage.status === "new" ? "contacted" : "closed"
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as {selectedMessage.status === "new" ? "Contacted" : "Closed"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-12 text-center">
              <p className="text-gray-500">Select a message to view details</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
