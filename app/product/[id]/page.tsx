import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createServerClient, type DatabaseProduct, type Product } from "@/lib/supabase";
import { DEMO_PRODUCTS } from "@/lib/demoProducts";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 3600; // 1 hour ISR for product pages

// Pre-render product pages statically at build time
export async function generateStaticParams() {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("products").select("id");
    if (data && data.length > 0) {
      return data.map((p) => ({ id: p.id }));
    }
  } catch (err) {
    console.error("Static params generation fallback to DEMO_PRODUCTS:", err);
  }

  return DEMO_PRODUCTS.map((p) => ({ id: p.id }));
}

// React cache() deduplicates getProduct between generateMetadata and ProductDetailPage
const getProduct = cache(async (id: string): Promise<Product | null> => {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      const item = data as DatabaseProduct & { description?: string; specs?: string };
      const rupees = Math.round(item.price / 100);
      return {
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
    }
  } catch (err) {
    console.error("Failed to fetch product:", err);
  }

  // Fallback: check DEMO_PRODUCTS
  const fallback = DEMO_PRODUCTS.find(
    (p) => p.id === id || p.name.toLowerCase().replace(/\s+/g, "-") === id
  );

  return fallback ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product Not Found — Anabia" };
  }

  const formattedPrice =
    typeof product.price === "string"
      ? product.price
      : `₹${product.price.toLocaleString("en-IN")}`;

  return {
    title: `${product.name} — Anabia`,
    description: product.description || `${product.name} — ${formattedPrice}. Considered things for considered people.`,
    openGraph: {
      title: `${product.name} — Anabia`,
      description: product.description || `${product.name} — ${formattedPrice}`,
      images: product.image_url ? [{ url: product.image_url }] : [],
      url: `/product/${product.id}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
