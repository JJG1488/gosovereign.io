import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { newEmail } = body;

    // Validate email format
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Check if email is same as current
    if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "New email must be different from current email" },
        { status: 400 }
      );
    }

    // Update email - Supabase will send verification to new email
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      console.error("[Account] Email update error:", updateError);

      // Handle common errors
      if (updateError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "This email is already registered to another account" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    console.log("[Account] Email update initiated for user:", user.id);

    return NextResponse.json({
      success: true,
      message: "Verification email sent to your new email address. Please check your inbox.",
    });
  } catch (error) {
    console.error("[Account] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
