"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cartStore";
import OrderModal from "./OrderModal";

export default function CartSummary() {
  const { total, items } = useCart();
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const formattedTotal = `₹${total.toLocaleString("en-IN")}`;
  const isEmpty = items.length === 0;

  return (
    <>
      <aside className="w-full sticky top-20">
        <div className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-none p-6 flex flex-col">
          <h2 className="text-[14px] font-medium uppercase tracking-wider text-[var(--ink)] pb-4 border-b border-[var(--line)]">
            Order summary
          </h2>

          {/* Rows */}
          <div className="flex flex-col space-y-3 pt-5">
            {/* Subtotal Row */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-normal text-[var(--ink)]">Subtotal</span>
              <span className="text-[14px] font-normal text-[var(--ink)]">
                {formattedTotal}
              </span>
            </div>

            {/* Shipping Row */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-normal text-[var(--muted)]">Shipping</span>
              <span className="text-[13px] font-normal text-[var(--muted)]">
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[var(--line)] my-4" />

          {/* Total Row */}
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-[15px] font-medium text-[var(--ink)]">Total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
                INR
              </span>
              <span className="text-[15px] font-medium text-[var(--ink)]">
                {formattedTotal}
              </span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="button"
            disabled={isEmpty}
            onClick={() => setOrderModalOpen(true)}
            className={`w-full h-[48px] bg-[var(--ink)] text-[var(--surface)] text-[14px] font-normal rounded-none transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] active:opacity-95 ${
              isEmpty
                ? "opacity-40 pointer-events-none"
                : "hover:bg-[var(--accent)]"
            }`}
          >
            <span>Place Order</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>

          {/* Continue Shopping Link */}
          <Link
            href="/"
            className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] block text-center mt-4 transition-colors duration-150 underline-offset-4 hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </aside>

      {/* Order Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
      />
    </>
  );
}
