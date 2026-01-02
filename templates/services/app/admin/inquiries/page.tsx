import Link from "next/link";
import { MessageSquare, Mail, Phone, Clock } from "lucide-react";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  services: { name: string } | null;
}

async function getInquiries(): Promise<Inquiry[]> {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return [];
  }

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*, services(name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inquiries:", error);
    return [];
  }

  return data || [];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "new":
      return "bg-yellow-100 text-yellow-700";
    case "contacted":
      return "bg-blue-100 text-blue-700";
    case "converted":
      return "bg-green-100 text-green-700";
    case "closed":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Inquiries</h1>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No inquiries yet</p>
          <p className="text-sm text-gray-400 mt-2">
            When customers submit contact forms, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={"/admin/inquiries/" + inquiry.id}
              className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
                    <span
                      className={"text-xs font-medium px-2 py-1 rounded-full capitalize " +
                        getStatusColor(inquiry.status)
                      }
                    >
                      {inquiry.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {inquiry.email}
                    </span>
                    {inquiry.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {inquiry.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(inquiry.created_at)}
                    </span>
                  </div>

                  {inquiry.services?.name && (
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-medium">Service:</span> {inquiry.services.name}
                    </p>
                  )}

                  <p className="text-gray-600 line-clamp-2">{inquiry.message}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
