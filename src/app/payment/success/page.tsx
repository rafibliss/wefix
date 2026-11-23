"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  CalendarCheck,
  ShieldCheck,
  Home
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface PaymentDetails {
  serviceTitle?: string;
  technicianName?: string;
  amount?: number;
  currency?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  paidAt?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: session } = useSession();

  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    let ignore = false;

    async function verifyStripePayment() {
      if (!sessionId) {
        setError("Missing payment session ID in URL parameters.");
        setVerifying(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;
        console.log("season token", sessionToken);
        const headers: Record<string, string> = {};
        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`;
        }

        const res = await fetch(`${apiUrl}/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`, {
          headers,
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to verify transaction with payment gateway");
        }

        if (!ignore) {
          setPayment(data.payment || {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Payment verification failed");
        }
      } finally {
        if (!ignore) {
          setVerifying(false);
        }
      }
    }

    verifyStripePayment();

    return () => {
      ignore = true;
    };
  }, [sessionId, session]);

  if (verifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-[#27272A] flex items-center justify-center text-emerald-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Verifying Your Payment</h2>
          <p className="text-xs text-zinc-400 max-w-sm">
            Communicating with Stripe to confirm your transaction details and update your repair status...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-[#111113] border border-rose-500/20 p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Verification Notice</h2>
            <p className="text-xs text-zinc-400">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/dashboard/customer/bookings"
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-700 transition-colors"
            >
              My Bookings
            </Link>
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full rounded-2xl bg-[#111113] border border-[#27272A] p-6 sm:p-8 space-y-8 shadow-2xl animate-fade-in">
        {/* Success Icon & Heading */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Payment Successful!</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Thank you for using WeFix. Your payment has been received and verified securely via Stripe.
          </p>
        </div>

        {/* Receipt Snapshot Card */}
        <div className="rounded-xl bg-zinc-900/80 border border-[#27272A] p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <span className="text-zinc-400 font-medium">Service</span>
            <span className="text-white font-bold">{payment?.serviceTitle || "Repair Service"}</span>
          </div>

          {payment?.technicianName && (
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <span className="text-zinc-400 font-medium">Technician</span>
              <span className="text-zinc-200 font-medium">{payment.technicianName}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <span className="text-zinc-400 font-medium">Amount Paid</span>
            <span className="text-lg font-bold text-emerald-400">
              ${Number(payment?.amount || 0).toFixed(2)}{" "}
              <span className="text-xs text-zinc-500 uppercase">{payment?.currency || "USD"}</span>
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <span className="text-zinc-400 font-medium">Transaction Ref</span>
            <span className="font-mono text-zinc-300">
              {payment?.stripePaymentIntentId || payment?.stripeSessionId?.slice(-10) || "Recorded"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified & Settled</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href="/dashboard/customer/bookings"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Go to My Bookings</span>
          </Link>
          <Link
            href="/dashboard/customer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 border border-[#27272A] transition-colors"
          >
            <Home className="h-4 w-4 text-zinc-400" />
            <span>Customer Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
