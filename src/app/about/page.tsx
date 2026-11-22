import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Wrench,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  Users,
  Search,
  ArrowRight,
  HelpCircle,
  Award,
  Zap,
  Cpu,
  Tv,
  Smartphone,
  Laptop
} from "lucide-react";

export const metadata = {
  title: "About WeFix | How It Works & Transparent Device Repair",
  description: "Learn how WeFix connects you with certified technicians for transparent, pay-after-completion device and appliance repair.",
};

export default function AboutPage() {
  const steps = [
    {
      step: "01",
      title: "Discover & Filter Services",
      desc: "Browse certified repair listings for smartphones, laptops, TVs, ACs, refrigerators, and more. Filter by category, price, or service mode.",
      icon: Search,
    },
    {
      step: "02",
      title: "Submit a Repair Request",
      desc: "Provide your device issue, preferred service date, contact phone, and service location. Technicians review details before accepting.",
      icon: Clock,
    },
    {
      step: "03",
      title: "Certified Technician Fixes It",
      desc: "Your technician arrives for a Home Visit or handles your Shop Drop-off. Track live status updates from inspection to completion.",
      icon: Wrench,
    },
    {
      step: "04",
      title: "Pay After Inspection & Completion",
      desc: "Only pay when the repair is finished to your satisfaction. Complete transactions securely through Stripe Checkout.",
      icon: CreditCard,
    },
  ];

  const categories = [
    { name: "Smartphone", count: "Screen, Battery, Board Fixes", icon: Smartphone },
    { name: "Laptop & PC", count: "Keyboard, OS, Chip-level fixes", icon: Laptop },
    { name: "Television", count: "Backlight, 4K Display, Motherboards", icon: Tv },
    { name: "AC & Cooling", count: "Gas Refill, Compressor, Servicing", icon: Zap },
    { name: "Home Appliances", count: "Washing Machines & Refrigerators", icon: Cpu },
  ];

  const pillars = [
    {
      title: "Pay-After-Completion",
      desc: "Zero upfront repair fees. You only pay once the technician finishes the job and sets the verified final bill.",
      icon: CreditCard,
    },
    {
      title: "Verified Technicians",
      desc: "Every technician is vetted and approved by administrators before offering services on the platform.",
      icon: ShieldCheck,
    },
    {
      title: "Transparent Tracking",
      desc: "Full visibility into every status change with exact timestamps and technician notes in your customer dashboard.",
      icon: Award,
    },
    {
      title: "Secure Payments",
      desc: "PCI-compliant transactions powered by Stripe. Your sensitive payment details never touch our application servers.",
      icon: CheckCircle2,
    },
  ];

  const faqs = [
    {
      q: "Do I have to pay before the technician inspects my device?",
      a: "No! WeFix operates strictly on a pay-after-completion model. You only pay when the technician marks the repair complete and presents the final bill.",
    },
    {
      q: "How are technician service listings approved?",
      a: "When a technician creates or edits a repair service, it is placed in 'Pending' status. A platform administrator reviews the pricing, service area, and details before making it public.",
    },
    {
      q: "Can I cancel a repair request?",
      a: "Yes. Customers can freely cancel any request while it is in 'Requested' status directly from their dashboard. Once a technician accepts or starts work, contact support or the technician directly.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support all major credit and debit cards (Visa, MasterCard, American Express) processed securely via Stripe Checkout.",
    },
  ];

  return (
    <div className="space-y-20 pb-20 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-[#27272A] text-xs font-semibold text-zinc-300">
          <Wrench className="h-3.5 w-3.5 text-zinc-400" />
          <span>Transparent Device & Appliance Care</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Reliable repairs. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
            Zero upfront surprises.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
          WeFix connects device owners with verified, background-checked repair technicians across your city. Track every step from initial request to completion, and pay securely only after the job is done.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FAFAFA] text-[#09090B] font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Search className="h-4 w-4" />
            <span>Explore Services</span>
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 text-white font-semibold text-sm hover:bg-zinc-700 border border-[#27272A] transition-colors"
          >
            <Users className="h-4 w-4 text-zinc-400" />
            <span>Join as Technician</span>
          </Link>
        </div>
      </div>



      <div className="space-y-10">
        <ScrollReveal variant="up">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              How It Works
            </span>
            <h2 className="text-3xl font-bold text-white">4 Simple Steps to Get Fixed</h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              From first diagnostics to finished repair, our process is designed around customer peace of mind.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.step} variant="up" delay={idx * 60}>
                <div
                  className="relative rounded-2xl bg-[#111113] border border-[#27272A] p-6 space-y-4 hover:border-zinc-700 transition-colors h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-[#27272A] flex items-center justify-center text-zinc-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-zinc-800 font-mono">{step.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Trust Pillars */}
      <ScrollReveal variant="zoom">
        <div className="rounded-3xl bg-gradient-to-b from-[#111113] to-[#09090B] border border-[#27272A] p-8 sm:p-12 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Why Choose WeFix
            </span>
            <h2 className="text-3xl font-bold text-white">Built on Trust, Transparency & Safety</h2>
            <p className="text-sm text-zinc-400">
              We built WeFix to eliminate hidden fees, fake parts, and unaccountable repair shops.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <ScrollReveal key={pillar.title} variant="up" delay={idx * 60}>
                  <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/40 border border-[#27272A]/80 h-full">
                    <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-[#27272A] flex items-center justify-center text-zinc-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{pillar.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Device Categories Covered */}
      <div className="space-y-8">
        <ScrollReveal variant="up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Coverage</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Appliances & Devices We Repair</h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <ScrollReveal key={cat.name} variant="blur" delay={idx * 40}>
                <Link
                  href={`/services?category=${encodeURIComponent(cat.name)}`}
                  className="p-5 rounded-2xl bg-[#111113] border border-[#27272A] hover:border-zinc-700 transition-all space-y-3 group block h-full"
                >
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-[#27272A] flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-zinc-200">{cat.name}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">{cat.count}</p>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="max-w-3xl mx-auto space-y-8">
        <ScrollReveal variant="up">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <HelpCircle className="h-4 w-4" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Got Questions? We Have Answers.</h2>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} variant="up" delay={i * 50}>
              <div className="rounded-2xl bg-[#111113] border border-[#27272A] p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">{faq.q}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Final CTA Card */}
      <ScrollReveal variant="zoom">
        <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-[#111113] to-zinc-900 border border-[#27272A] p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Have a broken device right now?
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Find a certified technician in your neighborhood and get a repair request confirmed in minutes.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FAFAFA] text-[#09090B] font-bold text-sm hover:bg-zinc-200 transition-colors shadow-lg"
          >
            <span>Find a Repair Service</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
