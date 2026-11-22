"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  XCircle,
  CalendarCheck,
  Search,
  ShieldAlert,
  Loader2
} from "lucide-react";

function CancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full rounded-2xl bg-[#111113] border border-[#27272A] p-6 sm:p-8 space-y-6 text-center shadow-2xl animate-fade-in">
        {/* Warning Icon */}
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
          <XCircle className="h-8 w-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Payment Cancelled</h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            You exited the checkout session before completing the transaction. No charges were made to your account.
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-[#27272A] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Your booking is safe</span>
          </div>
          <p className="text-zinc-400 leading-normal">
            Your completed repair request is still saved in your account. You can complete the payment at any time from your Customer Dashboard.
          </p>
          {bookingId && (
            <p className="text-[11px] font-mono text-zinc-500 pt-1">
              Booking Ref: #{bookingId.slice(-8)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href="/dashboard/customer/bookings"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Return to My Bookings</span>
          </Link>
          <Link
            href="/services"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 border border-[#27272A] transition-colors"
          >
            <Search className="h-4 w-4 text-zinc-400" />
            <span>Browse Other Services</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
