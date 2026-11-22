"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Wrench,
  Search,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Clock,
  Sparkles,
  Smartphone,
  Laptop,
  Wind,
  Box,
  Tv,
  Disc,
  Zap,
  MapPin,
  User,
  CheckCircle2,
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

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedServices() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/services?limit=6&sort=newest`);
        if (res.ok) {
          const data = await res.json();
          if (data.services) {
            setServices(data.services);
          }
        }
      } catch (err) {
        console.error("Error fetching featured services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedServices();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/services");
    }
  };

  const categories = [
    { name: "Smartphone", count: "Screen, battery, motherboard", icon: Smartphone },
    { name: "Laptop & PC", count: "OS, hardware, cleaning", icon: Laptop },
    { name: "AC", count: "Gas refill, servicing, cooling", icon: Wind },
    { name: "Refrigerator", count: "Compressor, gas, cooling leak", icon: Box },
    { name: "TV", count: "Display panel, LED backlights", icon: Tv },
    { name: "Washing Machine", count: "Motor, drum, drainage", icon: Disc },
    { name: "Electrical", count: "Wiring, circuit breakers, fixes", icon: Zap },
  ];

  const steps = [
    {
      num: "01",
      title: "Find a Service",
      description: "Explore verified technician profiles, review starting prices, and select home visit or shop drop-off.",
      icon: Search,
    },
    {
      num: "02",
      title: "Send a Request",
      description: "Detail your device's malfunction, attach preferred repair date, and confirm your location.",
      icon: Clock,
    },
    {
      num: "03",
      title: "Technician Fixes It",
      description: "Follow real-time status transitions: Requested → Accepted → In Progress → Completed.",
      icon: Wrench,
    },
    {
      num: "04",
      title: "Pay After Completion",
      description: "Inspect the completed job with zero upfront risk, then settle the final invoice securely online.",
      icon: CreditCard,
    },
  ];

  const stats = [
    { label: "Verified Technicians", value: "100%", sub: "Strict identity & skill checks" },
    { label: "Upfront Pricing", value: "$0", sub: "Pay only after job is delivered" },
    { label: "Service Categories", value: "7+", sub: "Devices & appliances covered" },
    { label: "Platform Guarantee", value: "Protected", sub: "Safe escrow & Stripe checkout" },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* ==========================================
          SECTION 1: HERO / BANNER SECTION
      ========================================== */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-12 border-b border-[#27272A]/80">
        {/* Subtle background radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-zinc-800/20 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-semibold text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-zinc-100" />
                <span>On-Demand Device & Appliance Repair Service</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#FAFAFA] leading-[1.1]">
                Broken Device? <br />
                <span className="text-zinc-400">Get It Fixed by Verified Technicians.</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
                WeFix connects you directly with trusted repair specialists for smartphones, laptops, ACs, and home appliances.
                Track repair progress live—pay securely online only after your device is completely fixed.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl">
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-1.5 rounded-xl bg-[#111113] border border-[#27272A] shadow-2xl">
                  <div className="relative flex-1 flex items-center">
                    <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search repair services (e.g. iPhone, AC, Laptop)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-semibold text-sm transition-colors cursor-pointer shrink-0 shadow-sm"
                  >
                    <span>Find Services</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Quick Trust Highlights */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-zinc-300" />
                  <span>Vetted Technicians</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-300" />
                  <span>Live Status Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-zinc-300" />
                  <span>Pay Only After Completion</span>
                </div>
              </div>
            </div>

            {/* Right Graphic Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-2xl bg-[#111113] border border-[#27272A] p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-white">WeFix Service Pipeline</h2>
                        <p className="text-xs text-zinc-400">Transparent & Secure Process</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      Zero Upfront Fee
                    </span>
                  </div>

                  {/* Step visual item 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                    <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      1
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-zinc-200">Customer Submits Request</p>
                      <p className="text-zinc-400 mt-0.5">Device fault details, location, and preferred date are recorded.</p>
                    </div>
                  </div>

                  {/* Step visual item 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                    <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      2
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-zinc-200">Technician Executes Work</p>
                      <p className="text-zinc-400 mt-0.5">Job status updates from Accepted to In Progress to Completed.</p>
                    </div>
                  </div>

                  {/* Step visual item 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#18181B] border border-zinc-700">
                    <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-black shrink-0">
                      3
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-white">Online Stripe Payment</p>
                      <p className="text-zinc-400 mt-0.5">Customer verifies the repair before paying the final quotation.</p>
                    </div>
                  </div>

                  <Link
                    href="/services"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#18181B] hover:bg-[#222226] border border-[#3F3F46] text-xs font-semibold text-white transition-colors"
                  >
                    <span>Browse All Available Technicians</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 2: DYNAMIC FEATURED SERVICES
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs font-medium text-zinc-300 mb-2">
                <span>Featured Repairs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Latest Verified Repair Services
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Top repair solutions offered by certified local technicians
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-zinc-300 transition-colors"
            >
              <span>View All Services</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <ScrollReveal key={service._id} variant="up" delay={idx * 60}>
                <div
                  className="group flex flex-col h-full bg-[#111113] border border-[#27272A] hover:border-zinc-500 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg"
                >
                  {/* Service Card Image Banner */}
                  <div className="relative h-48 w-full bg-zinc-900 overflow-hidden shrink-0">
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

                    {/* Badges on Image */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#09090B]/90 backdrop-blur-md text-white border border-[#27272A]">
                        {service.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-800/60">
                        {service.serviceMode}
                      </span>
                    </div>
                  </div>

                  {/* Service Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-white group-hover:text-zinc-200 transition-colors line-clamp-1">
                        {service.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Technician & Area info */}
                    <div className="pt-2 border-t border-[#27272A] space-y-2 text-xs text-zinc-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-zinc-300" />
                          <span className="truncate max-w-[140px] text-zinc-300 font-medium">
                            {service.technicianName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{service.estimatedDuration}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 truncate max-w-[150px]">
                          <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{service.serviceArea}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Starts at</span>
                          <p className="text-base font-bold text-white leading-none mt-0.5">
                            ${service.basePrice}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <Link
                      href={`/services/${service._id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-semibold text-sm transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          /* Empty State when no approved services are seeded yet */
          <div className="rounded-2xl bg-[#111113] border border-[#27272A] p-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">No Services Available Yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Technicians are currently creating new repair listings. Check back shortly or browse all categories.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FAFAFA] text-[#09090B] font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              <span>Explore Services Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* ==========================================
          SECTION 3: HOW WEFIX WORKS (4-STEP FLOW)
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="up">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs font-medium text-zinc-300">
              <span>Simple 4-Step Process</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">How WeFix Works</h2>
            <p className="text-sm text-zinc-400">
              A secure, transparent repair booking flow designed around customer peace of mind
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.num} variant="zoom" delay={idx * 70}>
                <div
                  className="relative bg-[#111113] border border-[#27272A] rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-500 transition-colors shadow-lg h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-11 w-11 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-black text-zinc-700 tracking-wider font-mono">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#27272A]/60 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Step {step.num} Verified</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          SECTION 4: POPULAR CATEGORIES & WHY CHOOSE US
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Categories Grid */}
        <div>
          <ScrollReveal variant="up">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Popular Repair Categories
              </h2>
              <p className="text-sm text-zinc-400">
                Select an appliance or device to immediately filter certified specialists
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <ScrollReveal key={cat.name} variant="blur" delay={idx * 40}>
                  <Link
                    href={`/services?category=${encodeURIComponent(cat.name)}`}
                    className="group flex flex-col items-start p-5 rounded-2xl bg-[#111113] border border-[#27272A] hover:border-white transition-all shadow-md h-full"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{cat.count}</p>
                  </Link>
                </ScrollReveal>
              );
            })}

            {/* "Browse All" Card to complete grid nicely */}
            <ScrollReveal variant="blur" delay={categories.length * 40}>
              <Link
                href="/services"
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#18181B] border border-[#3F3F46] hover:border-white transition-all text-center group h-full"
              >
                <div className="h-10 w-10 rounded-xl bg-white text-black flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-white">Explore All Services</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Directory & Filters</span>
              </Link>
            </ScrollReveal>
          </div>
        </div>

        {/* Why Choose WeFix Stats / Trust Banner */}
        <ScrollReveal variant="up">
          <div className="rounded-2xl bg-[#111113] border border-[#27272A] p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#27272A]">
              {stats.map((s, idx) => (
                <div key={s.label} className={idx !== 0 ? "pt-6 md:pt-0 md:pl-6" : ""}>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{s.value}</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1">{s.label}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
