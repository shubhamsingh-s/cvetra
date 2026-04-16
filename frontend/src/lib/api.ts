/**
 * API Integration Utility
 * Handles all backend communication for TalentVerse
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Generic Fetch Wrapper
 */
async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // If body is FormData, remove Content-Type to let fetch set it with boundary
  if (options.body instanceof FormData) {
    delete (headers as any)['Content-Type'];
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || data?.message || response.statusText || "Request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error [${path}]:`, error);
    throw error;
  }
}

/**
 * Auth API
 */
export const auth = {
  login: (credentials: any) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData: any) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

/**
 * Jobs API
 */
export const jobs = {
  create: (jobData: any) => request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  }),
  list: () => request('/api/jobs'),
  getById: (id: string) => request(`/api/jobs/${id}`),
};

/**
 * Resumes API
 */
export const resumes = {
  upload: (formData: FormData) => request('/api/resumes/upload-resume', {
    method: 'POST',
    body: formData,
  }),
  analyze: (resumeId: string, jdText: string) => request('/api/resumes/analyze-resume', {
    method: 'POST',
    body: JSON.stringify({ resumeId, jd_text: jdText }),
  }),
};

/**
 * Matches & Ranking API
 */
export const matches = {
  getRanking: (jobId: string) => request(`/api/matches/ranking?jobId=${jobId}`),
  performAction: (matchId: string, action: 'shortlist' | 'invite') => request(`/api/matches/${matchId}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  }),
  export: (jobId: string, shortlistedOnly = false) => {
    // Return the URL for direct download or use window.location
    return `${API_URL}/api/matches/export?jobId=${jobId}&shortlisted=${shortlistedOnly}`;
  }
};
