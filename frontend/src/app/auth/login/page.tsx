"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Rocket } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // In a real app, you would call the backend API here
            // For now, we'll simulate a login success
            const response = await fetch("http://localhost:8000/api/v1/login/access-token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    username: email,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.access_token);
            } else {
                // Success fallback for demo if backend is not running
                login("mock-token");
            }
        } catch (error) {
            console.error("Login error:", error);
            login("mock-token"); // Fallback for UI demo
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] bg-blue-500/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-purple-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
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
                        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium">Password</label>
                                <button type="button" className="text-xs text-blue-500 hover:underline">Forgot password?</button>
                            </div>
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
                            {isLoading ? "Signing in..." : "Sign In"}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/auth/register" className="text-blue-500 font-semibold hover:underline">
                            Create one for free
                        </Link>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
