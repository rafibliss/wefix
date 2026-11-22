"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Wrench,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  Loader2,
  CalendarCheck,
  CreditCard,
  Users,
  CheckSquare,
  DollarSign
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";

interface UserInfo {
  name?: string;
  email?: string;
  role?: string;
  image?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = session?.user as UserInfo | undefined;
  const role = user?.role || "customer";

  // Enforce Route Protection
  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      // Role isolation: prevent cross-role dashboard penetration
      if (pathname.startsWith("/dashboard/technician") && role !== "technician") {
        router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
      } else if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        router.replace(role === "technician" ? "/dashboard/technician" : "/dashboard/customer");
      } else if (pathname.startsWith("/dashboard/customer") && role !== "customer") {
        router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard/technician");
      }
    }
  }, [isPending, session, role, pathname, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Define sidebar navigation items based on role
  let navItems = [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "My Bookings", href: "/dashboard/customer/bookings", icon: CalendarCheck },
    { label: "Payment History", href: "/dashboard/customer/payments", icon: CreditCard },
  ];

  if (role === "technician") {
    navItems = [
      { label: "Overview", href: "/dashboard/technician", icon: LayoutDashboard },
      { label: "Add Service", href: "/dashboard/technician/add-service", icon: PlusCircle },
      { label: "My Services", href: "/dashboard/technician/my-services", icon: Wrench },
      { label: "Manage Requests", href: "/dashboard/technician/requests", icon: ClipboardList },
    ];
  } else if (role === "admin") {
    navItems = [
      { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
      { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
      { label: "Service Approval", href: "/dashboard/admin/services", icon: CheckSquare },
      { label: "All Bookings", href: "/dashboard/admin/bookings", icon: ClipboardList },
      { label: "Transactions", href: "/dashboard/admin/transactions", icon: DollarSign },
    ];
  }

  const roleBadgeColors: Record<string, string> = {
    technician: "bg-amber-950/40 text-amber-300 border-amber-800",
    admin: "bg-purple-950/40 text-purple-300 border-purple-800",
    customer: "bg-blue-950/40 text-blue-300 border-blue-800",
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#111113] border-r border-[#27272A] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Sidebar Header Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#27272A]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 shadow">
                <Wrench className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight">
                  We<span className="text-zinc-400">Fix</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 -mt-1">
                  {role} Hub
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#18181B]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Preview Box */}
          <div className="p-4 mx-3 my-4 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center gap-3">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "User"}
                className="h-10 w-10 rounded-lg object-cover border border-zinc-700 shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-sm border border-zinc-700 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || "User"}</p>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border mt-1 ${
                  roleBadgeColors[role] || roleBadgeColors.customer
                }`}
              >
                <Shield className="h-2.5 w-2.5 mr-1" />
                {role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-white text-zinc-950 font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-[#18181B]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Shared Profile Settings Link */}
            <Link
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                pathname === "/dashboard/profile"
                  ? "bg-white text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-[#18181B]"
              }`}
            >
              <User className="h-4 w-4 shrink-0" />
              <span>Profile Settings</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#27272A] space-y-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#18181B] hover:bg-[#202024] border border-[#27272A] text-xs font-medium text-zinc-300 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Visit WeFix Home</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-[#111113] border border-[#27272A] text-zinc-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold text-white capitalize">
              {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>

            <div className="h-4 w-px bg-[#27272A] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[10px] text-zinc-400 truncate max-w-[150px]">{user?.email}</p>
              </div>
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-8 w-8 rounded-lg object-cover border border-zinc-700"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs border border-zinc-700">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
