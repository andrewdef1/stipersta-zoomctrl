import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zoom-STA | Dashboard Controller",
    template: "%s | Zoom-STA",
  },
  description:
    "Dashboard Controller internal untuk mengelola akun Zoom STIPER STA secara terpusat.",
  keywords: ["zoom", "stiper sta", "dashboard", "meeting", "rapat online"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
