import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deployStore } from "@/lib/vercel";

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
    // Get user's store
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
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
