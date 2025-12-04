import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const supabase = await createClient();

    // Check auth
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;
    const userEmail = authData?.user?.email || null;

    results.auth = {
      user: userId,
      email: userEmail,
      error: authError?.message || null,
    };

    // Check user's payment status
    if (userId) {
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id, email, has_paid, paid_at, payment_tier, stripe_customer_id")
        .eq("id", userId)
        .single();

      results.payment_status = {
        has_paid: userProfile?.has_paid || false,
        paid_at: userProfile?.paid_at || null,
        payment_tier: userProfile?.payment_tier || null,
        stripe_customer_id: userProfile?.stripe_customer_id || null,
        error: profileError?.message || null,
      };

      // Check purchases for this user
      const { data: purchases, error: purchasesError } = await supabase
        .from("purchases")
        .select("id, plan, amount, status, created_at, stripe_checkout_session_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      results.purchases = {
        count: purchases?.length || 0,
        recent: purchases || [],
        error: purchasesError?.message || null,
      };
    } else {
      results.payment_status = { note: "Not authenticated - cannot check payment" };
      results.purchases = { note: "Not authenticated" };
    }

    // Check if tables exist
    const { error: usersError } = await supabase
      .from("users")
      .select("id")
      .limit(1);
    results.users_table = {
      exists: !usersError || usersError.code !== "42P01",
      error: usersError?.message || null,
    };

    const { error: purchasesTableError } = await supabase
      .from("purchases")
      .select("id")
      .limit(1);
    results.purchases_table = {
      exists: !purchasesTableError || purchasesTableError.code !== "42P01",
      error: purchasesTableError?.message || null,
    };

  } catch (err) {
    results.exception = String(err);
  }

  return NextResponse.json(results, { status: 200 });
}
