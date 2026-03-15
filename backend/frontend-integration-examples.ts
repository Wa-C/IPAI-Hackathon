// ============================================================
// COPA Frontend Integration Examples
// ============================================================
// These examples show how to connect the Next.js frontend to
// the FastAPI backend. Drop the api-client into lib/ and use
// the patterns in your page components.
// ============================================================

// ---- lib/api-client.ts ----

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Get the Supabase session token from your auth provider
  const token = typeof window !== "undefined"
    ? localStorage.getItem("sb-access-token") // or from supabase.auth.getSession()
    : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }

  return res.json();
}

// ---- Example 1: Teacher Dashboard - Fetch classes & analytics ----

async function fetchTeacherDashboard(orgId: string) {
  const [classes, biasOverview] = await Promise.all([
    apiFetch<any[]>(`/api/v1/classes?org_id=${orgId}`),
    apiFetch<any>(`/api/v1/analytics/organizations/${orgId}/bias-overview`),
  ]);
  return { classes, biasOverview };
}

// Usage in a React component:
// const { classes, biasOverview } = await fetchTeacherDashboard(organisation.id);

// ---- Example 2: Lesson Builder - Create a lesson ----

interface CreateLessonPayload {
  class_id: string;
  title: string;
  subject: string;
  topic: string;
  learning_objective: string;
  base_material?: string;
  grade_level?: number;
  duration?: number;
  generate_differentiation: boolean;
}

async function createLesson(payload: CreateLessonPayload) {
  return apiFetch<any>("/api/v1/lessons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Usage:
// const lesson = await createLesson({
//   class_id: selectedClass.id,
//   title: "Introduction to Shakespeare",
//   subject: "English",
//   topic: "Romeo and Juliet",
//   learning_objective: "Understand historical context...",
//   base_material: editorContent,
//   grade_level: 10,
//   generate_differentiation: true,
// });

// ---- Example 3: Bias Scanner ----

async function runBiasScan(text: string, materialId?: string) {
  return apiFetch<any>("/api/v1/bias/scan", {
    method: "POST",
    body: JSON.stringify({
      text,
      material_id: materialId || null,
    }),
  });
}

async function resolveBiasIssue(issueId: string) {
  return apiFetch<any>(`/api/v1/bias/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved: true }),
  });
}

// Usage:
// const scanResult = await runBiasScan(materialContent);
// scanResult.issues.forEach(issue => {
//   console.log(`${issue.category}: ${issue.original_phrase} -> ${issue.suggestion}`);
// });

// ---- Example 4: Student Dashboard - Recommendation ----

async function fetchStudentDashboard(studentId: string) {
  const [recommendation, preferences] = await Promise.all([
    apiFetch<any>(`/api/v1/students/${studentId}/recommendation`),
    apiFetch<any>(`/api/v1/students/${studentId}/preferences`),
  ]);
  return { recommendation, preferences };
}

// Usage:
// const { recommendation, preferences } = await fetchStudentDashboard(user.id);
// console.log(`Recommended mode: ${recommendation.recommended_mode}`);

// ---- Example 5: Student Preferences Update ----

async function updateLearningPreference(studentId: string, mode: string) {
  return apiFetch<any>(`/api/v1/students/${studentId}/preferences`, {
    method: "PATCH",
    body: JSON.stringify({ manual: mode }),
  });
}
