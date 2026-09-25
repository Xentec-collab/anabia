import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { resolveDirectImageUrl } from "@/lib/resolveImageUrl";

function isPrivateIpOrHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower === "127.0.0.1" ||
    lower === "::1" ||
    lower === "0.0.0.0" ||
    lower === "169.254.169.254"
  ) {
    return true;
  }
  // RFC 1918 private ranges
  if (
    /^10\./.test(lower) ||
    /^192\.168\./.test(lower) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lower)
  ) {
    return true;
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSession(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return NextResponse.json({ error: "Only http and https protocols are allowed" }, { status: 400 });
    }

    if (isPrivateIpOrHost(parsed.hostname)) {
      return NextResponse.json({ error: "Access to private or local network hosts is prohibited" }, { status: 400 });
    }

    const directUrl = await resolveDirectImageUrl(url);
    return NextResponse.json({ directUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error resolving image";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
