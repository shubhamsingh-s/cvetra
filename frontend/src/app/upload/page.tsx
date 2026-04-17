"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, FileUp, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { resumes as resumesApi, jobs as jobsApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export default function UploadPage() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [jd, setJd] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return setStatus({ type: 'error', message: 'Please select a resume file.' });
        if (!user) return setStatus({ type: 'error', message: 'You must be logged in to upload.' });

        setIsLoading(true);
        setStatus({ type: 'idle', message: '' });
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user.id);
            formData.append('parsedText', ''); // Backend can extract if needed, or we could extract client-side

            // 1. Upload
            const uploadData = await resumesApi.upload(formData);
            
            if (uploadData.status === 'ok') {
                const resumeId = uploadData.resume._id;
                
                // 2. Perform AI Analysis (if JD is provided)
                if (jd.trim()) {
                    setStatus({ type: 'idle', message: 'Analyzing with AI engine...' });
                    const analysisData = await resumesApi.analyze(resumeId, jd);
                    setAnalysisResult(analysisData.analysis);
                }

                setStatus({ type: 'success', message: 'Resume uploaded and processed successfully!' });
            } else {
                throw new Error(uploadData.error || 'Upload failed');
            }
        } catch (err: any) {
            console.error("Upload Error:", err);
            setStatus({ type: 'error', message: err.message || 'Something went wrong during upload' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to dashboard
                </Link>

                <div className="glass rounded-[2.5rem] p-10 md:p-16 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <FileUp className="w-64 h-64" />
                    </div>

                    <header className="mb-12 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                <Rocket className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">AI Resume <span className="text-blue-500">Scan</span></h1>
                        </div>
                        <p className="text-xl text-muted-foreground">Upload your resume to receive an instant ATS score and semantic matching report.</p>
                    </header>

                    {status.type === 'success' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl flex items-center gap-6">
                                <div className="p-4 bg-green-500 rounded-2xl shadow-lg shadow-green-500/20">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-green-500">Processing Complete</h3>
                                    <p className="text-muted-foreground">{status.message}</p>
                                </div>
                            </div>

                            {analysisResult && (
                                <div className="grid md:grid-cols-2 gap-6 mt-8">
                                    <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                                        <div className="text-5xl font-black text-blue-500 mb-2">{analysisResult?.ats_score || analysisResult?.analysis?.ats_score || 0}%</div>
                                        <div className="text-sm font-bold uppercase tracking-widest opacity-60">ATS Score</div>
                                    </div>
                                    <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                                        <div className="text-5xl font-black text-purple-500 mb-2">{analysisResult?.semantic_similarity ? Math.round(analysisResult.semantic_similarity * 100) : "N/A"}%</div>
                                        <div className="text-sm font-bold uppercase tracking-widest opacity-60">JD Match</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => { setStatus({ type: 'idle', message: '' }); setAnalysisResult(null); setFile(null); }}
                                    className="flex-1 py-4 bg-foreground/5 hover:bg-foreground/10 border border-white/10 rounded-2xl font-bold transition-all"
                                >
                                    Upload Another
                                </button>
                                <Link 
                                    href="/dashboard/student"
                                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-2xl font-bold shadow-lg shadow-blue-500/25 transition-all"
                                >
                                    View Detailed Report
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpload} className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">1. Choose Document</label>
                                <div className={cn(
                                    "relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center text-center group cursor-pointer",
                                    file ? "border-blue-500 bg-blue-500/5" : "border-white/10 hover:border-blue-500/50 hover:bg-foreground/[0.02]"
                                )}>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx" 
                                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="p-4 bg-foreground/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                        <FileUp className={cn("w-8 h-8", file ? "text-blue-500" : "text-muted-foreground")} />
                                    </div>
                                    {file ? (
                                        <div>
                                            <p className="text-lg font-bold">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready to scan</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-lg font-bold">Drop your resume here</p>
                                            <p className="text-sm text-muted-foreground">PDF or DOCX supported (Max 10MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">2. Add Job Context (Optional)</label>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-500/80">
                                        <Sparkles className="w-3 h-3" />
                                        <span>AI MATCHING</span>
                                    </div>
                                </div>
                                <textarea 
                                    value={jd}
                                    onChange={(e) => setJd(e.target.value)}
                                    rows={5}
                                    placeholder="Paste the job description here to compare your resume against real hiring requirements..."
                                    className="w-full bg-foreground/5 border border-white/10 rounded-3xl p-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium resize-none"
                                />
                            </div>

                            {status.type === 'error' && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm font-bold">{status.message}</p>
                                </div>
                            )}

                            {status.message && !isLoading && status.type === 'idle' && (
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3 text-blue-500">
                                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm font-bold">{status.message}</p>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading || !file}
                                className={cn(
                                    "w-full py-6 rounded-[2rem] bg-blue-600 text-white font-black text-xl shadow-2xl shadow-blue-500/30",
                                    "hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:grayscale",
                                    "flex items-center justify-center gap-4"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Analyzing Talent...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Start Intelligent Scan</span>
                                        <Rocket className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}