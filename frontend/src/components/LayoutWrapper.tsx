"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Only show sidebar on dashboard routes
  // Also hide it on pure landing page and jobs list if we want full width
  const isDashboard = pathname.startsWith("/dashboard");

  if (!isDashboard) {
    return (
      <div className="w-full">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
