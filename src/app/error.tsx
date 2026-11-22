"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-2xl bg-[#111113] border border-rose-500/20 p-8 text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
            Something Went Wrong
          </span>
          <h1 className="text-2xl font-extrabold text-white">Application Encountered an Error</h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            {error?.message || "An unexpected error occurred while processing your request. Please try again or return to the home page."}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 border border-[#27272A] transition-colors"
          >
            <Home className="h-4 w-4 text-zinc-400" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
