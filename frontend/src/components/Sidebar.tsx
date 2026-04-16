"use client";
import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  return (
    <aside className={`transition-all ${open ? 'w-64' : 'w-16'} bg-transparent border-r border-white/5 p-4` }>
      <button onClick={() => setOpen(!open)} className="mb-4 text-xs px-2 py-1 bg-slate-800 rounded">{open ? 'Collapse' : 'Open'}</button>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="text-sm">Dashboard</Link>
        <Link href="/dashboard/recruiter" className="text-sm">Recruiter</Link>
        <Link href="/jobs" className="text-sm">Jobs</Link>
        <Link href="/dashboard/ats" className="text-sm">ATS Score</Link>
      </nav>
    </aside>
  );
}
