import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import type { PaymentTier } from "@/types/database";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
  });
}

const PLAN_CONFIG: Record<
  PaymentTier,
  { amount: number; name: string; description: string }
> = {
  starter: {
    amount: 14900, // $149
    name: "GoSovereign Starter",
    description: "One-time purchase - Full ownership of your store",
  },
  pro: {
    amount: 29900, // $299
    name: "GoSovereign Pro",
    description: "One-time purchase - Premium features & priority support",
  },
  hosted: {
    amount: 14900, // $149 (+ subscription later)
    name: "GoSovereign Hosted",
    description: "One-time setup fee - Includes managed hosting",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, variant } = body as { plan: PaymentTier; variant?: string };

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const origin =
      request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;
    const config = PLAN_CONFIG[plan];

    // Check if user is logged in (for linking purchase to existing account)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stripe = getStripe();

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: config.name,
              description: config.description,
            },
            unit_amount: config.amount,
          },
          quantity: 1,
        },
      ],
      customer_creation: "always",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        plan,
        variant: variant || "",
        user_id: user?.id || "",
      },
      billing_address_collection: "auto",
    };

    // If user is logged in, pre-fill their email
    if (user?.email) {
      sessionConfig.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
