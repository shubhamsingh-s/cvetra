"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function NewJobPage() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/jobs', { method: 'POST', body: JSON.stringify({ title, description: desc, recruiterId: null }) });
      setMsg('Job posted');
      setTitle(''); setDesc('');
    } catch (err: any) {
      setMsg(err.message || 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <section className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Post Job</h1>
      <form onSubmit={submit} className="glass p-6 rounded">
        <label className="block mb-2">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 rounded bg-transparent border border-white/5 mb-4" />
        <label className="block mb-2">Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2 rounded bg-transparent border border-white/5 mb-4" rows={6} />
        <div>
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Posting...' : 'Post Job'}</button>
        </div>
        {msg && <div className="mt-3 text-sm">{msg}</div>}
      </form>
    </section>
  );
}
