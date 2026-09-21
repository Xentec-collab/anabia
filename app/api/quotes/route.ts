import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import resend from "@/lib/resend";
import {
  quotesRateLimiter,
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

const quoteItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(150),
  quantity: z.number().int().positive().optional(),
});

const quoteSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  company_name: z
    .string()
    .max(100, "Company name cannot exceed 100 characters")
    .optional()
    .nullable(),
  message: z
    .string()
    .min(10, "Quote requirements must be at least 10 characters")
    .max(2000, "Quote requirements cannot exceed 2000 characters"),
  items: z.array(quoteItemSchema).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting: 5 requests per IP per hour
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(quotesRateLimiter, clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error:
            "Too many quote requests from this IP address. Please try again later.",
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

    // Clean phone number format if needed
    if (typeof body.phone === "string") {
      body.phone = body.phone
        .trim()
        .replace(/^(\+91[\s-]?|0)/, "")
        .replace(/[\s-]/g, "");
    }

    const parseResult = quoteSchema.safeParse(body);
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

    const { name, email, phone, company_name, message, items } =
      parseResult.data;

    // 2. Sanitize inputs
    const safeName = sanitizeHeader(name);
    const safeCompanyName = sanitizeHeader(company_name);

    // 3. Save to Supabase
    const supabase = createServerClient();
    const { data: dbData, error: dbError } = await supabase
      .from("quotes")
      .insert({
        name: safeName,
        email,
        phone,
        company_name: safeCompanyName || null,
        message,
        items: items || null,
      })
      .select("id, created_at")
      .maybeSingle();

    if (dbError) {
      console.error("Supabase quote insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 4. Send notification email via Resend
    const clientEmail = process.env.CLIENT_EMAIL;
    if (clientEmail) {
      try {
        const senderEmail =
          process.env.RESEND_FROM_EMAIL ||
          "Anabia Quotes <onboarding@resend.dev>";

        await resend.emails.send({
          from: senderEmail,
          to: [clientEmail],
          subject: `Wholesale Quote Request — ${safeName}${safeCompanyName ? ` (${safeCompanyName})` : ""}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFFFFF; border: 1px solid #E5E4E0;">
              <h2 style="margin: 0 0 16px; font-family: Georgia, serif; font-size: 20px; font-weight: normal; color: #1A1A1A;">
                New Wholesale Quote Request
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8A8780; width: 120px;">Contact:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #1A1A1A; font-weight: 500;">${escapeHtml(safeName)}</td>
                </tr>
                ${
                  safeCompanyName
                    ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8A8780;">Company:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #1A1A1A; font-weight: 500;">${escapeHtml(safeCompanyName)}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8A8780;">Phone:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #1A1A1A; font-weight: 500;">${escapeHtml(phone)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8A8780;">Email:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #1A1A1A; font-weight: 500;">${escapeHtml(email)}</td>
                </tr>
              </table>
              <div style="background: #F9F8F6; border: 1px solid #E5E4E0; padding: 16px; font-size: 13px; color: #1A1A1A; line-height: 1.6; white-space: pre-wrap;">
                ${escapeHtml(message)}
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Quote email notification error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      quoteId: dbData?.id ? dbData.id.slice(0, 8).toUpperCase() : undefined,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("Quote route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
