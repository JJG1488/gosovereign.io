import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidSubdomainFormat, slugifyStoreName } from "@/lib/slugify";

/**
 * GET /api/subdomain/check?subdomain=example
 *
 * Checks if a subdomain is available for use.
 * Returns: { available: boolean, subdomain: string, error?: string }
 */
export async function GET(request: NextRequest) {
  const rawSubdomain = request.nextUrl.searchParams.get("subdomain");

  if (!rawSubdomain) {
    return NextResponse.json(
      { available: false, error: "Subdomain parameter is required" },
      { status: 400 }
    );
  }

  // Slugify the input to get the actual subdomain
  const subdomain = slugifyStoreName(rawSubdomain);

  // Validate format
  const validation = isValidSubdomainFormat(subdomain);
  if (!validation.valid) {
    return NextResponse.json({
      available: false,
      subdomain,
      error: validation.error,
    });
  }

  try {
    const supabase = await createClient();

    // Check if subdomain already exists in stores table
    const { data, error } = await supabase
      .from("stores")
      .select("id")
      .eq("subdomain", subdomain)
      .limit(1);

    if (error) {
      console.error("Error checking subdomain availability:", error);
      return NextResponse.json(
        { available: false, subdomain, error: "Failed to check availability" },
        { status: 500 }
      );
    }

    const isAvailable = !data || data.length === 0;

    return NextResponse.json({
      available: isAvailable,
      subdomain,
      ...(isAvailable ? {} : { error: "This subdomain is already taken" }),
    });
  } catch (error) {
    console.error("Subdomain check error:", error);
    return NextResponse.json(
      { available: false, subdomain, error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
