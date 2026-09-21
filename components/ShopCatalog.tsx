"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/supabase";
import FilterBar, { type Category, type SortOption } from "./FilterBar";
import ProductGrid from "./ProductGrid";

interface ShopCatalogProps {
  products: Product[];
}

export default function ShopCatalog({ products }: ShopCatalogProps) {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as Category) || "all";
  const initialSort = (searchParams.get("sort") as SortOption) || "default";

  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory);
  const [activeSort, setActiveSort] = useState<SortOption>(initialSort);

  // Sync state if user navigates via browser back/forward
  useEffect(() => {
    const cat = (searchParams.get("category") as Category) || "all";
    const s = (searchParams.get("sort") as SortOption) || "default";
    setActiveCategory(cat);
    setActiveSort(s);
  }, [searchParams]);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    // Shallow URL update without triggering Next.js server component re-renders
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (category === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", category);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setActiveSort(sort);
    // Shallow URL update without triggering Next.js server component re-renders
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (sort === "default") {
        url.searchParams.delete("sort");
      } else {
        url.searchParams.set("sort", sort);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <>
      <FilterBar
        activeCategory={activeCategory}
        activeSort={activeSort}
        onSelectCategory={handleCategoryChange}
        onSelectSort={handleSortChange}
      />
      <ProductGrid
        products={products}
        activeCategory={activeCategory}
        activeSort={activeSort}
      />
    </>
  );
}
