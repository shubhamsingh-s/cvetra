"use client";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function Navbar() {
  return (
    <header className="w-full sticky top-0 z-40 bg-transparent backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          TALENT<span className="text-blue-500">VERSE</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm">Dashboard</Link>
          <Link href="/upload" className="text-sm">Upload</Link>
          <Link href="/jobs" className="text-sm">Jobs</Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
