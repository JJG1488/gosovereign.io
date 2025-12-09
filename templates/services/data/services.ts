export interface Service {
  id: string;
  name: string;
  description: string;
  price: number; // in cents (starting price)
  images: string[];
}

// This file is auto-generated from your store configuration
export const services: Service[] = {{SERVICES_JSON}};

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
