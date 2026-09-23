import { NextRequest, NextResponse } from "next/server";
import { resolveDirectImageUrl } from "@/lib/resolveImageUrl";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const directUrl = await resolveDirectImageUrl(url);
  return NextResponse.json({ directUrl });
}
