"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Assuming Product type is defined here
export interface Product {
  id: string;
  name: string;
  price: number | string;
  category: string;
  image_url: string;
  description?: string;
  created_at?: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleResultClick = (id: string) => {
    router.push(`/product/${id}`);
    onClose();
  };

  const formatPrice = (price: number | string) => {
    if (typeof price === "string") return price;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 top-14 z-40 bg-black/20 animate-modal-backdrop" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed top-14 left-0 right-0 z-40 bg-[var(--surface)] border-b border-[var(--line)] shadow-sm animate-search-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative flex items-center">
            <svg width="20" height="20" className="absolute left-0 w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent pl-8 pr-10 py-2 outline-none text-[15px] text-[var(--ink)] placeholder-[var(--muted)]"
              placeholder="Search the catalog..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              onClick={onClose}
              className="absolute right-0 p-1 -mr-1 text-[var(--muted)] hover:text-[var(--ink)] active:scale-95 transition-all"
              aria-label="Close search"
            >
              <svg width="20" height="20" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6 min-h-[100px] max-h-[60vh] overflow-y-auto">
            {!debouncedQuery.trim() ? (
              <p className="text-[13px] text-[var(--muted)] text-center py-8">
                Start typing to search the catalog...
              </p>
            ) : isLoading ? (
              <div className="flex justify-center items-center py-8">
                <svg width="20" height="20" className="animate-spin h-5 w-5 text-[var(--muted)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 cursor-pointer group hover:bg-[var(--ghost)] p-2 -mx-2 transition-colors"
                    onClick={() => handleResultClick(product.id)}
                  >
                    <div
                      className="relative w-[40px] h-[50px] flex-shrink-0 bg-[var(--ghost)] overflow-hidden"
                      style={{ position: "relative", width: 40, height: 50, overflow: "hidden" }}
                    >
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={40}
                          height={50}
                          unoptimized={Boolean(product.image_url?.includes("cloudinary.com") || product.image_url?.includes("ibb.co"))}
                          className="w-full h-full object-cover"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[10px] text-[var(--muted)]">No img</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <span className="text-[14px] text-[var(--ink)] group-hover:underline underline-offset-2">{product.name}</span>
                      <span className="text-[12px] text-[var(--muted)] uppercase tracking-wider">{product.category}</span>
                    </div>
                    <div className="text-[13px] text-[var(--ink)]">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--muted)] text-center py-8">
                No products found for &apos;{debouncedQuery}&apos;
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
