const API = process.env.NEXT_PUBLIC_API_URL;

export async function analyzeResume(file: File, jdText: string) {
  const form = new FormData();
  form.append('file', file);
  form.append('jd_text', jdText);
  const res = await fetch(`${API}/api/resume/analyze`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}
