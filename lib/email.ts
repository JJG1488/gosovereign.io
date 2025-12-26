/**
 * Platform email utilities using Resend API
 */

import crypto from "crypto";

const PLATFORM_EMAIL = "info@gosovereign.io";
const FROM_EMAIL = "GoSovereign <noreply@gosovereign.io>";

interface PaymentNotificationData {
  userId: string;
  storeId: string | null;
  storeName: string | null;
  userEmail: string;
  tier: string;
  amount: number;
  storeUrl?: string | null;
}

/**
 * Send payment notification email to platform owner (info@gosovereign.io)
 */
export async function sendPlatformPaymentNotification(data: PaymentNotificationData): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not set - skipping payment notification email");
    return false;
  }

  const amountFormatted = `$${(data.amount / 100).toFixed(2)}`;
  const tierFormatted = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);

  const emailHtml = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #10b981; margin-bottom: 20px;">💰 New Payment Received!</h2>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 140px;">Amount</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #10b981; font-weight: 700;">${amountFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Tier</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${tierFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">User Email</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.userEmail}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">User ID</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${data.userId}</td>
        </tr>
        ${data.storeId ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Store ID</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${data.storeId}</td>
        </tr>
        ` : ''}
        ${data.storeName ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Store Name</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.storeName}</td>
        </tr>
        ` : ''}
        ${data.storeUrl ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Store URL</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
            <a href="${data.storeUrl}" style="color: #3b82f6;">${data.storeUrl}</a>
          </td>
        </tr>
        ` : ''}
      </table>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        This is an automated notification from GoSovereign.
      </p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [PLATFORM_EMAIL],
        subject: `💰 New ${tierFormatted} payment: ${amountFormatted} from ${data.userEmail}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to send payment notification:", error);
      return false;
    }

    console.log("Payment notification sent to", PLATFORM_EMAIL);
    return true;
  } catch (error) {
    console.error("Error sending payment notification:", error);
    return false;
  }
}

/**
 * Generate a secure password reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

interface PasswordResetEmailData {
  toEmail: string;
  storeName: string;
  storeUrl: string;
  resetToken: string;
}

/**
 * Send password reset email to store owner after deployment
 */
export async function sendStorePasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not set - skipping password reset email");
    return false;
  }

  const resetUrl = `${data.storeUrl}/admin/reset-password?token=${data.resetToken}`;

  const emailHtml = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e3a5f; margin-bottom: 20px;">Your Store is Live!</h2>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Great news! Your store <strong>${data.storeName}</strong> has been successfully deployed.
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Your store is now live at: <a href="${data.storeUrl}" style="color: #3b82f6;">${data.storeUrl}</a>
      </p>

      <h3 style="color: #1e3a5f; margin-top: 30px; margin-bottom: 15px;">Set Up Your Admin Password</h3>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        To access your store's admin panel, please set up your password by clicking the button below:
      </p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Set Admin Password
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

      <p style="color: #9ca3af; font-size: 12px;">
        This email was sent by GoSovereign. If you have questions, reply to this email or contact support.
      </p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [data.toEmail],
        subject: `Your store "${data.storeName}" is live! Set up your admin password`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to send password reset email:", error);
      return false;
    }

    console.log("Password reset email sent to", data.toEmail);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
