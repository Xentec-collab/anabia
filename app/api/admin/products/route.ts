import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { createServerClient } from "@/lib/supabase";
import { resolveDirectImageUrl } from "@/lib/resolveImageUrl";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSession(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, price, category, stock, description, image_url } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { error: "Valid price in ₹ is required" },
        { status: 400 }
      );
    }

    const validCategories = ["clothing", "accessories", "home", "care"];
    const normalizedCategory = (category || "").toLowerCase().trim();
    if (!validCategories.includes(normalizedCategory)) {
      return NextResponse.json(
        { error: "Invalid category. Must be Clothing, Accessories, Home, or Care." },
        { status: 400 }
      );
    }

    const numericStock = stock !== undefined && stock !== null ? parseInt(String(stock), 10) : 10;
    if (isNaN(numericStock) || numericStock < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative number" },
        { status: 400 }
      );
    }

    // Convert rupees to paise (e.g. 2800 -> 280000)
    const priceInPaise = Math.round(numericPrice * 100);

    const resolvedImageUrl = await resolveDirectImageUrl(image_url);

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        price: priceInPaise,
        category: normalizedCategory,
        stock: numericStock,
        description: description?.trim() || null,
        image_url: resolvedImageUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Bust Next.js cache so the live store updates immediately
    try {
      revalidatePath("/");
      revalidateTag("products");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, product: data }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error adding product:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
