"use client";

import { useState } from "react";
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
    Rocket
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

export default function StudentDashboard() {
    const { logout, user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsUploading(true);
        setError(null);
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("job_description", "Software Engineer role with React and Python experience.");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/v1/resume/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisResult(data);
            } else {
                const errData = await response.json();
                throw new Error(errData.detail || "Upload failed");
            }
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Something went wrong while analyzing your resume.");

            // MOCK DATA for demonstration if backend fails
            setTimeout(() => {
                setAnalysisResult({
                    filename: selectedFile.name,
                    analysis: {
                        alignment_score: 85,
                        missing_skills: ["Docker", "Kubernetes", "GraphQL"],
                        strengths: ["React Expert", "Modern UI Design", "TypeScript", "Next.js"],
                        improvement_suggestions: [
                            "Add more quantitative impact to your project descriptions.",
                            "Highlight experience with cloud infrastructure.",
                        ],
                        interview_questions: [
                            "How do you optimize React performance in a large-scale app?",
                            "Describe a difficult bug you solved using browser developer tools.",
                        ]
                    }
                });
                setIsUploading(false);
            }, 2000);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <ModeToggle />

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-20 md:w-64 glass border-r border-white/10 z-50 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl hidden md:block">Dashboard</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {[
                        { icon: LayoutDashboard, label: "Overview", active: true },
                        { icon: FileSearch, label: "Resume Analysis" },
                        { icon: Briefcase, label: "Job Matches" },
                        { icon: TrendingUp, label: "Career Path" },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                item.active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "hover:bg-foreground/5 text-muted-foreground"
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
                        Welcome, <span className="text-blue-500">Talent</span>
                    </motion.h1>
                    <p className="text-muted-foreground">Analyze your resume and unlock strategic career insights.</p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Upload Section */}
                    <div className="xl:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-[2rem] p-8 border border-white/10 shadow-xl"
                        >
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-blue-500" />
                                Upload Resume
                            </h3>

                            <label
                                className={cn(
                                    "relative block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
                                    isUploading ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-blue-500/50 hover:bg-foreground/5"
                                )}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.docx"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />

                                <div className="flex flex-col items-center">
                                    {isUploading ? (
                                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                    ) : (
                                        <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                                            <FileText className="w-8 h-8 text-blue-500" />
                                        </div>
                                    )}
                                    <div className="font-semibold text-lg mb-1">
                                        {file ? file.name : "Choose File"}
                                    </div>
                                    <p className="text-sm text-muted-foreground">PDF or DOCX (Max 10MB)</p>
                                </div>
                            </label>

                            {error && (
                                <div className="mt-4 p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm flex gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}
                        </motion.div>

                        {/* AI Tips Card */}
                        <div className="glass rounded-[2rem] p-8 border border-white/10 bg-gradient-to-br from-blue-600/10 to-transparent">
                            <Brain className="w-8 h-8 text-blue-500 mb-4" />
                            <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Include measurable achievements like "Increased efficiency by 30%" to get a higher AI alignment score.
                            </p>
                        </div>
                    </div>

                    {/* Right: Results Section */}
                    <div className="xl:col-span-2">
                        <AnimatePresence mode="wait">
                            {!analysisResult && !isUploading && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center p-12 text-center glass rounded-[2rem] border border-white/10 border-dashed"
                                >
                                    <div className="p-6 bg-foreground/5 rounded-full mb-6">
                                        <Rocket className="w-12 h-12 text-muted-foreground opacity-20" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No Analysis Yet</h3>
                                    <p className="text-muted-foreground max-w-sm">Upload your resume to see the magic of Talentverse AI analysis.</p>
                                </motion.div>
                            )}

                            {isUploading && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center p-12 text-center glass rounded-[2rem] border border-white/10"
                                >
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                                        <Brain className="w-10 h-10 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold mb-2">Analyzing Your DNA</h3>
                                    <p className="text-muted-foreground animate-pulse">Running advanced heuristics and Gemini models...</p>
                                </motion.div>
                            )}

                            {analysisResult && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Top Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass rounded-[2rem] p-8 border border-white/10 shadow-lg">
                                            <div className="flex justify-between items-start mb-6">
                                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Alignment Score</span>
                                                <div className="p-2 bg-green-500/10 rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl font-black text-blue-500">{analysisResult.analysis.alignment_score}</span>
                                                <span className="text-xl text-muted-foreground">/ 100</span>
                                            </div>
                                        </div>

                                        <div className="glass rounded-[2rem] p-8 border border-white/10 shadow-lg">
                                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6 block">Missing Skills</span>
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.analysis.missing_skills.map((skill: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-xs font-bold">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strengths & Suggestions */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass rounded-[2rem] p-8 border border-white/10">
                                            <h4 className="font-bold text-lg mb-4">Key Strengths</h4>
                                            <ul className="space-y-3">
                                                {analysisResult.analysis.strengths.map((item: string, i: number) => (
                                                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="glass rounded-[2rem] p-8 border border-white/10">
                                            <h4 className="font-bold text-lg mb-4">Improvement Suggestions</h4>
                                            <ul className="space-y-3">
                                                {analysisResult.analysis.improvement_suggestions.map((item: string, i: number) => (
                                                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Interview Questions */}
                                    <div className="glass rounded-[2rem] p-8 border border-white/10 bg-gradient-to-tr from-purple-600/5 to-transparent">
                                        <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                                            <FileSearch className="w-5 h-5 text-purple-500" />
                                            Anticipated Interview Questions
                                        </h4>
                                        <div className="space-y-4">
                                            {analysisResult.analysis.interview_questions.map((q: string, i: number) => (
                                                <div key={i} className="p-4 bg-foreground/5 rounded-2xl border border-white/5 text-sm italic">
                                                    "{q}"
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
