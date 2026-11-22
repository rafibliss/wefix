"use client";

import { useState } from "react";
import { User, Phone, MapPin, FileText, Camera, Loader2, CheckCircle2, Shield, Mail } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/imgbb";
import { toast } from "sonner";

interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  image?: string;
  phone?: string;
  area?: string;
  bio?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as UserProfile | undefined;

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [area, setArea] = useState(user?.area || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [image, setImage] = useState(user?.image || "");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle ImgBB Profile Photo Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadToImgBB(file);
      setImage(uploadedUrl);
      toast.success("Profile photo uploaded to ImgBB successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          area: area.trim(),
          bio: bio.trim(),
          image: image.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update profile");
        setSaving(false);
        return;
      }

      toast.success("Profile updated successfully!");
      // Trigger a soft reload to rehydrate session with new name and avatar
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      toast.error(msg);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Update your public profile, contact info, service coverage, and avatar.
        </p>
      </div>

      <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#27272A]">
          <div className="relative group">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Profile Avatar"
                className="h-24 w-24 rounded-2xl object-cover border-2 border-zinc-700 shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-3xl text-zinc-400">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}

            {uploadingImage && (
              <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white">Profile Picture</h3>
            <p className="text-xs text-zinc-400">
              Upload a clear photo via ImgBB. Recommended: Square PNG or JPG.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181B] hover:bg-[#222226] border border-[#3F3F46] text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm">
              <Camera className="h-4 w-4" />
              <span>{uploadingImage ? "Uploading to ImgBB..." : "Change Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Read-Only Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-zinc-400 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Read-Only Role */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Account Role (Fixed)
              </label>
              <div className="relative">
                <Shield className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={user?.role?.toUpperCase() || "CUSTOMER"}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-zinc-400 font-bold uppercase cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Editable Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +880 1712-345678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Coverage Area / City */}
            <div className="sm:col-span-2">
              <label htmlFor="area" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                City / Coverage Area
              </label>
              <div className="relative">
                <MapPin className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="area"
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Mirpur, Dhaka or Dhanmondi, Dhaka"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Bio / Skills Description */}
            <div className="sm:col-span-2">
              <label htmlFor="bio" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Bio / Skills & Experience
              </label>
              <div className="relative">
                <FileText className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3" />
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your repair certifications, years of experience, or personal bio..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#27272A] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
