import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  login: string;
  id: number;
  email: string | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Handle OAuth errors (user denied access, etc.)
  if (error) {
    const errorDescription =
      searchParams.get("error_description") || "Unknown error";
    console.error("GitHub OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/deploy?error=github_denied&message=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/deploy?error=missing_params`
    );
  }

  // Parse state to get user and store IDs
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
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${baseUrl}/api/auth/github/callback`,
        }),
      }
    );

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (tokenData.error) {
      console.error(
        "GitHub token error:",
        tokenData.error,
        tokenData.error_description
      );
      return NextResponse.redirect(
        `${baseUrl}/dashboard/deploy?error=token_exchange_failed`
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch user's GitHub profile to get username
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!userResponse.ok) {
      console.error("Failed to fetch GitHub user:", await userResponse.text());
      return NextResponse.redirect(
        `${baseUrl}/dashboard/deploy?error=github_user_fetch_failed`
      );
    }

    const githubUser: GitHubUser = await userResponse.json();

    // Store the access token and username in database
    // NOTE: In production, encrypt the access token before storing
    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        github_access_token: accessToken,
        github_username: githubUser.login,
        updated_at: new Date().toISOString(),
      })
      .eq("id", state.userId);

    if (updateError) {
      console.error("Failed to store GitHub token:", updateError);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/deploy?error=token_storage_failed`
      );
    }

    // Log successful connection
    await supabase.from("deployment_logs").insert({
      store_id: state.storeId,
      step: "github_oauth",
      status: "completed",
      message: `Connected GitHub account: ${githubUser.login}`,
      metadata: { github_username: githubUser.login },
    });

    // Redirect back to deploy page with success
    return NextResponse.redirect(`${baseUrl}/dashboard/deploy?github=connected`);
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/deploy?error=github_callback_failed`
    );
  }
}
