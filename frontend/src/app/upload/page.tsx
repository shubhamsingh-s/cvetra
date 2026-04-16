"use client";
import ResumeUpload from "@/components/ResumeUpload";

export default function UploadPage() {
  return (
    <section className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Resume</h1>
      <ResumeUpload />
    </section>
  );
}
"use client";
import { useState } from "react";

export default function Page() {
	const [file, setFile] = useState<File | null>(null);
	const [jd, setJd] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<any>(null);

	const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!file) return;
		setLoading(true);
		const form = new FormData();
		form.append("file", file);
		form.append("jd_text", jd);
		try {
			const res = await fetch(`${apiBase}/api/resume/analyze`, {
				method: "POST",
				body: form,
			});
			const data = await res.json();
			setResult(data);
		} catch (err) {
			setResult({ status: "error", message: String(err) });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-3xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Upload Resume</h1>
			<form onSubmit={submit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium">Resume (PDF or DOCX)</label>
					<input
						type="file"
						accept=".pdf,.doc,.docx"
						onChange={(e) => setFile(e.target.files?.[0] ?? null)}
						className="mt-1"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">Job Description (optional)</label>
					<textarea
						value={jd}
						onChange={(e) => setJd(e.target.value)}
						rows={6}
						className="w-full mt-1 p-2 border rounded"
					/>
				</div>
				<div>
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 bg-blue-600 text-white rounded"
					>
						{loading ? "Analyzing..." : "Analyze Resume"}
					</button>
				</div>
			</form>

			{result && (
				<div className="mt-6 p-4 border rounded">
					<pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}