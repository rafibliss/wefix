"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CreditCard,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  User,
  Wrench,
  Search,
  ShieldCheck,
  History
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface StatusHistoryItem {
  status: string;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  serviceImage?: string;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: "requested" | "accepted" | "in-progress" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  basePrice: number;
  finalAmount?: number;
  statusHistory?: StatusHistoryItem[];
  createdAt: string;
}

export default function CustomerBookingsPage() {
  const { data: session } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Payment Redirect State
  const [payingId, setPayingId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    if (checkoutUrl) {
      window.location.assign(checkoutUrl);
    }
  }, [checkoutUrl]);

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`;
        }

        const res = await fetch(`${apiUrl}/api/bookings/my`, {
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
        console.error("Error loading bookings:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (session?.user) {
      loadBookings();
    }

    return () => {
      ignore = true;
    };
  }, [session, refreshKey]);

  // Handle Cancel Request
  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelling(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${apiUrl}/api/bookings/${cancellingBooking._id}/cancel`, {
        method: "PATCH",
        headers,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to cancel request");
        setCancelling(false);
        return;
      }

      toast.success("Repair request cancelled successfully");
      setCancelModalOpen(false);
      setCancellingBooking(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error cancelling request");
    } finally {
      setCancelling(false);
    }
  };

  // Handle Stripe Checkout
  const handleInitiatePayment = async (booking: Booking) => {
    setPayingId(booking._id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${apiUrl}/api/payments/create-checkout-session`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ bookingId: booking._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error ? `${data.message}: ${data.error}` : (data.message || "Failed to initiate payment");
        toast.error(errorMsg);
        setPayingId(null);
        return;
      }

      if (data.url) {
        toast.loading("Redirecting to secure Stripe Checkout...");
        setCheckoutUrl(data.url);
      } else {
        toast.error("Did not receive checkout URL from payment gateway");
        setPayingId(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment checkout error");
      setPayingId(null);
    }
  };

  // Filter Bookings by Tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") {
      return ["requested", "accepted", "in-progress"].includes(b.status);
    }
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "requested":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Requested</span>
          </span>
        );
      case "accepted":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Accepted</span>
          </span>
        );
      case "in-progress":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            <span>In Progress</span>
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Completed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Repair Requests</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor the status of your repair requests, communicate with technicians, and complete payments.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Search className="h-4 w-4" />
          <span>Book Another Service</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#27272A] pb-3">
        {(
          [
            { id: "all", label: "All Requests", count: bookings.length },
            {
              id: "active",
              label: "Active Jobs",
              count: bookings.filter((b) =>
                ["requested", "accepted", "in-progress"].includes(b.status)
              ).length,
            },
            {
              id: "completed",
              label: "Completed",
              count: bookings.filter((b) => b.status === "completed").length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: bookings.filter((b) => b.status === "cancelled").length,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-zinc-800 text-white border border-[#27272A]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === tab.id
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-900 text-zinc-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-sm">Retrieving your repair requests...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl bg-[#111113] border border-[#27272A] p-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-[#27272A] flex items-center justify-center mx-auto text-zinc-500">
            <CalendarCheck className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No requests found</h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
              {activeTab === "all"
                ? "You haven't requested any repair services yet. Find a service to get started!"
                : `You currently have no ${activeTab} repair requests.`}
            </p>
          </div>
          {activeTab === "all" && (
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Browse Services</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isCompleted = b.status === "completed";
            const isUnpaid = b.paymentStatus === "unpaid";
            const isPaid = b.paymentStatus === "paid";
            const canCancel = b.status === "requested";
            const displayAmount = Number(b.finalAmount ?? b.basePrice).toFixed(2);

            return (
              <div
                key={b._id}
                className="rounded-2xl bg-[#111113] border border-[#27272A] p-5 sm:p-6 transition-all hover:border-zinc-700 space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A]/70 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-[#27272A] text-zinc-300">
                        {b.serviceCategory}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Booked: {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        Ref: #{b._id.slice(-6)}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white hover:text-zinc-200 transition-colors">
                      {b.serviceTitle}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getStatusBadge(b.status)}
                    {isPaid ? (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-400 border border-[#27272A]">
                        Unpaid
                      </span>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Technician</span>
                    </div>
                    <p className="text-white font-medium pl-5">{b.technicianName}</p>
                    <p className="text-zinc-500 pl-5">{b.technicianEmail}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <CalendarCheck className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Preferred Service Date</span>
                    </div>
                    <p className="text-white font-medium pl-5">
                      {new Date(b.preferredDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-zinc-500 pl-5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{b.address}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <CreditCard className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Pricing</span>
                    </div>
                    <div className="pl-5 space-y-0.5">
                      {b.finalAmount !== undefined ? (
                        <div>
                          <p className="text-sm font-bold text-white">
                            Final Bill: ${Number(b.finalAmount).toFixed(2)}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Base estimate was ${Number(b.basePrice).toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-white">
                            Estimate: ${Number(b.basePrice).toFixed(2)}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Final cost set upon inspection
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Problem Description Snippet */}
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-[#27272A]/70 text-xs">
                  <span className="font-semibold text-zinc-400 block mb-1">Problem Description:</span>
                  <p className="text-zinc-300 line-clamp-2">{b.problemDescription}</p>
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedBooking(b);
                      setDetailsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    <History className="h-3.5 w-3.5 text-zinc-400" />
                    <span>View Status History & Details</span>
                  </button>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Cancel Request (Only when 'requested') */}
                    {canCancel && (
                      <button
                        onClick={() => {
                          setCancellingBooking(b);
                          setCancelModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 border border-rose-500/20 transition-all"
                      >
                        Cancel Request
                      </button>
                    )}

                    {/* Pay Now Button (Only when completed && unpaid) */}
                    {isCompleted && isUnpaid && (
                      <button
                        onClick={() => handleInitiatePayment(b)}
                        disabled={payingId === b._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-md shadow-emerald-950/20"
                      >
                        {payingId === b._id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Pay Now (${displayAmount})</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Paid Indicator */}
                    {isCompleted && isPaid && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Paid in Full</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#111113] border border-[#27272A] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cancel Repair Request</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-[#27272A] space-y-2 text-xs">
              <p className="text-zinc-300 font-medium">{cancellingBooking.serviceTitle}</p>
              <p className="text-zinc-500">Technician: {cancellingBooking.technicianName}</p>
              <p className="text-zinc-500">Date: {new Date(cancellingBooking.preferredDate).toLocaleDateString()}</p>
            </div>

            <p className="text-xs text-zinc-400">
              Are you sure you want to cancel this repair booking? The technician will be notified.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setCancellingBooking(null);
                }}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Request</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Status Timeline Modal */}
      {detailsModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111113] border border-[#27272A] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {selectedBooking.serviceCategory}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedBooking.serviceTitle}
                </h3>
              </div>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedBooking(null);
                }}
                className="h-8 w-8 rounded-lg bg-zinc-900 border border-[#27272A] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-[#27272A]">
              <div>
                <span className="text-xs text-zinc-500 block">Current Status</span>
                <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 block">Payment</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {selectedBooking.paymentStatus === "paid" ? (
                    <span className="text-emerald-400">Paid in Full</span>
                  ) : (
                    <span className="text-amber-400">Unpaid</span>
                  )}
                </span>
              </div>
            </div>

            {/* Request Info Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3 rounded-xl bg-zinc-900/60 border border-[#27272A]">
                <span className="text-zinc-500 font-medium">Technician Details:</span>
                <p className="text-white font-semibold">{selectedBooking.technicianName}</p>
                <p className="text-zinc-400">{selectedBooking.technicianEmail}</p>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-zinc-900/60 border border-[#27272A]">
                <span className="text-zinc-500 font-medium">Service Schedule & Contact:</span>
                <p className="text-white font-semibold">
                  Date: {new Date(selectedBooking.preferredDate).toLocaleDateString()}
                </p>
                <p className="text-zinc-400">Phone: {selectedBooking.customerPhone}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-[#27272A] text-xs space-y-1">
              <span className="text-zinc-500 font-medium">Pickup / Service Address:</span>
              <p className="text-zinc-200">{selectedBooking.address}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-[#27272A] text-xs space-y-1">
              <span className="text-zinc-500 font-medium">Problem Description:</span>
              <p className="text-zinc-200 whitespace-pre-wrap">{selectedBooking.problemDescription}</p>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="h-4 w-4 text-zinc-400" />
                <span>Status History Timeline</span>
              </h4>

              {selectedBooking.statusHistory && selectedBooking.statusHistory.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#27272A]">
                  {selectedBooking.statusHistory.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-zinc-400 border-2 border-[#111113]" />
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white capitalize">{item.status}</span>
                          <span className="text-[11px] text-zinc-500">
                            {new Date(item.changedAt).toLocaleString()}
                          </span>
                        </div>
                        {item.note && <p className="text-zinc-400">{item.note}</p>}
                        {item.changedBy && (
                          <p className="text-[10px] text-zinc-500">Updated by: {item.changedBy}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No status updates logged yet.</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272A]">
              {selectedBooking.status === "completed" && selectedBooking.paymentStatus === "unpaid" && (
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleInitiatePayment(selectedBooking);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>
                    Pay Now (${Number(selectedBooking.finalAmount ?? selectedBooking.basePrice).toFixed(2)})
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
