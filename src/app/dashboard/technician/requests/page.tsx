"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Check,
  X,
  Play,
  CheckCircle,
  Loader2,
  Phone,
  MapPin,
  Calendar,
  CreditCard
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: string;
  basePrice: number;
  finalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_TABS = ["All", "requested", "accepted", "in-progress", "completed", "rejected"];

export default function TechnicianRequestsPage() {
  const { data: session } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Reject Confirmation Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Complete Job Modal State (sets finalAmount)
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
  const [finalAmountInput, setFinalAmountInput] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

        const qs = activeTab !== "All" ? `?status=${activeTab}` : "";
        const res = await fetch(`${apiUrl}/api/bookings/technician${qs}`, {
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setBookings(data.bookings || []);
          }
        }
      } catch (err) {
        console.error("Error fetching technician requests:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (session?.user) {
      load();
    }
    return () => {
      ignore = true;
    };
  }, [session, activeTab, refreshKey]);

  // Execute Status Transition
  const handleUpdateStatus = async (
    bookingId: string,
    targetStatus: string,
    finalAmount?: number
  ) => {
    setUpdatingStatus(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

      const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          status: targetStatus,
          ...(finalAmount ? { finalAmount } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update status");
        return;
      }

      toast.success(data.message || `Status updated to ${targetStatus}`);
      setRejectModalOpen(false);
      setCompleteModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Network error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenCompleteModal = (booking: Booking) => {
    setCompletingBooking(booking);
    // Pre-fill with base price or existing final amount
    setFinalAmountInput(booking.finalAmount ? booking.finalAmount.toString() : booking.basePrice.toString());
    setCompleteModalOpen(true);
  };

  const statusColors: Record<string, string> = {
    requested: "bg-blue-950/40 text-blue-300 border-blue-800",
    accepted: "bg-indigo-950/40 text-indigo-300 border-indigo-800",
    "in-progress": "bg-amber-950/40 text-amber-300 border-amber-800",
    completed: "bg-emerald-950/40 text-emerald-300 border-emerald-800",
    rejected: "bg-rose-950/40 text-rose-300 border-rose-800",
    cancelled: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

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
          Manage Repair Requests
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Review client problem descriptions and transition jobs along the verified status pipeline.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#111113] border border-[#27272A]">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-[#18181B]"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Bookings List / Table */}
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-[#111113] border border-[#27272A] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#27272A]">
                <div>
                  <h3 className="text-base font-bold text-white">{booking.serviceTitle}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-1">
                    <span className="font-semibold text-zinc-200">Customer: {booking.customerName}</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {booking.customerPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(booking.preferredDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded text-[11px] font-bold uppercase border ${
                      statusColors[booking.status] || statusColors.requested
                    }`}
                  >
                    {booking.status}
                  </span>

                  {booking.status === "completed" && (
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        booking.paymentStatus === "paid"
                          ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                          : "bg-amber-950/40 text-amber-300 border-amber-800"
                      }`}
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      {booking.paymentStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Problem Description */}
              <div className="text-xs">
                <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                  Problem Reported
                </span>
                <p className="mt-1 p-3 rounded-xl bg-[#09090B] border border-[#27272A] text-zinc-300 leading-relaxed">
                  {booking.problemDescription}
                </p>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <div className="text-zinc-400">
                  <span>Quotation: </span>
                  <strong className="text-white text-sm">
                    ${booking.status === "completed" ? booking.finalAmount : booking.basePrice}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status: requested -> Accept / Reject */}
                  {booking.status === "requested" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(booking._id, "accepted")}
                        disabled={updatingStatus}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Accept Job</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(booking._id);
                          setRejectModalOpen(true);
                        }}
                        disabled={updatingStatus}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/60 text-rose-300 font-semibold transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* Status: accepted -> Start Work (in-progress) */}
                  {booking.status === "accepted" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(booking._id, "in-progress")}
                      disabled={updatingStatus}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start Work (In Progress)</span>
                    </button>
                  )}

                  {/* Status: in-progress -> Mark Completed */}
                  {booking.status === "in-progress" && (
                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(booking)}
                      disabled={updatingStatus}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {/* Terminal states: completed, rejected, cancelled */}
                  {(booking.status === "completed" ||
                    booking.status === "rejected" ||
                    booking.status === "cancelled") && (
                    <span className="text-[11px] text-zinc-500 italic">No further actions available</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-12 text-center space-y-3">
            <ClipboardList className="h-8 w-8 text-zinc-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Requests in this category</h3>
            <p className="text-xs text-zinc-400">
              There are currently no bookings with status &quot;{activeTab}&quot;.
            </p>
          </div>
        )}
      </div>

      {/* ==========================================
          REJECT CONFIRMATION MODAL
      ========================================== */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111113] border border-[#27272A] p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-950/40 text-rose-400 border border-rose-900/50 flex items-center justify-center mx-auto">
              <X className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reject This Repair Request?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                This is a final state. Once rejected, this request cannot be reopened.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#18181B] text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => rejectingId && handleUpdateStatus(rejectingId, "rejected")}
                disabled={updatingStatus}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white"
              >
                {updatingStatus ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MARK COMPLETED MODAL (FINAL AMOUNT SET)
      ========================================== */}
      {completeModalOpen && completingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111113] border border-[#27272A] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="text-base font-bold text-white">Complete Repair Job</h3>
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-zinc-300 font-semibold">{completingBooking.serviceTitle}</p>
              <p className="text-zinc-400 text-[11px]">Customer: {completingBooking.customerName}</p>
            </div>

            <div>
              <label htmlFor="finalAmountInput" className="block font-semibold uppercase text-zinc-300 mb-1">
                Final Billable Amount ($ USD) <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-zinc-400 mb-2">
                Pre-filled with base price (${completingBooking.basePrice}). Enter the total amount including any additional parts or work delivered.
              </p>
              <input
                id="finalAmountInput"
                type="number"
                min="1"
                step="0.01"
                value={finalAmountInput}
                onChange={(e) => setFinalAmountInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div className="pt-3 border-t border-[#27272A] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#18181B] text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const amt = Number(finalAmountInput);
                  if (isNaN(amt) || amt <= 0) {
                    toast.error("Please enter a valid amount greater than 0");
                    return;
                  }
                  handleUpdateStatus(completingBooking._id, "completed", amt);
                }}
                disabled={updatingStatus}
                className="px-5 py-2 rounded-lg bg-[#FAFAFA] text-[#09090B] font-bold flex items-center gap-1.5"
              >
                {updatingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                <span>Set Final Amount & Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
