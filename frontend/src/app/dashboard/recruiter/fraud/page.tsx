"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, ShieldAlert, FileText } from "lucide-react";

export default function RecruiterResumeReportPage() {
    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                <ArrowLeft className="w-4 h-4" />
                Back to recruiter dashboard
            </Link>

            <div className="max-w-4xl space-y-6">
                <div className="glass rounded-[2rem] p-8 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        <h1 className="text-3xl font-bold">Resume Report</h1>
                    </div>
                    <p className="text-muted-foreground">Review candidate summaries, fit breakdowns, and suspicious resume signals in one place.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass rounded-[2rem] p-8 border border-white/10">
                        <FileText className="w-5 h-5 text-slate-300 mb-3" />
                        <h2 className="font-semibold mb-2">Candidate summaries</h2>
                        <p className="text-sm text-muted-foreground">Best-fit explanations, experience highlights, and scoring details can appear here.</p>
                    </div>

                    <div className="glass rounded-[2rem] p-8 border border-white/10">
                        <ShieldAlert className="w-5 h-5 text-red-400 mb-3" />
                        <h2 className="font-semibold mb-2">Risk signals</h2>
                        <p className="text-sm text-muted-foreground">Flag suspicious claims, formatting anomalies, and duplicate profile patterns.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
