/* ============================================================
 * LAYOUT STRINGS — literal UI string yang di-wrap t() pada
 * komponen layout + views guestbook/contact (grup 4-c).
 * String dari file data & API response TIDAK dimasukkan
 * (sudah dikumpulkan otomatis oleh strings.ts / strings-core).
 * ============================================================ */

export const LAYOUT_STRINGS: string[] = [
  // ---- GuestbookView: header + form ----
  "Say hello 👋",
  "Leave a message — it appears here instantly for everyone visiting.",
  "Sign the guestbook",
  "// visitors from everywhere",
  "Name",
  "e.g. Alex from Berlin",
  "Message",
  "Say hi, share feedback, or drop a fun fact…",
  "Posting…",
  "Sign guestbook",

  // ---- GuestbookView: entries list + pagination ----
  "Recent messages",
  "message",
  "messages",
  "Be the first to sign!",
  "Your message will appear here for everyone.",
  "Try again",
  "Guestbook messages",
  "Guestbook pages",
  "Loading messages",
  "Showing",
  "of",
  "Previous page",
  "Go to page",
  "Next page",

  // ---- GuestbookView: manage mode (admin) ----
  "Turn on manage mode to remove messages",
  "Owner: manage messages",
  "Turn off manage mode",
  "Manage mode is on — click to turn off",
  "managing",
  "Enter admin key",
  "Admin key",
  "Admin key (ADMIN_DELETE_KEY)",
  "Unlock",
  "Manage mode turned off",
  "Manage mode enabled — you can now remove messages",
  "Wrong admin key.",
  "Network error — could not verify the key.",
  "Message deleted",
  "Admin key rejected — manage mode disabled.",
  "Network error — could not delete the message.",
  "Network error — could not load messages.",
  "Failed to post your message.",
  "Network error — please try again.",
  "Message posted!",
  "Message from",
  "was removed.",
  "just signed the guestbook.",

  // ---- GuestbookView: delete confirmation dialog ----
  "Delete this message?",
  "This will permanently remove the message from",
  "This action cannot be undone.",
  "Cancel",
  "Deleting…",
  "Delete message",
  "Delete message from",

  // ---- ContactView: header + form ----
  "Let's work together",
  "Tell me about your project — I usually reply within 24 hours.",
  "Contact form",
  "Your name",
  "Email",
  "Choose a topic",
  "Subject",
  "Tell me about your project, timeline, and goals…",
  "Sending…",
  "Send message",
  "Powered by Resend — your message is also stored securely.",

  // ---- ContactView: client-side zod messages (belum ada di strings-core) ----
  "Email is required",
  "Email must be at most 120 characters",
  "Message must be at least 10 characters",
  "Please select a subject",

  // ---- ContactView: success state ----
  "Message sent!",
  "Thanks — I'll get back to you within 24 hours.",
  "(stored offline mode — email delivery not configured)",
  "Send another message",

  // ---- ContactView: submit errors ----
  "Failed to send your message. Please try again.",
  "Network error — please check your connection and try again.",

  // ---- ContactView: info column + copy buttons ----
  "Phone",
  "Location",
  "to clipboard",
  "Copied to clipboard",
  "Could not copy — clipboard unavailable",
  "Save contact",
  "Download vCard (.vcf)",
  "Contact card downloaded — check your files",
  "Typical reply time: under 24h",

  // ---- ContactView: WhatsApp card + socials ----
  "Prefer WhatsApp?",
  "Chat instantly with a prefilled message — no email thread needed.",
  "Chat on WhatsApp",
  "Chat on WhatsApp (opens in a new tab)",
  "Social profiles",
  "profile (opens in a new tab)",

  // ---- ContactMessagesSection: owner tools panel ----
  "Owner tools — recent contact messages",
  "Owner tools",
  "Contact form submissions, newest first — delete any you don't need.",
  "Private inbox for the site owner — unlock with your admin key to read and remove messages.",
  "Reload messages",
  "Exit manage",
  "Turn on manage mode to read and remove messages",
  "Manage messages",
  "Your ADMIN_DELETE_KEY",
  "Same key as the guestbook manage mode. It stays in this browser session only.",
  "Verifying…",
  "Manage mode enabled — recent messages unlocked",
  "Could not verify the key — try again.",
  "Saved admin key was rejected — log in again.",
  "Could not load messages — please try again.",

  // ---- ContactMessagesSection: filter + list + badges ----
  "Filter messages by subject",
  "all",
  "No messages yet — the contact form submissions will appear here.",
  "No messages with subject",
  "Recent contact messages",
  "will be permanently removed from recent messages.",
  "emailed",
  "stored",
  "Email notification was sent",
  "Stored in database (email not configured)",

  // ---- NotFoundView ----
  "This page drifted off the grid",
  "The link you followed doesn't exist — maybe a typo, or an old bookmark. The rest of the portfolio is still very much here.",
  "Back to home",
  "Browse projects",
  "try the command palette",

  // ---- Footer ----
  "Quick Links",
  "Footer quick links",
  "Connect",
  "All rights reserved.",
  "Made with",
  "using Next.js & Tailwind CSS",
  "Local time in Surabaya",
  "Local time in Surabaya (WIB)",
  "Open command palette",
  "Back to top",

  // ---- MobileMenu ----
  "Navigation menu",
  "Close menu",
  "Mobile navigation",

  // ---- ThemeToggle ----
  "Switch to light mode",
  "Switch to dark mode",
];
