const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://talentiq-backend-pyhf.onrender.com";

async function parseResponse(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const base = API_BASE.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  const url = `${base}/${cleanPath}`;

  const defaultHeaders: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Attach token from localStorage when available (browser-only)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const mergedHeaders = { ...defaultHeaders, ...(options.headers as Record<string, string> | undefined) };

  // Use 'include' to support cookie-based authentication across origins when backend allows it.
  const res = await fetch(url, { credentials: "include", ...options, headers: mergedHeaders });
  const data = await parseResponse(res);
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || res.statusText || "Request failed";
    throw new Error(message);
  }
  return data;
}

export async function analyzeResume(file: File, jdText: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("job_description", jdText);
  return apiFetch("/api/v1/resume/upload", { method: "POST", body: form });
}

export const API = API_BASE;
