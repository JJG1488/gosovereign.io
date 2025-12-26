import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

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

/**
 * Superadmin API: Directly set admin password for a store
 * POST /api/superadmin/stores/[id]/set-password
 *
 * Requires x-superadmin-key header matching SUPER_ADMIN_API_KEY env var
 * Body: { password: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify superadmin authorization
  const superAdminKey = request.headers.get("x-superadmin-key");
  const expectedKey = process.env.SUPER_ADMIN_API_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { error: "Superadmin API not configured" },
      { status: 500 }
    );
  }

  if (superAdminKey !== expectedKey) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id: storeId } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify store exists
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Hash the password and set it directly
    const passwordHash = createHash("sha256").update(password).digest("hex");

    const { error: updateError } = await supabase
      .from("stores")
      .update({
        admin_password_hash: passwordHash,
        admin_password_reset_token: null,
        admin_password_reset_expires: null,
      })
      .eq("id", storeId);

    if (updateError) {
      console.error("Failed to set password:", updateError);
      return NextResponse.json(
        { error: "Failed to set password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin password has been set directly",
    });
  } catch (error) {
    console.error("Superadmin set-password error:", error);
    return NextResponse.json(
      { error: "Failed to set password" },
      { status: 500 }
    );
  }
}
