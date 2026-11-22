"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface AppUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "customer" | "technician" | "admin";
  phone?: string;
  area?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loggedInEmail = session?.user?.email;

  useEffect(() => {
    let ignore = false;
    async function loadUsers() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

        const headers: Record<string, string> = {};
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

        const res = await fetch(`${apiUrl}/api/admin/users`, {
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore) setUsers(data.users || []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (session?.user) {
      loadUsers();
    }
    return () => {
      ignore = true;
    };
  }, [session]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const sessionToken = (session as unknown as { session?: { token?: string } })?.session?.token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

      const res = await fetch(`${apiUrl}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update role");
        return;
      }

      toast.success(data.message || "Role updated successfully");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole as AppUser["role"] } : u))
      );
    } catch {
      toast.error("Error updating user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    admin: "bg-purple-950/40 text-purple-300 border-purple-800",
    technician: "bg-amber-950/40 text-amber-300 border-amber-800",
    customer: "bg-blue-950/40 text-blue-300 border-blue-800",
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage user accounts, assign roles, and review registered members.
          </p>
        </div>


        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#111113] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
        </div>
      </div>


      <div className="bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181B] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Current Role</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {filteredUsers.map((user) => {
                const isSelf = user.email === loggedInEmail;
                return (
                  <tr key={user._id} className="hover:bg-[#18181B]/40 transition-colors">

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-9 w-9 rounded-lg object-cover border border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs border border-zinc-700 shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {user.name}
                            {isSelf && (
                              <span className="text-[10px] text-zinc-400 font-normal">(You)</span>
                            )}
                          </p>
                          <span className="text-[10px] text-zinc-400">{user.area || "Dhaka"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px]">{user.email}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${roleColors[user.role] || roleColors.customer
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isSelf ? (
                        <span className="text-[11px] text-zinc-500 italic">Self-protected</span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <select
                            value={user.role}
                            disabled={updatingId === user._id}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white focus:outline-none focus:border-zinc-400 cursor-pointer disabled:opacity-50"
                          >
                            <option value="customer">Customer</option>
                            <option value="technician">Technician</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updatingId === user._id && (
                            <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
