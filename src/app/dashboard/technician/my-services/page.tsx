"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Wrench,
  PlusCircle,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Service {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
  approvalStatus: string;
  isAvailable: boolean;
  createdAt: string;
}

const CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical"
];

export default function MyServicesPage() {
  const { data: session } = useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

        const res = await fetch(`${apiUrl}/api/services/technician`, {
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setServices(data.services || []);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("API error fetching technician services:", res.status, errData);
          if (!ignore) {
            toast.error(errData.message || `Failed to load your services (Error ${res.status})`);
          }
        }
      } catch (err) {
        console.error("Error fetching technician services:", err);
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
  }, [session, refreshKey]);

  // Toggle isAvailable
  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

      const res = await fetch(`${apiUrl}/api/services/${id}/availability`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ isAvailable: nextStatus }),
      });

      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isAvailable: nextStatus } : s))
        );
        toast.success(`Service availability turned ${nextStatus ? "ON" : "OFF"}`);
      } else {
        toast.error("Failed to update availability");
      }
    } catch {
      toast.error("Error updating availability");
    }
  };

  // Open Edit Modal
  const openEditModal = (service: Service) => {
    setEditingService(service);
    setEditTitle(service.title);
    setEditCategory(service.category);
    setEditPrice(service.basePrice.toString());
    setEditDuration(service.estimatedDuration);
    setEditArea(service.serviceArea);
    setEditDescription(service.description);
    setEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    setSavingEdit(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

      const res = await fetch(`${apiUrl}/api/services/${editingService._id}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          basePrice: Number(editPrice),
          estimatedDuration: editDuration.trim(),
          serviceArea: editArea.trim(),
          description: editDescription.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Service updated! Approval status reset to pending.");
        setEditModalOpen(false);
        setRefreshKey((k) => k + 1);
      } else {
        toast.error("Failed to update service");
      }
    } catch {
      toast.error("Error saving edits");
    } finally {
      setSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = {};
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

      const res = await fetch(`${apiUrl}/api/services/${deletingId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Service deleted successfully");
        setServices((prev) => prev.filter((s) => s._id !== deletingId));
        setDeleteModalOpen(false);
      } else {
        toast.error("Failed to delete service");
      }
    } catch {
      toast.error("Error deleting service");
    } finally {
      setDeleting(false);
    }
  };

  const statusBadges: Record<string, string> = {
    pending: "bg-amber-950/40 text-amber-300 border-amber-800",
    approved: "bg-emerald-950/40 text-emerald-300 border-emerald-800",
    rejected: "bg-rose-950/40 text-rose-300 border-rose-800",
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Repair Services
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your repair listings, toggle visibility, and update pricing or duration.
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

      {/* Services Table */}
      <div className="bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
        {services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Service</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Base Price</th>
                  <th className="py-3.5 px-4 font-semibold">Approval</th>
                  <th className="py-3.5 px-4 font-semibold">Available</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-[#18181B]/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {service.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={service.image}
                            alt={service.title}
                            className="h-10 w-12 rounded-lg object-cover border border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                            <Wrench className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[220px]">{service.title}</p>
                          <span className="text-[10px] text-zinc-400">{service.serviceMode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-zinc-300 font-medium">{service.category}</td>

                    <td className="py-4 px-4 font-bold text-white">${service.basePrice}</td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          statusBadges[service.approvalStatus] || statusBadges.pending
                        }`}
                      >
                        {service.approvalStatus}
                      </span>
                    </td>

                    {/* Availability Switch */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(service._id, service.isAvailable)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          service.isAvailable ? "bg-emerald-600" : "bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            service.isAvailable ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Edit / Delete Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(service)}
                          className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#222226] border border-[#27272A] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(service._id);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/50 text-rose-300 transition-colors cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Services Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              You haven&apos;t added any repair services yet. List your specialized repair services to start receiving client requests.
            </p>
            <Link
              href="/dashboard/technician/add-service"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAFAFA] text-[#09090B] font-bold text-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Your First Service</span>
            </Link>
          </div>
        )}
      </div>

      {/* ==========================================
          EDIT SERVICE MODAL
      ========================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111113] border border-[#27272A] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="text-base font-bold text-white">Edit Repair Service</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/50 text-amber-300 text-[11px]">
              Note: Saving edits will reset the approval status to <strong>pending</strong> for admin review.
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-semibold uppercase text-zinc-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-zinc-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-300 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-zinc-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-300 mb-1">Service Area</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white"
                />
              </div>

              <div className="pt-3 border-t border-[#27272A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#18181B] text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-lg bg-[#FAFAFA] text-[#09090B] font-bold flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE CONFIRMATION MODAL
      ========================================== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111113] border border-[#27272A] p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-950/40 text-rose-400 border border-rose-900/50 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete This Service?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to permanently remove this service listing? This action cannot be undone.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#18181B] text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
