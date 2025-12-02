import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store");

  if (!storeId) {
    return NextResponse.json({ error: "Missing store ID" }, { status: 400 });
  }

  // Verify user is authenticated and owns this store
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify store ownership
  const { data: store, error } = await supabase
    .from("stores")
    .select("id, user_id")
    .eq("id", storeId)
    .single();

  if (error || !store || store.user_id !== user.id) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Build Stripe Connect OAuth URL
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin")}/api/stripe/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "Stripe Connect not configured" },
      { status: 500 }
    );
  }

  // Create state parameter with store ID (to identify which store to update)
  const state = Buffer.from(JSON.stringify({ storeId, userId: user.id })).toString(
    "base64"
  );

  const stripeConnectUrl = new URL("https://connect.stripe.com/oauth/authorize");
  stripeConnectUrl.searchParams.set("response_type", "code");
  stripeConnectUrl.searchParams.set("client_id", clientId);
  stripeConnectUrl.searchParams.set("scope", "read_write");
  stripeConnectUrl.searchParams.set("redirect_uri", redirectUri);
  stripeConnectUrl.searchParams.set("state", state);

  // Return the URL for client to redirect
  return NextResponse.json({ url: stripeConnectUrl.toString() });
}
