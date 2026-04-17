"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    LogOut,
    LayoutDashboard,
    FileSearch,
    Briefcase,
    TrendingUp,
    Brain,
    Rocket,
    Star,
    ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { resumes as resumesApi, jobs as jobsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

export default function StudentDashboard() {
    const { logout, user } = useAuth();
    const [stats, setStats] = useState({ totalJobs: 0, myResumes: 0, profileScore: 0 });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [jobsData, resumeData] = await Promise.all([
                    jobsApi.list(),
                    user?.id ? resumesApi.getLatestByUserId(user.id).catch(() => null) : null
                ]);

                setStats({
                    totalJobs: jobsData.jobs?.length || 0,
                    myResumes: resumeData?.resume ? 1 : 0,
                    profileScore: resumeData?.resume?.atsScore || 0
                });
            } catch (e) {
                console.error("Failed to load dashboard stats", e);
            } finally {
                setIsLoadingStats(false);
            }
        }
        loadStats();
    }, [user?.id]);

    const menuItems = [
        { icon: LayoutDashboard, label: "Overview", active: true, href: "/dashboard/student" },
        { icon: FileSearch, label: "Resume Scan", href: "/upload" },
        { icon: Briefcase, label: "Browse Jobs", href: "/jobs" },
        { icon: Star, label: "My Matches", href: "/dashboard/student" },
    ];

    return (
        <div className="min-h-screen bg-transparent text-foreground font-sans selection:bg-blue-500/30">
            {/* Main Content */}
            <div className="p-0 relative">
                {/* Background Decor */}
                <div className="absolute top-[10%] right-[10%] w-[50vw] h-[50vw] bg-blue-500/[0.03] blur-[150px] rounded-full pointer-events-none" />

                <header className="mb-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <h1 className="text-5xl font-black mb-3 tracking-tight">
                                Intelligence <span className="text-blue-500">Command</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-xl">
                                Welcome back, <span className="text-foreground font-bold">{user?.full_name || user?.email?.split('@')[0] || "Strategist"}</span>. 
                                Your talent profile is ready for optimization.
                            </p>
                        </div>
                        <div className="flex gap-4">
                             <div className="glass px-6 py-4 rounded-2xl border border-white/10">
                                 <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Account Level</div>
                                 <div className="font-bold text-sm">Platinum Elite</div>
                             </div>
                        </div>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Stats Row */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: "Job Postings", value: isLoadingStats ? "..." : stats.totalJobs, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
                                { label: "Live Matches", value: "24", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                                { label: "Profile Score", value: isLoadingStats ? "..." : `${stats.profileScore}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass p-8 rounded-[2rem] border border-white/10 shadow-lg group hover:bg-foreground/[0.02] transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                                        </div>
                                    </div>
                                    <div className="text-4xl font-black mb-1">{stat.value}</div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Activity / Next Steps */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-[2.5rem] p-10 border border-white/10 shadow-xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                <Brain className="w-48 h-48" />
                            </div>

                            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-yellow-500" />
                                Recommended Strategy
                            </h3>

                            <div className="space-y-6">
                                {[
                                    { title: "Optimize Resume", desc: "Your ATS score for Frontend roles could increase by 15% with few semantic tweaks.", icon: FileSearch, color: "text-blue-500", href: "/upload" },
                                    { title: "Review New Matches", desc: "Top tech companies just posted roles that match 95% of your skill set.", icon: Briefcase, color: "text-green-500", href: "/jobs" },
                                    { title: "Mock Interview", desc: "Prepare for your upcoming technical assessments with AI-generated questions.", icon: Brain, color: "text-purple-500", href: "/dashboard/student" },
                                ].map((step, i) => (
                                    <Link key={i} href={step.href} className="flex items-center justify-between group bg-foreground/5 p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-background rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                                <step.icon className={cn("w-6 h-6", step.color)} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                                                <p className="text-sm text-muted-foreground max-w-md">{step.desc}</p>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                                            <ArrowRight className="w-5 h-5 text-blue-500" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: AI Insights */}
                    <aside className="lg:col-span-4 space-y-8">
                         <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass rounded-[2.5rem] p-8 border border-white/10 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl relative overflow-hidden"
                         >
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 blur-3xl rounded-full" />
                            <Rocket className="w-12 h-12 mb-6" />
                            <h3 className="text-2xl font-black mb-3">Jumpstart Your Career</h3>
                            <p className="text-blue-100/80 mb-8 leading-relaxed font-medium">
                                Our AI engine has detected high demand for your TypeScript skills. Perform a specialized scan to see specific job gaps.
                            </p>
                            <Link href="/upload" className="w-full inline-block py-4 bg-white text-blue-600 rounded-2xl font-black text-center shadow-lg hover:scale-[1.02] transition-transform">
                                Start AI Scan
                            </Link>
                         </motion.div>

                         <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass rounded-[2.5rem] p-10 border border-white/10 shadow-xl"
                         >
                            <h3 className="text-xl font-black mb-8">Skill Blueprint</h3>
                            <div className="space-y-6">
                                {[
                                    { label: "React / Next.js", value: 95, color: "bg-blue-500" },
                                    { label: "TypeScript", value: 88, color: "bg-purple-500" },
                                    { label: "Backend / Node", value: 72, color: "bg-green-500" },
                                    { label: "AI / NLP", value: 45, color: "bg-yellow-500" },
                                ].map((skill, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                            <span className="opacity-60">{skill.label}</span>
                                            <span>{skill.value}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.value}%` }}
                                                transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                                                className={cn("h-full rounded-full", skill.color)} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </motion.div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

// Sparkle icon
function Sparkles({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
        </svg>
    )
}
