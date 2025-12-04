import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { PaymentTier } from "@/types/database";

// Use service role client to bypass RLS
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutComplete(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();

  const email = session.customer_email || session.customer_details?.email;
  if (!email) {
    console.error("No email found in checkout session:", session.id);
    return;
  }

  const plan = session.metadata?.plan as PaymentTier;
  const variant = session.metadata?.variant || null;
  const existingUserId = session.metadata?.user_id || null;

  console.log("Processing checkout completion:", {
    sessionId: session.id,
    email,
    plan,
    existingUserId,
  });

  try {
    // Step 1: Find or create auth user
    let userId: string | null = existingUserId || null;

    if (!userId) {
      // Check if user exists by email
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email === email
      );

      if (existingUser) {
        userId = existingUser.id;
        console.log("Found existing auth user:", userId);
      } else {
        // Create new auth user (auto-confirmed)
        const { data: newUser, error: createError } =
          await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
          });

        if (createError) {
          console.error("Failed to create auth user:", createError);
          throw createError;
        }

        userId = newUser.user.id;
        console.log("Created new auth user:", userId);
      }
    }

    // Step 2: Create or update user profile
    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: userId,
        email,
        has_paid: true,
        paid_at: new Date().toISOString(),
        payment_tier: plan,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : null,
      },
      {
        onConflict: "id",
      }
    );

    if (profileError) {
      console.error("Failed to upsert user profile:", profileError);
      throw profileError;
    }

    console.log("Updated user profile with payment info");

    // Step 3: Record purchase
    const { error: purchaseError } = await supabase.from("purchases").insert({
      user_id: userId,
      email,
      stripe_checkout_session_id: session.id,
      stripe_customer_id:
        typeof session.customer === "string" ? session.customer : null,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      plan,
      amount: session.amount_total || 0,
      currency: session.currency || "usd",
      status: "completed",
      variant,
      metadata: {
        payment_status: session.payment_status,
        mode: session.mode,
      },
    });

    if (purchaseError) {
      // Check if it's a duplicate (idempotency)
      if (purchaseError.code === "23505") {
        console.log("Purchase already recorded (duplicate webhook)");
      } else {
        console.error("Failed to record purchase:", purchaseError);
        throw purchaseError;
      }
    } else {
      console.log("Recorded purchase in database");
    }

    // Step 4: Send magic link for passwordless login (only for new users or direct purchases)
    if (!existingUserId) {
      const origin =
        process.env.NEXT_PUBLIC_APP_URL || "https://gosovereign.io";

      const { error: magicLinkError } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: {
            redirectTo: `${origin}/wizard`,
          },
        });

      if (magicLinkError) {
        console.error("Failed to generate magic link:", magicLinkError);
        // Don't throw - payment succeeded, just log the error
      } else {
        console.log("Magic link sent to:", email);
      }
    }

    console.log("Checkout completion processed successfully");
  } catch (error) {
    console.error("Error processing checkout completion:", error);
    // Don't throw - we don't want Stripe to retry and charge again
    // The payment succeeded, we just had an issue with our internal processing
  }
}
