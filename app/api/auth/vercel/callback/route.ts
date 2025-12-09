import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface VercelTokenResponse {
  access_token: string;
  token_type: string;
  team_id?: string | null;
  error?: string;
  error_description?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Handle OAuth errors
  if (error) {
    const errorDescription =
      searchParams.get("error_description") || "Unknown error";
    console.error("Vercel OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/deploy?error=vercel_denied&message=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/deploy?error=missing_params`
    );
  }

  // Parse state
  let state: { userId: string; storeId: string };
  try {
    state = JSON.parse(stateParam);
  } catch {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/deploy?error=invalid_state`
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://api.vercel.com/v2/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.VERCEL_CLIENT_ID!,
          client_secret: process.env.VERCEL_CLIENT_SECRET!,
          code,
          redirect_uri: `${baseUrl}/api/auth/vercel/callback`,
        }),
      }
    );

    const tokenData: VercelTokenResponse = await tokenResponse.json();

    if (tokenData.error) {
      console.error(
        "Vercel token error:",
        tokenData.error,
        tokenData.error_description
      );
      return NextResponse.redirect(
        `${baseUrl}/dashboard/deploy?error=token_exchange_failed`
      );
    }

    // Store the access token and team ID in database
    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        vercel_access_token: tokenData.access_token,
        vercel_team_id: tokenData.team_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", state.userId);

    if (updateError) {
      console.error("Failed to store Vercel token:", updateError);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/deploy?error=token_storage_failed`
      );
    }

    // Log successful connection
    await supabase.from("deployment_logs").insert({
      store_id: state.storeId,
      step: "vercel_oauth",
      status: "completed",
      message: "Connected Vercel account",
      metadata: { team_id: tokenData.team_id },
    });

    // Redirect back to deploy page with success
    return NextResponse.redirect(`${baseUrl}/dashboard/deploy?vercel=connected`);
  } catch (err) {
    console.error("Vercel OAuth callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/deploy?error=vercel_callback_failed`
    );
  }
}
