"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function UserMenu({ user }: { user: { email?: string; user_metadata?: Record<string, any> } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const initial = fullName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
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
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          <a
            href="/dashboard"
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Dashboard
          </a>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
