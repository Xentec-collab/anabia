"use client";

import { useState } from "react";
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
  const [resolvingImage, setResolvingImage] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const resolveImg = async (urlToResolve: string) => {
    try {
      setResolvingImage(true);
      toast.loading("Converting ImgBB link to direct image...", { id: "resolve-img" });
      const res = await fetch(`/api/admin/resolve-image?url=${encodeURIComponent(urlToResolve)}`);
      const data = await res.json();
      if (data.directUrl && data.directUrl !== urlToResolve) {
        setFormData((prev) => ({ ...prev, image_url: data.directUrl }));
        setImagePreviewError(false);
        toast.success("Converted to direct image file!", { id: "resolve-img" });
      } else {
        toast.dismiss("resolve-img");
      }
    } catch {
      toast.dismiss("resolve-img");
    } finally {
      setResolvingImage(false);
    }
  };

  const handleImageUrlChange = (val: string) => {
    let cleanVal = val.trim();

    // If user pasted embed code like <img src="https://i.ibb.co/..." /> or [img]https://i.ibb.co/...[/img]
    const embedMatch = cleanVal.match(/https?:\/\/i\.ibb\.co\/[^\s"'<>\)\]]+/i);
    if (embedMatch) {
      cleanVal = embedMatch[0];
      toast.success("Direct image link extracted!", { id: "resolve-img" });
    }

    setFormData((prev) => ({ ...prev, image_url: cleanVal }));
    setImagePreviewError(false);

    // If it's an ibb.co viewer link (e.g. https://ibb.co/fGTVjCN8), auto-resolve immediately
    const ibbMatch = cleanVal.match(/https?:\/\/ibb\.co\/([a-zA-Z0-9_-]+)/i);
    if (ibbMatch && !cleanVal.includes("i.ibb.co")) {
      resolveImg(ibbMatch[0]);
    }
  };

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

    let finalImageUrl = formData.image_url.trim();

    // Extract i.ibb.co if embedded
    const embedMatch = finalImageUrl.match(/https?:\/\/i\.ibb\.co\/[^\s"'<>\)\]]+/i);
    if (embedMatch) {
      finalImageUrl = embedMatch[0];
    }

    // Auto-resolve if still ibb.co viewer link
    if (finalImageUrl.match(/https?:\/\/ibb\.co\/([a-zA-Z0-9_-]+)/i) && !finalImageUrl.includes("i.ibb.co")) {
      try {
        setResolvingImage(true);
        const res = await fetch(`/api/admin/resolve-image?url=${encodeURIComponent(finalImageUrl)}`);
        const data = await res.json();
        if (data.directUrl) {
          finalImageUrl = data.directUrl;
        }
      } catch {
        // Fallback: backend route also runs resolveDirectImageUrl
      } finally {
        setResolvingImage(false);
      }
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
              If 0, card displays "Out of stock" and customers can request restock alerts.
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1.5 font-medium">
              Image URL
            </label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="Paste any ImgBB link, embed code, or image URL"
              className="w-full h-11 px-3.5 bg-white border border-[#E5E4E0] text-[13px] text-[#1A1A1A] placeholder:text-[#B0AEA8] focus:outline-none focus:border-[#1A1A1A] rounded-none transition-colors font-mono"
            />

            {resolvingImage && (
              <p className="mt-2 text-[12px] text-amber-700 flex items-center gap-1.5 animate-pulse">
                <span>🔄</span>
                <span>Auto-converting ImgBB link into direct image file...</span>
              </p>
            )}

            <div className="mt-2.5 p-3.5 bg-[#F9F8F6] border border-[#E5E4E0] text-[12px] text-[#66645E] space-y-2 leading-relaxed">
              <p className="font-semibold text-[#1A1A1A]">
                📸 Adding photos from ImgBB (Free, No account needed):
              </p>
              <ul className="space-y-1.5 text-[#4A4843]">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">✓ Option 1 (Easiest):</span>
                  <span>Paste the default <code>https://ibb.co/...</code> link — Anabia automatically converts it into the real photo file!</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">✓ Option 2:</span>
                  <span>Right-click your uploaded photo on ImgBB and click <strong>"Copy image address"</strong> (or "Copy image link"), then paste here.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">✓ Option 3:</span>
                  <span>From the ImgBB dropdown, select <strong>"HTML full linked"</strong> and paste the whole code — we extract the image link automatically!</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link
                  href="/admin/help"
                  className="text-[#1A1A1A] underline underline-offset-2 font-medium"
                >
                  View Step-by-Step Upload Guide →
                </Link>
              </div>
            </div>

            {/* Optional Image Preview */}
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
                <div className="text-[11px] text-[#8A8780] truncate max-w-xs sm:max-w-md">
                  {resolvingImage ? "Converting link..." : "Preview loaded"}
                </div>
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
              disabled={saving}
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
