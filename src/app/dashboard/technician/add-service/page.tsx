"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Wrench,
  DollarSign,
  Clock,
  MapPin,
  Camera,
  Loader2,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/imgbb";
import { toast } from "sonner";

const CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical"
];

const SERVICE_MODES = ["Home Visit", "Shop Drop-off"];

export default function AddServicePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Smartphone");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("1-2 hours");
  const [serviceMode, setServiceMode] = useState("Home Visit");
  const [serviceArea, setServiceArea] = useState("");
  const [image, setImage] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadToImgBB(file);
      setImage(url);
      toast.success("Service banner uploaded to ImgBB!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please upload a service banner image via the file upload button.");
      return;
    }

    const priceNum = Number(basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid positive base price.");
      return;
    }

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

      const res = await fetch(`${apiUrl}/api/services`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          basePrice: priceNum,
          estimatedDuration: estimatedDuration.trim(),
          serviceMode,
          serviceArea: serviceArea.trim(),
          image,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create service");
        setSubmitting(false);
        return;
      }

      toast.success("Service submitted! Waiting for Admin approval.");
      router.push("/dashboard/technician/my-services");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit service";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/dashboard/technician/my-services"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to My Services</span>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Add New Repair Service
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Create a new service listing. Once submitted, it will be reviewed and approved by an administrator.
        </p>
      </div>

      <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Read-Only Technician Info */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#09090B] border border-[#27272A]">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">Technician Name</span>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{session?.user?.name || "Technician"}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">Technician Email</span>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{session?.user?.email || ""}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Service Title */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block font-semibold uppercase text-zinc-300 mb-1.5">
                Service Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. iPhone 13 Screen Replacement with TrueTone restoration"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block font-semibold uppercase text-zinc-300 mb-1.5">
                Repair Category <span className="text-rose-400">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Mode */}
            <div>
              <label htmlFor="serviceMode" className="block font-semibold uppercase text-zinc-300 mb-1.5">
                Service Mode <span className="text-rose-400">*</span>
              </label>
              <select
                id="serviceMode"
                value={serviceMode}
                onChange={(e) => setServiceMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400 cursor-pointer"
              >
                {SERVICE_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Price */}
            <div>
              <label htmlFor="basePrice" className="block font-semibold uppercase text-zinc-300 mb-1.5">
                Base Price (USD) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="basePrice"
                  type="number"
                  min="1"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 45"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label htmlFor="estimatedDuration" className="block font-semibold uppercase text-zinc-300 mb-1.5">
                Estimated Duration <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Clock className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="estimatedDuration"
                  type="text"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g. 2-3 hours or 1 day"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Service Coverage Area */}
            <div className="sm:col-span-2">
              <label htmlFor="serviceArea" className="block font-semibold uppercase text-zinc-300 mb-1.5">
                Service Area Covered <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="serviceArea"
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Mirpur, Dhanmondi, or All Dhaka"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Service Image File Upload via ImgBB */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block font-semibold uppercase text-zinc-300">
                Service Banner Image (ImgBB File Upload) <span className="text-rose-400">*</span>
              </label>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#09090B] border border-[#27272A]">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt="Service Preview"
                    className="h-20 w-32 rounded-lg object-cover border border-zinc-700 shrink-0"
                  />
                ) : (
                  <div className="h-20 w-32 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                    <Wrench className="h-6 w-6" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <p className="text-xs text-zinc-300">Upload a high-resolution banner photo</p>
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#202024] border border-[#3F3F46] text-xs font-semibold text-white transition-colors cursor-pointer">
                    <Camera className="h-3.5 w-3.5" />
                    <span>{uploadingImage ? "Uploading to ImgBB..." : "Select File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {image && <p className="text-[10px] text-emerald-400 font-medium">✓ Image uploaded</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block font-semibold uppercase text-zinc-300 mb-1.5">
                Service Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is included in this repair service, warranty, parts used, etc..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#27272A] flex justify-end gap-3">
            <Link
              href="/dashboard/technician/my-services"
              className="px-4 py-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Create Service</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
