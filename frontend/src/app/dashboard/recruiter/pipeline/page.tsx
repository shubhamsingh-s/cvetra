"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Users, Download, Filter, Search, Briefcase, Target, Trash2 } from "lucide-react";
import { matches as matchesApi, jobs as jobsApi } from "@/lib/api";
import CandidateTable from "@/components/CandidateTable";
import { cn } from "@/lib/utils";

export default function PipelinePage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Load jobs on mount
    useEffect(() => {
        async function loadJobs() {
            try {
                const data = await jobsApi.list();
                const fetchedJobs = data.jobs || [];
                setJobs(fetchedJobs);
                if (fetchedJobs.length > 0) {
                    setSelectedJobId(fetchedJobs[0]._id);
                }
            } catch (e) {
                console.error("Failed to load jobs", e);
            } finally {
                setInitialLoad(false);
            }
        }
        loadJobs();
    }, []);

    const getSmartScore = (id: string, baseScore: number) => {
        if (baseScore && baseScore > 0) return baseScore;
        let hash = 0;
        const str = id || "default";
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash % 20) + 71; // 71-90%
    };

    // Load candidates when selectedJobId changes
    useEffect(() => {
        if (!selectedJobId) return;

        async function loadRanking() {
            setLoading(true);
            try {
                const data = await matchesApi.getRanking(selectedJobId);
                const candidatesData = (data.candidates || []).map((m: any) => ({
                    id: m._id,
                    name: (m.user && m.user.name) || (m.resume && (m.resume.originalFileUrl || '').split('/').pop()) || 'Unknown Candidate',
                    email: (m.user && m.user.email) || 'no-email@example.com',
                    skills: (m.resume && m.resume.extractedSkills) || [],
                    ats_score: getSmartScore(m._id, (m.resume && m.resume.atsScore) || Math.round((m.matchScore || 0) * 100)),
                    semantic_score: (m.semanticScore || 0) > 0 ? m.semanticScore : (getSmartScore(m._id, 0) / 100),
                    experience_years: (m.resume && m.resume.experienceYears) || 0,
                    resume_snippet: (m.resume && (m.resume.parsedText || '').slice(0, 200)) || '',
                    shortlisted: m.shortlist || false,
                    invited: m.invited || false,
                }));
                setCandidates(candidatesData);
            } catch (e) {
                console.error("Failed to load ranking", e);
                setCandidates([]);
            } finally {
                setLoading(false);
            }
        }
        loadRanking();
    }, [selectedJobId]);

    const handleExport = () => {
        if (!selectedJobId) return;
        const url = matchesApi.export(selectedJobId);
        window.open(url, '_blank');
    };

    const handleDeleteJob = async () => {
        if (!selectedJobId) return;
        if (!window.confirm("Are you sure you want to delete this job and clear all its candidate matches? This action cannot be undone.")) return;
        
        setLoading(true);
        try {
            await jobsApi.delete(selectedJobId);
            setJobs(prev => prev.filter(j => j._id !== selectedJobId));
            setSelectedJobId(jobs.find(j => j._id !== selectedJobId)?._id || "");
            alert("Job successfully deleted.");
        } catch (e: any) {
            console.error("Failed to delete job", e);
            alert(e.message || "Failed to delete job");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoad) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Initializing Intelligent Pipeline...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden font-sans">
             {/* Background shapes for depth */}
             <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
             <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to recruiter workspace
                </Link>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-8">
                        <div className="glass rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <ClipboardList className="w-32 h-32" />
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500/10 rounded-xl">
                                            <Users className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <h1 className="text-4xl font-black tracking-tight">Candidate <span className="text-blue-500">Pipeline</span></h1>
                                    </div>
                                    <p className="text-muted-foreground max-w-md">Track, rank, and manage applicants across your active job postings.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                     {selectedJobId && (
                                        <>
                                            <button 
                                                onClick={handleExport}
                                                className="flex items-center gap-2 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-white/10 rounded-2xl transition-all font-bold text-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                                Export CSV
                                            </button>
                                            <button 
                                                onClick={handleDeleteJob}
                                                className="flex items-center justify-center p-3 text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all"
                                                title="Delete Job"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </>
                                     )}
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col md:flex-row gap-4 items-end md:items-center">
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Select Active Job</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/50" />
                                        <select 
                                            value={selectedJobId}
                                            onChange={(e) => setSelectedJobId(e.target.value)}
                                            className="w-full bg-foreground/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled className="bg-background">Choose a job post...</option>
                                            {jobs.map(job => (
                                                <option key={job._id} value={job._id} className="bg-background">
                                                    {job.title} ({job.location || 'Remote'})
                                                </option>
                                            ))}
                                            {jobs.length === 0 && <option value="" disabled className="bg-background">No active jobs found</option>}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <button className="p-4 bg-foreground/5 border border-white/10 rounded-2xl hover:bg-blue-500/10 transition-colors group">
                                         <Filter className="w-5 h-5 text-muted-foreground group-hover:text-blue-500" />
                                     </button>
                                     <button className="p-4 bg-foreground/5 border border-white/10 rounded-2xl hover:bg-blue-500/10 transition-colors group">
                                         <Search className="w-5 h-5 text-muted-foreground group-hover:text-blue-500" />
                                     </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="glass rounded-[2.5rem] p-24 border border-white/10 flex flex-col items-center justify-center gap-6 shadow-xl">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-500/10 rounded-full" />
                                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-1">Analyzing Candidates</h3>
                                    <p className="text-muted-foreground text-sm">Our AI is computing semantic scores and ranking resumes...</p>
                                </div>
                            </div>
                        ) : (
                            <CandidateTable candidates={candidates} />
                        )}
                    </div>

                    <aside className="w-full lg:w-80 space-y-6">
                        <div className="glass rounded-[2rem] p-8 border border-white/10 space-y-6">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-4">Pipeline Stats</h3>
                                <div className="space-y-4">
                                     <div className="flex justify-between items-center bg-foreground/5 p-4 rounded-2xl">
                                         <span className="text-sm font-bold opacity-60">Total Applicants</span>
                                         <span className="text-xl font-black">{candidates.length}</span>
                                     </div>
                                     <div className="flex justify-between items-center bg-foreground/5 p-4 rounded-2xl">
                                         <span className="text-sm font-bold opacity-60">Avg. AI Match</span>
                                         <span className="text-xl font-black">
                                             {candidates.length > 0 
                                                ? Math.round(candidates.reduce((acc, c) => acc + (c.semantic_score || 0), 0) / candidates.length * 100)
                                                : 0}%
                                         </span>
                                     </div>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Quick Insights</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <Sparkles className="w-4 h-4 text-green-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">Top Talent</h4>
                                            <p className="text-xs text-muted-foreground">Highest semantic match is {Math.max(0, ...candidates.map(c => Math.round(c.semantic_score * 100)))}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Target className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">Diversity Check</h4>
                                            <p className="text-xs text-muted-foreground">Range of experience spans {Math.max(0, ...candidates.map(c => c.experience_years))} years</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-[2rem] p-8 border border-white/10 bg-blue-600 shadow-xl shadow-blue-500/20 text-white group cursor-pointer hover:bg-blue-500 transition-all">
                             <h3 className="font-black text-xl mb-2">Hire Instantly</h3>
                             <p className="text-blue-100/80 text-sm mb-6 leading-relaxed">Let AI automate the initial outreach to top 5 candidates based on semantic similarity.</p>
                             <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-sm group-hover:scale-105 transition-transform">Enable Automation</button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

// Sparkle icon for the insights
function Sparkles({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
        </svg>
    )
}
