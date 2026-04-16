"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, ShieldAlert, FileText, Briefcase, AlertTriangle, CheckCircle2, Search, Loader2 } from "lucide-react";
import { jobs as jobsApi, matches as matchesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RiskFlag {
    type: 'danger' | 'warning';
    label: string;
    detail: string;
}

interface AnalyzedCandidate {
    id: string;
    name: string;
    flags: RiskFlag[];
    riskScore: number;
    atsScore: number;
    semanticScore: number;
    experienceYears: number;
    snippet: string;
}

export default function RecruiterResumeReportPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [candidates, setCandidates] = useState<AnalyzedCandidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState<AnalyzedCandidate | null>(null);

    // Initial load
    useEffect(() => {
        async function loadData() {
            try {
                const data = await jobsApi.list();
                const fetchedJobs = data.jobs || [];
                setJobs(fetchedJobs);
                if (fetchedJobs.length > 0) setSelectedJobId(fetchedJobs[0]._id);
            } catch (e) {
                console.error(e);
            }
        }
        loadData();
    }, []);

    // Load candidates and compute fraud heuristics
    useEffect(() => {
        if (!selectedJobId) return;

        async function analyzePipeline() {
            setLoading(true);
            setCandidates([]);
            setSelectedCandidate(null);
            
            try {
                const data = await matchesApi.getRanking(selectedJobId);
                const rawCandidates = data.candidates || [];
                
                const analyzed: AnalyzedCandidate[] = rawCandidates.map((m: any) => {
                    const resume = m.resume || {};
                    const snippet = resume.parsedText ? resume.parsedText.slice(0, 500) : '';
                    const atsScore = resume.atsScore || Math.round((m.matchScore || 0) * 100);
                    const semanticScore = Math.round((m.semanticScore || 0) * 100);
                    const expYears = resume.experienceYears || 0;
                    const skills = resume.extractedSkills || [];

                    const flags: RiskFlag[] = [];
                    let score = 0;

                    // Heuristic 1: Empty or extremely short parsed text indicates formatting manipulation or image-based PDF
                    if (snippet.length < 100) {
                        flags.push({
                            type: 'danger',
                            label: 'Unparseable Format',
                            detail: 'The resume contains very little extractable text. This could be an image-only PDF or an attempt to block ATS parsers.'
                        });
                        score += 35;
                    }

                    // Heuristic 2: Keyword stuffing detection (High ATS, Low Semantic and high skills count)
                    if (atsScore > 95 && semanticScore < 50 && skills.length > 30) {
                        flags.push({
                            type: 'warning',
                            label: 'Keyword Stuffing',
                            detail: `Candidate has an unusually high ATS string match but very low semantic relevance, listing ${skills.length} skills.`
                        });
                        score += 40;
                    }

                    // Heuristic 3: Experience Mismatch
                    if (expYears > 15 && skills.length < 4) {
                        flags.push({
                            type: 'warning',
                            label: 'Experience Anomaly',
                            detail: `Claims ${expYears} years of experience but the engine extracted very few hard skills.`
                        });
                        score += 20;
                    }

                    return {
                        id: m._id,
                        name: (m.user && m.user.name) || (resume.originalFileUrl && resume.originalFileUrl.split('/').pop()) || 'Unknown',
                        flags,
                        riskScore: Math.min(100, score),
                        atsScore,
                        semanticScore,
                        experienceYears: expYears,
                        snippet: snippet
                    };
                });

                // Sort by highest risk first
                setCandidates(analyzed.sort((a, b) => b.riskScore - a.riskScore));
                
            } catch (e) {
                console.error("Failed to analyze pipeline", e);
            } finally {
                setLoading(false);
            }
        }
        analyzePipeline();
    }, [selectedJobId]);

    const filteredCandidates = candidates.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden font-sans">
             <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to recruiter workspace
                </Link>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-8">
                        <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <ShieldAlert className="w-40 h-40" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-500/10 rounded-2xl">
                                        <BarChart3 className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tight">Fraud & Risk <span className="text-red-500">Analytics</span></h1>
                                </div>
                                <p className="text-muted-foreground max-w-xl text-lg">Automatically scan your active pipelines for formatting anomalies, keyword stuffing, and experience inconsistencies.</p>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-end sm:items-center relative z-10">
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Scan Pipeline</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/50" />
                                        <select 
                                            value={selectedJobId}
                                            onChange={(e) => setSelectedJobId(e.target.value)}
                                            className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold appearance-none cursor-pointer"
                                            disabled={loading}
                                        >
                                            <option value="" disabled className="bg-background">Choose a pipeline...</option>
                                            {jobs.map(job => (
                                                <option key={job._id} value={job._id} className="bg-background">{job.title}</option>
                                            ))}
                                            {jobs.length === 0 && <option value="" disabled className="bg-background">No active jobs found</option>}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="w-full sm:w-64 space-y-2">
                                     <label className="text-xs font-bold uppercase tracking-widest text-transparent ml-1">.</label>
                                     <div className="relative">
                                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                         <input 
                                             type="text"
                                             placeholder="Search candidate..."
                                             value={searchQuery}
                                             onChange={(e) => setSearchQuery(e.target.value)}
                                             className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-sm font-medium"
                                         />
                                     </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="glass rounded-[2.5rem] p-24 border border-white/10 flex flex-col items-center justify-center gap-6 shadow-xl">
                                <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-1">Scanning Resumes</h3>
                                    <p className="text-muted-foreground text-sm">Computing discrepancy metrics...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredCandidates.map((candidate) => (
                                    <div 
                                        key={candidate.id}
                                        onClick={() => setSelectedCandidate(candidate)}
                                        className={cn(
                                            "cursor-pointer p-6 rounded-3xl border transition-all flex flex-col md:flex-row gap-6 md:items-center justify-between",
                                            selectedCandidate?.id === candidate.id 
                                                ? "bg-foreground/5 border-red-500/50 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]" 
                                                : "glass border-white/10 hover:border-white/20 hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center font-bold text-lg">
                                                {candidate.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{candidate.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">ATS: {candidate.atsScore}% &bull; Exp: {candidate.experienceYears}y</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {candidate.flags.length > 0 ? (
                                                <div className="flex -space-x-2">
                                                    {candidate.flags.map((flag, idx) => (
                                                        <div key={idx} className={cn(
                                                            "w-8 h-8 rounded-full border-2 border-background flex items-center justify-center shadow-sm",
                                                            flag.type === 'danger' ? "bg-red-500 text-white" : "bg-yellow-500 text-white"
                                                        )}>
                                                            <AlertTriangle className="w-4 h-4" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full text-sm font-bold">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Clean
                                                </div>
                                            )}

                                            <div className="text-right w-24">
                                                 <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Risk Score</div>
                                                 <div className={cn(
                                                     "text-2xl font-black",
                                                     candidate.riskScore > 50 ? "text-red-500" : candidate.riskScore > 0 ? "text-yellow-500" : "text-green-500"
                                                 )}>{candidate.riskScore}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredCandidates.length === 0 && !loading && (
                                     <div className="text-center p-12 text-muted-foreground">
                                         No candidates found in this pipeline.
                                     </div>
                                )}
                            </div>
                        )}
                    </div>

                    <aside className="w-full lg:w-[400px]">
                        <div className="sticky top-6">
                            {selectedCandidate ? (
                                <div className="glass rounded-[2rem] p-8 border border-white/10 animate-in fade-in slide-in-from-right-4">
                                    <h2 className="text-2xl font-black mb-2">{selectedCandidate.name}</h2>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-8 pb-8 border-b border-white/10">
                                        <span>Candidate Profile Analysis</span>
                                    </div>

                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Identified Signals</h3>
                                    
                                    {selectedCandidate.flags.length > 0 ? (
                                        <div className="space-y-4 mb-8">
                                            {selectedCandidate.flags.map((flag, idx) => (
                                                <div key={idx} className={cn(
                                                    "p-5 rounded-2xl border",
                                                    flag.type === 'danger' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                                                )}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                                        <span className="font-bold">{flag.label}</span>
                                                    </div>
                                                    <p className="text-sm opacity-90 leading-relaxed text-foreground">{flag.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 mb-8 flex items-center justify-center flex-col text-center gap-3">
                                            <CheckCircle2 className="w-8 h-8" />
                                            <div>
                                                <span className="font-bold block mb-1">No Anomalies Detected</span>
                                                <span className="text-xs text-foreground opacity-80">This resume passed all standard heuristic checks.</span>
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Raw Text Snippet</h3>
                                    <div className="p-4 rounded-xl bg-background/50 font-mono text-xs text-muted-foreground break-all h-48 overflow-y-auto custom-scrollbar">
                                        {selectedCandidate.snippet || "No text could be extracted from this document."}
                                    </div>
                                </div>
                            ) : (
                                <div className="glass rounded-[2rem] p-12 border border-white/10 text-center flex flex-col items-center justify-center opacity-50">
                                    <FileText className="w-12 h-12 mb-4 text-muted-foreground" />
                                    <p className="font-medium text-lg leading-tight">Select a candidate</p>
                                    <p className="text-sm text-muted-foreground mt-2">Click on any profile line to view detailed anomaly reports and explanations.</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
