import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import resend from "@/lib/resend";
import {
  inquiriesRateLimiter,
  getClientIp,
  checkRateLimit,
} from "@/lib/ratelimit";

// Sanitize email headers to prevent CRLF injection
function sanitizeHeader(str?: string | null): string {
  return str ? str.replace(/[\r\n]+/g, " ").trim() : "";
}

// Escape HTML entities to prevent HTML injection and phishing
function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const inquirySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Enter a valid email address"),
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters")
    .max(100, "Subject cannot exceed 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting: 5 requests per IP per hour
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(inquiriesRateLimiter, clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error:
            "Too many inquiry submissions from this IP address. Please try again later.",
          details: {
            ip: clientIp,
            limit: rateLimit.limit,
            retryAfterSeconds: Math.max(
              1,
              Math.ceil((rateLimit.reset - Date.now()) / 1000)
            ),
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(
              1,
              Math.ceil((rateLimit.reset - Date.now()) / 1000)
            ).toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const parseResult = inquirySchema.safeParse(body);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const firstError =
        parseResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json(
        {
          error: firstError,
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parseResult.data;

    // 2. Sanitize inputs
    const safeName = sanitizeHeader(name);
    const safeSubject = sanitizeHeader(subject);

    // 3. Save to Supabase
    const supabase = createServerClient();
    const { error: dbError } = await supabase.from("inquiries").insert({
      name: safeName,
      email,
      subject: safeSubject,
      message,
    });

    if (dbError) {
      console.error("Supabase inquiry insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 4. Send notification email via Resend
    const clientEmail = process.env.CLIENT_EMAIL;
    if (clientEmail) {
      try {
        const senderEmail =
          process.env.RESEND_FROM_EMAIL ||
          "Anabia Inquiries <onboarding@resend.dev>";

        await resend.emails.send({
          from: senderEmail,
          to: [clientEmail],
          subject: `New Inquiry: ${safeSubject} — ${safeName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFFFFF; border: 1px solid #E5E4E0;">
              <h2 style="margin: 0 0 16px; font-family: Georgia, serif; font-size: 20px; font-weight: normal; color: #1A1A1A;">
                New Inquiry Received
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8A8780; width: 100px;">From:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #1A1A1A; font-weight: 500;">${escapeHtml(safeName)} (${escapeHtml(email)})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8A8780;">Subject:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #1A1A1A; font-weight: 500;">${escapeHtml(safeSubject)}</td>
                </tr>
              </table>
              <div style="background: #F9F8F6; border: 1px solid #E5E4E0; padding: 16px; font-size: 13px; color: #1A1A1A; line-height: 1.6; white-space: pre-wrap;">
                ${escapeHtml(message)}
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Inquiry email notification error:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("Inquiry route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
