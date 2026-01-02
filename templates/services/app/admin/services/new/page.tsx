import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ServiceForm } from "@/components/ServiceForm";

export default function NewServicePage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/services"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">New Service</h1>
      </div>

      <ServiceForm isNew />
    </div>
  );
}
