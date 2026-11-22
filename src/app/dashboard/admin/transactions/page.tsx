"use client";

import { useEffect, useState } from "react";
import { DollarSign, CreditCard, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface PaymentRecord {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentStatus: string;
  paidAt: string;
}

export default function AdminTransactionsPage() {
  const { data: session } = useSession();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadTransactions() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

        const res = await fetch(`${apiUrl}/api/admin/payments`, {
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setPayments(data.payments || []);
            setTotalRevenue(data.totalRevenue || 0);
          }
        }
      } catch (err) {
        console.error("Error loading admin transactions:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (session?.user) {
      loadTransactions();
    }
    return () => {
      ignore = true;
    };
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Financial Transactions & Revenue
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Review all completed Stripe payments, platform service revenue, and transaction IDs.
        </p>
      </div>

      {/* Prominent Total Revenue Banner Card */}
      <div className="p-8 rounded-2xl bg-[#111113] border border-[#27272A] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Total Platform Processed Volume
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              ${totalRevenue}
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase">USD via Stripe</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Across {payments.length} successful client settlement{payments.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="h-14 w-14 rounded-2xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
          <DollarSign className="h-7 w-7" />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Service</th>
                  <th className="py-3.5 px-4 font-semibold">Paid By (Customer)</th>
                  <th className="py-3.5 px-4 font-semibold">Technician</th>
                  <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#18181B]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-[200px] truncate">
                      {p.serviceTitle}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-200">{p.customerName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{p.customerEmail}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-200">{p.technicianName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{p.technicianEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px] truncate max-w-[150px]">
                      {p.transactionId}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400 text-sm">
                      +${p.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="h-8 w-8 text-zinc-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Transactions Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Payments will be recorded here immediately after customers pay for completed repair jobs via Stripe Checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
