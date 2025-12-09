interface CreateRepoResult {
  success: boolean;
  repoFullName?: string;
  repoUrl?: string;
  error?: string;
}

/**
 * Creates a new repository in the user's GitHub account from the template repository.
 * Uses GitHub's "Generate from template" API.
 */
export async function createRepoFromTemplate(
  userAccessToken: string,
  userGithubUsername: string,
  storeName: string
): Promise<CreateRepoResult> {
  const repoName = `${slugify(storeName)}-store`;

  try {
    // Check if repo already exists
    const checkResponse = await fetch(
      `https://api.github.com/repos/${userGithubUsername}/${repoName}`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (checkResponse.ok) {
      // Repo already exists, return it
      const existingRepo = await checkResponse.json();
      return {
        success: true,
        repoFullName: existingRepo.full_name,
        repoUrl: existingRepo.html_url,
      };
    }

    // Create repo from template
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_TEMPLATE_OWNER}/${process.env.GITHUB_TEMPLATE_REPO}/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          owner: userGithubUsername,
          name: repoName,
          description: `E-commerce store powered by GoSovereign`,
          private: true,
          include_all_branches: false,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("GitHub create repo error:", errorData);
      return {
        success: false,
        error: errorData.message || "Failed to create repository",
      };
    }

    const repo = await response.json();

    return {
      success: true,
      repoFullName: repo.full_name,
      repoUrl: repo.html_url,
    };
  } catch (err) {
    console.error("GitHub createRepoFromTemplate error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Converts a store name to a valid GitHub repo name.
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove special characters
 * - Max 100 characters
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}
