"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface AdminProductRow {
  id: string;
  name: string;
  price: number; // in paise (e.g. 280000)
  category: string;
  image_url: string | null;
  stock: number;
  created_at?: string;
  description?: string;
}

function AdminProductThumbnail({ src, name }: { src: string | null; name: string }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);

    // If it's an ImgBB viewer link, auto-resolve to direct image
    if (src && src.includes("ibb.co") && !src.includes("i.ibb.co")) {
      fetch(`/api/admin/resolve-image?url=${encodeURIComponent(src)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.directUrl) {
            setCurrentSrc(data.directUrl);
          }
        })
        .catch(() => {});
    }
  }, [src]);

  if (!currentSrc || hasError) {
    return (
      <div
        className="w-12 h-14 bg-[#F2F1EF] border border-[#E5E4E0] flex flex-col items-center justify-center flex-shrink-0 text-center px-1"
        style={{ width: 48, height: 56 }}
      >
        <span className="text-[10px] text-[#8A8780] leading-tight select-none">
          {hasError ? "Broken" : "No img"}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-12 h-14 bg-[#F2F1EF] border border-[#E5E4E0] relative overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{ position: "relative", width: 48, height: 56, overflow: "hidden" }}
    >
      <Image
        src={currentSrc}
        alt={name}
        width={48}
        height={56}
        className="w-full h-full object-cover"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        unoptimized
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function AdminProductsTable({
  initialProducts,
}: {
  initialProducts: AdminProductRow[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductRow[]>(initialProducts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      toast.loading("Restoring starter products...", { id: "seed-products" });
      const res = await fetch("/api/admin/products/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to seed products");
      }
      toast.success(data.message || "12 starter products restored!", { id: "seed-products" });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error restoring products";
      toast.error(msg, { id: "seed-products" });
    } finally {
      setSeeding(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
      router.refresh();
    } catch (err: unknown) {
      console.error("Delete product error:", err);
      const msg = err instanceof Error ? err.message : "Error deleting product";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar: Heading, Search & Add New Product */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] text-[#1A1A1A] tracking-tight">
            Products Catalog
          </h1>
          <p className="text-[13px] text-[#8A8780] mt-0.5">
            Manage your store's inventory, pricing, and live catalog items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 px-3 border border-[#E5E4E0] text-[13px] text-[#1A1A1A] placeholder:text-[#8A8780] focus:outline-none focus:border-[#1A1A1A] rounded-none w-48 sm:w-60"
          />
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center h-10 px-4 bg-[#1A1A1A] text-white text-[13px] font-medium hover:bg-black active:scale-[0.98] transition-all whitespace-nowrap rounded-none cursor-pointer"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-[#E5E4E0] bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E4E0] bg-[#FBFBFA] text-[11px] uppercase tracking-wider text-[#8A8780]">
              <th className="py-3.5 px-4 font-medium w-16">Image</th>
              <th className="py-3.5 px-4 font-medium">Name</th>
              <th className="py-3.5 px-4 font-medium">Category</th>
              <th className="py-3.5 px-4 font-medium">Price</th>
              <th className="py-3.5 px-4 font-medium">Stock</th>
              <th className="py-3.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E4E0] text-[13px] text-[#1A1A1A]">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-[14px] text-[#8A8780]">
                        Your product catalog is empty.
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Link
                          href="/admin/products/new"
                          className="inline-flex items-center justify-center h-10 px-5 bg-[#1A1A1A] text-white text-[12px] font-medium uppercase tracking-wider hover:bg-black transition-colors"
                        >
                          + Add New Product
                        </Link>
                        <button
                          type="button"
                          onClick={handleSeed}
                          disabled={seeding}
                          className="inline-flex items-center justify-center h-10 px-5 border border-[#E5E4E0] bg-white text-[#1A1A1A] text-[12px] font-medium uppercase tracking-wider hover:border-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {seeding ? "Restoring..." : "Restore 12 Starter Products"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#8A8780] py-4">No products matching &quot;{searchTerm}&quot;.</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const priceRupees = Math.round(p.price / 100);
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock > 0 && p.stock < 5;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F9F8F6] transition-colors group"
                  >
                    {/* Image */}
                    <td className="py-3 px-4">
                      <AdminProductThumbnail src={p.image_url} name={p.name} />
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-medium">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="hover:underline underline-offset-2 text-[#1A1A1A]"
                      >
                        {p.name}
                      </Link>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 capitalize text-[#66645E]">
                      {p.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-medium">
                      ₹{priceRupees.toLocaleString("en-IN")}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                          OUT
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          {p.stock} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {p.stock}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#1A1A1A] hover:bg-[#F2F1EF] border border-[#E5E4E0] transition-colors rounded-none"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p.id, p.name)}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#C0392B] hover:bg-red-50 border border-[#E5E4E0] hover:border-[#C0392B] transition-colors rounded-none disabled:opacity-50 cursor-pointer"
                        >
                          {deletingId === p.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
