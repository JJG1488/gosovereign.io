import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("Stripe OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/wizard?error=stripe_connect_failed&message=${encodeURIComponent(
        errorDescription || error
      )}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${origin}/wizard?error=missing_params`
    );
  }

  // Decode state to get storeId
  let stateData: { storeId: string; userId: string };
  try {
    stateData = JSON.parse(Buffer.from(state, "base64").toString());
  } catch {
    return NextResponse.redirect(
      `${origin}/wizard?error=invalid_state`
    );
  }

  const { storeId, userId } = stateData;

  // Verify user is still authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.redirect(
      `${origin}/auth/login?next=/wizard?store=${storeId}`
    );
  }

  try {
    // Exchange authorization code for connected account
    const stripe = getStripe();
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const connectedAccountId = response.stripe_user_id;

    if (!connectedAccountId) {
      throw new Error("No connected account ID returned");
    }

    // Update store with Stripe account ID
    const { error: updateError } = await supabase
      .from("stores")
      .update({ stripe_account_id: connectedAccountId })
      .eq("id", storeId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating store with Stripe account:", updateError);
      return NextResponse.redirect(
        `${origin}/wizard?store=${storeId}&error=db_update_failed`
      );
    }

    // Redirect back to wizard with success
    return NextResponse.redirect(
      `${origin}/wizard?store=${storeId}&stripe_connected=true`
    );
  } catch (err) {
    console.error("Error exchanging Stripe OAuth code:", err);
    return NextResponse.redirect(
      `${origin}/wizard?store=${storeId}&error=stripe_exchange_failed`
    );
  }
}
