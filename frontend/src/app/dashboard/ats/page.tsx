"use client";
import { useEffect, useState } from "react";
import ATSProgress from "@/components/ATSProgress";

export default function ATSPage() {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // placeholder: ideally call /resumes to get last uploaded resume
        setScore(68);
      } catch (e) {
        setScore(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
