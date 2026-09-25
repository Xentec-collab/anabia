import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { createServerClient } from "@/lib/supabase";
import ProductForm from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({ params }: EditProductPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifyAdminSession(session))) {
    redirect("/admin");
  }

  const { id } = await params;
  if (!id || !UUID_REGEX.test(id)) {
    notFound();
  }

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

  if (!product) {
    notFound();
  }

  return <ProductForm mode="edit" productId={id} initialData={product} />;
}
