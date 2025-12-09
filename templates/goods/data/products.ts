export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  images: string[];
}

// This file is auto-generated from your store configuration
export const products: Product[] = {{PRODUCTS_JSON}};

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
