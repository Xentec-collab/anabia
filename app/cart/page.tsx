"use client";

import Link from "next/link";
import { useCart } from "@/store/cartStore";
import CartRow from "@/components/CartRow";
import CartSummary from "@/components/CartSummary";

export default function CartPage() {
  const { items, itemCount, hasHydrated } = useCart();

  if (!hasHydrated) {
    return (
      <div className="w-full max-w-6xl mx-auto px-6 py-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-[var(--muted)] text-[14px]">Loading cart...</div>
      </div>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="w-full max-w-6xl mx-auto px-6 mt-12 mb-8 flex items-baseline justify-between border-b border-[var(--line)] pb-6">
        <div className="flex items-baseline gap-4">
          <h1 className="font-serif text-[28px] leading-[36px] font-normal text-[var(--ink)]">
            Your cart
          </h1>
          <span className="text-[11px] uppercase tracking-widest text-[var(--muted)]">
            ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
        </div>
        <span className="text-[13px] text-[var(--muted)] hidden sm:inline-block">
          Curated artisanal editions
        </span>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column (Items) */}
          <section aria-label="Cart items" className="lg:col-span-7 flex flex-col w-full">
            {isEmpty ? (
              /* Empty Cart Notice */
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <svg
                  className="w-8 h-8 text-[var(--muted)] mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                  />
                </svg>
                <p className="font-serif text-[22px] text-[var(--ink)] font-normal mb-2">
                  Your cart is empty.
                </p>
                <p className="text-[13px] text-[var(--muted)] mb-6">
                  Discover archival homewares, garments, and handcrafted objects.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-[var(--ink)] text-[var(--surface)] text-[13px] rounded-none hover:bg-[var(--accent)] transition-colors duration-150"
                >
                  Return to shop
                </Link>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--line)] border-t border-b border-[var(--line)]">
                {items.map((item) => (
                  <CartRow key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Archival Care Notes */}
            <div className="mt-8 pt-6 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-[var(--ink)] mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[var(--ink)]">
                    Plastic-free packaging
                  </span>
                  <p className="text-[12px] text-[var(--muted)] mt-0.5">
                    Shipped in recyclable unbleached paper boxes and vegetal water-based ink tape.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-[var(--ink)] mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[var(--ink)]">
                    Direct provenance
                  </span>
                  <p className="text-[12px] text-[var(--muted)] mt-0.5">
                    Small-batch production directly supporting regional master weavers and potters.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column (Summary Box) */}
          <div className="lg:col-span-5 w-full">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
