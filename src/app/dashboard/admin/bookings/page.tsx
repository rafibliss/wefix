"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Loader2, CreditCard } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface AdminBooking {
  _id: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  technicianName: string;
  technicianEmail: string;
  preferredDate: string;
  status: string;
  basePrice: number;
  finalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_TABS = ["All", "requested", "accepted", "in-progress", "completed", "rejected", "cancelled"];

export default function AdminBookingsPage() {
  const { data: session } = useSession();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    let ignore = false;
    async function loadBookings() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

        const qs = activeTab !== "All" ? `?status=${activeTab}` : "";
        const res = await fetch(`${apiUrl}/api/admin/bookings${qs}`, {
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore) setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error("Error loading admin bookings:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (session?.user) {
      loadBookings();
    }
    return () => {
      ignore = true;
    };
  }, [session, activeTab]);

  const statusColors: Record<string, string> = {
    requested: "bg-blue-950/40 text-blue-300 border-blue-800",
    accepted: "bg-indigo-950/40 text-indigo-300 border-indigo-800",
    "in-progress": "bg-amber-950/40 text-amber-300 border-amber-800",
    completed: "bg-emerald-950/40 text-emerald-300 border-emerald-800",
    rejected: "bg-rose-950/40 text-rose-300 border-rose-800",
    cancelled: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          All Platform Bookings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Complete read-only monitor of every active, ongoing, completed, and cancelled repair job across WeFix.
        </p>
      </div>


      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#111113] border border-[#27272A]">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${activeTab === tab
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-[#18181B]"
              }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>


      <div className="bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Service</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Technician</th>
                  <th className="py-3.5 px-4 font-semibold">Target Date</th>
                  <th className="py-3.5 px-4 font-semibold">Job Status</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-[#18181B]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-[200px] truncate">
                      {booking.serviceTitle}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-200">{booking.customerName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{booking.customerEmail}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-200">{booking.technicianName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{booking.technicianEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(booking.preferredDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColors[booking.status] || statusColors.requested
                          }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${booking.paymentStatus === "paid"
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                            : "bg-amber-950/40 text-amber-300 border-amber-800"
                          }`}
                      >
                        <CreditCard className="h-2.5 w-2.5 mr-1" />
                        {booking.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                      ${booking.status === "completed" ? booking.finalAmount : booking.basePrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <ClipboardList className="h-8 w-8 text-zinc-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Bookings Found</h3>
            <p className="text-xs text-zinc-400">
              There are currently no bookings with status &quot;{activeTab}&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
