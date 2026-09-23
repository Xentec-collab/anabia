import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { DEMO_PRODUCTS } from "@/lib/demoProducts";
import ProductForm from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  if (!id) notFound();

  let product = null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      product = data;
    }
  } catch (err) {
    console.error("Error fetching product for edit:", err);
  }

  // Fallback: check DEMO_PRODUCTS if not found in DB
  if (!product) {
    const demo = DEMO_PRODUCTS.find((p) => p.id === id);
    if (demo) {
      const numericPrice =
        typeof demo.price === "number"
          ? demo.price
          : parseInt(String(demo.price).replace(/[^\d]/g, ""), 10) || 0;
      product = {
        id: demo.id,
        name: demo.name,
        price: demo.price_in_paise || numericPrice * 100,
        category: demo.category,
        image_url: demo.image_url,
        stock: demo.stock ?? 10,
        description: demo.description,
      };
    }
  }

  if (!product) {
    notFound();
  }

  return <ProductForm mode="edit" productId={id} initialData={product} />;
}
