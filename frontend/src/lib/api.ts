const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeResume(file: File, jdText: string) {
  const form = new FormData();
  form.append('file', file);
  form.append('jd_text', jdText);

  try {
    const res = await fetch(`${API_URL}/api/resume/analyze`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to analyze resume');
    }

    return await res.json();
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
}

