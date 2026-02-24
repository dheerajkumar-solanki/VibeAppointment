"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function UserMenu({ user }: { user: { email?: string; user_metadata?: Record<string, any> } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Fix hydration mismatch by using useEffect
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("User");
  const [initial, setInitial] = useState("U");

  useEffect(() => {
    setMounted(true);
    setFullName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
    setInitial((user.user_metadata?.full_name || user.email?.split("@")[0] || "User").charAt(0).toUpperCase());
  }, [user]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.auth.signOut();
      // Force full page navigation to ensure UI updates
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/";
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-200"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white">
          {initial}
        </span>
        <span className="max-w-[100px] truncate">{fullName}</span>
      </button>
      
      {open && (
        <div className="absolute right-0 mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all">
          <a
            href="/dashboard"
            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand-600"
          >
            Dashboard
          </a>
          <div className="my-1 h-px w-full bg-slate-100"></div>
          <button
            onClick={handleSignOut}
            className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
