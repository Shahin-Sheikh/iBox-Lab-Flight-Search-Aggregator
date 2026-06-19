import Link from "next/link";
import { PlaneIcon } from "./icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <PlaneIcon className="h-4 w-4" />
          </span>
          <span>
            iBox<span className="text-brand-600">Flights</span>
          </span>
        </Link>
        <nav className="text-sm text-slate-500">
          <span className="hidden sm:inline">Flight Search Aggregator</span>
        </nav>
      </div>
    </header>
  );
}
