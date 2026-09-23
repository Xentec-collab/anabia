"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Incorrect password");
        return;
      }

      toast.success("Welcome back");
      // Hard reload ensures server layout re-evaluates session cookie cleanly
      window.location.href = "/admin";
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-[#E5E4E0] p-8 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="font-serif text-[26px] text-[#1A1A1A]">Anabia</h1>
        <p className="text-[12px] uppercase tracking-widest text-[#8A8780] mt-1">
          Store Management
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="admin-password"
            className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-2 font-medium"
          >
            Admin Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter password..."
            className="w-full h-11 px-3.5 bg-white border border-[#E5E4E0] text-[14px] text-[#1A1A1A] placeholder:text-[#B0AEA8] focus:outline-none focus:border-[#1A1A1A] rounded-none transition-colors"
          />
          {error && (
            <p className="text-[12px] text-[#C0392B] mt-2 font-medium">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#1A1A1A] text-white text-[13px] font-medium tracking-wide uppercase hover:bg-black active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 select-none rounded-none"
        >
          {loading ? "Verifying..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
