"use client";
import Link from "next/link";

export default function RecruiterDashboard() {
  return (
    <section className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <Link href="/jobs/new" className="px-3 py-2 bg-blue-600 text-white rounded">Post Job</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-4 rounded">Shortlisted candidates</div>
        <div className="glass p-4 rounded">Recent activity</div>
      </div>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";
import {
    Users,
    BarChart3,
    LogOut,
    LayoutDashboard,
    Briefcase,
    Star,
    FileSearch,
    ClipboardList,
    ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

export default function RecruiterDashboard() {
    const { logout, user } = useAuth();

    const quickActions = [
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            description: "See hiring metrics and active hiring activity.",
            href: "/dashboard/recruiter",
            active: true,
        },
        {
            icon: Briefcase,
            label: "Create Job",
            description: "Open a new role and define the candidate profile.",
            href: "/dashboard/recruiter/postjob",
        },
        {
            icon: FileSearch,
            label: "Check Resume",
            description: "Upload and screen resumes against your hiring needs.",
            href: "/dashboard/recruiter/bulk",
        },
        {
            icon: BarChart3,
            label: "Resume Report",
            description: "Review resume quality, fit, and fraud signals.",
            href: "/dashboard/recruiter/fraud",
        },
        {
            icon: ClipboardList,
            label: "Applied Candidate List",
            description: "Track applicants through your recruiting pipeline.",
            href: "/dashboard/recruiter/pipeline",
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <ModeToggle />

            <aside className="fixed left-0 top-0 h-full w-20 md:w-64 glass border-r border-white/10 z-50 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl hidden md:block">Recruiter Hub</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {quickActions.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                item.active ? "bg-slate-800 text-white shadow-lg shadow-black/20" : "hover:bg-foreground/5 text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium hidden md:block">{item.label}</span>
                        </Link>
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

            <main className="pl-20 md:pl-64 p-6 md:p-12">
                <header className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-extrabold mb-2"
                    >
                        {user?.company_name || "Recruiter"} Hiring <span className="text-slate-400">Dashboard</span>
                    </motion.h1>
                    <p className="text-muted-foreground">Manage jobs, review resumes, and track applicants from one recruiter workspace.</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {quickActions.map((item, index) => (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="glass rounded-[2rem] p-8 border border-white/10"
                        >
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div className="p-3 bg-slate-800 rounded-2xl">
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                {item.active && <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Current</span>}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{item.label}</h3>
                            <p className="text-muted-foreground mb-6">{item.description}</p>
                            <Link
                                href={item.href}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                            >
                                Open Section
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
