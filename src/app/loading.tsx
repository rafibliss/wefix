import { Loader2, Wrench } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center justify-center text-white">
          <Wrench className="h-8 w-8 text-zinc-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1">
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        </div>
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-white">Loading WeFix...</h2>
        <p className="text-xs text-zinc-500">Preparing repair data and interface</p>
      </div>
    </div>
  );
}
