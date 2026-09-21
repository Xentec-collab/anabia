"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/lib/supabase";
import type { Category, SortOption } from "./FilterBar";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  activeCategory?: Category;
  activeSort?: SortOption;
  pageSize?: number;
}

function parsePrice(price: string | number): number {
  if (typeof price === "number") return price;
  return parseInt(price.replace(/[^\d]/g, ""), 10) || 0;
}

export default function ProductGrid({
  products,
  activeCategory = "all",
  activeSort = "default",
  pageSize = 6,
}: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [prevFilter, setPrevFilter] = useState(`${activeCategory}-${activeSort}`);

  const currentFilter = `${activeCategory}-${activeSort}`;

  // Reset pagination cleanly when category or sort changes
  if (prevFilter !== currentFilter) {
    setPrevFilter(currentFilter);
    setVisibleCount(pageSize);
  }

  const processedProducts = useMemo(() => {
    // 1. Filter by category
    const filtered =
      activeCategory === "all"
        ? products
        : products.filter(
            (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
          );

    // 2. Sort
    const sorted = [...filtered];
    switch (activeSort) {
      case "price-asc":
        sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case "newest":
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "name-az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return sorted;
  }, [products, activeCategory, activeSort]);

  if (processedProducts.length === 0) {
    return (
      <div className="py-20 text-center text-[var(--muted)] text-[14px]">
        No products found in this collection.
      </div>
    );
  }

  const visibleProducts = processedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < processedProducts.length;

  return (
    <section className="max-w-6xl w-full mx-auto px-6 pb-24">
      {/* Product count */}
      <div className="mb-6 text-[12px] text-[var(--muted)]">
        Showing {visibleProducts.length} of {processedProducts.length} products
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            category={product.category}
            image_url={product.image_url}
            specs={product.specs}
            description={product.description}
            stock={product.stock}
            index={index}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + pageSize)}
            className="px-8 py-3 bg-[var(--ghost)] text-[var(--ink)] text-[13px] rounded-none hover:bg-[var(--line)] transition-colors duration-150 cursor-pointer select-none"
          >
            Load more
          </button>
        </div>
      )}
    </section>
  );
}
