"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  DollarSign,
  Receipt,
  Loader2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface PaymentItem {
  _id: string;
  bookingId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  serviceTitle: string;
  serviceCategory?: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  paidAt: string;
  createdAt: string;
}

export default function CustomerPaymentsPage() {
  const { data: session } = useSession();

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPayments() {
      setLoading(true);
      setError("");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`;
        }

        const res = await fetch(`${apiUrl}/api/payments/my`, {
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load payment history");
        }

        const data = await res.json();
        if (!ignore) {
          setPayments(data.payments || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Error fetching payments");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (session?.user) {
      loadPayments();
    }

    return () => {
      ignore = true;
    };
  }, [session]);

  const totalSpent = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Payment History</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Review your receipts, completed transactions, and payment methods processed via Stripe.
          </p>
        </div>
        <Link
          href="/dashboard/customer/bookings"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 border border-[#27272A] transition-colors shrink-0"
        >
          <Receipt className="h-4 w-4 text-zinc-400" />
          <span>My Repair Requests</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Paid Out</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "-" : `$${totalSpent.toFixed(2)}`}
            </h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Completed Transactions</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "-" : payments.length}
            </h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Security</p>
            <h3 className="text-sm font-bold text-white mt-1">Stripe Certified</h3>
            <p className="text-[11px] text-zinc-500">256-bit SSL encrypted</p>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl bg-[#111113] border border-[#27272A] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">All Transactions</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Itemized transaction log of all paid repair services</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
            <p className="text-sm">Loading your payments...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-14 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-[#27272A] flex items-center justify-center mx-auto text-zinc-500">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">No payment records yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Payments are made only after a technician completes a repair job to your satisfaction.
              </p>
            </div>
            <Link
              href="/dashboard/customer/bookings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              <span>View Repair Requests</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
                <tr>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Technician</th>
                  <th className="pb-3 font-semibold">Amount Paid</th>
                  <th className="pb-3 font-semibold">Transaction ID</th>
                  <th className="pb-3 font-semibold">Date Paid</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/60">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4">
                      <div className="font-semibold text-white">{p.serviceTitle}</div>
                      {p.serviceCategory && (
                        <span className="text-xs text-zinc-500">{p.serviceCategory}</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="text-zinc-200 font-medium">{p.technicianName}</div>
                      <span className="text-xs text-zinc-500">{p.technicianEmail}</span>
                    </td>
                    <td className="py-4 font-bold text-emerald-400">
                      ${Number(p.amount).toFixed(2)}{" "}
                      <span className="text-[10px] text-zinc-500 uppercase">{p.currency || "USD"}</span>
                    </td>
                    <td className="py-4 font-mono text-xs text-zinc-400">
                      <span className="bg-zinc-900 px-2 py-1 rounded border border-[#27272A]">
                        {p.stripePaymentIntentId || p.stripeSessionId.slice(-12)}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-zinc-300">
                      {new Date(p.paidAt || p.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Paid</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
