"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Wrench,
  Search,
  Filter,
  ArrowRight,
  User,
  Clock,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Loader2,
  AlertCircle
} from "lucide-react";

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
  technicianName: string;
  technicianEmail: string;
  approvalStatus: string;
  isAvailable: boolean;
  createdAt: string;
}

const CATEGORIES = [
  "All",
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical"
];

const SERVICE_MODES = ["All", "Home Visit", "Shop Drop-off"];

function BrowseServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive active filters directly from searchParams (single source of truth)
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "All";
  const currentMode = searchParams.get("serviceMode") || "All";
  const currentSort = searchParams.get("sort") || "newest";

  // Local state for the search input field with render-time sync
  const [prevSearch, setPrevSearch] = useState(currentSearch);
  const [searchInput, setSearchInput] = useState(currentSearch);

  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  const [services, setServices] = useState<Service[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch from backend whenever URL filters change (Server-side MongoDB query - Challenge 1)
  useEffect(() => {
    let ignore = false;
    async function fetchServices() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentSearch.trim()) params.set("search", currentSearch.trim());
        if (currentCategory && currentCategory !== "All") params.set("category", currentCategory);
        if (currentMode && currentMode !== "All") params.set("serviceMode", currentMode);
        if (currentSort && currentSort !== "newest") params.set("sort", currentSort);

        const queryString = params.toString();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const fetchUrl = `${apiUrl}/api/services${queryString ? `?${queryString}` : ""}`;

        const res = await fetch(fetchUrl);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setServices(data.services || []);
            setTotalCount(data.total || 0);
          }
        } else {
          if (!ignore) {
            setServices([]);
            setTotalCount(0);
          }
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        if (!ignore) {
          setServices([]);
          setTotalCount(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchServices();
    return () => {
      ignore = true;
    };
  }, [currentSearch, currentCategory, currentMode, currentSort]);

  const updateUrlParams = (newParams: {
    search?: string;
    category?: string;
    serviceMode?: string;
    sort?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.search !== undefined) {
      if (newParams.search.trim()) params.set("search", newParams.search.trim());
      else params.delete("search");
    }

    if (newParams.category !== undefined) {
      if (newParams.category && newParams.category !== "All") params.set("category", newParams.category);
      else params.delete("category");
    }

    if (newParams.serviceMode !== undefined) {
      if (newParams.serviceMode && newParams.serviceMode !== "All") params.set("serviceMode", newParams.serviceMode);
      else params.delete("serviceMode");
    }

    if (newParams.sort !== undefined) {
      if (newParams.sort && newParams.sort !== "newest") params.set("sort", newParams.sort);
      else params.delete("sort");
    }

    const qs = params.toString();
    router.push(qs ? `/services?${qs}` : "/services");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    router.push("/services");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs font-semibold text-zinc-300">
          <Filter className="h-3.5 w-3.5 text-zinc-300" />
          <span>Verified Repair Specialists</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Browse Repair Services
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Search and filter verified repair services across Bangladesh. All sorting and filtering are verified server-side.
        </p>
      </div>

      {/* Control Panel: Search & Filters (Challenge 1) */}
      <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-5 space-y-5 shadow-2xl">
        {/* Row 1: Search bar & Sort dropdown */}
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, device model, or area..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-semibold text-sm transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <SlidersHorizontal className="h-4 w-4 text-zinc-400 shrink-0 hidden sm:block" />
            <select
              value={currentSort}
              onChange={(e) => updateUrlParams({ sort: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-sm text-white focus:outline-none focus:border-zinc-400 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Chips & Service Mode Selector */}
        <div className="space-y-3 pt-3 border-t border-[#27272A]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1">
                Category:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateUrlParams({ category: cat })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentCategory === cat
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "bg-[#18181B] text-zinc-400 border border-[#27272A] hover:text-white hover:border-zinc-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Service Mode Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1">
                Mode:
              </span>
              {SERVICE_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateUrlParams({ serviceMode: mode })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentMode === mode
                      ? "bg-zinc-200 text-zinc-950 font-bold"
                      : "bg-[#18181B] text-zinc-400 border border-[#27272A] hover:text-white hover:border-zinc-500"
                  }`}
                >
                  {mode}
                </button>
              ))}

              {/* Reset Filters button */}
              {(currentSearch || currentCategory !== "All" || currentMode !== "All" || currentSort !== "newest") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 text-rose-300 border border-rose-900/50 hover:bg-rose-950/60 text-xs font-medium transition-colors ml-2 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <p>
          Showing <span className="font-semibold text-white">{services.length}</span> of{" "}
          <span className="font-semibold text-white">{totalCount}</span> approved services
        </p>
        {(currentCategory !== "All" || currentMode !== "All" || currentSearch) && (
          <span className="text-zinc-500">Filters applied</span>
        )}
      </div>

      {/* Services Grid (Equal Height / Equal Width) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-[380px] rounded-2xl bg-[#111113] border border-[#27272A] p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="h-44 bg-zinc-800 rounded-xl mb-4" />
              <div className="space-y-3 flex-1">
                <div className="h-4 w-20 bg-zinc-800 rounded" />
                <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                <div className="h-4 w-1/2 bg-zinc-800 rounded" />
              </div>
              <div className="h-10 bg-zinc-800 rounded-lg mt-4" />
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <ScrollReveal
              key={service._id}
              variant="up"
              delay={Math.min((idx % 4) * 50, 180)}
              className="h-full"
            >
              <div
                className="group flex flex-col h-full bg-[#111113] border border-[#27272A] hover:border-zinc-500 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg"
              >
              {/* Image banner */}
              <div className="relative h-44 w-full bg-zinc-900 overflow-hidden shrink-0">
                {service.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-600 bg-zinc-900">
                    <Wrench className="h-10 w-10" />
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#09090B]/90 backdrop-blur-md text-white border border-[#27272A]">
                    {service.category}
                  </span>
                </div>

                {/* Service mode badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-800/60">
                    {service.serviceMode}
                  </span>
                </div>
              </div>

              {/* Service Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-base text-white group-hover:text-zinc-200 transition-colors line-clamp-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#27272A] space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-zinc-300" />
                      <span className="truncate max-w-[120px] text-zinc-300 font-medium">
                        {service.technicianName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      <span>{service.estimatedDuration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 truncate max-w-[140px]">
                      <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{service.serviceArea}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Starts at</span>
                      <p className="text-base font-bold text-white leading-none mt-0.5">
                        ${service.basePrice}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/services/${service._id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-semibold text-xs transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
          ))}
        </div>
      ) : (
        /* Friendly Empty State with Reset Filters */
        <div className="rounded-2xl bg-[#111113] border border-[#27272A] p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Matching Services Found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            We couldn&apos;t find any approved services matching your active filters. Try adjusting your search keyword or clearing the filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FAFAFA] text-[#09090B] font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
        </div>
      }
    >
      <BrowseServicesContent />
    </Suspense>
  );
}
