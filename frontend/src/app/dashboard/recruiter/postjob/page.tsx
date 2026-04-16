"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Target, Sparkles, Send, Plus, X } from "lucide-react";
import { jobs } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RecruiterPostJobPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [experienceRequired, setExperienceRequired] = useState(0);
    const [skillsString, setSkillsString] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("You must be logged in to post a job.");
        
        setIsLoading(true);
        try {
            const skills = skillsString.split(",").map(s => s.trim()).filter(Boolean);
            const data = await jobs.create({
                recruiterId: user.id,
                title,
                description,
                requiredSkills: skills,
                experienceRequired,
            });

            if (data.status === "ok") {
                alert("Job posted successfully!");
                router.push("/dashboard/recruiter");
            } else {
                alert(data.error || "Failed to post job");
            }
        } catch (error: any) {
            console.error("Post job error:", error);
            alert(error.message || "Something went wrong while posting the job");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to recruiter dashboard
                </Link>

                <div className="space-y-8">
                    <div className="glass rounded-[2rem] p-10 border border-white/10 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                                <Briefcase className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Post a New Job</h1>
                                <p className="text-muted-foreground mt-1">Define your ideal candidate profile and start receiving AI-matched resumes.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-semibold ml-1">Job Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Senior Frontend Engineer"
                                        className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-semibold ml-1">Min. Experience (Years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={experienceRequired}
                                        onChange={(e) => setExperienceRequired(parseInt(e.target.value) || 0)}
                                        className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-semibold ml-1">Job Description</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    placeholder="Describe the role, responsibilities, and impact..."
                                    className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-semibold ml-1">Required Skills (Comma separated)</label>
                                <div className="relative group">
                                    <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500/50" />
                                    <input
                                        type="text"
                                        value={skillsString}
                                        onChange={(e) => setSkillsString(e.target.value)}
                                        placeholder="React, TypeScript, Node.js, NLP..."
                                        className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium pr-12"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">Our AI uses these skills to rank candidates automatically.</p>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full md:w-auto px-12 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25",
                                        "hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-50",
                                        "flex items-center justify-center gap-3"
                                    )}
                                >
                                    {isLoading ? "Posting Job..." : "Publish Job Post"}
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="glass rounded-[2rem] p-8 border border-white/10">
                            <Target className="w-6 h-6 text-slate-300 mb-4" />
                            <h2 className="font-bold text-lg mb-2">Targeted Matching</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Be specific with skills to improve match accuracy. Our semantic engine understands synonyms and related technologies.
                            </p>
                        </div>

                        <div className="glass rounded-[2rem] p-8 border border-white/10">
                            <Sparkles className="w-6 h-6 text-yellow-400 mb-4" />
                            <h2 className="font-bold text-lg mb-2">Automated Pipelin</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Once posted, applicants are ranked instantly based on their resume profile compared to your success criteria.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
