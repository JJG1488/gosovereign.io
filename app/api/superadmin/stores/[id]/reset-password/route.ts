import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateResetToken, sendStorePasswordResetEmail } from "@/lib/email";

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
 * Superadmin API: Trigger password reset email for a store
 * POST /api/superadmin/stores/[id]/reset-password
 *
 * Requires x-superadmin-key header matching SUPER_ADMIN_API_KEY env var
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
    const supabase = getSupabaseAdmin();

    // Get store and owner details
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, name, config, deployment_url, user_id")
      .eq("id", storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Get user email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", store.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Store owner not found" },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    const { error: updateError } = await supabase
      .from("stores")
      .update({
        admin_password_reset_token: resetToken,
        admin_password_reset_expires: resetExpires.toISOString(),
      })
      .eq("id", storeId);

    if (updateError) {
      console.error("Failed to store reset token:", updateError);
      return NextResponse.json(
        { error: "Failed to generate reset token" },
        { status: 500 }
      );
    }

    // Send reset email
    const ownerEmail = store.config?.contactEmail || user.email;
    const storeName = store.config?.storeName || store.name || "Store";
    const storeUrl = store.deployment_url;

    if (!storeUrl) {
      return NextResponse.json(
        { error: "Store has not been deployed yet" },
        { status: 400 }
      );
    }

    const emailSent = await sendStorePasswordResetEmail({
      toEmail: ownerEmail,
      storeName,
      storeUrl,
      resetToken,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${ownerEmail}`,
      expiresAt: resetExpires.toISOString(),
    });
  } catch (error) {
    console.error("Superadmin reset-password error:", error);
    return NextResponse.json(
      { error: "Failed to trigger password reset" },
      { status: 500 }
    );
  }
}
