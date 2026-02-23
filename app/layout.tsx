import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeAppointment - Book Trusted Doctors",
  description:
    "Book trusted doctors, manage appointments, and share real patient feedback with VibeAppointment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-brand-100 px-2 py-1 text-sm font-semibold text-brand-600">
                  VibeAppointment
                </span>
              </div>
              <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
                <a href="/" className="hover:text-brand-600">
                  Home
                </a>
                <a href="/doctors" className="hover:text-brand-600">
                  Doctors
                </a>
                <a href="/login" className="rounded-md bg-brand-500 px-3 py-1.5 text-white hover:bg-brand-600">
                  Sign in
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
          </main>
          <footer className="border-t bg-white">
            <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500">
              © {new Date().getFullYear()} VibeAppointment. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

