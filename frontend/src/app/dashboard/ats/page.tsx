"use client";
import { useEffect, useState } from "react";
import ATSProgress from "@/components/ATSProgress";
import { useAuth } from "@/context/auth-context";
import { resumes as resumesApi } from "@/lib/api";

export default function ATSPage() {
  const { user } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await resumesApi.getLatestByUserId(user.id).catch(() => null);
        setScore(data?.resume?.atsScore || 0);
      } catch (e) {
        setScore(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  return (
    <section className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ATS Score</h1>
      <div className="glass rounded-lg p-6">
        {loading ? <div>Loading...</div> : (
          <div>
            <ATSProgress value={score ?? 0} />
            <p className="text-sm text-muted-foreground mt-3">Your resume's ATS score helps you understand compatibility with job descriptions.</p>
          </div>
        )}
      </div>
    </section>
  );
}
