"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileUp, 
    Rocket, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    Brain, 
    TrendingUp, 
    Search,
    ChevronRight,
    Target
} from "lucide-react";
import ATSProgress from "@/components/ATSProgress";
import { useAuth } from "@/context/auth-context";
import { resumes as resumesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ATSPage() {
    const { user } = useAuth();
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    useEffect(() => {
        async function load() {
            if (!user?.id) return;
            setLoading(true);
            try {
                const data = await resumesApi.getLatestByUserId(user.id).catch(() => null);
                if (data?.resume) {
                    setScore(data.resume.atsScore || 0);
                    // If we have parsed text but no analysis yet, we could trigger one or show last
                }
            } catch (e) {
                setScore(null);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user?.id]);

    async function handleScan(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !user) return;

        setScanning(true);
        setStatus({ type: 'idle', message: 'Uploading document...' });
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user.id);

            const uploadData = await resumesApi.upload(formData);
            
            if (uploadData.status === 'ok') {
                setStatus({ type: 'idle', message: 'AI Engine analyzing skills & experience...' });
                const analysisData = await resumesApi.analyze(uploadData.resume._id, "General Tech Role Matching");
                setAnalysis(analysisData.analysis);
                setScore(analysisData.analysis.ats_score);
                setStatus({ type: 'success', message: 'Intelligence scan complete!' });
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Scan failed' });
        } finally {
            setScanning(false);
        }
    }

    return (
        <main className="max-w-6xl mx-auto pb-20">
            <header className="mb-12">
                <h1 className="text-4xl font-black mb-3 tracking-tight">AI <span className="text-blue-500">Scanner</span></h1>
                <p className="text-muted-foreground text-lg">Upload your resume for real-time ATS optimization and AI-driven career insights.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Scanner */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="glass rounded-[2rem] p-8 border border-white/10 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <Search className="w-32 h-32" />
                        </div>
                        
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                             <FileUp className="w-5 h-5 text-blue-500" />
                             Document Input
                        </h2>

                        <form onSubmit={handleScan} className="space-y-6">
                            <div className={cn(
                                "group relative border-2 border-dashed rounded-3xl p-10 transition-all flex flex-col items-center justify-center text-center cursor-pointer",
                                file ? "border-blue-500 bg-blue-500/5" : "border-white/10 hover:border-blue-500/50"
                            )}>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div className="p-4 bg-foreground/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                    <FileUp className={file ? "text-blue-500" : "text-muted-foreground"} />
                                </div>
                                <p className="font-bold">{file ? file.name : "Drop Resume Here"}</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX supported</p>
                            </div>

                            <button 
                                type="submit"
                                disabled={scanning || !file}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                            >
                                {scanning ? (
                                    <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Rocket className="w-5 h-5" /> Start AI Scan</>
                                )}
                            </button>
                        </form>

                        <AnimatePresence>
                            {status.type !== 'idle' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "mt-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3",
                                        status.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                    )}
                                >
                                    {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {status.message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* Quick Stats Overlay */}
                    <div className="glass rounded-[2rem] p-8 border border-white/10">
                         <div className="flex justify-between items-center">
                            <div>
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Current ATS Health</div>
                                <div className="text-3xl font-black">{score ?? 0}%</div>
                            </div>
                            <div className="p-4 bg-blue-500/10 rounded-2xl">
                                <TrendingUp className="text-blue-500" />
                            </div>
                         </div>
                         <div className="mt-6 w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score ?? 0}%` }}
                                className="h-full bg-blue-500 rounded-full"
                             />
                         </div>
                    </div>
                </div>

                {/* Right Column: AI Insights & Suggestions */}
                <div className="lg:col-span-7 space-y-8">
                    {analysis ? (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            {/* Key Suggestions */}
                            <section className="glass rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
                                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                    <Sparkles className="text-yellow-500" />
                                    AI Optimization Blueprint
                                </h3>
                                
                                <div className="space-y-4">
                                    {(analysis.checklist || []).map((item: any, i: number) => (
                                        <div key={i} className="group flex items-start gap-4 p-5 bg-foreground/5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all">
                                            <div className={cn(
                                                "p-2 rounded-xl mt-1",
                                                item.priority === 'High' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                            )}>
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full h-fit">
                                                +{item.impact_pts} PTS
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Skills Analysis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="glass p-8 rounded-[2rem] border border-white/10">
                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Matches
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(analysis.matched_skills || []).map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="glass p-8 rounded-[2rem] border border-white/10">
                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500" /> Missing
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(analysis.missing_skills || []).map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-full border border-orange-500/20">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Prediction Card */}
                            <div className="glass rounded-[2rem] p-8 border border-white/10 bg-gradient-to-br from-indigo-600/20 to-blue-600/20">
                                <div className="flex items-center gap-6">
                                    <div className="p-5 bg-white/10 rounded-[1.5rem] backdrop-blur-xl">
                                        <Brain className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Career Prediction</div>
                                        <h4 className="text-2xl font-black text-white">{analysis.career_prediction?.next_role || "Strategy Lead"}</h4>
                                        <p className="text-indigo-100/60 text-sm">Estimated Salary: {analysis.career_prediction?.salary_range || "$120k - $150k"}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-20 glass rounded-[2.5rem] border border-white/10 border-dashed opacity-50">
                            <Brain className="w-16 h-16 mb-6 text-muted-foreground" />
                            <h3 className="text-xl font-bold mb-2">Awaiting Intelligence Scan</h3>
                            <p className="max-w-xs text-sm text-muted-foreground">Upload your resume to begin the AI optimization process and unlock career insights.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
