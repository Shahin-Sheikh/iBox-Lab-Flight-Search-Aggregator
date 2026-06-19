import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "iBox Flights — Flight Search Aggregator",
  description: "Search, compare and book flights across airlines.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-white py-6">
              <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400">
                Demo project · Mock data · Built for the iBox Lab take-home exercise
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
