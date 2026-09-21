import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import resend from "@/lib/resend";
import { generateOrderPdf } from "@/lib/generateOrderPdf";
import { ordersRateLimiter, getClientIp, checkRateLimit } from "@/lib/ratelimit";
import { DEMO_PRODUCTS } from "@/lib/demoProducts";

// Sanitize email headers to prevent CRLF injection
function sanitizeHeader(str?: string | null): string {
  return str ? str.replace(/[\r\n]+/g, " ").trim() : "";
}

// Escape HTML entities to prevent HTML injection and phishing in notification emails
function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number(),
  specs: z.string().optional(),
  category: z.string().optional(),
  image_url: z.string().optional(),
});

const orderSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),
  address: z
    .string()
    .min(10, "Please enter a delivery address (min 10 characters)"),
  city: z.string().min(2, "City / State is required"),
  company_name: z
    .string()
    .max(100, "Company name cannot exceed 100 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .nullable(),
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  subtotal: z
    .number()
    .int("Subtotal must be an integer")
    .positive("Subtotal must be a positive integer"),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting: 3 requests per IP per hour
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(ordersRateLimiter, clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many order attempts from this IP address. Please try again in an hour.",
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

    const parseResult = orderSchema.safeParse(body);
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

    const {
      customer_name,
      company_name,
      phone,
      email,
      address,
      city,
      notes,
      items,
      subtotal,
    } = parseResult.data;

    // 2. Sanitize email headers (prevent CRLF injection)
    const safeCustomerName = sanitizeHeader(customer_name);
    const safeCompanyName = sanitizeHeader(company_name);

    // 3. Server-side price verification against Supabase products & fallback catalog
    const supabase = createServerClient();
    const itemIds = items.map((i) => i.id);
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, price")
      .in("id", itemIds);

    const priceMap = new Map<string, number>();
    for (const demo of DEMO_PRODUCTS) {
      const priceNum =
        typeof demo.price === "number"
          ? demo.price
          : parseFloat(String(demo.price).replace(/[^0-9.]/g, ""));
      priceMap.set(demo.id, priceNum);
    }
    if (dbProducts) {
      for (const p of dbProducts) {
        priceMap.set(p.id, Math.round(p.price / 100));
      }
    }

    let calculatedSubtotal = 0;
    const validatedItems = items.map((item) => {
      const catalogPrice = priceMap.get(item.id);
      const unitPrice =
        catalogPrice !== undefined && catalogPrice > 0
          ? catalogPrice
          : item.price;
      calculatedSubtotal += unitPrice * item.quantity;
      return {
        ...item,
        price: unitPrice,
      };
    });

    // Detect price tampering (allow 0 difference or reject if client subtotal differs by > 1)
    if (
      calculatedSubtotal > 0 &&
      Math.abs(calculatedSubtotal - subtotal) > 1
    ) {
      return NextResponse.json(
        {
          error:
            "Price mismatch detected. Please refresh your cart and try again.",
          details: {
            expectedSubtotal: calculatedSubtotal,
            submittedSubtotal: subtotal,
          },
        },
        { status: 400 }
      );
    }

    const numericSubtotal =
      calculatedSubtotal > 0 ? calculatedSubtotal : Math.round(Number(subtotal)) || 0;

    // 4. Save to Supabase
    const { data: dbData, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: safeCustomerName,
        company_name: safeCompanyName || null,
        phone,
        email: email || null,
        address,
        city,
        notes: notes || null,
        items: validatedItems, // verified item prices
        subtotal: numericSubtotal,
        status: "new",
      })
      .select("id, created_at")
      .maybeSingle();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    const orderId = dbData?.id ? dbData.id.slice(0, 8).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderRef = `ANB-${orderId}`;
    const orderDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // 2. Generate PDF Invoice
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await generateOrderPdf({
        orderId: orderRef,
        orderDate,
        customerName: safeCustomerName,
        companyName: safeCompanyName || undefined,
        phone,
        address,
        city,
        notes: notes || undefined,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          specs: i.specs,
          category: i.category,
        })),
        subtotal: numericSubtotal,
      });
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
    }

    // 3. Send email via Brevo with PDF attachment
    const clientEmail = process.env.CLIENT_EMAIL;
    if (clientEmail) {
      try {
        const formattedTotal = `₹${numericSubtotal.toLocaleString("en-IN")}`;
        const itemRows = items
          .map((item, idx) => {
            const lineTotal = `₹${(item.price * item.quantity).toLocaleString("en-IN")}`;
            const unitPrice = `₹${item.price.toLocaleString("en-IN")}`;
            const safeItemName = escapeHtml(item.name);
            const subtext = [item.category, item.specs]
              .filter(Boolean)
              .map((s) => escapeHtml(s))
              .join(" • ");
            return `
              <tr style="border-bottom: 1px solid #E5E4E0;">
                <td style="padding: 12px 14px; font-size: 13px; color: #1A1A1A; font-weight: 500;">
                  ${idx + 1}. ${safeItemName}
                  ${subtext ? `<div style="font-size: 11px; color: #8A8780; font-weight: normal; margin-top: 2px;">${subtext}</div>` : ""}
                </td>
                <td style="padding: 12px 14px; font-size: 13px; color: #1A1A1A; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px 14px; font-size: 13px; color: #1A1A1A; text-align: right;">${unitPrice}</td>
                <td style="padding: 12px 14px; font-size: 13px; color: #1A1A1A; text-align: right; font-weight: 600;">${lineTotal}</td>
              </tr>
            `;
          })
          .join("");

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order ${orderRef}</title>
          </head>
          <body style="margin: 0; padding: 24px 12px; background-color: #F9F8F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <table role="presentation" style="max-width: 620px; width: 100%; background: #FFFFFF; border: 1px solid #E5E4E0; border-collapse: collapse;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding: 36px 32px 24px; border-bottom: 1px solid #E5E4E0;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td valign="top">
                              <h1 style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 1px; color: #1A1A1A;">
                                Anabia
                              </h1>
                              <p style="margin: 4px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #8A8780;">
                                Archival Homewares & Objects
                              </p>
                            </td>
                            <td align="right" valign="top">
                              <span style="display: inline-block; padding: 4px 10px; background: #F2F1EF; border: 1px solid #E5E4E0; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: #1A1A1A;">
                                ${orderRef}
                              </span>
                              <div style="font-size: 12px; color: #8A8780; margin-top: 6px;">${orderDate}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- PDF Attachment Callout -->
                    <tr>
                      <td style="padding: 16px 32px; background: #F9F8F6; border-bottom: 1px solid #E5E4E0;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="font-size: 13px; color: #1A1A1A;">
                              <strong>📎 PDF Invoice Attached:</strong> A formal purchase order PDF (<code>${orderRef}.pdf</code>) has been attached to this email for your accounting and fulfillment records.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Metadata (Customer & Store) -->
                    <tr>
                      <td style="padding: 28px 32px 16px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="50%" valign="top" style="padding-right: 16px;">
                              <h3 style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8A8780;">
                                Bill To / Customer
                              </h3>
                              <div style="font-size: 14px; font-weight: 600; color: #1A1A1A; margin-bottom: 4px;">
                                ${escapeHtml(safeCustomerName)}
                              </div>
                              ${safeCompanyName ? `<div style="font-size: 13px; color: #555; margin-bottom: 3px;">Company: ${escapeHtml(safeCompanyName)}</div>` : ""}
                              <div style="font-size: 13px; color: #555; margin-bottom: 3px;">Phone: <strong>${escapeHtml(phone)}</strong></div>
                              <div style="font-size: 13px; color: #555; margin-bottom: 3px;">Delivery Address: <strong>${escapeHtml(address)}</strong></div>
                              <div style="font-size: 13px; color: #555;">City / State: <strong>${escapeHtml(city)}</strong></div>
                            </td>
                            <td width="50%" valign="top" style="padding-left: 16px; border-left: 1px solid #F2F1EF;">
                              <h3 style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8A8780;">
                                Fulfillment Info
                              </h3>
                              <div style="font-size: 13px; color: #555; margin-bottom: 4px;">Store: <strong>Anabia Traders</strong></div>
                              <div style="font-size: 13px; color: #555; margin-bottom: 4px;">Packaging: <strong>Plastic-free paper</strong></div>
                              <div style="font-size: 13px; color: #555; margin-bottom: 4px;">Dispatch SLA: <strong>Within 48 hours</strong></div>
                              <div style="font-size: 13px; color: #555;">Support: ayanhusain2907@gmail.com</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Order Items Table -->
                    <tr>
                      <td style="padding: 16px 32px 24px;">
                        <h3 style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8A8780;">
                          Order Items
                        </h3>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #E5E4E0; border-collapse: collapse;">
                          <thead>
                            <tr style="background: #F9F8F6; border-bottom: 1px solid #E5E4E0;">
                              <th align="left" style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #8A8780;">Item</th>
                              <th align="center" style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #8A8780; width: 40px;">Qty</th>
                              <th align="right" style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #8A8780; width: 90px;">Unit</th>
                              <th align="right" style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #8A8780; width: 90px;">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${itemRows}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <!-- Subtotal & Total Block -->
                    <tr>
                      <td style="padding: 0 32px 28px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="55%"></td>
                            <td width="45%">
                              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                                <tr>
                                  <td style="padding: 4px 0; font-size: 13px; color: #8A8780;">Subtotal</td>
                                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #1A1A1A; font-weight: 500;">${formattedTotal}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 4px 0; font-size: 13px; color: #8A8780;">Shipping</td>
                                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #8A8780;">Calculated at checkout</td>
                                </tr>
                                <tr>
                                  <td colspan="2" style="padding: 8px 0;">
                                    <div style="height: 1px; background: #1A1A1A;"></div>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 4px 0; font-size: 15px; font-weight: 600; color: #1A1A1A;">Total (INR)</td>
                                  <td align="right" style="padding: 4px 0; font-size: 16px; font-weight: 700; color: #1A1A1A;">${formattedTotal}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Customer Notes if any -->
                    ${
                      notes
                        ? `
                    <tr>
                      <td style="padding: 0 32px 28px;">
                        <div style="background: #F9F8F6; border: 1px solid #E5E4E0; padding: 16px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8A8780; margin-bottom: 6px;">
                            Special Instructions / Client Notes
                          </div>
                          <div style="font-size: 13px; color: #1A1A1A; line-height: 1.5;">
                            ${escapeHtml(notes)}
                          </div>
                        </div>
                      </td>
                    </tr>
                    `
                        : ""
                    }

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 32px; background: #F9F8F6; border-top: 1px solid #E5E4E0; text-align: center;">
                        <p style="margin: 0 0 6px; font-size: 12px; color: #1A1A1A; font-weight: 500;">
                          Anabia — Minimalist Homewares &amp; Objects
                        </p>
                        <p style="margin: 0; font-size: 11px; color: #8A8780;">
                          Small-batch production • Direct provenance from regional master artisans • Plastic-free dispatch
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        const senderEmail =
          process.env.RESEND_FROM_EMAIL ||
          "Anabia Orders <onboarding@resend.dev>";

        // Build attachments array
        const attachments = pdfBuffer
          ? [
              {
                filename: `${orderRef}.pdf`,
                content: pdfBuffer,
              },
            ]
          : undefined;

        const { error: resendError } = await resend.emails.send({
          from: senderEmail,
          to: [clientEmail],
          subject: `Order ${orderRef} — ${safeCustomerName} — ${formattedTotal}`,
          html: htmlContent,
          attachments,
        });

        if (resendError) {
          console.error("Resend email error:", resendError);
        }
      } catch (emailErr) {
        // Log email error but don't fail the order response
        console.error("Resend email sending error:", emailErr);
      }
    }

    return NextResponse.json({ success: true, orderId: orderRef });
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("Order processing error:", err);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
