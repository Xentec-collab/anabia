"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specs?: string;
  category?: string;
  image_url?: string;
}

export interface AdminOrder {
  id: string;
  customer_name: string;
  company_name?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  city: string;
  notes?: string | null;
  items: OrderItem[];
  subtotal: number;
  status: string;
  created_at: string;
}

export default function AdminOrdersTable({
  initialOrders,
}: {
  initialOrders: AdminOrder[];
}) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: unknown) {
      console.error("Status update error:", err);
      const msg = err instanceof Error ? err.message : "Error updating status";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.customer_name.toLowerCase().includes(term) ||
      o.phone.includes(term) ||
      (o.city && o.city.toLowerCase().includes(term)) ||
      o.id.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "confirmed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "restock-inquiry":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] text-[#1A1A1A] tracking-tight">
            Orders &amp; Inquiries
          </h1>
          <p className="text-[13px] text-[#8A8780] mt-0.5">
            Review customer orders, restock inquiries, and update fulfillment progress.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by customer, phone, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 px-3 border border-[#E5E4E0] text-[13px] text-[#1A1A1A] placeholder:text-[#8A8780] focus:outline-none focus:border-[#1A1A1A] rounded-none w-full sm:w-72"
        />
      </div>

      {/* Orders Table */}
      <div className="border border-[#E5E4E0] bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E4E0] bg-[#FBFBFA] text-[11px] uppercase tracking-wider text-[#8A8780]">
              <th className="py-3.5 px-4 font-medium w-8"></th>
              <th className="py-3.5 px-4 font-medium">Date</th>
              <th className="py-3.5 px-4 font-medium">Customer Name</th>
              <th className="py-3.5 px-4 font-medium">Phone</th>
              <th className="py-3.5 px-4 font-medium">City</th>
              <th className="py-3.5 px-4 font-medium">Items</th>
              <th className="py-3.5 px-4 font-medium">Subtotal</th>
              <th className="py-3.5 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E4E0] text-[13px] text-[#1A1A1A]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#8A8780]">
                  {orders.length === 0
                    ? "No orders found in the database."
                    : `No orders matching "${searchTerm}".`}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isExpanded = expandedId === order.id;
                const formattedDate = new Date(order.created_at).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                );

                const totalItemsCount = Array.isArray(order.items)
                  ? order.items.reduce((sum, i) => sum + (i.quantity || 1), 0)
                  : 0;

                return (
                  <tbody key={order.id} className="border-b border-[#E5E4E0]">
                    <tr
                      onClick={() => toggleExpand(order.id)}
                      className={`hover:bg-[#F9F8F6] transition-colors cursor-pointer select-none ${
                        isExpanded ? "bg-[#F9F8F6]" : ""
                      }`}
                    >
                      {/* Expand Chevron */}
                      <td className="py-3.5 px-3 text-[#8A8780] text-center w-8">
                        <span
                          className={`inline-block transition-transform duration-200 text-[10px] ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        >
                          ▶
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#66645E] whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4 font-medium">
                        {order.customer_name}
                        {order.company_name && (
                          <span className="block text-[11px] text-[#8A8780] font-normal">
                            {order.company_name}
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[12px]">
                        <a
                          href={`tel:${order.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline text-[#1A1A1A]"
                        >
                          {order.phone}
                        </a>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 text-[#66645E]">
                        {order.city || "—"}
                      </td>

                      {/* Items Count */}
                      <td className="py-3.5 px-4">
                        {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                        {order.subtotal > 0
                          ? `₹${order.subtotal.toLocaleString("en-IN")}`
                          : "₹0 (Inquiry)"}
                      </td>

                      {/* Status Dropdown */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          disabled={updatingId === order.id}
                          value={order.status.toLowerCase()}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className={`text-[12px] font-medium py-1 px-2.5 border rounded-none focus:outline-none focus:border-[#1A1A1A] cursor-pointer transition-colors ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="restock-inquiry">Restock Inquiry</option>
                        </select>
                      </td>
                    </tr>

                    {/* Expandable Order Details Row */}
                    {isExpanded && (
                      <tr className="bg-[#FAF9F7]">
                        <td colSpan={8} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 border border-[#E5E4E0]">
                            {/* Left: Customer & Delivery Details */}
                            <div className="space-y-3">
                              <h3 className="text-[11px] uppercase tracking-wider text-[#8A8780] font-semibold">
                                Customer &amp; Delivery Details
                              </h3>
                              <div className="text-[13px] space-y-1.5 text-[#1A1A1A]">
                                <p>
                                  <span className="text-[#8A8780]">Name:</span>{" "}
                                  <span className="font-medium">{order.customer_name}</span>
                                </p>
                                {order.company_name && (
                                  <p>
                                    <span className="text-[#8A8780]">Company:</span>{" "}
                                    {order.company_name}
                                  </p>
                                )}
                                <p>
                                  <span className="text-[#8A8780]">Phone:</span>{" "}
                                  <a
                                    href={`https://wa.me/${order.phone.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-700 hover:underline font-medium"
                                  >
                                    {order.phone} (WhatsApp ↗)
                                  </a>
                                </p>
                                {order.email && (
                                  <p>
                                    <span className="text-[#8A8780]">Email:</span>{" "}
                                    <a
                                      href={`mailto:${order.email}`}
                                      className="underline hover:text-black"
                                    >
                                      {order.email}
                                    </a>
                                  </p>
                                )}
                                <p>
                                  <span className="text-[#8A8780]">City/State:</span>{" "}
                                  {order.city}
                                </p>
                                {order.address && (
                                  <p className="pt-1">
                                    <span className="text-[#8A8780] block text-[11px] uppercase tracking-wider">
                                      Shipping Address:
                                    </span>
                                    <span className="whitespace-pre-line text-[#333]">
                                      {order.address}
                                    </span>
                                  </p>
                                )}
                                {order.notes && (
                                  <p className="pt-2 border-t border-[#E5E4E0] mt-2">
                                    <span className="text-[#8A8780] block text-[11px] uppercase tracking-wider">
                                      Customer Notes:
                                    </span>
                                    <span className="italic text-[#444] bg-[#F2F1EF] p-2 block mt-1">
                                      "{order.notes}"
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Itemized Breakdown */}
                            <div>
                              <h3 className="text-[11px] uppercase tracking-wider text-[#8A8780] font-semibold mb-3">
                                Ordered Items ({totalItemsCount})
                              </h3>
                              <div className="border border-[#E5E4E0] overflow-hidden">
                                <table className="w-full text-left text-[12px]">
                                  <thead className="bg-[#FBFBFA] border-b border-[#E5E4E0] text-[10px] uppercase text-[#8A8780]">
                                    <tr>
                                      <th className="py-2 px-3">Item</th>
                                      <th className="py-2 px-3 text-center">Qty</th>
                                      <th className="py-2 px-3 text-right">Price</th>
                                      <th className="py-2 px-3 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#E5E4E0]">
                                    {Array.isArray(order.items) &&
                                      order.items.map((item, idx) => (
                                        <tr key={idx}>
                                          <td className="py-2.5 px-3 font-medium text-[#1A1A1A]">
                                            {item.name}
                                            {item.specs && (
                                              <span className="block text-[10px] text-[#8A8780] font-normal">
                                                {item.specs}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 text-center">
                                            {item.quantity}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-[#66645E]">
                                            ₹{item.price.toLocaleString("en-IN")}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-medium text-[#1A1A1A]">
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                  <tfoot className="bg-[#FBFBFA] border-t border-[#E5E4E0]">
                                    <tr>
                                      <td
                                        colSpan={3}
                                        className="py-2.5 px-3 font-medium text-[#1A1A1A] text-right"
                                      >
                                        Subtotal:
                                      </td>
                                      <td className="py-2.5 px-3 font-bold text-[#1A1A1A] text-right">
                                        ₹{order.subtotal.toLocaleString("en-IN")}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
