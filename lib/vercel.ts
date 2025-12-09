import type { Store } from "@/types/database";

interface DeployResult {
  success: boolean;
  projectId?: string;
  projectUrl?: string;
  deploymentId?: string;
  deploymentUrl?: string;
  error?: string;
}

/**
 * Creates a Vercel project and triggers deployment.
 * The project is created in the USER's Vercel account.
 */
export async function deployToUserVercel(
  vercelAccessToken: string,
  vercelTeamId: string | null,
  githubRepoFullName: string,
  store: Store
): Promise<DeployResult> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${vercelAccessToken}`,
    "Content-Type": "application/json",
  };

  // If user has a team, deployments go there
  const teamParam = vercelTeamId ? `?teamId=${vercelTeamId}` : "";

  try {
    // Step 1: Check if project already exists
    const projectName = store.subdomain;
    const checkResponse = await fetch(
      `https://api.vercel.com/v9/projects/${projectName}${teamParam}`,
      { headers }
    );

    let projectId: string;

    if (checkResponse.ok) {
      // Project exists, use it
      const existingProject = await checkResponse.json();
      projectId = existingProject.id;
    } else {
      // Step 2: Create new project
      const createProjectResponse = await fetch(
        `https://api.vercel.com/v9/projects${teamParam}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: projectName,
            framework: "nextjs",
            gitRepository: {
              repo: githubRepoFullName,
              type: "github",
            },
            buildCommand: "npm run build",
            outputDirectory: ".next",
          }),
        }
      );

      if (!createProjectResponse.ok) {
        const errorData = await createProjectResponse.json();
        console.error("Vercel create project error:", errorData);
        return {
          success: false,
          error: errorData.error?.message || "Failed to create Vercel project",
        };
      }

      const project = await createProjectResponse.json();
      projectId = project.id;
    }

    // Step 3: Set environment variables
    const envVars = buildEnvironmentVariables(store);

    // Delete existing env vars to avoid conflicts
    for (const envVar of envVars) {
      await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env/${envVar.key}${teamParam}`,
        {
          method: "DELETE",
          headers,
        }
      );
    }

    // Create new env vars
    const envResponse = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/env${teamParam}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(envVars),
      }
    );

    if (!envResponse.ok) {
      const errorData = await envResponse.json();
      console.error("Vercel set env error:", errorData);
      // Continue anyway, env vars can be set manually
    }

    // Step 4: Trigger deployment
    const deployResponse = await fetch(
      `https://api.vercel.com/v13/deployments${teamParam}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: projectName,
          project: projectId,
          target: "production",
          gitSource: {
            type: "github",
            repo: githubRepoFullName,
            ref: "main",
          },
        }),
      }
    );

    if (!deployResponse.ok) {
      const errorData = await deployResponse.json();
      console.error("Vercel deploy error:", errorData);
      return {
        success: false,
        error: errorData.error?.message || "Failed to trigger deployment",
      };
    }

    const deployment = await deployResponse.json();

    return {
      success: true,
      projectId,
      projectUrl: `https://vercel.com/${vercelTeamId || "dashboard"}/${projectName}`,
      deploymentId: deployment.id,
      deploymentUrl: `https://${deployment.url}`,
    };
  } catch (err) {
    console.error("deployToUserVercel error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Builds the environment variables for the deployed store.
 * These connect the storefront to YOUR Supabase + the user's Stripe.
 */
function buildEnvironmentVariables(store: Store) {
  const envVars: Array<{
    key: string;
    value: string;
    target: string[];
    type: string;
  }> = [
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "NEXT_PUBLIC_STORE_ID",
      value: store.id,
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "STORE_NAME",
      value: store.name,
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "BRAND_COLOR",
      value: store.config.branding.primaryColor,
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "THEME_PRESET",
      value: store.config.branding.themePreset,
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "SHIPPING_ENABLED",
      value: store.config.features.shippingEnabled ? "true" : "false",
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "TAX_ENABLED",
      value: store.config.features.taxEnabled ? "true" : "false",
      target: ["production", "preview", "development"],
      type: "plain",
    },
  ];

  // Add logo URL if present
  if (store.config.branding.logoUrl) {
    envVars.push({
      key: "LOGO_URL",
      value: store.config.branding.logoUrl,
      target: ["production", "preview", "development"],
      type: "plain",
    });
  }

  // Add Stripe account if connected
  if (store.stripe_account_id) {
    envVars.push({
      key: "STRIPE_ACCOUNT_ID",
      value: store.stripe_account_id,
      target: ["production", "preview", "development"],
      type: "encrypted",
    });
  }

  return envVars;
}

/**
 * Checks the status of a Vercel deployment.
 */
export async function getDeploymentStatus(
  vercelAccessToken: string,
  vercelTeamId: string | null,
  deploymentId: string
): Promise<{ status: string; url?: string; error?: string }> {
  const headers = {
    Authorization: `Bearer ${vercelAccessToken}`,
  };

  const teamParam = vercelTeamId ? `?teamId=${vercelTeamId}` : "";

  try {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}${teamParam}`,
      { headers }
    );

    if (!response.ok) {
      return { status: "error", error: "Failed to fetch deployment status" };
    }

    const deployment = await response.json();

    // Vercel deployment states: QUEUED, BUILDING, READY, ERROR, CANCELED
    return {
      status: deployment.readyState,
      url: deployment.url ? `https://${deployment.url}` : undefined,
    };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
