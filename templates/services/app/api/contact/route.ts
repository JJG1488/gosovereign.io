import { NextResponse } from "next/server";
import { store } from "@/data/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // In a production app, you would:
    // 1. Send an email notification to store.contactEmail
    // 2. Store the inquiry in a database
    // 3. Send a confirmation email to the customer

    // For now, we'll just log it and return success
    console.log("Contact form submission:", {
      to: store.contactEmail,
      from: { name, email },
      message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
