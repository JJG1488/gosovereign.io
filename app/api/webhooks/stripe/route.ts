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

  // DEBUG: Log what's being used for signature verification
  console.log("=== WEBHOOK DEBUG ===");
  console.log("Secret loaded:", webhookSecret ? webhookSecret.substring(0, 15) + "..." : "NOT SET");
  console.log("Signature header:", signature?.substring(0, 30) + "...");
  console.log("Body length:", body.length);

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
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(invoice);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
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

    // Step 2.5: Apply payment tier to store(s)
    const selectedStoreId = session.metadata?.store_id || null;

    const { data: userStores } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", userId);

    if (selectedStoreId) {
      // User selected a specific store (multi-store scenario)
      const { error: storeUpdateError } = await supabase
        .from("stores")
        .update({
          payment_tier: plan,
          subscription_status: plan === "hosted" ? "active" : "none",
          can_deploy: true,
        })
        .eq("id", selectedStoreId)
        .eq("user_id", userId); // Security: ensure user owns this store

      if (storeUpdateError) {
        console.error("Failed to update store payment tier:", storeUpdateError);
      } else {
        console.log("Updated store payment tier to:", plan, "for store:", selectedStoreId);
      }
    } else if (userStores?.length === 1) {
      // User has exactly one store - apply tier automatically
      const { error: storeUpdateError } = await supabase
        .from("stores")
        .update({
          payment_tier: plan,
          subscription_status: plan === "hosted" ? "active" : "none",
          can_deploy: true,
        })
        .eq("id", userStores[0].id);

      if (storeUpdateError) {
        console.error("Failed to update store payment tier:", storeUpdateError);
      } else {
        console.log("Updated store payment tier to:", plan, "for store:", userStores[0].id);
      }
    } else if (userStores && userStores.length > 1) {
      // Multiple stores but no selection - log warning
      console.warn("User has multiple stores but no store_id in metadata. Tier applied to user only.");
    } else {
      // No stores yet - tier will be propagated when store is created
      console.log("No stores found for user. Tier will propagate on store creation.");
    }

    // Step 2.6: Create subscription record for hosted tier
    if (plan === "hosted" && session.subscription) {
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as { id: string }).id;

      const targetStoreId = selectedStoreId || (userStores?.length === 1 ? userStores[0].id : null);

      if (targetStoreId && subscriptionId) {
        // Get subscription details from Stripe for period info
        const stripe = getStripe();
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as {
            items: { data: Array<{ price?: { id: string } }> };
            current_period_start: number;
            current_period_end: number;
            cancel_at_period_end: boolean;
          };

          const { error: subInsertError } = await supabase.from("subscriptions").insert({
            user_id: userId,
            store_id: targetStoreId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: stripeSubscription.items.data[0]?.price?.id || "unknown",
            plan: "hosted",
            status: "active",
            current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          });

          if (subInsertError) {
            // Check for duplicate (idempotency)
            if (subInsertError.code === "23505") {
              console.log("Subscription record already exists (duplicate webhook)");
            } else {
              console.error("Failed to create subscription record:", subInsertError);
            }
          } else {
            console.log("Created subscription record for store:", targetStoreId);
          }
        } catch (stripeErr) {
          console.error("Failed to retrieve Stripe subscription details:", stripeErr);
          // Still insert a basic record without period info
          const { error: basicInsertError } = await supabase.from("subscriptions").insert({
            user_id: userId,
            store_id: targetStoreId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: "unknown",
            plan: "hosted",
            status: "active",
          });

          if (basicInsertError && basicInsertError.code !== "23505") {
            console.error("Failed to create basic subscription record:", basicInsertError);
          }
        }
      } else {
        console.warn("Hosted plan purchased but no target store for subscription record. " +
          "User has", userStores?.length || 0, "stores, selectedStoreId:", selectedStoreId);
      }
    }

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

/**
 * Handle successful invoice payment (monthly subscription renewal)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = getSupabaseAdmin();

  // Only handle subscription invoices
  // Cast to access subscription field which exists at runtime but may not be in TS types
  const invoiceData = invoice as unknown as { subscription?: string | { id: string } | null };
  if (!invoiceData.subscription) {
    console.log("Invoice paid but not a subscription invoice, skipping");
    return;
  }

  const subscriptionId = typeof invoiceData.subscription === "string"
    ? invoiceData.subscription
    : invoiceData.subscription.id;

  console.log("Processing invoice.paid for subscription:", subscriptionId);

  try {
    // Find the subscription record
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("store_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (subscription?.store_id) {
      // Restore active status on successful payment
      const { error: updateError } = await supabase
        .from("stores")
        .update({
          subscription_status: "active",
          can_deploy: true,
        })
        .eq("id", subscription.store_id);

      if (updateError) {
        console.error("Failed to update store on invoice.paid:", updateError);
      } else {
        console.log("Store subscription restored to active:", subscription.store_id);
      }
    } else {
      console.log("No subscription record found for:", subscriptionId);
    }
  } catch (error) {
    console.error("Error handling invoice.paid:", error);
  }
}

/**
 * Handle failed invoice payment (subscription renewal failed)
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = getSupabaseAdmin();

  // Cast to access subscription field which exists at runtime but may not be in TS types
  const invoiceData = invoice as unknown as { subscription?: string | { id: string } | null };
  if (!invoiceData.subscription) {
    console.log("Invoice payment failed but not a subscription invoice, skipping");
    return;
  }

  const subscriptionId = typeof invoiceData.subscription === "string"
    ? invoiceData.subscription
    : invoiceData.subscription.id;

  console.log("Processing invoice.payment_failed for subscription:", subscriptionId);

  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("store_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (subscription?.store_id) {
      // Mark as past_due and restrict deployments
      const { error: updateError } = await supabase
        .from("stores")
        .update({
          subscription_status: "past_due",
          can_deploy: false, // Restrict deployments until payment is fixed
        })
        .eq("id", subscription.store_id);

      if (updateError) {
        console.error("Failed to update store on payment failure:", updateError);
      } else {
        console.log("Store marked as past_due:", subscription.store_id);
      }
    }
  } catch (error) {
    console.error("Error handling invoice.payment_failed:", error);
  }
}

/**
 * Handle subscription deletion (cancellation)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdmin();

  // Cast to access fields that exist at runtime but may not be in TS types
  const subData = subscription as unknown as { id: string; current_period_end: number; status: string };

  console.log("Processing customer.subscription.deleted:", subData.id);

  try {
    const { data: subRecord } = await supabase
      .from("subscriptions")
      .select("store_id")
      .eq("stripe_subscription_id", subData.id)
      .single();

    if (subRecord?.store_id) {
      // Keep payment_tier as 'hosted' until period ends (grace period)
      // Store continues to work, just can't deploy updates
      const periodEnd = new Date(subData.current_period_end * 1000).toISOString();

      const { error: storeError } = await supabase
        .from("stores")
        .update({
          subscription_status: "cancelled",
          subscription_ends_at: periodEnd,
          can_deploy: false,
        })
        .eq("id", subRecord.store_id);

      if (storeError) {
        console.error("Failed to update store on subscription deletion:", storeError);
      }

      // Update subscription record
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancel_at_period_end: true,
          current_period_end: periodEnd,
        })
        .eq("stripe_subscription_id", subData.id);

      if (subError) {
        console.error("Failed to update subscription record:", subError);
      } else {
        console.log("Subscription cancelled, grace period until:", periodEnd);
      }
    }
  } catch (error) {
    console.error("Error handling subscription.deleted:", error);
  }
}

/**
 * Handle subscription updates (resubscription, plan changes)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdmin();

  // Cast to access fields that exist at runtime but may not be in TS types
  const subData = subscription as unknown as { id: string; status: string };

  console.log("Processing customer.subscription.updated:", subData.id, "status:", subData.status);

  try {
    const { data: subRecord } = await supabase
      .from("subscriptions")
      .select("store_id")
      .eq("stripe_subscription_id", subData.id)
      .single();

    if (subRecord?.store_id && subData.status === "active") {
      // Resubscribed or payment method updated - restore full access
      const { error: storeError } = await supabase
        .from("stores")
        .update({
          subscription_status: "active",
          subscription_ends_at: null,
          can_deploy: true,
        })
        .eq("id", subRecord.store_id);

      if (storeError) {
        console.error("Failed to restore store on subscription update:", storeError);
      }

      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          cancel_at_period_end: false,
        })
        .eq("stripe_subscription_id", subData.id);

      if (subError) {
        console.error("Failed to update subscription record:", subError);
      } else {
        console.log("Subscription restored to active, deployments enabled");
      }
    }
  } catch (error) {
    console.error("Error handling subscription.updated:", error);
  }
}
