"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Wrench, Menu, X, User, LayoutDashboard, LogOut, Shield, ChevronDown } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user as {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    image?: string;
  } | undefined;

  const role = user?.role || "customer";

  const getDashboardHref = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "technician") return "/dashboard/technician";
    return "/dashboard/customer";
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push("/sign-in");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "How It Works / About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 shadow-sm transition-transform group-hover:scale-105">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#FAFAFA]">
                We<span className="text-zinc-400">Fix</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-semibold -mt-1">
                Repair Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors py-1 ${
                    isActive
                      ? "text-[#FAFAFA] font-semibold border-b-2 border-white"
                      : "text-zinc-400 hover:text-white font-medium"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isPending ? (
              <div className="h-9 w-24 bg-zinc-800/60 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-3 rounded-lg bg-[#111113] border border-[#27272A] hover:border-zinc-600 transition-colors cursor-pointer"
                  aria-expanded={dropdownOpen}
                >
                  <div className="text-left text-xs leading-tight">
                    <p className="font-semibold text-zinc-100 max-w-[120px] truncate">{user.name || "User"}</p>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      {role}
                    </span>
                  </div>
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || "Avatar"}
                      className="h-8 w-8 rounded-md object-cover border border-zinc-700"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs border border-zinc-700">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </button>

                {/* Dropdown Card */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#111113] border border-[#27272A] rounded-xl shadow-2xl p-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-[#27272A] mb-1">
                      <p className="font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase border ${
                            role === "admin"
                              ? "bg-purple-950/40 text-purple-300 border-purple-800"
                              : role === "technician"
                              ? "bg-amber-950/40 text-amber-300 border-amber-800"
                              : "bg-blue-950/40 text-blue-300 border-blue-800"
                          }`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {role}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={getDashboardHref()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#18181B] transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#18181B] transition-colors"
                    >
                      <User className="h-4 w-4 text-zinc-400" />
                      Update Profile
                    </Link>

                    <div className="border-t border-[#27272A] my-1" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-sm font-medium text-zinc-200 bg-[#18181B] border border-[#27272A] hover:border-zinc-500 hover:text-white rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 text-sm font-semibold text-[#09090B] bg-[#FAFAFA] hover:bg-zinc-200 rounded-lg transition-colors shadow-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#111113] border border-[#27272A] text-zinc-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#27272A] bg-[#09090B] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-[#18181B] text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-[#111113]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#27272A] pt-4">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-[#111113] border border-[#27272A] rounded-lg">
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                  <p className="text-[11px] font-bold uppercase text-zinc-300 mt-1">Role: {role}</p>
                </div>
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-[#18181B] border border-[#27272A] rounded-lg"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-zinc-300 bg-[#111113] border border-[#27272A] rounded-lg"
                >
                  Update Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-rose-400 bg-rose-950/20 border border-rose-900/50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-medium text-zinc-200 bg-[#18181B] border border-[#27272A] rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-semibold text-[#09090B] bg-[#FAFAFA] rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
