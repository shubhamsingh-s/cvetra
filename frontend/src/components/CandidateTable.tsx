"use client";
import React from "react";

type Candidate = {
  id: string;
  name: string;
  email: string;
  skills: string[];
  ats_score: number;
  semantic_score: number;
  experience_years: number;
  resume_snippet?: string;
};

export default function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  async function handleAction(id: string, action: 'shortlist' | 'invite') {
    try {
      await fetch(`/api/matches/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      // optimistic UI is fine; caller can refresh list
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <table className="w-full text-sm table-auto">
        <thead>
          <tr className="text-left">
            <th className="p-2">Candidate</th>
            <th className="p-2 hidden md:table-cell">Skills</th>
            <th className="p-2">ATS</th>
            <th className="p-2">Semantic</th>
            <th className="p-2">Exp</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} className="border-t border-white/5">
              <td className="p-2 align-top">
                <div className="font-semibold">{c.name}</div>
                <div className="text-muted-foreground text-xs">{c.email}</div>
                <div className="text-xs mt-1 text-muted-foreground">{c.resume_snippet}</div>
              </td>
              <td className="p-2 hidden md:table-cell">
                <div className="flex flex-wrap gap-2">
                  {c.skills.slice(0, 5).map((s) => (
                    <span key={s} className="text-xs px-2 py-1 bg-slate-800 rounded">{s}</span>
                  ))}
                </div>
              </td>
              <td className="p-2">
                <div className="w-36">
                  <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${c.ats_score}%` }} className="bg-green-500 h-2 rounded-full" />
                  </div>
                  <div className="text-xs mt-1">{c.ats_score}%</div>
                </div>
              </td>
              <td className="p-2">{Math.round((c.semantic_score ?? 0) * 100)}%</td>
              <td className="p-2">{c.experience_years} yrs</td>
              <td className="p-2">
                <div className="flex gap-2">
                  <button onClick={() => handleAction(c.id, 'shortlist')} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">Shortlist</button>
                  <button onClick={() => handleAction(c.id, 'invite')} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Invite</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
