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

  // Verify user has a store
  const { data: store } = await supabase
    .from("stores")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (!store) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/wizard?error=no_store`
    );
  }

  // Build GitHub OAuth URL
  // Scope 'repo' grants full control of private repositories
  // This is needed to create repos and trigger deployments
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
    scope: "repo",
    state: JSON.stringify({ userId: user.id, storeId: store.id }),
    allow_signup: "true", // Allow users to create GitHub account during flow
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(githubAuthUrl);
}
