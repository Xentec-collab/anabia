import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import StoreLayoutShell from "@/components/StoreLayoutShell";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anabia — Minimalist E-Commerce",
  description:
    "Considered things for considered people. Archival homewares, garments, and handcrafted objects.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F9F8F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body
        className="bg-[var(--bg)] text-[var(--ink)] antialiased selection:bg-[var(--line)]"
        style={{ backgroundColor: "#F9F8F6", color: "#1A1A1A" }}
      >
        <StoreLayoutShell>{children}</StoreLayoutShell>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 1400,
            style: {
              background: "#1A1A1A",
              color: "#FFFFFF",
              borderRadius: "0px",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans), sans-serif",
              padding: "10px 18px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
