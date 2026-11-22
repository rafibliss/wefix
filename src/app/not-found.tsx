import Link from "next/link";
import { Wrench, Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-2xl bg-[#111113] border border-[#27272A] p-8 text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-[#27272A] flex items-center justify-center mx-auto text-zinc-400">
          <Wrench className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-white">Page Not Found</h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            The page or service you are searching for does not exist, has been relocated, or is no longer available.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/services"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 border border-[#27272A] transition-colors"
          >
            <Search className="h-4 w-4 text-zinc-400" />
            <span>Browse All Services</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
