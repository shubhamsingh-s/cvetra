"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  UserSearch, 
  Briefcase, 
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Recruiter", href: "/dashboard/recruiter", icon: UserSearch },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "ATS Score", href: "/dashboard/ats", icon: BarChart3 },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-[calc(100vh-100px)] glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl group"
    >
      <div className="flex flex-col flex-1 p-4 gap-4">
        <div className="flex items-center justify-between mb-2">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-semibold text-xs uppercase tracking-widest text-muted-foreground px-2"
              >
                Navigation
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.filter(item => {
            if (item.name === "Recruiter") return user?.role === "recruiter";
            return true;
          }).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group/item",
                    isActive 
                      ? "bg-blue-500/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className={cn(
                    "min-w-[24px] flex items-center justify-center transition-colors",
                    isActive ? "text-blue-400" : "group-hover/item:text-foreground"
                  )}>
                    <Icon size={22} strokeWidth={1.5} />
                  </div>

                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!isOpen && (
                    <div className="absolute left-16 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10">
                      {item.name}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5 space-y-2">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-blue-500/5 rounded-2xl p-3 mb-2 border border-blue-500/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Active</span>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Neural Matcher v1.2</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold group/logout"
        >
          <div className="min-w-[24px] flex items-center justify-center">
            <LogOut size={20} className="group-hover/logout:-translate-x-1 transition-transform" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-full py-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all group/btn"
        >
          {isOpen ? (
            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <ChevronLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
              <span className="text-xs">Collapse</span>
            </div>
          ) : (
            <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          )}
        </button>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent opacity-50" />
    </motion.aside>
  );
}

