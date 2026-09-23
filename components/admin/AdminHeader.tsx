"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const res = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/admin");
        router.refresh();
      } else {
        toast.error("Failed to log out");
      }
    } catch {
      toast.error("An error occurred during logout");
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { label: "Products", href: "/admin", exact: true },
    { label: "Orders", href: "/admin/orders", exact: false },
    { label: "Image Guide", href: "/admin/help", exact: false },
  ];

  return (
    <header className="border-b border-[#E5E4E0] bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/admin"
            className="text-[17px] font-medium tracking-tight text-[#1A1A1A] hover:opacity-80 transition-opacity"
          >
            Anabia <span className="text-[12px] font-normal uppercase tracking-widest text-[#8A8780] ml-1">Admin</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href || pathname?.startsWith("/admin/products")
                : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] px-3 py-1.5 transition-colors ${
                    isActive
                      ? "text-[#1A1A1A] font-medium bg-[#F2F1EF]"
                      : "text-[#8A8780] hover:text-[#1A1A1A]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: View Store & Logout */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="text-[13px] text-[#8A8780] hover:text-[#1A1A1A] transition-colors hidden md:inline-block"
          >
            View Live Store ↗
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-[13px] text-[#C0392B] hover:text-[#962D22] border border-[#E5E4E0] hover:border-[#C0392B] px-3.5 py-1.5 transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
