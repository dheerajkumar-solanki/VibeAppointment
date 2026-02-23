"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Shield, HeartPulse } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setOtpSent(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
      } else {
        // Create profile if it doesn't exist (for OTP login)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: profileError } = await supabase
            .from("user_profiles")
            .upsert({
              id: user.id,
              email: user.email,
              full_name: user.email?.split('@')[0] || 'User',
              role: "patient",
            }, { onConflict: "id", ignoreDuplicates: true });
        }
        // Force a full page navigation to ensure redirect works
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-12 relative">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[600px] opacity-30 pointer-events-none">
        <div className="absolute top-0 right-10 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-brand-500/10 mb-6 border border-slate-100">
            <HeartPulse className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-3 text-slate-500">Sign in to book appointments and manage your healthcare journey.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle gradient line at top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-purple-500"></div>
          
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium text-slate-900"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
              
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/10 disabled:opacity-70 transition-all shadow-lg shadow-slate-900/20"
              >
                {isLoading ? "Sending Code..." : "Continue with Email"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-2 text-center">
                  Enter 6-digit verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-slate-50 px-4 py-4 text-center text-4xl tracking-[0.3em] font-bold rounded-xl border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="mt-3 text-sm text-slate-500 text-center">We sent a code to <span className="font-medium text-slate-900">{email}</span></p>
              </div>
              
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
              
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-4 text-sm font-bold text-white hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-70 transition-all shadow-lg shadow-brand-500/30"
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => { setOtpSent(false); setError(""); setOtp(""); }}
                className="w-full text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors"
              >
                Use a different email address
              </button>
            </form>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm font-medium">
              <span className="bg-white px-4 text-slate-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const supabase = createBrowserClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
                if (error) {
                  setError(error.message);
                }
              } catch (err) {
                setError("Failed to connect with Google");
              }
            }}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all focus:ring-4 focus:ring-slate-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <Shield className="h-4 w-4 text-emerald-500" />
          <span>Secure, encrypted authentication</span>
        </div>
      </div>
    </div>
  );
}
