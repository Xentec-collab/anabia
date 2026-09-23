import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anabia Admin — Store Manager",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminSession(session);

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans antialiased">
      {isAuthenticated && <AdminHeader />}
      <main className={isAuthenticated ? "max-w-6xl mx-auto px-6 py-8" : ""}>
        {children}
      </main>
    </div>
  );
}
