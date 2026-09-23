"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import type { Product } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";
import OrderModal from "@/components/OrderModal";

interface ProductDetailClientProps {
  product: Product;
}

const SOLID_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGMkYxRUYiLz48L3N2Zz4=";

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock < 5;

  let stockStatusDot = "bg-emerald-600";
  let stockStatusText = "In stock";

  if (isOutOfStock) {
    stockStatusDot = "bg-red-600";
    stockStatusText = "Currently out of stock";
  } else if (isLowStock) {
    stockStatusDot = "bg-amber-500";
    stockStatusText = `Only ${product.stock} left`;
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const numericPrice =
      typeof product.price === "number"
        ? product.price
        : parseInt(product.price.toString().replace(/[^\d]/g, ""), 10) || 0;

    const formattedPrice =
      typeof product.price === "string"
        ? product.price
        : `₹${product.price.toLocaleString("en-IN")}`;

    addItem(
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: numericPrice,
        formatted_price: formattedPrice,
        specs: product.specs,
        image_url: product.image_url,
      },
      1
    );

    setAdded(true);
    toast.success("Added to bag");
    setTimeout(() => setAdded(false), 1500);
  };

  const formattedPrice =
    typeof product.price === "string"
      ? product.price
      : `₹${product.price.toLocaleString("en-IN")}`;

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-24">
        {/* Top Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors group"
          >
            <span className="transition-transform duration-150 group-hover:-translate-x-0.5">
              ←
            </span>
            <span>Back to shop</span>
          </Link>
        </div>

        {/* Product Layout: 60% Image Left / 40% Details Right on Desktop */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left Column (60% Desktop) - Full Width Image */}
          <div className="w-full lg:w-[60%] flex-shrink-0">
            <div className="aspect-[4/5] w-full bg-[#F2F1EF] overflow-hidden relative border border-[var(--line)]/40">
              {imageError || !product.image_url ? (
                <div className="w-full h-full bg-[#F2F1EF] flex items-center justify-center text-[var(--muted)] text-[13px] select-none">
                  Image unavailable
                </div>
              ) : (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  placeholder="blur"
                  blurDataURL={SOLID_BLUR_DATA_URL}
                  sizes="(max-width: 1024px) 100vw, 660px"
                  onError={() => setImageError(true)}
                  className="object-cover object-center"
                />
              )}
            </div>
          </div>

          {/* Right Column (40% Desktop) - Product Info */}
          <div className="w-full lg:w-[40%] flex flex-col">
            {/* Category Tag */}
            <div className="mb-2">
              <span className="inline-block text-[11px] uppercase tracking-widest text-[var(--muted)] font-medium">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="font-serif text-[30px] sm:text-[36px] text-[var(--ink)] font-normal leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-[18px] text-[var(--ink)] font-normal mt-3">
              {formattedPrice}
            </p>

            {/* Stock Status */}
            <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--muted)]">
              <span className={`w-2 h-2 rounded-full inline-block ${stockStatusDot}`} />
              <span>{stockStatusText}</span>
            </div>

            <div className="w-full h-[1px] bg-[var(--line)] my-6" />

            {/* Specs if available */}
            {product.specs && (
              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Specifications
                </span>
                <p className="text-[13px] text-[var(--ink)] font-normal">
                  {product.specs}
                </p>
              </div>
            )}

            {/* Full Description */}
            {product.description && (
              <div className="mb-8">
                <span className="text-[11px] uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                  About this edition
                </span>
                <p className="text-[14px] leading-relaxed text-[var(--muted)] font-normal whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart or Notify Me CTA */}
            {isOutOfStock ? (
              <button
                type="button"
                onClick={() => setNotifyModalOpen(true)}
                className="w-full h-[48px] text-[14px] font-normal rounded-none flex items-center justify-center gap-2 border border-[var(--ink)] text-[var(--ink)] bg-transparent hover:bg-[var(--ink)] hover:text-[var(--surface)] transition-colors duration-150 select-none cursor-pointer"
              >
                Notify Me
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full h-[48px] text-[14px] font-normal rounded-none flex items-center justify-center gap-2 bg-[var(--ink)] text-[var(--surface)] hover:bg-[var(--accent)] transition-colors duration-150 select-none cursor-pointer"
              >
                <span>{added ? "Added to bag" : "Add to cart"}</span>
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
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                  />
                </svg>
              </button>
            )}

            {/* Minimal Editorial Care Note */}
            <div className="mt-10 pt-6 border-t border-[var(--line)] flex flex-col space-y-3 text-[12px] text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--ink)]">✓</span>
                <span>Small-batch artisanal production</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ink)]">✓</span>
                <span>Plastic-free, unbleached paper packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ink)]">✓</span>
                <span>Dispatched within 48 hours via carbon-neutral courier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restock Notification Modal */}
      <OrderModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        mode="restock"
        restockProduct={{ id: product.id, name: product.name }}
        initialNotes={`Interested in: ${product.name} — please call when restocked`}
      />
    </div>
  );
}
