"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Wrench, User, Wrench as ToolIcon, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { signUp, signIn, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "technician">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Field-level error messages
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      const userRole = (session.user as { role?: string })?.role || "customer";
      if (userRole === "admin") router.replace("/dashboard/admin");
      else if (userRole === "technician") router.replace("/dashboard/technician");
      else router.replace("/dashboard/customer");
    }
  }, [session, sessionLoading, router]);

  // Client-side validation function
  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else {
      const hasMinLength = password.length >= 6;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);

      if (!hasMinLength || !hasUppercase || !hasLowercase) {
        newErrors.password =
          "Password must be at least 6 characters with at least one uppercase and one lowercase letter.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await signUp.email({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role, // strictly "customer" or "technician"
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Welcome to WeFix.");
      // Redirect based on selected role
      if (role === "technician") {
        router.push("/dashboard/technician");
      } else {
        router.push("/dashboard/customer");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard/customer",
      });
    } catch {
      toast.error("Google authentication failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950 shadow">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#FAFAFA]">
              We<span className="text-zinc-400">Fix</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="text-sm text-zinc-400">Join WeFix as a customer or certified repair technician</p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Social Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-[#18181B] border border-[#3F3F46] hover:border-zinc-500 hover:bg-[#202024] text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#27272A]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111113] px-3 text-zinc-400 font-medium">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                I want to register as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === "customer"
                      ? "bg-[#18181B] border-white text-white shadow-sm"
                      : "bg-[#09090B] border-[#27272A] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <User className="h-4 w-4 text-zinc-300" />
                    {role === "customer" && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span className="text-sm font-semibold text-white">Customer</span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">Book repairs & pay online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("technician")}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === "technician"
                      ? "bg-[#18181B] border-white text-white shadow-sm"
                      : "bg-[#09090B] border-[#27272A] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <ToolIcon className="h-4 w-4 text-zinc-300" />
                    {role === "technician" && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span className="text-sm font-semibold text-white">Technician</span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">List services & accept jobs</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Tanvir Hasan"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#09090B] border text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.name ? "border-rose-500 focus:border-rose-500" : "border-[#27272A] focus:border-zinc-400"
                }`}
              />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#09090B] border text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.email ? "border-rose-500 focus:border-rose-500" : "border-[#27272A] focus:border-zinc-400"
                }`}
              />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="At least 6 characters (Aa-Zz)"
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#09090B] border text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                    errors.password ? "border-rose-500 focus:border-rose-500" : "border-[#27272A] focus:border-zinc-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-rose-400 mt-1">{errors.password}</p>
              ) : (
                <p className="text-[11px] text-zinc-400 mt-1">Must be ≥ 6 chars, with uppercase and lowercase letters.</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-semibold text-sm transition-colors cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-6 text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-white font-medium hover:underline">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
