const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

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

export async function predictText(text: string) {
  try {
    const res = await fetch(`${API_URL}/api/nlp/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error('NLP predict failed');
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function trainModel(texts: string[], labels: string[]) {
  try {
    const res = await fetch(`${API_URL}/api/nlp/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, labels }),
    });
    if (!res.ok) {
      throw new Error('NLP train failed');
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

