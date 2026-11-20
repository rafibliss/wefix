import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeFix | On-Demand Device & Home Appliance Repair Platform",
  description: "Verified technicians for smartphone, laptop, AC, refrigerator, TV, and appliance repairs in Bangladesh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090B] text-[#FAFAFA]">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}


