import { NextRequest } from "next/server";

import { Resend } from "resend";

/* ============================================================
 * Types
 * ============================================================ */

interface InquiryPayload {
  inquiryType: string;

  name: string;

  email: string;

  projectType?: string;

  timeline?: string;

  features?: string[];

  description?: string;
}

/* ============================================================
 * Helpers
 * ============================================================ */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,

    headers: {
      "Content-Type": "application/json; charset=utf-8",

      "Cache-Control": "no-store",
    },
  });
}

/* ============================================================
 * POST
 * ============================================================ */

export async function POST(request: NextRequest): Promise<Response> {
  try {
    /* ========================================================
     * Environment
     * ======================================================== */

    const apiKey = process.env.RESEND_API_KEY;

    const recipient =
      process.env.PROJECT_INQUIRY_TO_EMAIL ?? "dearlyfebrianoi@gmail.com";

    const sender = process.env.RESEND_FROM_EMAIL;

    if (!apiKey) {
      console.error("[Project Inquiry] RESEND_API_KEY is missing.");

      return jsonResponse(
        {
          error: "Email service is not configured.",
        },
        500,
      );
    }

    if (!sender) {
      console.error("[Project Inquiry] RESEND_FROM_EMAIL is missing.");

      return jsonResponse(
        {
          error: "Email sender is not configured.",
        },
        500,
      );
    }

    /* ========================================================
     * Parse request
     * ======================================================== */

    const body = (await request.json()) as Partial<InquiryPayload>;

    const inquiryType = body.inquiryType?.trim() ?? "";

    const name = body.name?.trim() ?? "";

    const email = body.email?.trim() ?? "";

    const projectType = body.projectType?.trim() ?? "";

    const timeline = body.timeline?.trim() ?? "";

    const description = body.description?.trim() ?? "";

    const features = Array.isArray(body.features)
      ? body.features.map((item) => String(item).trim()).filter(Boolean)
      : [];

    /* ========================================================
     * Validation
     * ======================================================== */

    if (!inquiryType) {
      return jsonResponse(
        {
          error: "Inquiry type is required.",
        },
        400,
      );
    }

    if (!name) {
      return jsonResponse(
        {
          error: "Name is required.",
        },
        400,
      );
    }

    if (!email) {
      return jsonResponse(
        {
          error: "Email is required.",
        },
        400,
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse(
        {
          error: "Please provide a valid email address.",
        },
        400,
      );
    }

    if (name.length > 100) {
      return jsonResponse(
        {
          error: "Name is too long.",
        },
        400,
      );
    }

    if (inquiryType.length > 100) {
      return jsonResponse(
        {
          error: "Inquiry type is too long.",
        },
        400,
      );
    }

    if (projectType.length > 150) {
      return jsonResponse(
        {
          error: "Project type is too long.",
        },
        400,
      );
    }

    if (timeline.length > 100) {
      return jsonResponse(
        {
          error: "Timeline is too long.",
        },
        400,
      );
    }

    if (description.length > 2000) {
      return jsonResponse(
        {
          error: "Description is too long.",
        },
        400,
      );
    }

    /* ========================================================
     * Escape content
     * ======================================================== */

    const safeName = escapeHtml(name);

    const safeEmail = escapeHtml(email);

    const safeInquiryType = escapeHtml(inquiryType);

    const safeProjectType = escapeHtml(projectType || "Not specified");

    const safeTimeline = escapeHtml(timeline || "To be discussed");

    const safeDescription = escapeHtml(
      description || "No additional details provided.",
    );

    /* ========================================================
     * Features HTML
     * ======================================================== */

    const featureHtml =
      features.length > 0
        ? features
            .map(
              (feature) => `
                <span
                  style="
                    display:inline-block;
                    margin:4px 6px 4px 0;
                    padding:7px 11px;
                    border-radius:999px;
                    background:#f3f4f6;
                    color:#374151;
                    border:1px solid #e5e7eb;
                    font-size:13px;
                    line-height:1;
                  "
                >
                  ${escapeHtml(feature)}
                </span>
              `,
            )
            .join("")
        : `
          <span
            style="
              color:#6b7280;
              font-size:14px;
            "
          >
            To be discussed
          </span>
        `;

    /* ========================================================
     * Subject
     * ======================================================== */

    const subject =
      inquiryType === "Freelance Project"
        ? `🚀 New Project Inquiry — ${projectType || "Software Project"}`
        : `📩 New Inquiry — ${inquiryType}`;

    /* ========================================================
     * HTML email
     * ======================================================== */

    const html = `
<!doctype html>

<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    ${escapeHtml(subject)}
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#08080b;
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Arial,
      sans-serif;
    color:#111827;
  "
>

<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="
    width:100%;
    margin:0;
    padding:32px 16px;
    background:#08080b;
  "
>

<tr>

<td align="center">

<table
  role="presentation"
  width="620"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="
    width:100%;
    max-width:620px;
    overflow:hidden;
    border-radius:24px;
    background:#ffffff;
    border:1px solid #e5e7eb;
  "
>

<!-- ========================================================
     HEADER
     ======================================================== -->

<tr>

<td
  style="
    padding:34px 32px;
    background:#111118;
  "
>

<div
  style="
    color:#a78bfa;
    font-size:11px;
    font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
  "
>
  DEAR ENGINEER
</div>

<div
  style="
    margin-top:8px;
    color:#ffffff;
    font-size:28px;
    line-height:1.2;
    font-weight:800;
  "
>
  New Project Inquiry 🚀
</div>

<div
  style="
    margin-top:12px;
    max-width:480px;
    color:#b8b8c5;
    font-size:14px;
    line-height:1.7;
  "
>
  A new inquiry has been submitted through your portfolio website.
</div>

</td>

</tr>

<!-- ========================================================
     CLIENT
     ======================================================== -->

<tr>

<td
  style="
    padding:30px 32px 16px;
  "
>

<div
  style="
    color:#6b7280;
    font-size:11px;
    font-weight:700;
    letter-spacing:1.5px;
    text-transform:uppercase;
  "
>
  👤 Client
</div>

<div
  style="
    margin-top:8px;
    color:#111827;
    font-size:23px;
    font-weight:800;
  "
>
  ${safeName}
</div>

<a
  href="mailto:${safeEmail}"
  style="
    display:inline-block;
    margin-top:5px;
    color:#6366f1;
    font-size:14px;
    text-decoration:none;
  "
>
  ${safeEmail}
</a>

</td>

</tr>

<!-- ========================================================
     DIVIDER
     ======================================================== -->

<tr>

<td
  style="
    padding:0 32px;
  "
>

<div
  style="
    height:1px;
    background:#e5e7eb;
  "
></div>

</td>

</tr>

<!-- ========================================================
     SUMMARY
     ======================================================== -->

<tr>

<td
  style="
    padding:20px 32px 10px;
  "
>

<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  border="0"
>

<tr>

<td
  width="50%"
  valign="top"
  style="padding:10px 8px 10px 0;"
>

<div
  style="
    color:#6b7280;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.3px;
    text-transform:uppercase;
  "
>
  🎯 Inquiry
</div>

<div
  style="
    margin-top:6px;
    color:#111827;
    font-size:15px;
    font-weight:700;
  "
>
  ${safeInquiryType}
</div>

</td>

<td
  width="50%"
  valign="top"
  style="padding:10px 0 10px 8px;"
>

<div
  style="
    color:#6b7280;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.3px;
    text-transform:uppercase;
  "
>
  💻 Project
</div>

<div
  style="
    margin-top:6px;
    color:#111827;
    font-size:15px;
    font-weight:700;
  "
>
  ${safeProjectType}
</div>

</td>

</tr>

<tr>

<td
  width="50%"
  valign="top"
  style="padding:10px 8px 10px 0;"
>

<div
  style="
    color:#6b7280;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.3px;
    text-transform:uppercase;
  "
>
  ⏱ Timeline
</div>

<div
  style="
    margin-top:6px;
    color:#111827;
    font-size:15px;
    font-weight:700;
  "
>
  ${safeTimeline}
</div>

</td>

<td
  width="50%"
  valign="top"
  style="padding:10px 0 10px 8px;"
>

<div
  style="
    color:#6b7280;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.3px;
    text-transform:uppercase;
  "
>
  📬 Reply
</div>

<div
  style="
    margin-top:6px;
    color:#111827;
    font-size:14px;
    font-weight:700;
    word-break:break-word;
  "
>
  ${safeEmail}
</div>

</td>

</tr>

</table>

</td>

</tr>

<!-- ========================================================
     FEATURES
     ======================================================== -->

<tr>

<td
  style="
    padding:18px 32px 8px;
  "
>

<div
  style="
    color:#6b7280;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.4px;
    text-transform:uppercase;
  "
>
  🧩 Requested Features
</div>

<div
  style="
    margin-top:9px;
  "
>
  ${featureHtml}
</div>

</td>

</tr>

<!-- ========================================================
     DETAILS
     ======================================================== -->

<tr>

<td
  style="
    padding:20px 32px 30px;
  "
>

<div
  style="
    color:#6b7280;
    font-size:10px;
    font-weight:700;
    letter-spacing:1.4px;
    text-transform:uppercase;
  "
>
  📝 Project Details
</div>

<div
  style="
    margin-top:10px;
    padding:17px;
    border-radius:14px;
    background:#f9fafb;
    border:1px solid #e5e7eb;
    color:#374151;
    font-size:14px;
    line-height:1.75;
    white-space:pre-wrap;
  "
>
${safeDescription}
</div>

</td>

</tr>

<!-- ========================================================
     CTA
     ======================================================== -->

<tr>

<td
  align="center"
  style="
    padding:26px 32px 30px;
    background:#f7f5ff;
    border-top:1px solid #ede9fe;
  "
>

<div
  style="
    color:#6b7280;
    font-size:13px;
    line-height:1.6;
  "
>
  Ready to start the conversation?
</div>

<table
  role="presentation"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="
    margin-top:14px;
  "
>

<tr>

<td
  style="
    border-radius:12px;
    background:#6366f1;
  "
>

<a
  href="mailto:${safeEmail}"
  style="
    display:inline-block;
    padding:13px 20px;
    color:#ffffff;
    font-size:14px;
    font-weight:700;
    line-height:1;
    text-decoration:none;
  "
>
  Reply to ${safeName}
</a>

</td>

</tr>

</table>

</td>

</tr>

<!-- ========================================================
     FOOTER
     ======================================================== -->

<tr>

<td
  align="center"
  style="
    padding:22px 32px;
    background:#111118;
  "
>

<div
  style="
    color:#ffffff;
    font-size:13px;
    font-weight:700;
  "
>
  Dearly Febriano Irwansyah
</div>

<div
  style="
    margin-top:4px;
    color:#a1a1aa;
    font-size:11px;
    line-height:1.6;
  "
>
  Fullstack Software Engineer
  <br />
  Portfolio Project Inquiry
</div>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;

    /* ========================================================
     * Send with Resend
     * ======================================================== */

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: sender,

      to: [recipient],

      replyTo: email,

      subject,

      html,
    });

    if (result.error) {
      console.error("[Project Inquiry]", result.error);

      return jsonResponse(
        {
          error: "Unable to send the project inquiry email.",
        },
        502,
      );
    }

    return jsonResponse({
      ok: true,
      id: result.data?.id ?? null,
    });
  } catch (error) {
    console.error("[Project Inquiry]", error);

    return jsonResponse(
      {
        error: "Failed to process the project inquiry.",
      },
      500,
    );
  }
}
