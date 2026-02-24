import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";
import { CalendarHeart } from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VibeAppointment - Book Trusted Doctors",
  description:
    "Book trusted doctors, manage appointments, and share real patient feedback with VibeAppointment.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isDoctor = false;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isDoctor = profile?.role === "doctor";
  }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased`}>
        <Toaster position="bottom-right" richColors />
        {/* Sticky Glassmorphism Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 shadow-sm">
                <CalendarHeart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Vibe<span className="text-brand-600">Appointment</span>
              </span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/" className="transition-colors hover:text-brand-600">
                Home
              </Link>
              {!isDoctor && (
                <Link href="/doctors" className="transition-colors hover:text-brand-600">
                  Find Doctors
                </Link>
              )}
              {user ? (
                <UserMenu user={user} />
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Modernized Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <CalendarHeart className="h-5 w-5 text-brand-500" />
              <span className="text-lg font-bold tracking-tight text-slate-900">
                VibeAppointment
              </span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} VibeAppointment. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm font-medium text-slate-500">
              <Link href="#" className="hover:text-slate-900">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-900">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
