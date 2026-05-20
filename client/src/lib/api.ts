const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Auth
export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (email: string, password: string, name: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  me: () => request('/auth/me'),

  // Questions
  generateQuestions: (topic: string, subtopic?: string, count?: number, grade?: string) =>
    request('/questions/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, subtopic, count, grade }),
    }),

  saveQuestions: (topic: string, subtopic: string | undefined, questions: any[], sessionId?: string) =>
    request('/questions', {
      method: 'POST',
      body: JSON.stringify({ topic, subtopic, questions, sessionId }),
    }),

  getQuestions: (topic?: string) =>
    request(`/questions${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`),

  deleteQuestion: (id: string) =>
    request(`/questions/${id}`, { method: 'DELETE' }),

  updateQuestion: (id: string, data: any) =>
    request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Sessions
  createSession: (title: string, topic: string, questionIds: string[]) =>
    request('/sessions', { method: 'POST', body: JSON.stringify({ title, topic, questionIds }) }),

  getSessions: () => request('/sessions'),

  getSessionByCode: (code: string) => request(`/sessions/code/${code}`),

  getSessionById: (id: string) => request(`/sessions/${id}`),

  closeSession: (id: string) =>
    request(`/sessions/${id}/close`, { method: 'PATCH' }),

  // Responses
  submitResponse: (sessionId: string, questionId: string, selectedOptionId: string, studentName: string) =>
    request('/responses', {
      method: 'POST',
      body: JSON.stringify({ sessionId, questionId, selectedOptionId, studentName }),
    }),

  submitManualResponses: (sessionId: string, responses: any[]) =>
    request('/responses/manual', {
      method: 'POST',
      body: JSON.stringify({ sessionId, responses }),
    }),

  getSessionResponses: (sessionId: string) => request(`/responses/session/${sessionId}`),

  // Reports
  getReport: (sessionId: string) => request(`/reports/${sessionId}`),

  exportReport: (sessionId: string) => `${BASE}/reports/${sessionId}/export`,
};
