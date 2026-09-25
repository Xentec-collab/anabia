"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { CartItem } from "@/lib/supabase";

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const computeTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const computeItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const INITIAL_ITEMS: CartItem[] = [];

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: INITIAL_ITEMS,
      total: 0,
      itemCount: 0,

      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === product.id);

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          updatedItems = currentItems.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [...currentItems, { ...product, quantity }];
        }

        set({
          items: updatedItems,
          total: computeTotal(updatedItems),
          itemCount: computeItemCount(updatedItems),
        });
      },

      removeItem: (id: string) => {
        const updatedItems = get().items.filter((item) => item.id !== id);
        set({
          items: updatedItems,
          total: computeTotal(updatedItems),
          itemCount: computeItemCount(updatedItems),
        });
      },

      updateQty: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );

        set({
          items: updatedItems,
          total: computeTotal(updatedItems),
          itemCount: computeItemCount(updatedItems),
        });
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      getTotal: () => {
        return get().total;
      },

      getItemCount: () => {
        return get().itemCount;
      },
    }),
    {
      name: "anabia-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Atomic selector hook for item count.
 * Prevents Navbar and other layout components from re-rendering
 * when prices, totals, or item details change.
 */
export function useCartItemCount(): number {
  const count = useCartStore((state) => state.itemCount);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated ? count : 0;
}

/**
 * Hydration-safe wrapper hook for full cart access (used on /cart page)
 */
export function useCart() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const itemCount = useCartStore((state) => state.itemCount);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQty = useCartStore((state) => state.updateQty);
  const clearCart = useCartStore((state) => state.clearCart);

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return {
    items: hasHydrated ? items : [],
    total: hasHydrated ? total : 0,
    itemCount: hasHydrated ? itemCount : 0,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    hasHydrated,
  };
}
