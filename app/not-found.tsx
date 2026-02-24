import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200/50 sm:h-32 sm:w-32">
        <div className="absolute inset-0 -z-10 animate-pulse rounded-3xl bg-brand-500/10 blur-xl"></div>
        <SearchX className="h-10 w-10 text-slate-400 sm:h-14 sm:w-14" />
      </div>
      
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
        Page not found
      </h1>
      
      <p className="mx-auto mb-10 max-w-md text-lg text-slate-600">
        Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
      </p>
      
      <Link
        href="/"
        className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-slate-900 px-8 font-semibold text-white transition-all hover:scale-105 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>
    </div>
  );
}