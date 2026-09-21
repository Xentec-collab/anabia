import { createClient } from "@supabase/supabase-js";

export interface DatabaseProduct {
  id: string;
  name: string;
  price: number; // Stored in paise, e.g. 280000 = ₹2,800.00
  category: "clothing" | "accessories" | "home" | "care";
  image_url: string | null;
  stock: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: string | number; // Formatted string, e.g. "₹2,800", or numeric rupees
  price_in_paise?: number;
  category: "clothing" | "accessories" | "home" | "care";
  image_url: string;
  stock?: number;
  specs?: string;
  description?: string;
  created_at?: string;
}

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number; // Value in INR rupees for cart computations
  formatted_price?: string;
  specs?: string;
  image_url: string;
  quantity: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Browser client singleton
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase server client for Server Components, Route Handlers, and Server Actions
 * Disables session persistence to ensure request isolation
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
  // Use SUPABASE_SERVICE_ROLE_KEY on the server to safely bypass RLS; falls back to anon key
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    supabaseAnonKey;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
