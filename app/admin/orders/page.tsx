import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { createServerClient } from "@/lib/supabase";
import AdminOrdersTable, { type AdminOrder } from "@/components/admin/AdminOrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifyAdminSession(session))) {
    redirect("/admin");
  }

  let orders: AdminOrder[] = [];

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      orders = data as AdminOrder[];
    }
  } catch (err) {
    console.error("Error fetching admin orders:", err);
  }

  return <AdminOrdersTable initialOrders={orders} />;
}
