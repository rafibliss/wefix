"use client";

import { useEffect, useState } from "react";
import { CheckSquare, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface ServiceItem {
  _id: string;
  title: string;
  category: string;
  basePrice: number;
  serviceMode: string;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: string;
  isAvailable: boolean;
  createdAt: string;
}

const STATUS_TABS = ["pending", "approved", "rejected", "all"];

export default function AdminServicesPage() {
  const { data: session } = useSession();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // Pending is first/default
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadServices() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

        const qs = activeTab !== "all" ? `?approvalStatus=${activeTab}` : "";
        const res = await fetch(`${apiUrl}/api/admin/services${qs}`, {
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore) setServices(data.services || []);
        }
      } catch (err) {
        console.error("Error loading services for admin:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (session?.user) {
      loadServices();
    }
    return () => {
      ignore = true;
    };
  }, [session, activeTab, refreshKey]);

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
        toast.error("Failed to update service approval status");
      }
    } catch {
      toast.error("Error updating approval");
    }
  };

  const statusBadges: Record<string, string> = {
    pending: "bg-amber-950/40 text-amber-300 border-amber-800",
    approved: "bg-emerald-950/40 text-emerald-300 border-emerald-800",
    rejected: "bg-rose-950/40 text-rose-300 border-rose-800",
  };

  if (loading && services.length === 0) {
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
          Service Approval & Moderation
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Review repair services submitted by technicians. Approved services immediately become publicly searchable.
        </p>
      </div>

      {/* Status Filter Tabs */}
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
            {tab}
          </button>
        ))}
      </div>

      {/* Services Table */}
      <div className="bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
        {services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Service Title</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Technician</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-[#18181B]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white max-w-[220px] truncate">{service.title}</p>
                      <span className="text-[10px] text-zinc-400">{service.serviceMode} • {service.serviceArea}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-medium">{service.category}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-200">{service.technicianName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{service.technicianEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">${service.basePrice}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          statusBadges[service.approvalStatus] || statusBadges.pending
                        }`}
                      >
                        {service.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {service.approvalStatus !== "approved" && (
                          <button
                            type="button"
                            onClick={() => handleApprovalAction(service._id, "approved")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {service.approvalStatus !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => handleApprovalAction(service._id, "rejected")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <CheckSquare className="h-8 w-8 text-zinc-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No services found in this category</h3>
            <p className="text-xs text-zinc-400">
              There are currently no services with status &quot;{activeTab}&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
