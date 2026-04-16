"use client";
import { useEffect, useState } from "react";
import CandidateTable from "@/components/CandidateTable";

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/matches/ranking?jobId=');
        if (!res.ok) throw new Error('No API');
        const data = await res.json();
        if (mounted) setCandidates(data.candidates || []);
      } catch (e) {
        // ignore
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Candidate Ranking</h1>
      {loading ? <div>Loading...</div> : <CandidateTable candidates={candidates.map((c:any) => ({ id: c._id, name: c.user?.name || 'Unknown', email: c.user?.email || '', skills: c.resume?.extractedSkills || [], ats_score: c.resume?.atsScore || 0, semantic_score: c.semanticScore || 0, experience_years: c.resume?.experienceYears || 0, resume_snippet: c.resume?.parsedText?.slice(0,200) }))} />}
    </section>
  );
}
"use client";

"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList, Users, CalendarRange } from "lucide-react";
import { useEffect, useState } from "react";
import CandidateTable from "@/components/CandidateTable";

export default function RecruiterPipelinePage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // Fetch matches from Node backend ranking endpoint
                const res = await fetch(`${apiBase}/api/matches/ranking?jobId=demo-job`);
                const data = await res.json();
                const candidates = (data.candidates || []).map((m: any) => ({
                    id: m._id || m.id || m.matchId || m.id,
                    name: (m.user && m.user.name) || (m.resume && (m.resume.originalFileUrl || '').split('/').pop()) || 'Candidate',
                    email: (m.user && m.user.email) || '',
                    skills: (m.resume && m.resume.extractedSkills) || [],
                    ats_score: (m.resume && m.resume.atsScore) || Math.round((m.matchScore || 0)),
                    semantic_score: m.semanticScore || 0,
                    experience_years: (m.resume && m.resume.experienceYears) || 0,
                    resume_snippet: (m.resume && (m.resume.parsedText || '').slice(0, 200)) || '',
                }));
                setCandidates(candidates || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [apiBase]);

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                <ArrowLeft className="w-4 h-4" />
                Back to recruiter dashboard
            </Link>

            <div className="max-w-6xl space-y-6">
                <div className="glass rounded-[2rem] p-8 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <ClipboardList className="w-6 h-6 text-blue-500" />
                        <h1 className="text-3xl font-bold">Applied Candidate List</h1>
                    </div>
                    <p className="text-muted-foreground">Track applicants from new application through interview and final decision.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                        <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <div />
                            <div className="flex gap-2">
                                <button onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const r = await fetch(`${apiBase}/api/matches/export?jobId=demo-job`);
                                        const blob = await r.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `candidates_demo-job.csv`;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                    } catch (e) { console.error(e); }
                                    setLoading(false);
                                }} className="px-3 py-2 bg-slate-800 text-white rounded">Export CSV</button>
                            </div>
                        </div>
                        {loading ? (
                            <div className="glass p-8 rounded-2xl">Loading candidates…</div>
                        ) : (
                            <CandidateTable candidates={candidates} />
                        )}
                    </div>

                    <aside className="glass rounded-2xl p-6 border border-white/10">
                        <Users className="w-5 h-5 text-slate-300 mb-3" />
                        <h2 className="font-semibold mb-2">Pipeline stages</h2>
                        <p className="text-sm text-muted-foreground">Shortlist, interview, offer, and rejected candidate groups can be managed here.</p>
                        <div className="mt-6">
                            <h3 className="font-semibold">Quick filters</h3>
                            <div className="flex flex-col gap-2 mt-3">
                                <button className="px-3 py-2 bg-foreground/5 rounded">Top ATS score</button>
                                <button className="px-3 py-2 bg-foreground/5 rounded">Most experience</button>
                                <button className="px-3 py-2 bg-foreground/5 rounded">Semantic similarity</button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
