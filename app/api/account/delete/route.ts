import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { confirmation } = body;

    // Require explicit DELETE confirmation
    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Please type DELETE to confirm account deletion" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Step 1: Get all stores owned by this user
    const { data: stores, error: storesError } = await adminClient
      .from("stores")
      .select("id")
      .eq("user_id", user.id);

    if (storesError) {
      console.error("[Account] Error fetching stores:", storesError);
      return NextResponse.json(
        { error: "Failed to fetch account data" },
        { status: 500 }
      );
    }

    const storeIds = stores?.map((s) => s.id) || [];

    // Step 2: Delete all data associated with the stores
    // Order matters due to foreign key constraints
    if (storeIds.length > 0) {
      // First, get all order IDs for these stores
      const { data: orders } = await adminClient
        .from("orders")
        .select("id")
        .in("store_id", storeIds);

      const orderIds = orders?.map((o) => o.id) || [];

      // Delete order items first (references orders)
      if (orderIds.length > 0) {
        const { error: orderItemsError } = await adminClient
          .from("order_items")
          .delete()
          .in("order_id", orderIds);

        if (orderItemsError) {
          console.error("[Account] Error deleting order items:", orderItemsError);
        }
      }

      // Delete orders
      const { error: ordersError } = await adminClient
        .from("orders")
        .delete()
        .in("store_id", storeIds);

      if (ordersError) {
        console.error("[Account] Error deleting orders:", ordersError);
      }

      // Delete products
      const { error: productsError } = await adminClient
        .from("products")
        .delete()
        .in("store_id", storeIds);

      if (productsError) {
        console.error("[Account] Error deleting products:", productsError);
      }

      // Delete coupons
      const { error: couponsError } = await adminClient
        .from("coupons")
        .delete()
        .in("store_id", storeIds);

      if (couponsError) {
        console.error("[Account] Error deleting coupons:", couponsError);
      }

      // Delete reviews
      const { error: reviewsError } = await adminClient
        .from("reviews")
        .delete()
        .in("store_id", storeIds);

      if (reviewsError) {
        console.error("[Account] Error deleting reviews:", reviewsError);
      }

      // Delete store settings
      const { error: settingsError } = await adminClient
        .from("store_settings")
        .delete()
        .in("store_id", storeIds);

      if (settingsError) {
        console.error("[Account] Error deleting store settings:", settingsError);
      }

      // Delete deployment logs
      const { error: logsError } = await adminClient
        .from("deployment_logs")
        .delete()
        .in("store_id", storeIds);

      if (logsError) {
        console.error("[Account] Error deleting deployment logs:", logsError);
      }

      // Delete subscriptions
      const { error: subscriptionsError } = await adminClient
        .from("subscriptions")
        .delete()
        .in("store_id", storeIds);

      if (subscriptionsError) {
        console.error("[Account] Error deleting subscriptions:", subscriptionsError);
      }

      // Delete stores
      const { error: storesDeleteError } = await adminClient
        .from("stores")
        .delete()
        .in("id", storeIds);

      if (storesDeleteError) {
        console.error("[Account] Error deleting stores:", storesDeleteError);
        return NextResponse.json(
          { error: "Failed to delete stores" },
          { status: 500 }
        );
      }
    }

    // Step 3: Delete wizard progress
    const { error: wizardError } = await adminClient
      .from("wizard_progress")
      .delete()
      .eq("user_id", user.id);

    if (wizardError) {
      console.error("[Account] Error deleting wizard progress:", wizardError);
    }

    // Step 4: Delete purchases
    const { error: purchasesError } = await adminClient
      .from("purchases")
      .delete()
      .eq("user_id", user.id);

    if (purchasesError) {
      console.error("[Account] Error deleting purchases:", purchasesError);
    }

    // Step 5: Delete user profile (users table)
    const { error: userProfileError } = await adminClient
      .from("users")
      .delete()
      .eq("id", user.id);

    if (userProfileError) {
      console.error("[Account] Error deleting user profile:", userProfileError);
    }

    // Step 6: Delete user from Supabase Auth
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteAuthError) {
      console.error("[Account] Error deleting auth user:", deleteAuthError);
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      );
    }

    // Step 7: Sign out the user
    await supabase.auth.signOut();

    console.log("[Account] Account deleted for user:", user.id);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("[Account] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
