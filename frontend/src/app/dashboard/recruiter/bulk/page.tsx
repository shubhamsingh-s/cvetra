"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, FileUp, Upload, CheckCircle2, Briefcase, FileSearch, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { resumes as resumesApi, jobs as jobsApi, matches as matchesApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

type UploadStatus = "pending" | "uploading" | "analyzing" | "success" | "error";

interface FileWithProgress {
    id: string;
    file: File;
    status: UploadStatus;
    error?: string;
    scores?: { ats: number; semantic: number };
}

export default function RecruiterResumeCheckPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadJobs() {
            try {
                const data = await jobsApi.list();
                const activeJobs = data.jobs || [];
                setJobs(activeJobs);
                if (activeJobs.length > 0) setSelectedJobId(activeJobs[0]._id);
            } catch (err) {
                console.error("Failed to load jobs", err);
            }
        }
        loadJobs();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files).map((f) => ({
            id: Math.random().toString(36).substring(7),
            file: f,
            status: "pending" as UploadStatus,
        }));
        setFiles((prev) => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (id: string) => {
        setFiles(files.filter(f => f.id !== id));
    };

    const processFiles = async () => {
        if (!selectedJobId || files.length === 0) return;
        setIsProcessing(true);

        const job = jobs.find(j => j._id === selectedJobId);
        const jdText = job?.description || "";

        await Promise.all(
            files.map(async (fileObj) => {
                if (fileObj.status === "success") return; // skip already processed

                // Update to uploading
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "uploading" } : f));
                
                try {
                    const formData = new FormData();
                    formData.append("file", fileObj.file);
                    if (user) formData.append("userId", user.id); 
                    
                    const uploadRes = await resumesApi.upload(formData);
                    if (uploadRes.status !== "ok") throw new Error(uploadRes.error);
                    const resumeId = uploadRes.resume._id;

                    // Update to analyzing
                    setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "analyzing" } : f));
                    
                    const analysisRes = await resumesApi.analyze(resumeId, jdText);
                    const analysis = analysisRes.analysis || {};
                    
                    const semanticScore = analysis.semantic_similarity || 0;
                    const atsScore = analysis.ats_score || 0;
                    
                    // Create Match Pipeline link
                    await matchesApi.create({
                        resumeId,
                        jobId: selectedJobId,
                        matchScore: atsScore / 100,
                        skillMatch: {},
                        semanticScore: semanticScore
                    });

                    // Update to success
                    setFiles(prev => prev.map(f => f.id === fileObj.id ? { 
                        ...f, 
                        status: "success",
                        scores: { ats: atsScore, semantic: Math.round(semanticScore * 100) }
                    } : f));

                } catch (err: any) {
                    setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "error", error: err.message } : f));
                }
            })
        );

        setIsProcessing(false);
    };

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden font-sans">
             <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to recruiter dashboard
                </Link>

                <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <FileSearch className="w-48 h-48" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                                <FileUp className="w-6 h-6 text-blue-500" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">Bulk Resume <span className="text-blue-500">Processing</span></h1>
                        </div>
                        <p className="text-muted-foreground max-w-xl text-lg">Upload batches of resumes and let our AI engine automatically parse, score, and rank them against your active job roles.</p>
                    </div>

                    <div className="mt-10 max-w-md space-y-2 relative z-10">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Job Pipeline</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/50" />
                            <select 
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold appearance-none cursor-pointer"
                                disabled={isProcessing}
                            >
                                <option value="" disabled className="bg-background">Choose a job post...</option>
                                {jobs.map(job => (
                                    <option key={job._id} value={job._id} className="bg-background">
                                        {job.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div 
                            onClick={() => !isProcessing && fileInputRef.current?.click()}
                            className={cn(
                                "border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[300px]",
                                isProcessing ? "border-white/10 opacity-50 cursor-not-allowed" : "border-white/20 hover:border-blue-500/50 hover:bg-white/5"
                            )}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                multiple 
                                accept=".pdf,.doc,.docx" 
                                className="hidden" 
                                onChange={handleFileSelect} 
                            />
                            <div className="p-4 bg-foreground/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Drag & Drop Resumes</h3>
                            <p className="text-muted-foreground">Or click to browse your computer.</p>
                            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400 bg-foreground/5 px-4 py-2 rounded-full">
                                <span>PDF, DOCX format</span>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="glass rounded-[2rem] p-8 border border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg">Upload Queue ({files.length})</h3>
                                    {files.every(f => f.status === "success") && (
                                         <Link href="/dashboard/recruiter/pipeline" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
                                             Go to Pipeline <ArrowLeft className="w-3 h-3 rotate-180" />
                                         </Link>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {files.map((fileObj) => (
                                        <div key={fileObj.id} className="flex items-center justify-between p-4 bg-foreground/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                {fileObj.status === "success" ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                ) : fileObj.status === "error" ? (
                                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                ) : fileObj.status !== "pending" ? (
                                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0" />
                                                )}
                                                
                                                <div className="truncate">
                                                    <p className="font-semibold text-sm truncate">{fileObj.file.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {fileObj.status === "uploading" ? "Uploading to secure storage..." :
                                                             fileObj.status === "analyzing" ? "Computing AI semantic match..." :
                                                             fileObj.status === "error" ? <span className="text-red-400">{fileObj.error}</span> :
                                                             fileObj.status}
                                                        </span>
                                                        {fileObj.scores && (
                                                            <div className="flex gap-2">
                                                                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">ATS: {fileObj.scores.ats}%</span>
                                                                <span className="text-[10px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-bold">JD Match: {fileObj.scores.semantic}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {!isProcessing && fileObj.status !== "success" && (
                                                <button onClick={() => removeFile(fileObj.id)} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside>
                        <div className="glass rounded-[2rem] p-8 border border-white/10 sticky top-6">
                            <div className="p-3 bg-green-500/10 rounded-2xl w-fit mb-6">
                                <Sparkles className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">One-Click Processing</h3>
                            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                                Once you have selected your target job and dragged all candidate resumes into the queue, begin the autonomous screening process. Our AI engine scales horizontally to compute semantics instantly.
                            </p>

                            <button 
                                onClick={processFiles}
                                disabled={isProcessing || files.length === 0 || !selectedJobId || files.every(f => f.status === "success")}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2",
                                    (isProcessing || files.length === 0 || !selectedJobId || files.every(f => f.status === "success"))
                                        ? "bg-foreground/5 text-muted-foreground opacity-50 cursor-not-allowed border border-white/5"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95"
                                )}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Processing Batch...
                                    </>
                                ) : files.every(f => f.status === "success" && f.status !== "pending") && files.length > 0 ? (
                                    <>All Processed</>
                                ) : (
                                    <>Start Processing</>
                                )}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
