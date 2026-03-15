const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }

  return res.json();
}

// ---- Convenience helpers ----

export const api = {
  // Health check
  health: () => apiFetch("/health"),

  // Bias scan
  biasScan: (text: string) =>
    apiFetch("/api/v1/bias/scan", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Classes
  listClasses: (orgId?: string) =>
    apiFetch(`/api/v1/classes${orgId ? `?org_id=${orgId}` : ""}`),

  createClass: (data: { name: string; grade: string; subject: string; organization_id: string }) =>
    apiFetch("/api/v1/classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Lessons
  createLesson: (data: {
    class_id: string;
    title: string;
    subject: string;
    topic: string;
    learning_objective: string;
    base_material?: string;
    grade_level?: number;
    generate_differentiation?: boolean;
  }) =>
    apiFetch("/api/v1/lessons", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listLessonsForClass: (classId: string) =>
    apiFetch(`/api/v1/lessons/by-class/${classId}`),

  // Students
  listStudents: (orgId?: string) =>
    apiFetch(`/api/v1/students${orgId ? `?org_id=${orgId}` : ""}`),

  getRecommendation: (studentId: string) =>
    apiFetch(`/api/v1/students/${studentId}/recommendation`),
};
