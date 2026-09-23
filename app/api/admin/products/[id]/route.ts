import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { createServerClient } from "@/lib/supabase";
import { resolveDirectImageUrl } from "@/lib/resolveImageUrl";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSession(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
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

    const numericStock = stock !== undefined && stock !== null ? parseInt(String(stock), 10) : 0;
    if (isNaN(numericStock) || numericStock < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative number" },
        { status: 400 }
      );
    }

    const priceInPaise = Math.round(numericPrice * 100);

    const resolvedImageUrl = await resolveDirectImageUrl(image_url);

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        price: priceInPaise,
        category: normalizedCategory,
        stock: numericStock,
        description: description?.trim() || null,
        image_url: resolvedImageUrl || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Cache revalidation
    try {
      revalidatePath("/");
      revalidatePath(`/product/${id}`);
      revalidateTag("products");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSession(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Cache revalidation
    try {
      revalidatePath("/");
      revalidatePath(`/product/${id}`);
      revalidateTag("products");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
