import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set - emails will not be sent");
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  serviceName?: string;
  message: string;
}

/**
 * Send notification email to store owner when a contact form is submitted
 */
export async function sendContactNotification(
  submission: ContactSubmission,
  ownerEmail: string,
  storeName: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const fromEmail = process.env.EMAIL_FROM || "noreply@gosovereign.io";

  const phoneHtml = submission.phone 
    ? '<p><strong>Phone:</strong> <a href="tel:' + submission.phone + '">' + submission.phone + '</a></p>'
    : "";
  
  const serviceHtml = submission.serviceName
    ? '<p><strong>Service Interest:</strong> ' + submission.serviceName + '</p>'
    : "";

  try {
    await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      subject: 'New inquiry from ' + submission.name + ' - ' + storeName,
      html: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">' +
        '<h2 style="color: #1a1a1a;">New Contact Form Submission</h2>' +
        '<p>You have received a new inquiry on your ' + storeName + ' website.</p>' +
        '<div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
        '<p><strong>Name:</strong> ' + submission.name + '</p>' +
        '<p><strong>Email:</strong> <a href="mailto:' + submission.email + '">' + submission.email + '</a></p>' +
        phoneHtml +
        serviceHtml +
        '</div>' +
        '<div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">' +
        '<p><strong>Message:</strong></p>' +
        '<p style="white-space: pre-wrap;">' + submission.message + '</p>' +
        '</div>' +
        '<p style="margin-top: 20px; color: #6b7280; font-size: 14px;">' +
        'Reply directly to this email to respond to ' + submission.name + '.' +
        '</p></div>',
      replyTo: submission.email,
    });
    return true;
  } catch (error) {
    console.error("Failed to send contact notification:", error);
    return false;
  }
}
