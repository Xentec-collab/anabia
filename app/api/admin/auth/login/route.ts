import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE,
  verifyAdminPassword,
  getExpectedAdminToken,
} from "@/lib/adminAuth";
import { adminLoginRateLimiter, getClientIp, checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting: max 5 login attempts per IP per 15 minutes
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(
      adminLoginRateLimiter,
      `admin_login:${clientIp}`
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please wait 15 minutes before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "900",
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      // Artificial delay to mitigate high-speed brute force
      await new Promise((resolve) => setTimeout(resolve, 350));
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const token = await getExpectedAdminToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Admin login error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
