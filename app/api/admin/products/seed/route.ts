import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { createServerClient } from "@/lib/supabase";
import { DEMO_PRODUCTS } from "@/lib/demoProducts";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSession(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    // Check if products already exist
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Catalog already contains products. Delete existing products before seeding starter catalog." },
        { status: 400 }
      );
    }

    // Insert all 12 demo products as genuine database rows with auto-generated UUIDs
    const rowsToInsert = DEMO_PRODUCTS.map((p) => {
      const numericPrice =
        typeof p.price === "number"
          ? p.price
          : parseInt(String(p.price).replace(/[^\d]/g, ""), 10) || 0;

      return {
        name: p.name,
        price: p.price_in_paise || numericPrice * 100,
        category: p.category,
        image_url: p.image_url,
        stock: p.stock ?? 10,
        specs: (p as any).specs || null,
        description: p.description || null,
      };
    });

    const { data, error: insertError } = await supabase
      .from("products")
      .insert(rowsToInsert)
      .select();

    if (insertError) {
      console.error("Error seeding starter products:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin");
      revalidateTag("products");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data.length} starter products.`,
      count: data.length,
    });
  } catch (error: unknown) {
    console.error("Error seeding products:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
