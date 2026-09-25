import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { createServerClient, type DatabaseProduct } from "@/lib/supabase";
import { DEMO_PRODUCTS } from "@/lib/demoProducts";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminProductsTable, { type AdminProductRow } from "@/components/admin/AdminProductsTable";

import { resolveDirectImageUrl } from "@/lib/resolveImageUrl";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminSession(session);

  if (!isAuthenticated) {
    return (
      <div className="py-20 flex items-center justify-center">
        <AdminLoginForm />
      </div>
    );
  }

  // Fetch all products with service role client
  let products: AdminProductRow[] = [];
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      products = await Promise.all(
        (data as AdminProductRow[]).map(async (item) => {
          if (
            item.image_url &&
            item.image_url.includes("ibb.co") &&
            !item.image_url.includes("i.ibb.co")
          ) {
            const resolved = await resolveDirectImageUrl(item.image_url);
            return { ...item, image_url: resolved };
          }
          return item;
        })
      );
    }
  } catch (err) {
    console.error("Error loading products in admin page:", err);
  }

  return <AdminProductsTable initialProducts={products} />;
}
