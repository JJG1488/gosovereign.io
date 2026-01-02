import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET - Get single service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("store_id", storeId)
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

// PUT - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("services")
      .update({
        name: body.name,
        slug: body.slug,
        short_description: body.short_description,
        description: body.description,
        price: body.price,
        price_type: body.price_type,
        duration: body.duration,
        images: body.images,
        icon: body.icon,
        features: body.features,
        category: body.category,
        tags: body.tags,
        is_featured: body.is_featured,
        is_active: body.is_active,
        seo_title: body.seo_title,
        seo_description: body.seo_description,
        updated_at: new Date().toISOString(),
      })
      .eq("store_id", storeId)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// DELETE - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("store_id", storeId)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
