import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import archiver from "archiver";
import { createClient } from "@/lib/supabase/server";
import type { Store, Product } from "@/types/database";
import { createPlaceholders, replacePlaceholders, slugify } from "@/lib/store-generator";

// =============================================================================
// Template File Reading
// =============================================================================

async function getTemplateFiles(templateDir: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  async function readDir(dir: string, basePath = ""): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await readDir(fullPath, relativePath);
      } else {
        const content = await readFile(fullPath, "utf-8");
        files.set(relativePath, content);
      }
    }
  }

  await readDir(templateDir);
  return files;
}

// =============================================================================
// API Handler - POST (Generate from storeId)
// =============================================================================

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: "Missing store ID" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch store from database
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .eq("user_id", user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Fetch products for this store
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: true });

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Get template directory path
    const templateDir = join(process.cwd(), "templates", "starter");

    // Read all template files
    const templateFiles = await getTemplateFiles(templateDir);

    // Create placeholders from store and products
    const placeholders = createPlaceholders(
      store as Store,
      (products || []) as Product[]
    );

    // Create zip archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    // Collect chunks
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));

    // Process each template file
    const storeName = slugify(store.name);

    for (const [path, content] of templateFiles) {
      // Replace placeholders in content
      const processedContent = replacePlaceholders(content, placeholders);

      // Add to archive with store name as root folder
      archive.append(processedContent, { name: `${storeName}/${path}` });
    }

    // Finalize the archive
    await archive.finalize();

    // Wait for all chunks
    await new Promise<void>((resolve) => archive.on("end", resolve));

    // Combine chunks into single buffer
    const zipBuffer = Buffer.concat(chunks);

    // Update store status to indicate generation
    await supabase
      .from("stores")
      .update({ status: "deployed" })
      .eq("id", storeId);

    // Return zip file
    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${storeName}.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("Store generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate store" },
      { status: 500 }
    );
  }
}

// =============================================================================
// Config endpoint for debugging
// =============================================================================

export async function GET(): Promise<Response> {
  return NextResponse.json({
    message: "Store generation API",
    usage: "POST with { storeId: string } to generate a store zip",
  });
}
