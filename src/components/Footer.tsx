import Link from "next/link";
import { Wrench, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const categories = [
    { name: "Smartphone Repair", query: "Smartphone" },
    { name: "Laptop & PC Servicing", query: "Laptop & PC" },
    { name: "AC Repair & Servicing", query: "AC" },
    { name: "Refrigerator Servicing", query: "Refrigerator" },
    { name: "Television (TV) Repair", query: "TV" },
    { name: "Washing Machine Repair", query: "Washing Machine" },
    { name: "Electrical Wiring & Works", query: "Electrical" },
  ];

  return (
    <footer className="bg-[#0A0A0C] border-t border-[#27272A] text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950">
                <Wrench className="h-4.5 w-4.5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#FAFAFA]">
                We<span className="text-zinc-400">Fix</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              FixMate / WeFix is Bangladesh&apos;s premier on-demand smart device and home appliance repair platform.
              Verified technicians, transparent pricing, and pay only after complete satisfaction.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {/* New X Logo (Twitter Rebrand) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                aria-label="X (formerly Twitter)"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                aria-label="GitHub"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-[#111113] border border-[#27272A] flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Platform</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Browse All Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  How FixMate Works
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-white transition-colors">
                  Become a Technician
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-white transition-colors">
                  Technician / Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Repair Categories</p>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.query}>
                  <Link href={`/services?category=${encodeURIComponent(cat.query)}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Support & Operations</p>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>Level 7, Dhanmondi 27, Dhaka-1209, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>+880 1700-000000 (24/7 Hotline)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>support@wefix.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} WeFix (FixMate). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-300">Privacy Policy</span>
            <span className="hover:text-zinc-300">Terms of Service</span>
            <span className="hover:text-zinc-300">Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
