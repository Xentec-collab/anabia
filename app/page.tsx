import { Suspense } from "react";
import ShopCatalog from "@/components/ShopCatalog";
import type { Product, DatabaseProduct } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase";
import { DEMO_PRODUCTS } from "@/lib/demoProducts";

import { resolveDirectImageUrl } from "@/lib/resolveImageUrl";

// Incremental Static Regeneration: cache page at edge and revalidate every 60 seconds
export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return Promise.all(
        (data as DatabaseProduct[]).map(async (item) => {
          let cleanUrl = item.image_url || "";
          if (cleanUrl.includes("ibb.co") && !cleanUrl.includes("i.ibb.co")) {
            cleanUrl = await resolveDirectImageUrl(cleanUrl);
          }
          return {
            id: item.id,
            name: item.name,
            price: `₹${Math.round(item.price / 100).toLocaleString("en-IN")}`,
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
    }
  } catch (err) {
    console.error("Failed to load products from database:", err);
  }

  return DEMO_PRODUCTS;
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col w-full">
      {/* Editorial Hero Statement */}
      <section className="h-[260px] flex items-center justify-center flex-col text-center px-4">
        <h1 className="font-serif text-[36px] md:text-[40px] text-[var(--ink)] max-w-[560px] leading-tight font-normal">
          Considered things for considered people
        </h1>
        <div className="w-12 h-[1px] bg-[var(--line)] mt-6 mx-auto" />
      </section>

      {/* Shop Catalog with Instant Filtering & Sorting */}
      <Suspense
        fallback={
          <div className="py-20 text-center text-[var(--muted)] text-[14px]">
            Loading catalog...
          </div>
        }
      >
        <ShopCatalog products={products} />
      </Suspense>
    </div>
  );
}
