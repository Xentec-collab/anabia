import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type DatabaseProduct, type Product } from "@/lib/supabase";
import { resolveDirectImageUrl } from "@/lib/resolveImageUrl";

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

    // Search by name, category, or description with smart length thresholds
    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, " ").trim();
      if (sanitized) {
        // For short queries (< 3 chars), search only name and category to avoid false matches in long descriptions
        if (sanitized.length < 3) {
          query = query.or(`name.ilike.%${sanitized}%,category.ilike.%${sanitized}%`);
        } else {
          query = query.or(`name.ilike.%${sanitized}%,category.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
        }
      } else {
        return NextResponse.json([]);
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format price from paise (e.g. 280000) to string "₹2,800"
    let formattedProducts: Product[] = await Promise.all(
      (data as DatabaseProduct[]).map(async (item) => {
        const rupees = Math.round(item.price / 100);
        let cleanUrl = item.image_url || "";
        if (cleanUrl.includes("ibb.co") && !cleanUrl.includes("i.ibb.co")) {
          cleanUrl = await resolveDirectImageUrl(cleanUrl);
        }
        return {
          id: item.id,
          name: item.name,
          price: `₹${rupees.toLocaleString("en-IN")}`,
          price_in_paise: item.price,
          category: item.category,
          image_url: cleanUrl,
          stock: item.stock,
          specs: (item as any).specs,
          description: (item as any).description,
          created_at: item.created_at,
        };
      })
    );

    // Relevance sort: prioritize direct name matches at the top of results
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      formattedProducts.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aIncludes = aName.includes(q);
        const bIncludes = bName.includes(q);
        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;

        return 0;
      });
    }

    // Search results must never be cached on CDN/browser to avoid stale search race conditions
    const cacheHeader = search
      ? "no-store, no-cache, must-revalidate, proxy-revalidate"
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
