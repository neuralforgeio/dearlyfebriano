import type { ContactFormValues } from "@/dearlyfebriano/types";

/* ============================================================
 * EMAIL — HTML template + Resend sender untuk contact form.
 * Jika RESEND_API_KEY tidak di-set, email dilewati dan pesan
 * tetap tersimpan di database (tidak pernah hilang).
 * ============================================================ */

export function buildContactEmailHtml(values: ContactFormValues): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const rows = [
    ["Name", values.name],
    ["Email", values.email],
    ["Subject", values.subject],
  ]
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 16px;color:#a1a1aa;font-size:13px;white-space:nowrap;">${label}</td>
        <td style="padding:8px 16px;color:#fafafa;font-size:14px;font-weight:600;">${escape(value ?? "")}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#0a0a0a;padding:32px 16px;font-family:Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;">New message from your portfolio</h1>
        </td>
      </tr>
      <tr><td style="padding:24px 16px 8px;">
        <table role="presentation" width="100%">${rows}</table>
      </td></tr>
      <tr>
        <td style="padding:8px 16px 24px;">
          <div style="margin:8px 0 4px;color:#a1a1aa;font-size:13px;">Message</div>
          <div style="background:#0a0a0a;border:1px solid #262626;border-radius:12px;padding:16px;color:#e4e4e7;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escape(values.message)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px;border-top:1px solid #262626;color:#52525b;font-size:12px;">
          Sent from the portfolio contact form
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface SendEmailResult {
  sent: boolean;
  reason?: string;
}

export async function sendContactEmail(
  values: ContactFormValues,
  to: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM || "Portfolio Contact <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: values.email,
      subject: `[Portfolio] ${values.subject} — ${values.name}`,
      html: buildContactEmailHtml(values),
    });

    if (error) return { sent: false, reason: error.message };
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
