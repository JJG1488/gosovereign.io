import { NextResponse } from "next/server";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*, services(name)")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}
