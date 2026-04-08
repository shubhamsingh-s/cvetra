"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase, Target, Sparkles } from "lucide-react";

export default function RecruiterPostJobPage() {
    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                <ArrowLeft className="w-4 h-4" />
                Back to recruiter dashboard
            </Link>

            <div className="max-w-4xl space-y-6">
                <div className="glass rounded-[2rem] p-8 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Briefcase className="w-6 h-6 text-blue-500" />
                        <h1 className="text-3xl font-bold">Create Job</h1>
                    </div>
                    <p className="text-muted-foreground">Set up a role, define skills, and prepare matching criteria for incoming applicants.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass rounded-[2rem] p-8 border border-white/10">
                        <Target className="w-5 h-5 text-slate-300 mb-3" />
                        <h2 className="font-semibold mb-2">Recommended fields</h2>
                        <p className="text-sm text-muted-foreground">Job title, location, salary range, required skills, and a clear success profile.</p>
                    </div>

                    <div className="glass rounded-[2rem] p-8 border border-white/10">
                        <Sparkles className="w-5 h-5 text-yellow-400 mb-3" />
                        <h2 className="font-semibold mb-2">AI assist</h2>
                        <p className="text-sm text-muted-foreground">Use this area next to generate stronger job descriptions and candidate filters.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
