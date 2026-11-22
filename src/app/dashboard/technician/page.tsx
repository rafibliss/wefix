"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Wrench,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface ServiceItem {
  _id: string;
  title: string;
  approvalStatus: string;
  isAvailable: boolean;
  basePrice: number;
}

interface BookingItem {
  _id: string;
  serviceTitle: string;
  customerName: string;
  status: string;
  preferredDate: string;
  finalAmount: number;
  paymentStatus: string;
}

export default function TechnicianOverviewPage() {
  const { data: session } = useSession();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

        const [resServices, resBookings] = await Promise.all([
          fetch(`${apiUrl}/api/services/technician`, { headers, credentials: "include" }),
          fetch(`${apiUrl}/api/bookings/technician`, { headers, credentials: "include" }),
        ]);

        if (resServices.ok) {
          const dataS = await resServices.json();
          setServices(dataS.services || []);
        }
        if (resBookings.ok) {
          const dataB = await resBookings.json();
          setBookings(dataB.bookings || []);
        }
      } catch (err) {
        console.error("Error loading technician overview data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      loadData();
    }
  }, [session]);

  const totalServices = services.length;
  const approvedServices = services.filter((s) => s.approvalStatus === "approved").length;
  const pendingRequests = bookings.filter((b) => b.status === "requested").length;
  const inProgressJobs = bookings.filter((b) => b.status === "in-progress" || b.status === "accepted").length;

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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Technician Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your repair listings, review pending customer requests, and update ongoing jobs.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Service</span>
        </Link>
      </div>

      {/* 3 Reusable Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Services */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Services</span>
            <div className="h-9 w-9 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{totalServices}</p>
          <p className="text-[11px] text-zinc-400">Created across all repair categories</p>
        </div>

        {/* Approved Services */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Services</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
            {approvedServices}
          </p>
          <p className="text-[11px] text-zinc-400">Currently live and discoverable publicly</p>
        </div>

        {/* Pending Requests */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
            <div className="h-9 w-9 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-center justify-center text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-blue-400 tracking-tight">
            {pendingRequests}
          </p>
          <p className="text-[11px] text-zinc-400">
            {inProgressJobs} active jobs in progress
          </p>
        </div>
      </div>

      {/* Recent Incoming Requests */}
      <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-bold text-white">Recent Repair Bookings</h2>
            <p className="text-xs text-zinc-400">Latest customer repair requests awaiting your action</p>
          </div>
          <Link
            href="/dashboard/technician/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
                <tr>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Target Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="hover:bg-[#18181B]/50 transition-colors">
                    <td className="py-3.5 font-medium text-white max-w-[200px] truncate">
                      {booking.serviceTitle}
                    </td>
                    <td className="py-3.5 text-zinc-300">{booking.customerName}</td>
                    <td className="py-3.5 text-zinc-400">
                      {new Date(booking.preferredDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          statusColors[booking.status] || statusColors.requested
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href="/dashboard/technician/requests"
                        className="px-3 py-1 rounded-lg bg-[#18181B] hover:bg-[#202024] border border-[#27272A] text-[11px] font-semibold text-white"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <AlertCircle className="h-6 w-6 text-zinc-500 mx-auto" />
            <p className="text-xs text-zinc-400">No repair requests received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
