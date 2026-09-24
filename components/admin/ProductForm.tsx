"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

interface ProductFormData {
  name: string;
  price: number | string; // in rupees for UI
  category: "clothing" | "accessories" | "home" | "care";
  stock: number | string;
  description: string;
  image_url: string;
}

interface ProductFormProps {
  mode: "new" | "edit";
  productId?: string;
  initialData?: {
    name?: string;
    price?: number; // can be in paise or rupees
    category?: string;
    stock?: number;
    description?: string;
    image_url?: string | null;
  };
}

export default function ProductForm({
  mode,
  productId,
  initialData,
}: ProductFormProps) {
  const router = useRouter();

  // If editing and price was in paise (e.g. >= 1000 and integer), convert to rupees for display
  const initialRupees = initialData?.price !== undefined
    ? (initialData.price > 500 && initialData.price % 100 === 0
        ? Math.round(initialData.price / 100)
        : initialData.price)
    : "";

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    price: initialRupees,
    category: (initialData?.category as any) || "clothing",
    stock: initialData?.stock !== undefined ? initialData.stock : 10,
    description: initialData?.description || "",
    image_url: initialData?.image_url || "",
  });

  const [saving, setSaving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Image Upload ───────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    // Client-side validation
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, AVIF, and GIF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 10 MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    const toastId = "upload-img";
    toast.loading("Uploading image...", { id: toastId });

    try {
      const body = new FormData();
      body.append("file", file);

      // Simulate progress while waiting for fetch
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 8, 85));
      }, 300);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      clearInterval(progressInterval);
      setUploadProgress(90);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setUploadProgress(100);

      setFormData((prev) => ({ ...prev, image_url: data.url }));
      setImagePreviewError(false);

      toast.success("Image uploaded!", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  // ─── Manual URL paste (backward compatible) ─────────────
  const handleImageUrlChange = (val: string) => {
    setFormData((prev) => ({ ...prev, image_url: val.trim() }));
    setImagePreviewError(false);
  };

  // ─── Form Submit ────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    // Validation
    if (!formData.name.trim()) {
      setInlineError("Product Name is required.");
      return;
    }

    const numPrice = Number(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setInlineError("Please enter a valid price in ₹ greater than 0.");
      return;
    }

    const numStock = parseInt(String(formData.stock), 10);
    if (isNaN(numStock) || numStock < 0) {
      setInlineError("Stock must be 0 or a positive integer.");
      return;
    }

    setSaving(true);

    try {
      const url =
        mode === "new"
          ? "/api/admin/products"
          : `/api/admin/products/${productId}`;

      const method = mode === "new" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: numPrice, // backend converts rupees to paise
          category: formData.category,
          stock: numStock,
          description: formData.description.trim(),
          image_url: formData.image_url.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      toast.success(mode === "new" ? "Product added" : "Product updated");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving product";
      setInlineError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-[13px] text-[#8A8780] hover:text-[#1A1A1A] transition-colors"
        >
          ← Back to products
        </Link>
      </div>

      <div className="bg-white border border-[#E5E4E0] p-8 shadow-sm">
        <h1 className="font-serif text-[26px] text-[#1A1A1A] mb-1">
          {mode === "new" ? "Add New Product" : "Edit Product"}
        </h1>
        <p className="text-[13px] text-[#8A8780] mb-8">
          {mode === "new"
            ? "Enter the product details below to publish it to your store."
            : "Update pricing, inventory, or image details."}
        </p>

        {inlineError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
            {inlineError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1.5 font-medium">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Linen overshirt"
              className="w-full h-11 px-3.5 bg-white border border-[#E5E4E0] text-[13px] text-[#1A1A1A] placeholder:text-[#B0AEA8] focus:outline-none focus:border-[#1A1A1A] rounded-none transition-colors"
            />
          </div>

          {/* Price & Category in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1.5 font-medium">
                Price in ₹ *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#8A8780]">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="2800"
                  className="w-full h-11 pl-8 pr-3.5 bg-white border border-[#E5E4E0] text-[13px] text-[#1A1A1A] placeholder:text-[#B0AEA8] focus:outline-none focus:border-[#1A1A1A] rounded-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#8A8780] mt-1">
                Enter rupees (e.g. 2800). Stored automatically as paise.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1.5 font-medium">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full h-11 px-3.5 bg-white border border-[#E5E4E0] text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] rounded-none transition-colors cursor-pointer"
              >
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="home">Home</option>
                <option value="care">Care</option>
              </select>
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1.5 font-medium">
              {mode === "edit"
                ? "Stock Available (set to 0 if out of stock) *"
                : "Stock Quantity *"}
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              placeholder="10"
              className="w-full h-11 px-3.5 bg-white border border-[#E5E4E0] text-[13px] text-[#1A1A1A] placeholder:text-[#B0AEA8] focus:outline-none focus:border-[#1A1A1A] rounded-none transition-colors sm:w-48"
            />
            <p className="text-[11px] text-[#8A8780] mt-1">
              If 0, card displays &quot;Out of stock&quot; and customers can request restock alerts.
            </p>
          </div>

          {/* ─── Product Image ─────────────────────────────── */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1.5 font-medium">
              Product Image
            </label>

            {/* Upload Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed transition-colors p-6 text-center cursor-pointer ${
                dragOver
                  ? "border-[#1A1A1A] bg-[#F9F8F6]"
                  : "border-[#D5D4D0] bg-white hover:border-[#8A8780]"
              } ${uploading ? "pointer-events-none opacity-70" : ""}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploading ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <svg className="w-8 h-8 text-[#8A8780] animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-[#8A8780]">
                    Uploading... {uploadProgress}%
                  </p>
                  <div className="w-48 mx-auto h-1.5 bg-[#E5E4E0] overflow-hidden">
                    <div
                      className="h-full bg-[#1A1A1A] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Upload Icon */}
                  <div className="flex justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A8780" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-[#1A1A1A] font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-[11px] text-[#8A8780]">
                    JPEG, PNG, WebP, AVIF or GIF · Max 10 MB
                  </p>
                </div>
              )}
            </div>

            {/* Upload progress bar */}
            {uploading && uploadProgress > 0 && (
              <div className="mt-1" />
            )}

            {/* OR divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[1px] bg-[#E5E4E0]" />
              <span className="text-[11px] text-[#8A8780] uppercase tracking-wider font-medium">
                or paste URL
              </span>
              <div className="flex-1 h-[1px] bg-[#E5E4E0]" />
            </div>

            {/* Manual URL input */}
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://res.cloudinary.com/... or any image URL"
              className="w-full h-11 px-3.5 bg-white border border-[#E5E4E0] text-[13px] text-[#1A1A1A] placeholder:text-[#B0AEA8] focus:outline-none focus:border-[#1A1A1A] rounded-none transition-colors font-mono"
            />

            {/* Image Preview */}
            {formData.image_url && !imagePreviewError && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-[#F9F8F6] border border-[#E5E4E0]">
                <div
                  className="w-12 h-14 relative bg-[#F2F1EF] overflow-hidden border border-[#E5E4E0]"
                  style={{ position: "relative", width: 48, height: 56, overflow: "hidden" }}
                >
                  <Image
                    src={formData.image_url}
                    alt="Preview"
                    width={48}
                    height={56}
                    className="w-full h-full object-cover"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    unoptimized
                    onError={() => setImagePreviewError(true)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-emerald-700 font-medium">
                    ✓ Preview loaded
                  </p>
                  <p className="text-[10px] text-[#8A8780] truncate mt-0.5">
                    {formData.image_url}
                  </p>
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, image_url: "" }));
                    setImagePreviewError(false);
                  }}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[#8A8780] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove image"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* Image preview error */}
            {formData.image_url && imagePreviewError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-[12px] text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>Could not load preview. The URL may be invalid or inaccessible.</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1.5 font-medium">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe materials, texture, craftsmanship..."
              className="w-full p-3.5 bg-white border border-[#E5E4E0] text-[13px] text-[#1A1A1A] placeholder:text-[#B0AEA8] focus:outline-none focus:border-[#1A1A1A] rounded-none transition-colors resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#E5E4E0] flex items-center justify-between">
            <Link
              href="/admin"
              className="text-[13px] text-[#8A8780] hover:text-[#1A1A1A] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="h-11 px-6 bg-[#1A1A1A] text-white text-[13px] font-medium uppercase tracking-wider hover:bg-black active:scale-[0.98] transition-all rounded-none cursor-pointer disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : mode === "new"
                ? "Add Product"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
