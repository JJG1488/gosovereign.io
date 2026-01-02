import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (password !== adminPassword && password !== superAdminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = Buffer.from(Date.now().toString() + Math.random().toString()).toString("base64");
    
    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();
    
    if (supabase && storeId) {
      await supabase
        .from("admin_sessions")
        .delete()
        .lt("expires_at", new Date().toISOString());

      await supabase.from("admin_sessions").insert({
        store_id: storeId,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
