import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";
import { sendContactNotification } from "@/lib/email";
import { getStoreConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service_id, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const storeId = getStoreId();

    if (!supabase || !storeId) {
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    // Get service name if service_id provided
    let serviceName: string | undefined;
    if (service_id) {
      const { data: service } = await supabase
        .from("services")
        .select("name")
        .eq("id", service_id)
        .single();
      serviceName = service?.name;
    }

    // Insert contact submission
    const { error } = await supabase.from("contact_submissions").insert({
      store_id: storeId,
      name,
      email,
      phone: phone || null,
      service_id: service_id || null,
      message,
      status: "new",
    });

    if (error) throw error;

    // Send email notification to store owner
    const store = getStoreConfig();
    const ownerEmail = process.env.STORE_OWNER_EMAIL || store.contactEmail;
    
    if (ownerEmail) {
      await sendContactNotification(
        { name, email, phone, serviceName, message },
        ownerEmail,
        store.name
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
