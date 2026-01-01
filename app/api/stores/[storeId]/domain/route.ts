import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Platform Domain API
 *
 * This endpoint allows deployed stores to manage custom domains via the platform's
 * Vercel API access. Deployed stores don't have VERCEL_API_TOKEN, so they call
 * this platform endpoint which proxies to Vercel.
 *
 * Authentication: Store's admin password in Authorization header
 */

interface DomainVerification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

interface DomainResponse {
  success: boolean;
  domain?: string;
  verified?: boolean;
  verification?: DomainVerification[];
  error?: string;
}

function getVercelConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token) {
    throw new Error("VERCEL_API_TOKEN is not configured");
  }

  return { token, teamId };
}

function getTeamParam(teamId: string | undefined): string {
  return teamId ? `?teamId=${teamId}` : "";
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

async function verifyStoreAuth(
  storeId: string,
  authHeader: string | null
): Promise<{ valid: boolean; error?: string; projectId?: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing authorization header" };
  }

  const password = authHeader.replace("Bearer ", "");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { valid: false, error: "Database not configured" };
  }

  // Get store and verify admin password
  const { data: store, error } = await supabase
    .from("stores")
    .select("id, vercel_project_id")
    .eq("id", storeId)
    .single();

  if (error || !store) {
    return { valid: false, error: "Store not found" };
  }

  // The admin password is generated as: first 8 chars of store ID + "-admin"
  const expectedPassword = `${storeId.slice(0, 8)}-admin`;

  if (password !== expectedPassword) {
    return { valid: false, error: "Invalid credentials" };
  }

  if (!store.vercel_project_id) {
    return { valid: false, error: "Store not deployed yet" };
  }

  return { valid: true, projectId: store.vercel_project_id };
}

// GET - Check domain verification status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const authHeader = request.headers.get("authorization");

    const auth = await verifyStoreAuth(storeId, authHeader);
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { token, teamId } = getVercelConfig();
    const teamParam = getTeamParam(teamId);

    // Get domain from query params
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Domain parameter required" },
        { status: 400 }
      );
    }

    // Check domain status in Vercel
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${auth.projectId}/domains/${domain}${teamParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      // Domain not found in project
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          domain,
          verified: false,
          verification: [],
          error: "Domain not added to project yet",
        });
      }

      return NextResponse.json(
        { error: errorData.error?.message || "Failed to check domain" },
        { status: response.status }
      );
    }

    const domainData = await response.json();

    const result: DomainResponse = {
      success: true,
      domain: domainData.name,
      verified: domainData.verified,
      verification: domainData.verification || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Domain GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add domain to Vercel project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const authHeader = request.headers.get("authorization");

    const auth = await verifyStoreAuth(storeId, authHeader);
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    const { token, teamId } = getVercelConfig();
    const teamParam = getTeamParam(teamId);

    // Add domain to Vercel project
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${auth.projectId}/domains${teamParam}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Handle common errors
      if (data.error?.code === "domain_already_in_use") {
        return NextResponse.json(
          { error: "This domain is already in use by another Vercel project" },
          { status: 409 }
        );
      }

      if (data.error?.code === "domain_already_exists") {
        // Domain already added to this project - get its status
        const statusResponse = await fetch(
          `https://api.vercel.com/v10/projects/${auth.projectId}/domains/${domain}${teamParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          return NextResponse.json({
            success: true,
            domain: statusData.name,
            verified: statusData.verified,
            verification: statusData.verification || [],
          });
        }
      }

      return NextResponse.json(
        { error: data.error?.message || "Failed to add domain" },
        { status: response.status }
      );
    }

    // Update store's custom_domain in database
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("stores")
        .update({
          custom_domain: domain,
          updated_at: new Date().toISOString(),
        })
        .eq("id", storeId);
    }

    const result: DomainResponse = {
      success: true,
      domain: data.name,
      verified: data.verified,
      verification: data.verification || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Domain POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove domain from Vercel project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const authHeader = request.headers.get("authorization");

    const auth = await verifyStoreAuth(storeId, authHeader);
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Domain parameter required" },
        { status: 400 }
      );
    }

    const { token, teamId } = getVercelConfig();
    const teamParam = getTeamParam(teamId);

    // Remove domain from Vercel project
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${auth.projectId}/domains/${domain}${teamParam}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to remove domain" },
        { status: response.status }
      );
    }

    // Clear custom_domain in database
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("stores")
        .update({
          custom_domain: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", storeId);
    }

    return NextResponse.json({
      success: true,
      message: "Domain removed successfully",
    });
  } catch (error) {
    console.error("Domain DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
