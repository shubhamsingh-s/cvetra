"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ATSProgress from "@/components/ATSProgress";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ resumes?: number; jobs?: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // lightweight smoke: fetch jobs and resumes counts if API available
        const jobs = await fetch('/api/jobs').then((r) => r.ok ? r.json() : null).catch(() => null);
        const resumes = await fetch('/api/resumes').then((r) => r.ok ? r.json() : null).catch(() => null);
        if (!mounted) return;
        setStats({ resumes: resumes ? (resumes.resumes || []).length : undefined, jobs: jobs ? (jobs.jobs || []).length : undefined });
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-lg p-4">
          <h3 className="font-semibold mb-2">Resume Analyzer</h3>
          <p className="text-sm text-muted-foreground mb-3">Upload and get ATS feedback.</p>
          <Link href="/upload" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Upload Resume</Link>
        </div>

        <div className="glass rounded-lg p-4">
          <h3 className="font-semibold mb-2">ATS Score</h3>
          <div className="mt-2"><ATSProgress value={42} /></div>
        </div>

        <div className="glass rounded-lg p-4">
          <h3 className="font-semibold mb-2">Opportunities</h3>
          <p className="text-sm text-muted-foreground">{loading ? 'Loading...' : `${stats?.jobs ?? 'N/A'} jobs available`}</p>
          <Link href="/jobs" className="mt-3 inline-block text-sm text-blue-400">Browse jobs</Link>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace("/auth/login");
            return;
        }

        router.replace(user.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/student");
    }, [isLoading, router, user]);

    return (
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
            Redirecting to your dashboard...
        </div>
    );
}
