"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Product } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";

export interface ProductCardProps {
  id?: string;
  name?: string;
  price?: string | number;
  category?: string;
  image_url?: string;
  specs?: string;
  description?: string;
  stock?: number;
  index?: number;
  product?: Product;
}

// 1x1 SVG with #F2F1EF solid color base64 encoded for instant blurDataURL
const SOLID_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGMkYxRUYiLz48L3N2Zz4=";

export default function ProductCard(props: ProductCardProps) {
  const id = props.id ?? props.product?.id ?? "";
  const name = props.name ?? props.product?.name ?? "";
  const price = props.price ?? props.product?.price ?? 0;
  const category = props.category ?? props.product?.category ?? "";
  const image_url = props.image_url ?? props.product?.image_url ?? "";
  const specs = props.specs ?? props.product?.specs;
  const stock = props.stock ?? props.product?.stock;
  const index = props.index ?? 0;

  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const numericPrice =
    typeof price === "number"
      ? price
      : parseInt(price.replace(/[^\d]/g, ""), 10) || 0;

  const formattedPrice =
    typeof price === "string"
      ? price
      : `₹${price.toLocaleString("en-IN")}`;

  const isOutOfStock = stock !== undefined && stock <= 0;
  // First product loads eagerly for LCP; rest load lazily to avoid bandwidth starvation
  const isPriority = index === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id,
        name,
        category,
        price: numericPrice,
        formatted_price: formattedPrice,
        specs,
        image_url,
      },
      1
    );
    setAdded(true);
    toast.success("Added to bag");
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <article
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
      className="relative p-2 bg-transparent border border-transparent transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[var(--ink)] rounded-none group animate-drift-up"
    >
      {/* 4:5 Aspect Frame */}
      <div className="aspect-[4/5] w-full bg-[#F2F1EF] overflow-hidden relative flex items-center justify-center rounded-none">
        <Link
          href={`/product/${id}`}
          prefetch={false}
          className="absolute inset-0 z-0 block cursor-pointer"
          aria-label={`View ${name}`}
        >
          {imageError || !image_url ? (
            <div className="w-full h-full bg-[#F2F1EF] flex items-center justify-center text-[var(--muted)] text-[12px] select-none">
              <span>Image unavailable</span>
            </div>
          ) : (
            <Image
              src={image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px"
              priority={isPriority}
              loading={isPriority ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={SOLID_BLUR_DATA_URL}
              onError={() => setImageError(true)}
              className="object-cover rounded-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            />
          )}
        </Link>

        {/* Low Stock Badge */}
        {stock !== undefined && stock > 0 && stock < 5 && (
          <span className="absolute top-3 left-3 z-10 pointer-events-none px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200">
            Only {stock} left
          </span>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <span className="absolute top-3 left-3 z-10 pointer-events-none px-2 py-0.5 bg-red-50 text-red-600 text-[11px] font-medium border border-red-200">
            Out of stock
          </span>
        )}

        {/* Hover "Add to cart" Button - tactile active response, visible on mobile */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`absolute bottom-3 left-3 right-3 z-10 py-2 text-center text-[13px] bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] opacity-95 md:opacity-0 md:group-hover:opacity-100 font-normal rounded-none hover:bg-[var(--surface)] hover:border-[var(--ink)] active:scale-[0.97] active:bg-[var(--ink)] active:text-[var(--surface)] transition-all duration-300 md:translate-y-2 md:group-hover:translate-y-0 cursor-pointer select-none shadow-xs ${
              added ? "animate-subtle-pulse border-[var(--ink)]" : ""
            }`}
          >
            {added ? "Added to bag" : "Add to cart"}
          </button>
        )}
      </div>

      {/* Product Details Link */}
      <Link
        href={`/product/${id}`}
        prefetch={false}
        className="pt-3 pb-1 flex flex-col gap-1 block cursor-pointer active:opacity-80 transition-opacity duration-100"
      >
        <h2 className="text-[14px] text-[var(--ink)] font-normal truncate group-hover:underline underline-offset-2">
          {name}
        </h2>
        <span className="text-[13px] text-[var(--muted)] font-normal">
          {formattedPrice}
        </span>
      </Link>
    </article>
  );
}
