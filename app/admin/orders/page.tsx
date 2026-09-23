import { createServerClient } from "@/lib/supabase";
import AdminOrdersTable, { type AdminOrder } from "@/components/admin/AdminOrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
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
