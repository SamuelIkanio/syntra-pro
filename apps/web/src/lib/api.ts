/*
// Local development API URLs
// const API_BASE = "http://localhost:4000";
// const API_BASE = "https://abraham-casino-complexity-universe.trycloudflare.com/api";
*/
const API_BASE = "https://untitled-dancing-jean-discretion.trycloudflare.com";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data as T;
}

export interface AuthResponse {
  token: string;
  user: { id: number; email: string; name: string };
}

export interface DailyReport {
  date: string;
  summary: string;
  triggered_insights: { message: string; category: string; severity: string }[];
  personalized_tips: string[];
  overall_score: number;
}

export interface LogPayload {
  date: string;
  energy: number;
  mood: number;
  stress: number;
  overallScore?: number;
  notes?: string;
  sleepHours?: number;
  hydrationMl?: number;
  exerciseMinutes?: number;
  symptoms?: string[];
  meals?: { type: string; description: string; healthScore: number; calories?: number; tags?: string[] }[];
}

export interface LogResponse {
  id: number;
  date: string;
  energy: number;
  mood: number;
  stress: number;
  overallScore: number | null;
  notes: string;
  sleepHours: number;
  hydrationMl: number;
  exerciseMinutes: number;
  symptoms: string[];
  meals: { type: string; description: string; healthScore: number; calories: number; tags: string[] }[];
  createdAt: string;
  updatedAt: string;
}

export const api = {
  register: (email: string, password: string, name: string) =>
    apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: { email, password, name } }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/api/auth/login", { method: "POST", body: { email, password } }),

  me: (token: string) =>
    apiFetch<{ user: { id: number; email: string; name: string } }>("/api/auth/me", { token }),

  saveLogs: (token: string, payload: LogPayload) =>
    apiFetch<{ id: number; date: string; message: string; report?: DailyReport }>("/api/logs", { method: "POST", body: payload, token }),

  getLogs: (token: string, params?: { limit?: number; offset?: number; from?: string; to?: string }) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return apiFetch<{ logs: LogResponse[]; total: number }>((`/api/logs${qs}`), { token });
  },

  getLog: (token: string, date: string) =>
    apiFetch<LogResponse>(`/api/logs/${date}`, { token }),

  deleteLog: (token: string, date: string) =>
    apiFetch<{ message: string; date: string }>(`/api/logs/${date}`, { method: "DELETE", token }),

  insights: (token: string) =>
    apiFetch<{ summary: { total_insights: number; general_tips: string[] }; insights: any[]; message?: string }>("/api/insights", { token }),

  health: () =>
    apiFetch<{ status: string; version: string }>("/api/health"),
};
