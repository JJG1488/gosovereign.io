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

  // Get user's store
  const { data: store } = await supabase
    .from("stores")
    .select("id, vercel_deployment_id, deployment_url, status")
    .eq("user_id", user.id)
    .single();

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
      .eq("user_id", user.id);

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
      .eq("user_id", user.id);

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
