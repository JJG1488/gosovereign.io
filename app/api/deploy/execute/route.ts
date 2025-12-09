import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRepoFromTemplate } from "@/lib/github";
import { deployToUserVercel } from "@/lib/vercel";

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
    // Get user's OAuth tokens
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        "github_access_token, github_username, vercel_access_token, vercel_team_id"
      )
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    if (!userData.github_access_token || !userData.github_username) {
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
    }

    if (!userData.vercel_access_token) {
      return NextResponse.json({ error: "Vercel not connected" }, { status: 400 });
    }

    // Get user's store
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Prevent re-deployment if already deployed (optional safeguard)
    // Remove this check if you want to allow re-deployments
    if (store.status === "deployed" && store.deployment_url) {
      return NextResponse.json({
        success: true,
        message: "Store already deployed",
        deploymentUrl: store.deployment_url,
        githubRepo: store.github_repo,
      });
    }

    // Log deployment start
    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "deployment_started",
      status: "started",
      message: "Starting deployment process",
    });

    // Update store status to deploying
    await supabase
      .from("stores")
      .update({ status: "deploying" })
      .eq("id", store.id);

    // Step 1: Create GitHub repository
    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "github_repo",
      status: "started",
      message: "Creating GitHub repository",
    });

    const repoResult = await createRepoFromTemplate(
      userData.github_access_token,
      userData.github_username,
      store.subdomain
    );

    if (!repoResult.success) {
      await supabase.from("deployment_logs").insert({
        store_id: store.id,
        step: "github_repo",
        status: "failed",
        message: repoResult.error,
      });

      await supabase
        .from("stores")
        .update({ status: "failed" })
        .eq("id", store.id);

      return NextResponse.json(
        { error: `GitHub: ${repoResult.error}` },
        { status: 500 }
      );
    }

    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "github_repo",
      status: "completed",
      message: `Created repository: ${repoResult.repoFullName}`,
      metadata: { repo: repoResult.repoFullName, url: repoResult.repoUrl },
    });

    // Update store with GitHub repo
    await supabase
      .from("stores")
      .update({ github_repo: repoResult.repoFullName })
      .eq("id", store.id);

    // Step 2: Deploy to Vercel
    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "vercel_deploy",
      status: "started",
      message: "Creating Vercel project and deploying",
    });

    const deployResult = await deployToUserVercel(
      userData.vercel_access_token,
      userData.vercel_team_id,
      repoResult.repoFullName!,
      store
    );

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
        { error: `Vercel: ${deployResult.error}` },
        { status: 500 }
      );
    }

    await supabase.from("deployment_logs").insert({
      store_id: store.id,
      step: "vercel_deploy",
      status: "completed",
      message: `Deployment triggered: ${deployResult.deploymentUrl}`,
      metadata: {
        projectId: deployResult.projectId,
        deploymentId: deployResult.deploymentId,
        url: deployResult.deploymentUrl,
      },
    });

    // Update store record with deployment info
    await supabase
      .from("stores")
      .update({
        vercel_project_id: deployResult.projectId,
        vercel_deployment_id: deployResult.deploymentId,
        deployment_url: deployResult.deploymentUrl,
        status: "deploying",
        updated_at: new Date().toISOString(),
      })
      .eq("id", store.id);

    return NextResponse.json({
      success: true,
      deploymentId: deployResult.deploymentId,
      deploymentUrl: deployResult.deploymentUrl,
      githubRepo: repoResult.repoFullName,
      githubUrl: repoResult.repoUrl,
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
