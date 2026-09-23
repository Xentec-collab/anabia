"use client";

import { memo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import type { CartItem } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";

interface CartRowProps {
  item: CartItem;
}

function CartRowComponent({ item }: CartRowProps) {
  const [imageError, setImageError] = useState(false);
  const isDirectCdn = Boolean(
    item.image_url && (item.image_url.includes("ibb.co") || item.image_url.includes("googleusercontent.com"))
  );

  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQty(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < 10) {
      updateQty(item.id, item.quantity + 1);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
    toast.success("Item removed");
  };

  const formattedRowTotal = `₹${(item.price * item.quantity).toLocaleString("en-IN")}`;

  return (
    <article className="py-6 flex gap-6 items-center justify-between animate-fade-in">
      {/* Product Image & Details */}
      <div className="flex items-center gap-5 min-w-0">
        <div
          className="w-[64px] h-[80px] flex-shrink-0 bg-[var(--ghost)] overflow-hidden border border-[var(--line)]/50 relative flex items-center justify-center"
          style={{ position: "relative", width: 64, height: 80, overflow: "hidden" }}
        >
          {imageError || !item.image_url ? (
            <span className="text-[10px] text-[var(--muted)]">No img</span>
          ) : (
            <Image
              src={item.image_url}
              alt={item.name}
              width={64}
              height={80}
              unoptimized={isDirectCdn}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h2 className="text-[14px] leading-[20px] font-normal text-[var(--ink)] truncate">
            {item.name}
          </h2>
          {item.specs && (
            <p className="text-[13px] leading-[18px] text-[var(--muted)] mt-0.5">
              {item.specs}
            </p>
          )}
          <p className="text-[14px] leading-[20px] font-normal text-[var(--ink)] mt-2">
            {formattedRowTotal}
          </p>
        </div>
      </div>

      {/* Stepper & Remove */}
      <div className="flex items-center gap-6 flex-shrink-0">
        {/* Stepper with the exclusive 4px radius */}
        <div className="inline-flex items-center h-[32px] border border-[var(--line)] rounded-[4px] bg-[var(--surface)] overflow-hidden select-none">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            className={`w-8 h-full flex items-center justify-center text-[var(--ink)] transition-all duration-150 ${
              item.quantity <= 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-[var(--ghost)] active:scale-95 active:bg-[var(--line)] cursor-pointer"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
          <span className="w-8 text-center text-[13px] font-medium text-[var(--ink)] border-x border-[var(--line)] leading-none py-1">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={handleIncrease}
            disabled={item.quantity >= 10}
            className={`w-8 h-full flex items-center justify-center text-[var(--ink)] transition-all duration-150 ${
              item.quantity >= 10
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-[var(--ghost)] active:scale-95 active:bg-[var(--line)] cursor-pointer"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          className="text-[12px] text-[var(--muted)] hover:text-[var(--ink)] active:opacity-60 transition-all duration-150 bg-transparent border-0 cursor-pointer p-1 underline-offset-4 hover:underline"
        >
          Remove
        </button>
      </div>
    </article>
  );
}

export default memo(CartRowComponent, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.quantity === next.item.quantity &&
    prev.item.price === next.item.price
  );
});
