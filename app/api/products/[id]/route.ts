import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type DatabaseProduct, type Product } from "@/lib/supabase";
import { DEMO_PRODUCTS } from "@/lib/demoProducts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Query product by id
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      const item = data as DatabaseProduct & { description?: string; specs?: string };
      const rupees = Math.round(item.price / 100);
      const product: Product = {
        id: item.id,
        name: item.name,
        price: `₹${rupees.toLocaleString("en-IN")}`,
        price_in_paise: item.price,
        category: item.category,
        image_url: item.image_url || "",
        stock: item.stock,
        specs: item.specs,
        description: item.description,
        created_at: item.created_at,
      };
      return NextResponse.json(product);
    }

    // Fallback: check DEMO_PRODUCTS by id or matching name/slug
    const fallback = DEMO_PRODUCTS.find(
      (p) => p.id === id || p.name.toLowerCase().replace(/\s+/g, "-") === id
    );

    if (fallback) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
