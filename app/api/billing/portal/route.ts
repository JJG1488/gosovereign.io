import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
  });
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Stripe customer ID from user profile
    const { data: userProfile } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!userProfile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Please make a purchase first." },
        { status: 404 }
      );
    }

    // Create Stripe Customer Portal session
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal session error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
