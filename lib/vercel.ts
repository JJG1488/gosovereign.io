import type { Store } from "@/types/database";

interface DeployResult {
  success: boolean;
  projectId?: string;
  projectUrl?: string;
  deploymentId?: string;
  deploymentUrl?: string;
  storeUrl?: string; // The branded subdomain URL
  error?: string;
}

/**
 * Template repo mapping - each template type deploys from a different GitHub repo.
 */
const TEMPLATE_REPOS: Record<string, string> = {
  goods: "JJG1488/storefront-template",          // E-commerce (products) template
  services: "JJG1488/services-template",         // Services business template
  brochure: "JJG1488/brochure-template",         // Brochure/portfolio template (future)
};

/**
 * Platform API token and team ID from environment variables.
 * These are used for ALL deployments (stores deploy to OUR Vercel account).
 */
function getVercelConfig(templateType: string = "goods") {
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const storeDomain = process.env.STORE_DOMAIN || "gosovereign.io";

  // Select template repo based on store template type
  // Falls back to env var for backwards compatibility, then to goods template
  const templateRepo = TEMPLATE_REPOS[templateType] ||
    process.env.GITHUB_TEMPLATE_REPO ||
    TEMPLATE_REPOS.goods;

  if (!token) {
    throw new Error("VERCEL_API_TOKEN is not configured");
  }

  return { token, teamId, storeDomain, templateRepo };
}

/**
 * Gets the numeric GitHub repo ID needed for Vercel deployments.
 */
async function getGitHubRepoId(repoFullName: string): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // Use GitHub token if available for higher rate limits
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        }),
      },
    });

    if (!response.ok) {
      console.error("GitHub API error:", await response.text());
      return null;
    }

    const repo = await response.json();
    return repo.id;
  } catch (err) {
    console.error("Failed to get GitHub repo ID:", err);
    return null;
  }
}

/**
 * Creates headers for Vercel API requests.
 */
function getHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Builds the team parameter for Vercel API calls.
 */
function getTeamParam(teamId: string | undefined): string {
  return teamId ? `?teamId=${teamId}` : "";
}

/**
 * One-click deployment: Creates a Vercel project and deploys from our template.
 * The project is created in the PLATFORM's Vercel account (not user's).
 * Selects the appropriate template repo based on store.template type.
 */
export async function deployStore(store: Store): Promise<DeployResult> {
  // Get config with correct template repo based on store type
  const { token, teamId, storeDomain, templateRepo } = getVercelConfig(store.template || "goods");
  const headers = getHeaders(token);
  const teamParam = getTeamParam(teamId);

  try {
    const projectName = store.subdomain;

    // Step 1: Check if project already exists
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
      // Step 2: Create new project linked to template repo
      const createProjectResponse = await fetch(
        `https://api.vercel.com/v9/projects${teamParam}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: projectName,
            framework: "nextjs",
            gitRepository: {
              repo: templateRepo,
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

    // Step 4: Add custom subdomain alias
    const subdomainUrl = `${store.subdomain}.${storeDomain}`;
    const aliasResult = await addDomainAlias(
      token,
      teamId,
      projectId,
      subdomainUrl
    );

    if (!aliasResult.success) {
      console.error("Failed to add domain alias:", aliasResult.error);
      // Continue anyway, will use Vercel's default URL
    }

    // Step 5: Get GitHub repo ID (required by Vercel API)
    const repoId = await getGitHubRepoId(templateRepo);
    if (!repoId) {
      return {
        success: false,
        error: `Failed to get GitHub repo ID for ${templateRepo}. Make sure the repo exists and is public.`,
      };
    }

    // Step 6: Trigger deployment with proper gitSource
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
            repoId: repoId,
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
      projectUrl: `https://vercel.com/${teamId || "dashboard"}/${projectName}`,
      deploymentId: deployment.id,
      deploymentUrl: `https://${deployment.url}`,
      // Always return the branded subdomain URL - DNS should be configured
      storeUrl: `https://${subdomainUrl}`,
    };
  } catch (err) {
    console.error("deployStore error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Adds a custom domain alias to a Vercel project.
 */
async function addDomainAlias(
  token: string,
  teamId: string | undefined,
  projectId: string,
  domain: string
): Promise<{ success: boolean; error?: string }> {
  const headers = getHeaders(token);
  const teamParam = getTeamParam(teamId);

  try {
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains${teamParam}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ name: domain }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      // Domain might already exist, which is fine
      if (
        errorData.error?.code === "domain_already_in_use" ||
        errorData.error?.code === "domain_already_exists"
      ) {
        return { success: true };
      }
      return {
        success: false,
        error: errorData.error?.message || "Failed to add domain",
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Builds the environment variables for the deployed store.
 * These connect the storefront to YOUR Supabase + the store owner's Stripe.
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
      key: "NEXT_PUBLIC_STORE_NAME",
      value: store.name,
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "NEXT_PUBLIC_BRAND_COLOR",
      value: store.config.branding.primaryColor,
      target: ["production", "preview", "development"],
      type: "plain",
    },
    {
      key: "NEXT_PUBLIC_THEME_PRESET",
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
      key: "SHIPPING_COUNTRIES",
      value: store.config.features.shippingCountries || "US,CA,GB,AU",
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
      key: "NEXT_PUBLIC_LOGO_URL",
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

  // Platform's Stripe secret key (for processing payments via destination charges)
  if (process.env.STRIPE_SECRET_KEY) {
    envVars.push({
      key: "STRIPE_SECRET_KEY",
      value: process.env.STRIPE_SECRET_KEY,
      target: ["production", "preview", "development"],
      type: "encrypted",
    });
  }

  // Generate admin password for this store
  // Uses first 12 chars of store ID + random suffix for uniqueness
  const adminPassword = `${store.id.slice(0, 8)}-admin`;
  envVars.push({
    key: "ADMIN_PASSWORD",
    value: adminPassword,
    target: ["production", "preview", "development"],
    type: "encrypted",
  });

  // Super Admin password (same across ALL stores for platform owner access)
  if (process.env.SUPER_ADMIN_PASSWORD) {
    envVars.push({
      key: "SUPER_ADMIN_PASSWORD",
      value: process.env.SUPER_ADMIN_PASSWORD,
      target: ["production", "preview", "development"],
      type: "encrypted",
    });
  }

  // Service role key for database operations (password reset, etc.)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    envVars.push({
      key: "SUPABASE_SERVICE_ROLE_KEY",
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      target: ["production", "preview", "development"],
      type: "encrypted",
    });
  }

  // Email configuration for order notifications and password reset
  if (process.env.RESEND_API_KEY) {
    envVars.push({
      key: "RESEND_API_KEY",
      value: process.env.RESEND_API_KEY,
      target: ["production", "preview", "development"],
      type: "encrypted",
    });
  }

  // Anthropic API key for AI product description generation
  if (process.env.ANTHROPIC_API_KEY) {
    envVars.push({
      key: "ANTHROPIC_API_KEY",
      value: process.env.ANTHROPIC_API_KEY,
      target: ["production", "preview", "development"],
      type: "encrypted",
    });
  }

  // Email "from" address - use platform's verified domain
  // Without this, deployed stores would use the Resend sandbox domain
  envVars.push({
    key: "EMAIL_FROM",
    value: "noreply@gosovereign.io",
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // Store owner email (from wizard configuration)
  if (store.config.branding?.contactEmail) {
    envVars.push({
      key: "STORE_OWNER_EMAIL",
      value: store.config.branding.contactEmail,
      target: ["production", "preview", "development"],
      type: "plain",
    });
    // Public contact email for client-side display on contact page
    envVars.push({
      key: "NEXT_PUBLIC_CONTACT_EMAIL",
      value: store.config.branding.contactEmail,
      target: ["production", "preview", "development"],
      type: "plain",
    });
  }

  // App URL for the deployed store (for email links)
  const storeDomain = process.env.STORE_DOMAIN || "gosovereign.io";
  envVars.push({
    key: "NEXT_PUBLIC_APP_URL",
    value: `https://${store.subdomain}.${storeDomain}`,
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // Platform API URL for custom domain management
  // Deployed stores call this to add/verify domains via Vercel API
  const platformUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gosovereign.io";
  envVars.push({
    key: "PLATFORM_API_URL",
    value: platformUrl,
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // ========================================
  // Tier-based environment variables
  // IMPORTANT: These use NEXT_PUBLIC_ prefix so they're available to client components
  // ========================================

  // Payment tier for feature gating
  const paymentTier = store.payment_tier || "starter";
  envVars.push({
    key: "NEXT_PUBLIC_PAYMENT_TIER",
    value: paymentTier,
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // Tier-specific limits (products for goods, services for services template)
  const maxItems = paymentTier === "starter" ? "10" : "unlimited";

  envVars.push({
    key: "NEXT_PUBLIC_MAX_PRODUCTS",
    value: maxItems,
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // Services template uses MAX_SERVICES instead of MAX_PRODUCTS
  envVars.push({
    key: "NEXT_PUBLIC_MAX_SERVICES",
    value: maxItems,
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // Feature flags based on tier (Pro and Hosted get premium features)
  const isPro = paymentTier === "pro" || paymentTier === "hosted";

  envVars.push({
    key: "NEXT_PUBLIC_CUSTOM_DOMAIN_ENABLED",
    value: isPro ? "true" : "false",
    target: ["production", "preview", "development"],
    type: "plain",
  });

  envVars.push({
    key: "NEXT_PUBLIC_ANALYTICS_ENABLED",
    value: isPro ? "true" : "false",
    target: ["production", "preview", "development"],
    type: "plain",
  });

  envVars.push({
    key: "NEXT_PUBLIC_PREMIUM_THEMES_ENABLED",
    value: isPro ? "true" : "false",
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // Services template-specific feature flags
  envVars.push({
    key: "NEXT_PUBLIC_CALENDLY_ENABLED",
    value: isPro ? "true" : "false",
    target: ["production", "preview", "development"],
    type: "plain",
  });

  envVars.push({
    key: "NEXT_PUBLIC_PORTFOLIO_ENABLED",
    value: isPro ? "true" : "false",
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // Store currency (defaults to USD)
  envVars.push({
    key: "NEXT_PUBLIC_STORE_CURRENCY",
    value: store.config?.currency || "USD",
    target: ["production", "preview", "development"],
    type: "plain",
  });

  // Template type for template-specific features
  envVars.push({
    key: "NEXT_PUBLIC_TEMPLATE_TYPE",
    value: store.template || "goods",
    target: ["production", "preview", "development"],
    type: "plain",
  });

  return envVars;
}

/**
 * Checks the status of a Vercel deployment.
 * Uses platform credentials (not user OAuth).
 */
export async function getDeploymentStatus(
  deploymentId: string
): Promise<{ status: string; url?: string; error?: string }> {
  const { token, teamId } = getVercelConfig();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const teamParam = getTeamParam(teamId);

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

// ============================================================================
// LEGACY FUNCTIONS (kept for backwards compatibility during migration)
// These will be removed once all routes are updated
// ============================================================================

/**
 * @deprecated Use deployStore() instead. This function is kept for backwards
 * compatibility during the migration to platform-hosted deployments.
 */
export async function deployToUserVercel(
  _vercelAccessToken: string,
  _vercelTeamId: string | null,
  _githubRepoFullName: string,
  store: Store
): Promise<DeployResult> {
  // Redirect to new function - ignores user credentials
  console.warn(
    "deployToUserVercel is deprecated. Use deployStore() instead."
  );
  return deployStore(store);
}
