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

const INITIAL_ITEMS: CartItem[] = [
  {
    id: "item-1",
    name: "Linen overshirt",
    category: "clothing",
    price: 2800,
    specs: "Natural oat, size M",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmX3KormHYbutSbXybG6ONE4M0iDUCls7UUyBzSuvWORWzah0BAMbQCGvJykJP44EeFz_hB_blSuH-UfA0tyyVbZ2rnuSQMKaIrNP4n0pun4dxGkgEhdn-Z2Yxv2FxK1XUzKTkTSjF9_2TeRbtmtWYKNm8JItLx4jxwTL3ORa0x694jbxIfAlkPThQak95Jfq2o5Ew3WQ2ymafraYu9ocmybedPpOPNvumcyGjkdxpNm91AfK8-1xn",
    quantity: 1,
  },
  {
    id: "item-2",
    name: "Beeswax candle",
    category: "home",
    price: 650,
    specs: "Standard 220g",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAy0BGMO2GfrAJc0OKBbwyAFZUjYEjwAwwfCvcNUY_teM2kEbtW8Y-_LkqKodBGr3A63lPjOe0DWDi_jeVj3ecO4WFXjkLsPV-S0_tTXkn96EK6QIm5-NA8mcicnZxCakHXJFuBeJkivrjgKhkND6ekKbZShf4hf6lxpNKkLYYv7BtqlNAvZPzlbnQ_eoi-XqVriZIEtwSLA4RWE4LLxH5GWxsUZRc-_q4D8kDlpD6fvu_QTVlyxkRq",
    quantity: 2,
  },
  {
    id: "item-3",
    name: "Brass bookmark",
    category: "accessories",
    price: 340,
    specs: "Brushed finish",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ9vWmVd0GKwdyRfzcuZgsbAGLkrUa8D8vCzozioMHD1vZJYNP5zgqZFAjnSFRju_XYK5M0O3e4WUekiRfPnsSmZL1CGwamsrV_NCAvZPZZV23qKmFYZh6PUTccUSlBi22I2LMbp3HDdL9sbt5ppvXu2PfmzUP4sntSD0pU0KI9pr-ZooIeivciThtFHvjlDs0yQIX06cQqlDgnVifZUwkULk4ocmFQZFP7TspxkCFf9PgB5SnUn_8",
    quantity: 1,
  },
];

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: INITIAL_ITEMS,
      total: computeTotal(INITIAL_ITEMS),
      itemCount: computeItemCount(INITIAL_ITEMS),

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
