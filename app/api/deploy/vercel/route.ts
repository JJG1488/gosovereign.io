import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=unauthorized`
    );
  }

  // Verify user has a store and GitHub is connected
  const { data: userData } = await supabase
    .from("users")
    .select("github_access_token")
    .eq("id", user.id)
    .single();

  if (!userData?.github_access_token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deploy?error=github_not_connected`
    );
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!store) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/wizard?error=no_store`
    );
  }

  // Build Vercel OAuth URL
  const params = new URLSearchParams({
    client_id: process.env.VERCEL_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/vercel/callback`,
    state: JSON.stringify({ userId: user.id, storeId: store.id }),
  });

  const vercelAuthUrl = `https://vercel.com/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(vercelAuthUrl);
}
