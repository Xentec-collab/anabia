import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type DatabaseProduct, type Product } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Math.min(Math.max(limitParam || 50, 1), 100);

    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(limit);

    // Filter by category if supplied and not "all"
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Search by name or description with PostgREST syntax injection sanitization
    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[(),.*]/g, "");
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format price from paise (e.g. 280000) to string "₹2,800"
    const formattedProducts: Product[] = (data as DatabaseProduct[]).map((item) => {
      const rupees = Math.round(item.price / 100);
      return {
        id: item.id,
        name: item.name,
        price: `₹${rupees.toLocaleString("en-IN")}`,
        price_in_paise: item.price,
        category: item.category,
        image_url: item.image_url || "",
        stock: item.stock,
        specs: (item as any).specs,
        description: (item as any).description,
        created_at: item.created_at,
      };
    });

    const cacheHeader = search
      ? "public, s-maxage=30, stale-while-revalidate=120"
      : "public, s-maxage=300, stale-while-revalidate=86400";

    return NextResponse.json(formattedProducts, {
      headers: {
        "Cache-Control": cacheHeader,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
