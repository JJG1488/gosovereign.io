export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  company?: string;
  role?: string;
  photoUrl?: string;
}

// This file is auto-generated from your store configuration
export const testimonials: Testimonial[] = {{TESTIMONIALS_JSON}};
