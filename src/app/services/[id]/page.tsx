"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import {
  Wrench,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  User,
  ArrowLeft,
  Calendar,
  Phone,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface ServiceData {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: string;
  isAvailable: boolean;
  createdAt: string;
}

interface TechnicianProfile {
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
  area?: string;
  bio?: string;
}

export default function ServiceDetailsPage(props: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(props.params);
  const serviceId = resolvedParams.id;
  const router = useRouter();

  const { data: session, isPending: sessionLoading } = useSession();

  const [service, setService] = useState<ServiceData | null>(null);
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const user = session?.user as {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    area?: string;
  } | undefined;

  const userRole = user?.role || "customer";

  // Fetch Service Details
  useEffect(() => {
    async function loadService() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/services/${serviceId}`);
        if (res.ok) {
          const data = await res.json();
          setService(data.service);
          setTechnician(data.technician);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error loading service details:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [serviceId]);

  // Get Today's date string YYYY-MM-DD for min date picker
  const todayStr = new Date().toISOString().split("T")[0];

  const handleOpenModal = () => {
    if (!session?.user) {
      router.push(`/sign-in?callbackUrl=/services/${serviceId}`);
      return;
    }
    // Pre-populate with session details if not already set
    if (!customerPhone && user?.phone) setCustomerPhone(user.phone);
    if (!address && user?.area) setAddress(user.area);
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!customerPhone.trim()) {
      setFormError("Contact phone number is required.");
      return;
    }
    if (!address.trim()) {
      setFormError("Service address / pickup location is required.");
      return;
    }
    if (!preferredDate) {
      setFormError("Preferred service date is required.");
      return;
    }
    if (problemDescription.trim().length < 20) {
      setFormError("Problem description must be at least 20 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Pass BetterAuth session cookie
        body: JSON.stringify({
          serviceId: service?._id,
          customerPhone: customerPhone.trim(),
          address: address.trim(),
          preferredDate,
          problemDescription: problemDescription.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to submit repair request.");
        setFormError(data.message || "Submission failed");
        setSubmitting(false);
        return;
      }

      toast.success("Repair request submitted successfully!");
      setModalOpen(false);
      setProblemDescription("");
      router.push("/dashboard/customer/bookings");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      toast.error(msg);
      setFormError(msg);
      setSubmitting(false);
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-[#27272A] flex items-center justify-center mx-auto text-zinc-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Service Not Found</h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          The requested repair service is unavailable, has been removed, or is awaiting administrator approval.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Services</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Banner & Service Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Large Image */}
          <div className="relative rounded-2xl overflow-hidden bg-[#111113] border border-[#27272A] aspect-[16/9] w-full shadow-2xl">
            {service.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-zinc-700">
                <Wrench className="h-16 w-16" />
              </div>
            )}

            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#09090B]/90 backdrop-blur-md text-white border border-[#27272A]">
                {service.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-800/60">
                {service.serviceMode}
              </span>
            </div>
          </div>

          {/* Service Title & Metadata */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {service.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pb-4 border-b border-[#27272A]">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-zinc-300" />
                <span>Duration: <strong className="text-white">{service.estimatedDuration}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-zinc-300" />
                <span>Coverage Area: <strong className="text-white">{service.serviceArea}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-zinc-300" />
                <span>WeFix Verified Specialist</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-2">
              <h2 className="text-lg font-bold text-white">What This Repair Service Covers</h2>
              <div className="p-5 rounded-xl bg-[#111113] border border-[#27272A] text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {service.description}
              </div>
            </div>

            {/* Repair Guarantee Notice */}
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex items-start gap-3 text-xs text-zinc-400">
              <CreditCard className="h-4 w-4 text-zinc-200 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Pay-After-Completion Protection</p>
                <p className="mt-0.5 text-zinc-400">
                  You are not charged when requesting this repair. Payment is made through Stripe test mode only after the technician marks the job completed and you inspect the result.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Booking Action Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Card */}
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 shadow-2xl space-y-6 sticky top-24">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Starting Base Price
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold text-white">${service.basePrice}</span>
                <span className="text-xs text-zinc-400">USD</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Final amount will be confirmed after physical diagnostics.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#27272A] text-xs">
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Service Mode</span>
                <span className="font-semibold text-white">{service.serviceMode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Estimated Duration</span>
                <span className="font-semibold text-white">{service.estimatedDuration}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Service Area</span>
                <span className="font-semibold text-white">{service.serviceArea}</span>
              </div>
            </div>

            {/* Request Repair CTA with Role Checking */}
            <div className="pt-2">
              {!session?.user ? (
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-sm transition-colors cursor-pointer shadow"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Sign In to Request Repair</span>
                </button>
              ) : userRole === "technician" || userRole === "admin" ? (
                <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#3F3F46] text-center space-y-1">
                  <p className="text-xs font-semibold text-zinc-300">
                    Logged in as {userRole.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Only customers can send repair requests.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-sm transition-colors cursor-pointer shadow"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Request Repair Now</span>
                </button>
              )}
            </div>

            {/* Technician Profile Card */}
            <div className="pt-6 border-t border-[#27272A] space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Assigned Specialist
              </p>
              <div className="flex items-start gap-3">
                {technician?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={technician.image}
                    alt={service.technicianName}
                    className="h-11 w-11 rounded-xl object-cover border border-[#27272A]"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-white border border-[#27272A]">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 text-xs">
                  <p className="font-bold text-white">{service.technicianName}</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{technician?.area || service.serviceArea}</p>
                  {technician?.bio && (
                    <p className="text-zinc-400 text-[11px] mt-2 line-clamp-3 italic">
                      &quot;{technician.bio}&quot;
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          REPAIR REQUEST MODAL (CUSTOMER ONLY)
      ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111113] border border-[#27272A] p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-lg font-bold text-white">Send Repair Request</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{service.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
              {/* Read Only Session Info */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Customer Name</span>
                  <p className="font-semibold text-white truncate mt-0.5">{user?.name || "Customer"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Customer Email</span>
                  <p className="font-semibold text-white truncate mt-0.5">{user?.email || ""}</p>
                </div>
              </div>

              {/* Phone & Address */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="customerPhone" className="block font-semibold uppercase text-zinc-300 mb-1">
                    Contact Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +880 1712-345678"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block font-semibold uppercase text-zinc-300 mb-1">
                    Service / Pickup Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. House 42, Road 7, Dhanmondi, Dhaka"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="preferredDate" className="block font-semibold uppercase text-zinc-300 mb-1">
                    Preferred Service Date <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="preferredDate"
                      type="date"
                      min={todayStr}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                {/* Problem Description with min 20 char counter */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="problemDescription" className="block font-semibold uppercase text-zinc-300">
                      Problem Description <span className="text-rose-400">*</span>
                    </label>
                    <span
                      className={`text-[10px] ${
                        problemDescription.trim().length >= 20 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {problemDescription.trim().length} / 20 characters min
                    </span>
                  </div>
                  <div className="relative">
                    <FileText className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-3" />
                    <textarea
                      id="problemDescription"
                      rows={3}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      placeholder="Describe the issue, malfunction, or strange behavior in detail (at least 20 characters)..."
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#27272A] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || problemDescription.trim().length < 20}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirm & Send Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
