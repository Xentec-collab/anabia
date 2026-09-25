import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { createServerClient } from "@/lib/supabase";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSession(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { status } = body;

    const allowedStatuses = ["new", "confirmed", "shipped", "delivered", "restock-inquiry", "cancelled"];
    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: status.toLowerCase() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update order status error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error: unknown) {
    console.error("Error updating order status:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
