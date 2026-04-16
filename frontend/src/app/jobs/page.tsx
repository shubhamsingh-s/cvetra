"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('API not available');
        const data = await res.json();
        if (mounted) setJobs(data.jobs || []);
      } catch (e) {
        // ignore
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link href="/jobs/new" className="px-3 py-2 bg-blue-600 text-white rounded">Post Job</Link>
      </div>
      <div className="grid gap-4">
        {loading && <div>Loading...</div>}
        {!loading && jobs.length === 0 && <div className="glass p-4">No jobs found.</div>}
        {jobs.map((j) => (
          <div key={j._id} className="glass p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{j.title}</div>
                <div className="text-sm text-muted-foreground">{j.description?.slice(0, 120)}</div>
              </div>
              <div className="text-sm text-muted-foreground">{new Date(j.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
