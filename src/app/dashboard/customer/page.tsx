"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Wrench,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  serviceImage?: string;
  technicianName: string;
  technicianEmail: string;
  status: "requested" | "accepted" | "in-progress" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  basePrice: number;
  finalAmount?: number;
  preferredDate: string;
  createdAt: string;
}

export default function CustomerDashboardOverview() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    // Wait for auth session and token before fetching
    if (!session?.user) return; // session not loaded yet
    const token = (session as unknown as { session?: { token?: string } })?.session?.token;
    if (!token) return; // token not available yet

    async function fetchBookings() {
      setLoading(true);
      setError("");
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

        if (!res.ok) {
          throw new Error("Failed to load your bookings");
        }

        const data = await res.json();
        if (!ignore) {
          setBookings(data.bookings || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Error loading dashboard");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (session?.user) {
      fetchBookings();
    }

    return () => {
      ignore = true;
    };
  }, [session]);

  const totalRequests = bookings.length;
  const activeJobs = bookings.filter((b) =>
    ["requested", "accepted", "in-progress"].includes(b.status)
  ).length;
  const completedJobs = bookings.filter((b) => b.status === "completed").length;
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (Number(b.finalAmount ?? b.basePrice) || 0), 0);

  const recentBookings = bookings.slice(0, 5);

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "requested":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Requested
          </span>
        );
      case "accepted":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Accepted
          </span>
        );
      case "in-progress":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-[#111113] to-zinc-900 border border-[#27272A] p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {session?.user?.name || "Customer"}
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Track your active repair requests, review technician updates, and securely complete payments once jobs are finished.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <Search className="h-4 w-4" />
              <span>Browse Services</span>
            </Link>
            <Link
              href="/dashboard/customer/bookings"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 border border-[#27272A] transition-colors"
            >
              <CalendarCheck className="h-4 w-4 text-zinc-400" />
              <span>My Bookings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Requests</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "-" : totalRequests}
            </h3>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Active Jobs</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "-" : activeJobs}
            </h3>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Completed Jobs</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "-" : completedJobs}
            </h3>
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Spent</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "-" : `$${totalSpent.toFixed(2)}`}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table / List */}
      <div className="rounded-2xl bg-[#111113] border border-[#27272A] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Repair Requests</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Your most recent device and appliance repair bookings</p>
          </div>
          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
            <p className="text-sm">Loading your repair requests...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="py-14 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-[#27272A] flex items-center justify-center mx-auto text-zinc-500">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">No repair requests yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Explore our catalog of certified technicians and request repair assistance for your devices.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Find Services</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
                <tr>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Technician</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/60">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4">
                      <div className="font-semibold text-white">{b.serviceTitle}</div>
                      <span className="text-xs text-zinc-400">{b.serviceCategory}</span>
                    </td>
                    <td className="py-4">
                      <div className="text-zinc-200 font-medium">{b.technicianName}</div>
                      <span className="text-xs text-zinc-500">{b.technicianEmail}</span>
                    </td>
                    <td className="py-4 text-zinc-300 text-xs">
                      {new Date(b.preferredDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 font-semibold text-white">
                      ${Number(b.finalAmount ?? b.basePrice).toFixed(2)}
                    </td>
                    <td className="py-4">{getStatusBadge(b.status)}</td>
                    <td className="py-4">
                      {b.paymentStatus === "paid" ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-400 border border-[#27272A]">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href="/dashboard/customer/bookings"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        <span>Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
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
