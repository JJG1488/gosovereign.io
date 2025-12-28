import { NextRequest, NextResponse } from "next/server";

const PLATFORM_EMAIL = "info@gosovereign.io";
const FROM_EMAIL = "GoSovereign <noreply@gosovereign.io>";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("[Contact] RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const body: ContactFormData = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || name.length > 100) {
      return NextResponse.json(
        { error: "Name is required and must be under 100 characters" },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!subject || subject.length > 200) {
      return NextResponse.json(
        { error: "Subject is required and must be under 200 characters" },
        { status: 400 }
      );
    }

    if (!message || message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 5000 characters" },
        { status: 400 }
      );
    }

    // Sanitize input (basic XSS prevention)
    const sanitize = (str: string) =>
      str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981; margin-bottom: 20px;">New Contact Form Submission</h2>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 100px; vertical-align: top;">From</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${sanitize(name)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; vertical-align: top;">Email</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <a href="mailto:${sanitize(email)}" style="color: #3b82f6;">${sanitize(email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; vertical-align: top;">Subject</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${sanitize(subject)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: 600; vertical-align: top;">Message</td>
            <td style="padding: 12px; white-space: pre-wrap;">${sanitize(message)}</td>
          </tr>
        </table>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Reply directly to this email to respond to the sender.
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [PLATFORM_EMAIL],
        reply_to: email,
        subject: `[Contact] ${subject} - from ${name}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Contact] Failed to send email:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    console.log("[Contact] Message sent from", email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
