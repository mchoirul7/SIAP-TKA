import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { signOutAdminAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await isAdmin();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-14 items-center justify-between">
          <Link href="/admin" className="text-[15px] font-black text-ink-900">
            Siap TKA · Admin Murid
          </Link>
          {signedIn ? (
            <form action={signOutAdminAction}>
              <button type="submit" className="text-[13px] font-bold text-slate-500 hover:text-rose-700">
                Keluar
              </button>
            </form>
          ) : null}
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
