"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Rocket, GraduationCap, Briefcase } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
    const [role, setRole] = useState<"student" | "recruiter">("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        // Read query param on client side to avoid CSR-bailout hook during prerender
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get("role") as "student" | "recruiter" | null;
        if (roleParam) setRole(roleParam);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate registration and auto-login
        setTimeout(() => {
            login("mock-token");
            setIsLoading(false);
        }, 1500);
    };

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <main className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] bg-blue-500/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-purple-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="glass rounded-[2.5rem] p-10 md:p-12 border border-white/10 shadow-2xl">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                            <div className="p-2 bg-blue-500/10 rounded-lg glass group-hover:scale-110 transition-transform">
                                <Rocket className="w-6 h-6 text-blue-500" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                TALENT<span className="text-blue-500">VERSE</span>
                            </h1>
                        </Link>
                        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                        <p className="text-muted-foreground">Join the elite AI talent intelligence platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => setRole("student")}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3",
                                    role === "student"
                                        ? "bg-blue-500/10 border-blue-500 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
                                        : "bg-foreground/5 border-white/5 opacity-60 hover:opacity-100"
                                )}
                            >
                                <GraduationCap className={cn("w-6 h-6", role === "student" ? "text-blue-500" : "text-muted-foreground")} />
                                <span className="text-sm font-semibold">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("recruiter")}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3",
                                    role === "recruiter"
                                        ? "bg-slate-500/10 border-slate-500 shadow-[0_0_20px_-5px_rgba(100,116,139,0.3)]"
                                        : "bg-foreground/5 border-white/5 opacity-60 hover:opacity-100"
                                )}
                            >
                                <Briefcase className={cn("w-6 h-6", role === "recruiter" ? "text-slate-400" : "text-muted-foreground")} />
                                <span className="text-sm font-semibold">Recruiter</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                    className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25",
                                "hover:bg-blue-500 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                                "flex items-center justify-center gap-2"
                            )}
                        >
                            {isLoading ? "Creating account..." : "Join Talentverse"}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-blue-500 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </motion.div>
        </main>
        </Suspense>
    );
}
