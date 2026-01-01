import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deployStore } from "@/lib/vercel";

/**
 * Platform Admin: Redeploy stores endpoint
 * Allows platform admins to redeploy individual stores or all deployed stores
 * to push new environment variables.
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

  // Check if user is a platform admin
  const adminEmails = (process.env.PLATFORM_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  const userEmail = user.email?.toLowerCase() || "";

  if (!adminEmails.includes(userEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { storeId, all } = body as { storeId?: string; all?: boolean };

    // Single store redeploy
    if (storeId) {
      return await redeploySingleStore(supabase, storeId, userEmail);
    }

    // Bulk redeploy all deployed stores
    if (all) {
      return await redeployAllStores(supabase, userEmail);
    }

    return NextResponse.json(
      { error: "Either storeId or all must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Redeploy error:", error);
    return NextResponse.json(
      { error: "Failed to process redeploy request" },
      { status: 500 }
    );
  }
}

async function redeploySingleStore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storeId: string,
  adminEmail: string
) {
  // Get the store
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (storeError || !store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Log the redeploy start
  await supabase.from("deployment_logs").insert({
    store_id: storeId,
    step: "admin_redeploy_started",
    status: "started",
    message: `Redeploy initiated by ${adminEmail}`,
    metadata: { admin_email: adminEmail },
  });

  // Update store status
  await supabase
    .from("stores")
    .update({ status: "deploying" })
    .eq("id", storeId);

  try {
    // Deploy the store
    const result = await deployStore(store);

    // Update store with deployment info
    await supabase
      .from("stores")
      .update({
        status: "deployed",
        vercel_project_id: result.projectId,
        vercel_deployment_id: result.deploymentId,
        deployment_url: result.storeUrl,
        deployed_at: new Date().toISOString(),
      })
      .eq("id", storeId);

    // Log success
    await supabase.from("deployment_logs").insert({
      store_id: storeId,
      step: "admin_redeploy_complete",
      status: "completed",
      message: "Redeploy completed successfully",
      metadata: {
        admin_email: adminEmail,
        deployment_id: result.deploymentId,
        deployment_url: result.storeUrl,
      },
    });

    return NextResponse.json({
      success: true,
      storeId,
      deploymentId: result.deploymentId,
      deploymentUrl: result.storeUrl,
    });
  } catch (error) {
    // Update store status to failed
    await supabase
      .from("stores")
      .update({ status: "failed" })
      .eq("id", storeId);

    // Log failure
    await supabase.from("deployment_logs").insert({
      store_id: storeId,
      step: "admin_redeploy_failed",
      status: "failed",
      message: error instanceof Error ? error.message : "Unknown error",
      metadata: { admin_email: adminEmail },
    });

    return NextResponse.json(
      { error: "Deployment failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function redeployAllStores(
  supabase: Awaited<ReturnType<typeof createClient>>,
  adminEmail: string
) {
  // Get all deployed stores
  const { data: stores, error: storesError } = await supabase
    .from("stores")
    .select("*")
    .eq("status", "deployed")
    .order("created_at", { ascending: true });

  if (storesError) {
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }

  if (!stores || stores.length === 0) {
    return NextResponse.json({
      success: true,
      total: 0,
      completed: 0,
      failed: 0,
      results: [],
    });
  }

  const results: Array<{
    storeId: string;
    storeName: string;
    success: boolean;
    deploymentUrl?: string;
    error?: string;
  }> = [];

  // Process stores sequentially to avoid rate limits
  for (const store of stores) {
    const storeName = store.config?.branding?.storeName || store.name || store.subdomain;

    try {
      // Update store status
      await supabase
        .from("stores")
        .update({ status: "deploying" })
        .eq("id", store.id);

      // Log start
      await supabase.from("deployment_logs").insert({
        store_id: store.id,
        step: "admin_bulk_redeploy_started",
        status: "started",
        message: `Bulk redeploy initiated by ${adminEmail}`,
        metadata: { admin_email: adminEmail },
      });

      // Deploy
      const result = await deployStore(store);

      // Update store
      await supabase
        .from("stores")
        .update({
          status: "deployed",
          vercel_project_id: result.projectId,
          vercel_deployment_id: result.deploymentId,
          deployment_url: result.storeUrl,
          deployed_at: new Date().toISOString(),
        })
        .eq("id", store.id);

      // Log success
      await supabase.from("deployment_logs").insert({
        store_id: store.id,
        step: "admin_bulk_redeploy_complete",
        status: "completed",
        message: "Bulk redeploy completed successfully",
        metadata: {
          admin_email: adminEmail,
          deployment_id: result.deploymentId,
        },
      });

      results.push({
        storeId: store.id,
        storeName,
        success: true,
        deploymentUrl: result.storeUrl,
      });
    } catch (error) {
      // Update store status
      await supabase
        .from("stores")
        .update({ status: "failed" })
        .eq("id", store.id);

      // Log failure
      await supabase.from("deployment_logs").insert({
        store_id: store.id,
        step: "admin_bulk_redeploy_failed",
        status: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
        metadata: { admin_email: adminEmail },
      });

      results.push({
        storeId: store.id,
        storeName,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Small delay between deployments to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const completed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    success: failed === 0,
    total: results.length,
    completed,
    failed,
    results,
  });
}
