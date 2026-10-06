import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zoom-STA | Dashboard Controller",
    template: "%s | Zoom-STA",
  },
  description:
    "Dashboard Controller internal untuk mengelola akun Zoom STIPER STA secara terpusat.",
  keywords: ["zoom", "stiper sta", "dashboard", "meeting", "rapat online"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <body
        className="min-h-full bg-zinc-950 font-sans antialiased text-zinc-100"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
