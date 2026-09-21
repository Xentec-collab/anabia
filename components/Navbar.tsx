"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartItemCount } from "@/store/cartStore";
import SearchOverlay from "./SearchOverlay";
import MobileNav from "./MobileNav";

export default function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartItemCount();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--line)]">
        <div className="h-14 max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Hamburger (mobile only) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[var(--ink)] hover:text-[var(--muted)] active:scale-90 transition-all duration-100 p-1 flex items-center justify-center cursor-pointer select-none"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              </svg>
            </button>

            {/* Wordmark Left */}
            <Link
              href="/"
              className="font-serif text-[22px] tracking-normal select-none text-[var(--ink)]"
            >
              Anabia
            </Link>
          </div>

          {/* Links Center */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-[13px] transition-colors pb-0.5 ${
                pathname === "/"
                  ? "text-[var(--ink)] border-b border-[var(--ink)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={`text-[13px] transition-colors pb-0.5 ${
                pathname === "/about"
                  ? "text-[var(--ink)] border-b border-[var(--ink)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              About
            </Link>
            <Link
              href="/journal"
              className={`text-[13px] transition-colors pb-0.5 ${
                pathname.startsWith("/journal")
                  ? "text-[var(--ink)] border-b border-[var(--ink)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Journal
            </Link>
          </nav>

          {/* Right: Search + Cart Badge (No avatar) */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Search catalog"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[var(--ink)] hover:text-[var(--muted)] active:scale-90 transition-all duration-100 p-1 flex items-center justify-center cursor-pointer select-none"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>

            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative text-[var(--ink)] hover:text-[var(--muted)] active:scale-90 transition-all duration-100 p-1 flex items-center justify-center select-none"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--ink)] text-[var(--surface)] text-[10px] leading-none flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
