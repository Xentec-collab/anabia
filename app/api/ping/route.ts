import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { inquiriesRateLimiter, getClientIp, checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Basic rate limit to prevent connection pool exhaustion attacks (max 30 pings/hr per IP)
    const ip = getClientIp(request);
    const limitRes = await checkRateLimit(inquiriesRateLimiter, `ping:${ip}`);
    if (!limitRes.success) {
      return NextResponse.json(
        { ok: false, error: "Too many ping requests" },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Retry-After": "60",
          },
        }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Supabase database is active and awake",
        timestamp: new Date().toISOString(),
        rowCount: data?.length ?? 0,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { ok: false, error: msg },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
