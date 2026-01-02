import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET - Get current settings
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("store_settings")
      .select("settings")
      .eq("store_id", storeId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json(data?.settings || {});
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const settings = await request.json();

    // Upsert settings
    const { data, error } = await supabase
      .from("store_settings")
      .upsert(
        {
          store_id: storeId,
          settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data.settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
