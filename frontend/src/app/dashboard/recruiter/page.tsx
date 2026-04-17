
"use client";
import { useState, useEffect } from "react";
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

    const [stats, setStats] = useState({ jobs: 0, candidates: 0, matches: 0 });

    useEffect(() => {
        import("@/lib/api").then(({ jobs: jobsApi, matches: matchesApi }) => {
            jobsApi.list().then(data => {
                const activeJobs = data.jobs || [];
                // Load counts
                let totalC = 0, highMatches = 0;
                Promise.all(activeJobs.map((j: any) => matchesApi.getRanking(j._id).catch(() => ({ candidates: [] }))))
                    .then(results => {
                        results.forEach((r: any) => {
                            totalC += (r.candidates || []).length;
                            highMatches += (r.candidates || []).filter((c:any) => (c.matchScore || c.semanticScore || 0) > 0.8).length;
                        });
                        setStats({ jobs: activeJobs.length, candidates: totalC, matches: highMatches });
                    });
            });
        });
    }, []);

    return (
        <div className="min-h-screen bg-transparent text-foreground font-sans">
            {/* Main Content */}
            <div className="p-0">
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
                        { label: "Active Jobs", value: stats.jobs, icon: Briefcase, color: "text-blue-500" },
                        { label: "Total Candidates", value: stats.candidates, icon: Users, color: "text-purple-500" },
                        { label: "AI Matches", value: stats.matches, icon: Star, color: "text-yellow-500" },
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
