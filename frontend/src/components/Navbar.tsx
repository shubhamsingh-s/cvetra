"use client";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/context/auth-context";

  const { user } = useAuth();
  
  return (
    <header className="w-full sticky top-0 z-40 bg-transparent backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
          TALENT<span className="text-blue-500">VERSE</span>
        </Link>
        <nav className="flex items-center gap-6">
          {!user ? (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:text-blue-500 transition-colors">Login</Link>
              <Link href="/register" className="text-sm font-medium hover:text-blue-500 transition-colors">Start Strategy</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1 bg-foreground/5 rounded-full border border-white/5">
                {user.role} mode
              </span>
            </div>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
