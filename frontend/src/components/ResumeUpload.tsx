"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMessage('Select a file');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/resumes/upload-resume`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage('Upload successful');
    } catch (err: any) {
      setMessage(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 glass rounded-lg">
      <label className="block mb-2 font-semibold">Upload Resume</label>
      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div className="mt-4">
        <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Uploading...' : 'Upload'}</button>
      </div>
      {message && <div className="mt-3 text-sm">{message}</div>}
    </form>
  );
}
