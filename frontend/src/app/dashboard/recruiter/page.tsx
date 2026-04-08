"use client";

import { motion } from "framer-motion";
import {
    Users,
    Search,
    BarChart3,
    Settings,
    LogOut,
    LayoutDashboard,
    Briefcase,
    Star
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/src/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

export default function RecruiterDashboard() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <ModeToggle />

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-20 md:w-64 glass border-r border-white/10 z-50 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl hidden md:block">Recruiter Hub</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {[
                        { icon: LayoutDashboard, label: "Overview", active: true },
                        { icon: Search, label: "Search Talent" },
                        { icon: Users, label: "Applicants" },
                        { icon: Star, label: "Favorites" },
                        { icon: BarChart3, label: "Analytics" },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                item.active ? "bg-slate-800 text-white shadow-lg shadow-black/20" : "hover:bg-foreground/5 text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium hidden md:block">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium hidden md:block">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-20 md:pl-64 p-6 md:p-12">
                <header className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-extrabold mb-2"
                    >
                        Find Your Next <span className="text-slate-400">Star</span>
                    </motion.h1>
                    <p className="text-muted-foreground">Strategic talent intelligence for high-growth teams.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Active Jobs", value: "12", icon: Briefcase, color: "text-blue-500" },
                        { label: "Total Candidates", value: "840", icon: Users, color: "text-purple-500" },
                        { label: "AI Matches", value: "48", icon: Star, color: "text-yellow-500" },
                        { label: "Growth", value: "+12%", icon: BarChart3, color: "text-green-500" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-6 rounded-3xl border border-white/10"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase">{stat.label}</span>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div className="text-3xl font-black">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="glass rounded-[2rem] p-12 border border-white/10 border-dashed text-center">
                    <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-2">Initialize Talent Search</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">Start by creating a job description or uploading a target profile to find matching candidates.</p>
                </div>
            </main>
        </div>
    );
}
