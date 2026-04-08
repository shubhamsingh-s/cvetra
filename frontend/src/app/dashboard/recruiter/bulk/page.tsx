"use client";

import Link from "next/link";
import { ArrowLeft, FileSearch, Upload, CheckCircle2 } from "lucide-react";

export default function RecruiterResumeCheckPage() {
    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                <ArrowLeft className="w-4 h-4" />
                Back to recruiter dashboard
            </Link>

            <div className="max-w-4xl space-y-6">
                <div className="glass rounded-[2rem] p-8 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <FileSearch className="w-6 h-6 text-blue-500" />
                        <h1 className="text-3xl font-bold">Check Resume</h1>
                    </div>
                    <p className="text-muted-foreground">Upload one or many resumes and compare them against your open roles.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass rounded-[2rem] p-8 border border-white/10">
                        <Upload className="w-5 h-5 text-slate-300 mb-3" />
                        <h2 className="font-semibold mb-2">Resume upload</h2>
                        <p className="text-sm text-muted-foreground">This section is ready for drag-and-drop resume screening.</p>
                    </div>

                    <div className="glass rounded-[2rem] p-8 border border-white/10">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mb-3" />
                        <h2 className="font-semibold mb-2">Match review</h2>
                        <p className="text-sm text-muted-foreground">Show fit score, missing skills, and top candidate strengths here.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
