import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDeploymentStatus } from "@/lib/vercel";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's tokens and store
  const { data: userData } = await supabase
    .from("users")
    .select("vercel_access_token, vercel_team_id")
    .eq("id", user.id)
    .single();

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

  if (!userData?.vercel_access_token) {
    return NextResponse.json(
      { status: "error", error: "Vercel not connected" },
      { status: 400 }
    );
  }

  // Check Vercel deployment status
  const result = await getDeploymentStatus(
    userData.vercel_access_token,
    userData.vercel_team_id,
    store.vercel_deployment_id
  );

  // If deployment is ready, update store status
  if (result.status === "READY") {
    await supabase
      .from("stores")
      .update({
        status: "deployed",
        deployed_at: new Date().toISOString(),
        deployment_url: result.url || store.deployment_url,
      })
      .eq("user_id", user.id);

    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "deployment_complete",
      status: "completed",
      message: `Store is live at ${result.url}`,
    });
  }

  // If deployment failed, update status
  if (result.status === "ERROR" || result.status === "CANCELED") {
    await supabase.from("stores").update({ status: "failed" }).eq("user_id", user.id);

    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "deployment_complete",
      status: "failed",
      message: `Deployment ${result.status.toLowerCase()}`,
    });
  }

  return NextResponse.json({
    status: result.status,
    url: result.url,
    error: result.error,
  });
}
