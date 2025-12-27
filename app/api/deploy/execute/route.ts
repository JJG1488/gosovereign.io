import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deployStore } from "@/lib/vercel";
import { generateResetToken, sendStorePasswordResetEmail } from "@/lib/email";

/**
 * One-click deployment endpoint.
 * Deploys the user's store to the platform's Vercel account.
 * No user OAuth required - uses platform credentials.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get store_id from request body (required for multi-store support)
    let storeId: string | null = null;
    try {
      const body = await req.json();
      storeId = body.store_id;
    } catch {
      // Body might be empty for backwards compatibility
    }

    // Get user's store - use store_id if provided, otherwise get most recent
    let storeQuery = supabase
      .from("stores")
      .select("*")
      .eq("user_id", user.id);

    if (storeId) {
      storeQuery = storeQuery.eq("id", storeId);
    } else {
      storeQuery = storeQuery.order("created_at", { ascending: false }).limit(1);
    }

    const { data: stores, error: storeError } = await storeQuery;
    const store = stores?.[0];

    if (storeError || !store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Verify user owns this store
    if (store.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if deployment is restricted (subscription lapsed)
    if (store.can_deploy === false) {
      const reason = store.subscription_status === "past_due"
        ? "Payment failed. Please update your payment method to deploy updates."
        : store.subscription_status === "cancelled"
        ? "Subscription cancelled. Resubscribe to deploy updates."
        : "Deployment is currently restricted for this store.";

      return NextResponse.json(
        {
          error: "Deployment restricted",
          reason,
          subscription_status: store.subscription_status,
        },
        { status: 403 }
      );
    }

    // Prevent re-deployment if already deployed
    if (store.status === "deployed" && store.deployment_url) {
      return NextResponse.json({
        success: true,
        message: "Store already deployed",
        storeUrl: store.deployment_url,
        deploymentUrl: store.deployment_url,
      });
    }

    // Log deployment start
    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "deployment_started",
      status: "started",
      message: "Starting one-click deployment",
    });

    // Update store status to deploying
    await supabase
      .from("stores")
      .update({ status: "deploying" })
      .eq("id", store.id);

    // Deploy to platform Vercel account
    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "vercel_deploy",
      status: "started",
      message: "Creating Vercel project and deploying",
    });

    const deployResult = await deployStore(store);

    if (!deployResult.success) {
      await supabase.from("deployment_logs").insert({
        store_id: store.id,
        step: "vercel_deploy",
        status: "failed",
        message: deployResult.error,
      });

      await supabase
        .from("stores")
        .update({ status: "failed" })
        .eq("id", store.id);

      return NextResponse.json(
        { error: `Deployment failed: ${deployResult.error}` },
        { status: 500 }
      );
    }

    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "vercel_deploy",
      status: "completed",
      message: `Store deploying at ${deployResult.storeUrl}`,
      metadata: {
        projectId: deployResult.projectId,
        deploymentId: deployResult.deploymentId,
        deploymentUrl: deployResult.deploymentUrl,
        storeUrl: deployResult.storeUrl,
      },
    });

    // Update store record with deployment info
    await supabase
      .from("stores")
      .update({
        vercel_project_id: deployResult.projectId,
        vercel_deployment_id: deployResult.deploymentId,
        deployment_url: deployResult.storeUrl, // Use branded subdomain URL
        status: "deploying",
        updated_at: new Date().toISOString(),
      })
      .eq("id", store.id);

    // Step: Trigger admin password reset for store owner
    try {
      const resetToken = generateResetToken();
      const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store reset token in database
      await supabase
        .from("stores")
        .update({
          admin_password_reset_token: resetToken,
          admin_password_reset_expires: resetExpires.toISOString(),
        })
        .eq("id", store.id);

      // Get store owner email
      const ownerEmail = store.config?.contactEmail || user.email;
      const storeName = store.config?.storeName || store.name || "Your Store";

      if (ownerEmail && deployResult.storeUrl) {
        await sendStorePasswordResetEmail({
          toEmail: ownerEmail,
          storeName,
          storeUrl: deployResult.storeUrl,
          resetToken,
        });

        await supabase.from("deployment_logs").insert({
          store_id: store.id,
          step: "password_reset_email",
          status: "completed",
          message: `Password reset email sent to ${ownerEmail}`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Don't fail deployment if email fails
      await supabase.from("deployment_logs").insert({
        store_id: store.id,
        step: "password_reset_email",
        status: "failed",
        message: "Failed to send password reset email",
      });
    }

    return NextResponse.json({
      success: true,
      deploymentId: deployResult.deploymentId,
      deploymentUrl: deployResult.deploymentUrl,
      storeUrl: deployResult.storeUrl,
      projectUrl: deployResult.projectUrl,
    });
  } catch (err) {
    console.error("Deploy execute error:", err);

    return NextResponse.json(
      { error: "Deployment failed. Please try again." },
      { status: 500 }
    );
  }
}
