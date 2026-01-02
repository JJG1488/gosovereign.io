import Link from "next/link";
import { Plus, Edit, ToggleLeft, ToggleRight, Star, GripVertical } from "lucide-react";
import { getServices } from "@/data/services";

export const dynamic = "force-dynamic";

function formatPrice(price: number | null, priceType: string): string {
  if (price === null) return "Contact for pricing";
  
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price / 100);

  switch (priceType) {
    case "starting_at":
      return "Starting at " + formatted;
    case "hourly":
      return formatted + "/hr";
    case "custom":
      return "Custom pricing";
    default:
      return formatted;
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Services</h1>
        <Link
          href="/admin/services/new"
          className="flex items-center gap-2 bg-brand text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <p className="text-gray-500 mb-4">No services yet</p>
          <Link
            href="/admin/services/new"
            className="inline-flex items-center gap-2 bg-brand text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Service
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-500 text-sm w-8"></th>
                <th className="text-left py-4 px-6 font-medium text-gray-500 text-sm">Service</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500 text-sm hidden md:table-cell">Price</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500 text-sm hidden md:table-cell">Status</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {service.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.short_description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{service.short_description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <p className="text-gray-700">{formatPrice(service.price, service.price_type)}</p>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      {service.is_active ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Inactive</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={"/admin/services/" + service.id}
                      className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
