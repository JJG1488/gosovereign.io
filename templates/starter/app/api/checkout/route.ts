import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { store } from "@/data/store";
import { getProduct } from "@/data/products";

// Initialize Stripe with the secret key from environment variables
// Store owners will set this in their Vercel environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

interface CartItem {
  productId: string;
  quantity: number;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { items } = body as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Build line items for Stripe Checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = getProduct(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.images.length > 0 ? [product.images[0]] : undefined,
          },
          unit_amount: product.price, // Already in cents
        },
        quantity: item.quantity,
      });
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout Session with destination charge
    // This sends payment to the connected account (store owner)
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        store_name: store.name,
      },
    };

    // If the store has a connected Stripe account, use destination charges
    // This allows the store owner to receive payments directly
    if (store.stripeAccountId) {
      sessionParams.payment_intent_data = {
        // Application fee is 0% - GoSovereign takes no transaction fees
        // Store owner receives 100% minus standard Stripe fees
        transfer_data: {
          destination: store.stripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
