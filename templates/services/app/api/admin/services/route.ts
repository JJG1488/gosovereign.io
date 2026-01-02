import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET - List all services
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("store_id", storeId)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const body = await request.json();

    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.name);

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from("services")
      .select("display_order")
      .eq("store_id", storeId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const displayOrder = (maxOrder?.display_order || 0) + 1;

    const { data, error } = await supabase
      .from("services")
      .insert({
        store_id: storeId,
        name: body.name,
        slug,
        short_description: body.short_description || null,
        description: body.description || null,
        price: body.price || null,
        price_type: body.price_type || "fixed",
        duration: body.duration || null,
        images: body.images || [],
        icon: body.icon || null,
        features: body.features || [],
        category: body.category || null,
        tags: body.tags || null,
        display_order: displayOrder,
        is_featured: body.is_featured || false,
        is_active: body.is_active !== false,
        seo_title: body.seo_title || null,
        seo_description: body.seo_description || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
