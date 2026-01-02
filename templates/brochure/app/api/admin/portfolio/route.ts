import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-context";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("store_id", storeId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch portfolio items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Get next display order
    const { data: lastItem } = await supabase
      .from("portfolio_items")
      .select("display_order")
      .eq("store_id", storeId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const displayOrder = (lastItem?.display_order || 0) + 1;

    const { data, error } = await supabase
      .from("portfolio_items")
      .insert({
        store_id: storeId,
        title: body.title,
        slug,
        description: body.description,
        images: body.images || [],
        client_name: body.client_name,
        tags: body.tags || [],
        is_featured: body.is_featured || false,
        is_active: body.is_active ?? true,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to create portfolio item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
