"use client";

import React, { useState } from "react";
import { matches as matchesApi } from "@/lib/api";
import { Check, Mail, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Candidate = {
  id: string;
  name: string;
  email: string;
  skills: string[];
  ats_score: number;
  semantic_score: number;
  experience_years: number;
  resume_snippet?: string;
  shortlisted?: boolean;
  invited?: boolean;
};

export default function CandidateTable({ candidates: initialCandidates }: { candidates: Candidate[] }) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Update local state when prop changes
  React.useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);

  async function handleAction(id: string, action: 'shortlist' | 'invite') {
    setProcessingId(`${id}-${action}`);
    try {
      const result = await matchesApi.performAction(id, action);
      if (result.status === 'ok') {
        setCandidates(prev => prev.map(c => 
          c.id === id ? { 
            ...c, 
            shortlisted: action === 'shortlist' ? true : c.shortlisted,
            invited: action === 'invite' ? true : c.invited
          } : c
        ));
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  }

  if (candidates.length === 0) {
    return (
      <div className="glass rounded-[2rem] p-12 border border-white/10 text-center">
        <div className="inline-flex p-4 bg-foreground/5 rounded-2xl mb-4">
          <Star className="w-8 h-8 text-blue-500/50" />
        </div>
        <h3 className="text-xl font-bold mb-2">No candidates found</h3>
        <p className="text-muted-foreground">Once applicants upload their resumes, they will appear here ranked by AI.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-foreground/5 border-b border-white/5">
              <th className="p-6 text-left font-bold uppercase tracking-wider text-xs">Candidate Details</th>
              <th className="p-6 text-left font-bold uppercase tracking-wider text-xs hidden md:table-cell">Core Skills</th>
              <th className="p-6 text-left font-bold uppercase tracking-wider text-xs">ATS Rank</th>
              <th className="p-6 text-left font-bold uppercase tracking-wider text-xs">AI Match</th>
              <th className="p-6 text-left font-bold uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {candidates.map((c) => (
              <tr key={c.id} className="hover:bg-foreground/[0.02] transition-colors group">
                <td className="p-6 align-top">
                  <div className="font-bold text-base group-hover:text-blue-500 transition-colors">{c.name}</div>
                  <div className="text-muted-foreground font-medium mb-3">{c.email}</div>
                  {c.resume_snippet && (
                     <div className="text-xs text-muted-foreground line-clamp-2 bg-foreground/5 p-2 rounded-lg italic">
                     "{c.resume_snippet}..."
                   </div>
                  )}
                  <div className="mt-2 text-[10px] font-bold text-blue-500/80 uppercase">Exp: {c.experience_years} years</div>
                </td>
                <td className="p-6 hidden md:table-cell align-top">
                  <div className="flex flex-wrap gap-2 max-w-[250px]">
                    {c.skills.slice(0, 8).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md font-bold border border-blue-500/20">{s}</span>
                    ))}
                    {c.skills.length > 8 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 8} more</span>}
                  </div>
                </td>
                <td className="p-6 align-top">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>ATS Score</span>
                      <span className={cn(
                        c.ats_score > 80 ? "text-green-500" : c.ats_score > 60 ? "text-yellow-500" : "text-red-500"
                      )}>{c.ats_score}%</span>
                    </div>
                    <div className="w-24 bg-foreground/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        style={{ width: `${c.ats_score}%` }} 
                        className={cn(
                          "h-full transition-all duration-1000",
                          c.ats_score > 80 ? "bg-green-500" : c.ats_score > 60 ? "bg-yellow-500" : "bg-red-500"
                        )} 
                      />
                    </div>
                  </div>
                </td>
                <td className="p-6 align-top font-bold text-lg">
                  {Math.round((c.semantic_score ?? 0) * 100)}%
                </td>
                <td className="p-6 align-top">
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleAction(c.id, 'shortlist')}
                      disabled={c.shortlisted || processingId === `${c.id}-shortlist`}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        c.shortlisted 
                          ? "bg-green-500/20 text-green-500 border border-green-500/20" 
                          : "bg-blue-600 text-white hover:bg-blue-500"
                      )}
                    >
                      {processingId === `${c.id}-shortlist` ? <Loader2 className="w-3 h-3 animate-spin" /> : c.shortlisted ? <Check className="w-3 h-3" /> : null}
                      {c.shortlisted ? "Shortlisted" : "Shortlist"}
                    </button>
                    
                    <button 
                      onClick={() => handleAction(c.id, 'invite')}
                      disabled={c.invited || processingId === `${c.id}-invite`}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        c.invited 
                          ? "bg-purple-500/20 text-purple-500 border border-purple-500/20" 
                          : "bg-slate-800 text-white hover:bg-slate-700"
                      )}
                    >
                      {processingId === `${c.id}-invite` ? <Loader2 className="w-3 h-3 animate-spin" /> : c.invited ? <Mail className="w-3 h-3" /> : null}
                      {c.invited ? "Invited" : "Invite to Interview"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
