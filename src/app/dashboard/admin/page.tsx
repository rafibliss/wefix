"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  Wrench,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface OverviewMetrics {
  totalUsers: number;
  totalTechnicians: number;
  pendingServices: number;
  totalBookings: number;
  totalRevenue: number;
}

interface ServiceItem {
  _id: string;
  title: string;
  category: string;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: string;
  createdAt: string;
}

export default function AdminOverviewPage() {
  const { data: session } = useSession();

  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [pendingServices, setPendingServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadOverview() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

        const [resMetrics, resServices] = await Promise.all([
          fetch(`${apiUrl}/api/admin/overview`, { headers, credentials: "include" }),
          fetch(`${apiUrl}/api/admin/services?approvalStatus=pending`, { headers, credentials: "include" }),
        ]);

        if (resMetrics.ok) {
          const dataM = await resMetrics.json();
          if (!ignore) setMetrics(dataM);
        }
        if (resServices.ok) {
          const dataS = await resServices.json();
          if (!ignore) setPendingServices(dataS.services || []);
        }
      } catch (err) {
        console.error("Error loading admin overview:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (session?.user) {
      loadOverview();
    }
    return () => {
      ignore = true;
    };
  }, [session, refreshKey]);

  const handleApprovalAction = async (serviceId: string, approvalStatus: "approved" | "rejected") => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

      const res = await fetch(`${apiUrl}/api/admin/services/${serviceId}/approval`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ approvalStatus }),
      });

      if (res.ok) {
        toast.success(`Service successfully ${approvalStatus}`);
        setRefreshKey((k) => k + 1);
      } else {
        toast.error("Failed to update service status");
      }
    } catch {
      toast.error("Error updating approval");
    }
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Control Center
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Monitor platform metrics, approve technician services, manage user roles, and track revenue.
        </p>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <div className="h-9 w-9 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-center justify-center text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">{metrics?.totalUsers || 0}</p>
          <p className="text-[11px] text-zinc-400">Customers, technicians, and staff</p>
        </div>


        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Technicians</span>
            <div className="h-9 w-9 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-center justify-center text-amber-400">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 tracking-tight">
            {metrics?.totalTechnicians || 0}
          </p>
          <p className="text-[11px] text-zinc-400">Certified local specialists</p>
        </div>


        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Services</span>
            <div className="h-9 w-9 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-center justify-center text-rose-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 tracking-tight">
            {metrics?.pendingServices || 0}
          </p>
          <p className="text-[11px] text-zinc-400">Awaiting moderation</p>
        </div>


        <div className="p-6 rounded-2xl bg-[#111113] border border-[#27272A] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Revenue</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            ${metrics?.totalRevenue || 0}
          </p>
          <p className="text-[11px] text-zinc-400">Completed Stripe payments</p>
        </div>
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/dashboard/admin/users"
          className="p-4 rounded-xl bg-[#111113] border border-[#27272A] hover:border-zinc-500 transition-colors flex items-center justify-between text-xs font-bold text-white group"
        >
          <span>Manage Users</span>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/dashboard/admin/services"
          className="p-4 rounded-xl bg-[#111113] border border-[#27272A] hover:border-zinc-500 transition-colors flex items-center justify-between text-xs font-bold text-white group"
        >
          <span>Service Approval</span>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/dashboard/admin/bookings"
          className="p-4 rounded-xl bg-[#111113] border border-[#27272A] hover:border-zinc-500 transition-colors flex items-center justify-between text-xs font-bold text-white group"
        >
          <span>All Bookings</span>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/dashboard/admin/transactions"
          className="p-4 rounded-xl bg-[#111113] border border-[#27272A] hover:border-zinc-500 transition-colors flex items-center justify-between text-xs font-bold text-white group"
        >
          <span>Transactions</span>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>


      <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-bold text-white">Pending Services Requiring Review</h2>
            <p className="text-xs text-zinc-400">Newly submitted or modified services awaiting public listing</p>
          </div>
          <Link
            href="/dashboard/admin/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            <span>View All Services</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pendingServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
                <tr>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Technician</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {pendingServices.map((service) => (
                  <tr key={service._id} className="hover:bg-[#18181B]/50 transition-colors">
                    <td className="py-3.5 font-bold text-white max-w-[200px] truncate">{service.title}</td>
                    <td className="py-3.5 text-zinc-300">{service.category}</td>
                    <td className="py-3.5 text-zinc-400">{service.technicianName}</td>
                    <td className="py-3.5 font-bold text-white">${service.basePrice}</td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprovalAction(service._id, "approved")}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprovalAction(service._id, "rejected")}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 text-rose-300 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
            <p className="text-xs text-zinc-300 font-semibold">All caught up!</p>
            <p className="text-[11px] text-zinc-500">There are no services currently pending approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
