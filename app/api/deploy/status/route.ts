import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDeploymentStatus } from "@/lib/vercel";

/**
 * Checks deployment status for the user's store.
 * Uses platform credentials (not user OAuth).
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get store_id from query params (required for multi-store support)
  const storeId = req.nextUrl.searchParams.get("store_id");

  // Get user's store - use store_id if provided, otherwise get most recent
  let storeQuery = supabase
    .from("stores")
    .select("id, vercel_deployment_id, deployment_url, status, user_id")
    .eq("user_id", user.id);

  if (storeId) {
    storeQuery = storeQuery.eq("id", storeId);
  } else {
    storeQuery = storeQuery.order("created_at", { ascending: false }).limit(1);
  }

  const { data: stores } = await storeQuery;
  const store = stores?.[0];

  if (!store?.vercel_deployment_id) {
    return NextResponse.json({ status: "not_started" });
  }

  // If already marked as deployed, return success
  if (store.status === "deployed") {
    return NextResponse.json({
      status: "READY",
      url: store.deployment_url,
    });
  }

  // Check Vercel deployment status using platform credentials
  const result = await getDeploymentStatus(store.vercel_deployment_id);

  // If deployment is ready, update store status
  if (result.status === "READY") {
    // Keep the branded subdomain URL - don't overwrite with Vercel's deployment URL
    await supabase
      .from("stores")
      .update({
        status: "deployed",
        deployed_at: new Date().toISOString(),
        // Don't update deployment_url - it already has the branded subdomain
      })
      .eq("id", store.id);

    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "deployment_complete",
      status: "completed",
      message: `Store is live at ${store.deployment_url}`,
    });
  }

  // If deployment failed, update status
  if (result.status === "ERROR" || result.status === "CANCELED") {
    await supabase
      .from("stores")
      .update({ status: "failed" })
      .eq("id", store.id);

    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "deployment_complete",
      status: "failed",
      message: `Deployment ${result.status.toLowerCase()}`,
    });
  }

  return NextResponse.json({
    status: result.status,
    url: store.deployment_url, // Return branded URL, not Vercel URL
    error: result.error,
  });
}
