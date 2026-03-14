import { useState, useEffect, useRef } from "react";

const API = "http://localhost:8000/api";
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Progress Timeline ────────────────────
function ProgressTimeline({ student }) {
  const [timeline, setTimeline] = useState([]);
  const [weeklyTime, setWeeklyTime] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!student) return;
    api(`/students/${student.id}/progress`).then(setTimeline).catch(() => {});
    api(`/students/${student.id}/weekly-time`).then(setWeeklyTime).catch(() => {});
    api(`/students/${student.id}/badges`).then(setBadges).catch(() => {});
  }, [student?.id]);

  const statusColor = (pct, isCurrent) => {
    if (pct >= 100) return "#2e7d32";
    if (pct >= 50) return "#e65100";
    if (isCurrent) return "#1565c0";
    return "#888";
  };

  const statusBg = (pct, isCurrent) => {
    if (pct >= 100) return "#e8f5e9";
    if (pct >= 50) return "#fff3e0";
    if (isCurrent) return "#e3f2fd";
    return "#f5f5f0";
  };

  return (
    <div style={{ maxWidth: 620, margin: "2rem auto", padding: "0 1.5rem" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>My progress</h2>

      {/* Weekly time tracker */}
      {weeklyTime && (
        <div style={{ background: "#f5f5f0", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>This week</span>
            <span style={{ fontSize: "0.85rem", color: "#666" }}>
              {Math.round(weeklyTime.total_minutes)}m / {weeklyTime.goal_minutes}m goal
            </span>
          </div>
          <div style={{ height: 10, background: "#ddd", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(weeklyTime.pct_complete, 100)}%`, background: weeklyTime.pct_complete >= 100 ? "#2e7d32" : "#6d5cdb", borderRadius: 5, transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
            {weeklyTime.sessions_this_week} session{weeklyTime.sessions_this_week !== 1 ? "s" : ""} this week
            {weeklyTime.pct_complete >= 100 && <span style={{ color: "#2e7d32", fontWeight: 600, marginLeft: "0.5rem" }}>Goal reached!</span>}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 500, marginBottom: "0.5rem" }}>Badges</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {badges.map((b, i) => (
              <div key={i} title={b.description} style={{
                padding: "0.3rem 0.7rem", borderRadius: "1rem", fontSize: "0.8rem", fontWeight: 500,
                background: "#eeedfe", color: "#534ab7", border: "1px solid #cecbf6", cursor: "default"
              }}>
                {b.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course timeline */}
      <h3 style={{ fontSize: "0.95rem", fontWeight: 500, marginBottom: "0.75rem" }}>Course timeline</h3>
      {timeline.length === 0 && <p style={{ fontSize: "0.85rem", color: "#888" }}>No courses yet. Upload one in the Courses tab.</p>}

      {timeline.map((c, i) => (
        <div key={c.course_id} style={{
          display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.75rem",
          padding: "0.75rem 1rem", borderRadius: "0.75rem",
          background: statusBg(c.completion_pct, c.is_current),
          border: c.is_current ? "2px solid #6d5cdb" : "1px solid #e5e5e0"
        }}>
          {/* Progress circle */}
          <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#ddd" strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="none" stroke={statusColor(c.completion_pct, c.is_current)}
                strokeWidth="4" strokeLinecap="round" strokeDasharray={`${c.completion_pct * 1.256} 125.6`}
                transform="rotate(-90 24 24)" style={{ transition: "stroke-dasharray 0.5s" }} />
            </svg>
            <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              fontSize: "0.7rem", fontWeight: 600, color: statusColor(c.completion_pct, c.is_current) }}>
              {c.completion_pct}%
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                {c.title}
                {c.is_current && <span style={{ fontSize: "0.7rem", color: "#6d5cdb", marginLeft: "0.5rem", fontWeight: 600 }}>CURRENT</span>}
              </span>
              {c.week_number > 0 && <span style={{ fontSize: "0.75rem", color: "#888" }}>Week {c.week_number}</span>}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.2rem" }}>
              {c.subject && <span>{c.subject} — </span>}
              {c.concepts_mastered}/{c.concepts_total} concepts
              {c.completion_pct >= 100 ? (
                <span style={{ color: "#2e7d32", fontWeight: 500, marginLeft: "0.5rem" }}>Completed</span>
              ) : c.status === "in_progress" ? (
                <span style={{ color: "#e65100", marginLeft: "0.5rem" }}>In progress</span>
              ) : (
                <span style={{ color: "#888", marginLeft: "0.5rem" }}>Will be revised later</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {timeline.some(c => c.completion_pct < 100 && !c.is_current) && (
        <p style={{ fontSize: "0.8rem", color: "#888", fontStyle: "italic", marginTop: "0.5rem" }}>
          Incomplete past courses will be revisited in future sessions — your scores will update as you improve.
        </p>
      )}
    </div>
  );
}

// ─── Chat View ──────────────────────────
function ChatView({ student }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("warmup");
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseAnswer, setExerciseAnswer] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [exercisePrompt, setExercisePrompt] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(`chat_${student.id}`);
    if (saved) {
      const d = JSON.parse(saved);
      setMessages(d.messages || []); setSessionId(d.sessionId || null);
      setPhase(d.phase || "warmup"); setCurrentExercise(d.currentExercise || null);
      setTasks(d.tasks || []);
    } else {
      setMessages([]); setSessionId(null); setPhase("warmup"); setCurrentExercise(null);
      setTasks([]);
    }
    setEvalResult(null); setExerciseAnswer(""); setNewBadges([]);
    // Fetch the current course's exercise prompt to show pending bar even before first message
    api("/courses").then(courses => {
      const current = courses.find(c => c.is_current);
      if (current?.exercise_prompt) setExercisePrompt(current.exercise_prompt);
    }).catch(() => {});
  }, [student.id]);

  useEffect(() => {
    if (messages.length > 0 || sessionId) {
      sessionStorage.setItem(`chat_${student.id}`, JSON.stringify({ messages, sessionId, phase, currentExercise, tasks }));
    }
  }, [messages, sessionId, phase, currentExercise, tasks, student.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, evalResult, newBadges]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input; setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true); setEvalResult(null); setNewBadges([]);
    try {
      const res = await api("/chat", { method: "POST", body: JSON.stringify({ student_id: student.id, message: userMsg, session_id: sessionId }) });

      if (res.course_changed) {
        sessionStorage.removeItem(`chat_${student.id}`);
        setMessages([{ role: "assistant", text: "📚 Course updated! Starting fresh with the new material." }]);
        setSessionId(res.session_id);
        setPhase(res.phase || "warmup");
        setCurrentExercise(null);
        setLoading(false);
        return;
      }

      setSessionId(res.session_id);
      setMessages(m => [...m, { role: "assistant", text: res.response }]);
      if (res.exercise) setCurrentExercise(res.exercise);
      if (res.phase) setPhase(res.phase);
      if (res.new_badges?.length) setNewBadges(res.new_badges);
      if (res.tasks !== undefined) setTasks(res.tasks || []);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: "Sorry, something went wrong." }]);
    }
    setLoading(false);
  }

  async function submitExerciseAnswer() {
    if (!exerciseAnswer.trim() || !currentExercise || loading) return;
    setLoading(true);
    try {
      const res = await api("/exercises/evaluate", { method: "POST", body: JSON.stringify({ student_id: student.id, session_id: sessionId || 0, exercise: currentExercise, answer: exerciseAnswer }) });
      setEvalResult(res);
      setMessages(m => [...m,
        { role: "user", text: `My answer: ${exerciseAnswer}` },
        { role: "assistant", text: `${res.grade === "correct" ? "Correct!" : res.grade === "partial" ? "Partially correct." : "Not quite."} ${res.feedback}` }
      ]);
      setExerciseAnswer("");
    } catch (e) { setEvalResult({ grade: "error", feedback: "Failed to evaluate." }); }
    setLoading(false);
  }

  function clearSession() {
    setMessages([]); setSessionId(null); setCurrentExercise(null);
    setEvalResult(null); setPhase("warmup"); setNewBadges([]); setTasks([]); setExercisePrompt("");
    sessionStorage.removeItem(`chat_${student.id}`);
  }

  const phaseLabel = { onboarding: "Getting to know you", warmup: "Warmup", lesson: "Lesson", practice: "Practice", wrapup: "Wrap up" };
  const phaseColor = { onboarding: "#6d5cdb", warmup: "#1d9e75", lesson: "#378add", practice: "#d85a30", wrapup: "#888" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 1.5rem 0" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: phaseColor[phase] || "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {phaseLabel[phase] || phase}
        </span>
        <button onClick={clearSession} style={{ fontSize: "0.75rem", color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>New session</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.5rem 1.5rem" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#888", marginTop: "3rem" }}>
            <p style={{ fontSize: "1.2rem", fontWeight: 500 }}>
              {student.onboarded ? `Welcome back, ${student.name}!` : `Hi ${student.name}!`}
            </p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
              {student.onboarded ? "Ready to continue learning? Say hi!" : "Say hello and I'll introduce myself!"}
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "0.6rem" }}>
            <div style={{ maxWidth: "75%", padding: "0.65rem 0.9rem", borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem", background: msg.role === "user" ? "#6d5cdb" : "#f0f0ec", color: msg.role === "user" ? "#fff" : "#1a1a1a", fontSize: "0.9rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ display: "flex" }}><div style={{ padding: "0.65rem 0.9rem", borderRadius: "1rem 1rem 1rem 0.25rem", background: "#f0f0ec", color: "#888", fontSize: "0.85rem" }}>Thinking...</div></div>}

        {/* Badge notification */}
        {newBadges.length > 0 && newBadges.map((b, i) => (
          <div key={i} style={{ textAlign: "center", margin: "0.75rem 0", padding: "0.6rem", background: "#eeedfe", borderRadius: "0.75rem", border: "1px solid #cecbf6" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#534ab7" }}>New badge: {b.title}!</span>
            <p style={{ fontSize: "0.75rem", color: "#666", margin: "0.15rem 0 0" }}>{b.description}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Exercise panel */}
      {currentExercise && !evalResult && (
        <div style={{ margin: "0 1.5rem 0.5rem", padding: "0.75rem", background: "#fef9e7", border: "1px solid #f0e6b8", borderRadius: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#b8860b", textTransform: "uppercase" }}>{currentExercise.type === "quiz" ? "Quiz" : currentExercise.type === "game" ? `Game` : "Open question"}</span>
            <button onClick={() => { setCurrentExercise(null); setEvalResult(null); }} style={{ fontSize: "0.7rem", cursor: "pointer", border: "none", background: "none", color: "#888" }}>skip</button>
          </div>
          <p style={{ fontSize: "0.85rem", margin: "0 0 0.5rem", fontWeight: 500 }}>{currentExercise.question}</p>
          {currentExercise.type === "quiz" && currentExercise.options ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.5rem" }}>
              {currentExercise.options.map((opt, i) => (
                <button key={i} onClick={() => setExerciseAnswer(opt.charAt(0))} style={{ textAlign: "left", padding: "0.4rem 0.6rem", border: exerciseAnswer === opt.charAt(0) ? "2px solid #6d5cdb" : "1px solid #ddd", borderRadius: "0.4rem", background: exerciseAnswer === opt.charAt(0) ? "#eeedfe" : "#fff", cursor: "pointer", fontSize: "0.8rem" }}>{opt}</button>
              ))}
            </div>
          ) : (
            <textarea value={exerciseAnswer} onChange={e => setExerciseAnswer(e.target.value)} rows={2} placeholder="Your answer..." style={{ width: "100%", padding: "0.4rem", border: "1px solid #ddd", borderRadius: "0.4rem", fontSize: "0.8rem", resize: "vertical", boxSizing: "border-box" }} />
          )}
          <button onClick={submitExerciseAnswer} disabled={!exerciseAnswer.trim() || loading} style={{ marginTop: "0.4rem", padding: "0.4rem 1rem", background: "#6d5cdb", color: "#fff", border: "none", borderRadius: "0.4rem", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}>Submit</button>
        </div>
      )}

      {evalResult && evalResult.grade !== "error" && (
        <div style={{ margin: "0 1.5rem 0.5rem", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", background: evalResult.grade === "correct" ? "#e8f5e9" : evalResult.grade === "partial" ? "#fff3e0" : "#fce4ec" }}>
          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: evalResult.grade === "correct" ? "#2e7d32" : evalResult.grade === "partial" ? "#e65100" : "#c62828" }}>
            {evalResult.grade === "correct" ? "Correct!" : evalResult.grade === "partial" ? "Partially correct" : "Not quite"}
          </span>
          <button onClick={() => { setCurrentExercise(null); setEvalResult(null); }} style={{ marginLeft: "1rem", fontSize: "0.7rem", border: "none", background: "none", color: "#888", textDecoration: "underline", cursor: "pointer" }}>Continue</button>
        </div>
      )}

      {/* Task progress — dynamic goals */}
      {(tasks.length > 0 || exercisePrompt) && (
        <div style={{ margin: "0 1.5rem 0.5rem", padding: "0.6rem 0.85rem", background: "#fafaf8", border: "1px solid #e5e5e0", borderRadius: "0.75rem" }}>
          {tasks.length === 0 && exercisePrompt ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" }}>Today's goals</span>
                <span style={{ fontSize: "0.72rem", color: "#aaa" }}>Start chatting to unlock</span>
              </div>
              <div style={{ height: 4, background: "#e5e5e0", borderRadius: 2 }} />
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" }}>Today's goals</span>
                <span style={{ fontSize: "0.72rem", color: tasks.every(t => t.done) ? "#2e7d32" : "#888", fontWeight: tasks.every(t => t.done) ? 600 : 400 }}>
                  {tasks.filter(t => t.done).length}/{tasks.length}{tasks.every(t => t.done) ? " 🎉" : ""}
                </span>
              </div>
              <div style={{ height: 4, background: "#e5e5e0", borderRadius: 2, overflow: "hidden", marginBottom: "0.5rem" }}>
                <div style={{
                  height: "100%",
                  width: `${(tasks.filter(t => t.done).length / tasks.length) * 100}%`,
                  background: tasks.every(t => t.done) ? "#2e7d32" : "#6d5cdb",
                  borderRadius: 2, transition: "width 0.4s"
                }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {tasks.map((t, i) => {
                  const attempts = t.attempts || 0;
                  const showHint = !t.done && attempts >= 3;
                  const isNext = !t.done && tasks.slice(0, i).every(prev => prev.done);
                  return (
                    <div key={t.id || i} style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: "0.15rem"
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8rem", fontWeight: 700,
                        background: t.done ? "#2e7d32" : isNext ? "#6d5cdb" : "#e5e5e0",
                        color: t.done || isNext ? "#fff" : "#aaa",
                        border: isNext && !t.done ? "2px solid #6d5cdb" : "none",
                        transition: "all 0.3s",
                        cursor: "default",
                        boxShadow: isNext && !t.done ? "0 0 0 3px rgba(109,92,219,0.15)" : "none"
                      }}>
                        {t.done ? "✓" : i + 1}
                      </div>
                      {showHint && (
                        <span style={{
                          fontSize: "0.62rem", color: "#e65100", fontStyle: "italic",
                          maxWidth: 70, textAlign: "center", lineHeight: 1.2
                        }}>
                          {t.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "0.6rem 1.5rem", borderTop: "1px solid #e5e5e0" }}>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Type a message..." style={{ flex: 1, padding: "0.6rem 0.9rem", border: "1px solid #d0d0cc", borderRadius: "0.6rem", fontSize: "0.9rem", outline: "none" }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "0.6rem 1.2rem", background: loading || !input.trim() ? "#c4c0d4" : "#6d5cdb", color: "#fff", border: "none", borderRadius: "0.6rem", cursor: loading || !input.trim() ? "default" : "pointer", fontWeight: 500, fontSize: "0.9rem" }}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Setup ──────────────────────
function StudentSetup({ onCreated }) {
  const [form, setForm] = useState({ name: "", age: 16, interests: "", learning_style: "visual", issues: "", notes: "", weekly_goal_minutes: 120 });
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      const student = await api("/students", { method: "POST", body: JSON.stringify({ ...form, interests: form.interests.split(",").map(s => s.trim()).filter(Boolean), issues: form.issues.split(",").map(s => s.trim()).filter(Boolean) }) });
      onCreated(student);
    } catch (e) { alert("Failed to create student"); }
    setLoading(false);
  }
  const fs = { width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #d0d0cc", borderRadius: "0.5rem", fontSize: "0.85rem", boxSizing: "border-box" };
  return (
    <div style={{ maxWidth: 460, margin: "2.5rem auto", padding: "0 1.5rem" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "1.5rem" }}>New student profile</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <div><label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={fs} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Age</label><input type="number" value={form.age} onChange={e => setForm({ ...form, age: parseInt(e.target.value) })} style={fs} /></div>
          <div><label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Weekly goal (min)</label><input type="number" value={form.weekly_goal_minutes} onChange={e => setForm({ ...form, weekly_goal_minutes: parseInt(e.target.value) })} style={fs} /></div>
        </div>
        <div><label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Interests</label><input value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} placeholder="football, gaming, music" style={fs} /></div>
        <div><label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Learning style</label><select value={form.learning_style} onChange={e => setForm({ ...form, learning_style: e.target.value })} style={fs}><option value="visual">Visual</option><option value="auditory">Auditory</option><option value="kinesthetic">Kinesthetic</option><option value="reading">Reading/Writing</option></select></div>
        <div><label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Known issues</label><input value={form.issues} onChange={e => setForm({ ...form, issues: e.target.value })} placeholder="lack of focus, dyslexia" style={fs} /></div>
        <button type="submit" disabled={loading || !form.name} style={{ padding: "0.6rem", background: "#6d5cdb", color: "#fff", border: "none", borderRadius: "0.5rem", fontWeight: 500, cursor: "pointer", marginTop: "0.25rem" }}>{loading ? "Creating..." : "Create profile"}</button>
      </form>
    </div>
  );
}

// ─── Course Upload ──────────────────────
function CourseUpload() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState(""); const [subject, setSubject] = useState(""); const [weekNum, setWeekNum] = useState(1);
  const [file, setFile] = useState(null); const [uploading, setUploading] = useState(false); const [status, setStatus] = useState("");
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [promptText, setPromptText] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [promptStatus, setPromptStatus] = useState("");
  const [promptSaved, setPromptSaved] = useState({}); // {course_id: true} for courses with saved prompts
  useEffect(() => { api("/courses").then(setCourses).catch(() => {}); }, []);

  async function upload(e) {
    e.preventDefault(); if (!file || !title) return; setUploading(true); setStatus("Processing...");
    const fd = new FormData(); fd.append("file", file); fd.append("title", title); fd.append("subject", subject); fd.append("week_number", weekNum);
    try {
      const res = await fetch(`${API}/courses/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(); const course = await res.json();
      setCourses(c => [...c, course]); setStatus(`Done! ${course.chunk_count} chunks.`);
      setTitle(""); setSubject(""); setFile(null);
    } catch (e) { setStatus("Upload failed."); }
    setUploading(false);
  }

  async function deleteCourse(id) {
    if (!confirm("Delete this course?")) return;
    try {
      await api(`/courses/${id}`, { method: "DELETE" });
      setCourses(c => c.filter(x => x.id !== id));
      if (editingPrompt === id) setEditingPrompt(null);
      Object.keys(sessionStorage).filter(k => k.startsWith("chat_")).forEach(k => sessionStorage.removeItem(k));
    } catch (e) { alert("Failed"); }
  }

  async function setCurrent(id) {
    try { await api(`/courses/${id}/set-current`, { method: "PATCH" }); setCourses(c => c.map(x => ({ ...x, is_current: x.id === id }))); } catch (e) { alert("Failed"); }
  }

  async function openPromptEditor(course) {
    setEditingPrompt(course.id);
    setPromptStatus("");
    try {
      const data = await api(`/courses/${course.id}/exercise-prompt`);
      setPromptText(data.prompt || "");
      if (data.prompt) setPromptSaved(s => ({ ...s, [course.id]: true }));
    } catch { setPromptText(""); }
  }

  async function savePrompt() {
    if (!editingPrompt) return;
    setSavingPrompt(true); setPromptStatus("");
    try {
      await api(`/courses/${editingPrompt}/exercise-prompt`, { method: "PUT", body: JSON.stringify({ prompt: promptText }) });
      setPromptStatus("Saved!");
      setPromptSaved(s => ({ ...s, [editingPrompt]: !!promptText.trim() }));
      Object.keys(sessionStorage).filter(k => k.startsWith("chat_")).forEach(k => sessionStorage.removeItem(k));
    } catch { setPromptStatus("Save failed."); }
    setSavingPrompt(false);
  }

  const fs = { width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #d0d0cc", borderRadius: "0.5rem", fontSize: "0.85rem", boxSizing: "border-box" };
  return (
    <div style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1.5rem" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "1.5rem" }}>Course materials</h2>
      <form onSubmit={upload} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.7fr", gap: "0.6rem" }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" required style={fs} />
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" style={fs} />
          <input type="number" value={weekNum} onChange={e => setWeekNum(parseInt(e.target.value))} placeholder="Week" min={1} style={fs} />
        </div>
        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ fontSize: "0.85rem" }} />
        <button type="submit" disabled={uploading || !file || !title} style={{ padding: "0.5rem", background: "#6d5cdb", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 500 }}>{uploading ? "Processing..." : "Upload PDF"}</button>
        {status && <p style={{ fontSize: "0.8rem", color: "#666" }}>{status}</p>}
      </form>

      {courses.length > 0 && courses.map(c => (
        <div key={c.id} style={{ border: c.is_current ? "2px solid #6d5cdb" : "1px solid #e5e5e0", borderRadius: "0.6rem", marginBottom: "0.6rem", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.8rem", background: editingPrompt === c.id ? "#f5f3ff" : "#fff" }}>
            <div>
              <strong style={{ fontSize: "0.85rem" }}>{c.title}</strong>
              {c.subject && <span style={{ color: "#888", fontSize: "0.8rem" }}> — {c.subject}</span>}
              <span style={{ color: "#aaa", fontSize: "0.75rem", marginLeft: "0.5rem" }}>W{c.week_number} ({c.chunk_count}ch)</span>
              {c.is_current && <span style={{ fontSize: "0.65rem", color: "#6d5cdb", fontWeight: 600, marginLeft: "0.5rem" }}>CURRENT</span>}
              {promptSaved[c.id] && <span style={{ fontSize: "0.65rem", color: "#1d9e75", fontWeight: 600, marginLeft: "0.5rem" }}>✓ exercises set</span>}
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button onClick={() => editingPrompt === c.id ? setEditingPrompt(null) : openPromptEditor(c)}
                style={{ fontSize: "0.7rem", color: "#1d9e75", background: "none", border: "1px solid #1d9e75", borderRadius: "0.3rem", padding: "0.2rem 0.5rem", cursor: "pointer" }}>
                {editingPrompt === c.id ? "Close" : "✎ Exercises"}
              </button>
              {!c.is_current && <button onClick={() => setCurrent(c.id)} style={{ fontSize: "0.7rem", color: "#6d5cdb", background: "none", border: "1px solid #6d5cdb", borderRadius: "0.3rem", padding: "0.2rem 0.5rem", cursor: "pointer" }}>Set current</button>}
              <button onClick={() => deleteCourse(c.id)} style={{ fontSize: "0.7rem", color: "#c62828", background: "none", border: "1px solid #ef9a9a", borderRadius: "0.3rem", padding: "0.2rem 0.5rem", cursor: "pointer" }}>Delete</button>
            </div>
          </div>

          {editingPrompt === c.id && (
            <div style={{ padding: "0.9rem", background: "#f9f8ff", borderTop: "1px solid #e5e5f0" }}>
              <p style={{ fontSize: "0.78rem", color: "#555", margin: "0 0 0.6rem", lineHeight: 1.5 }}>
                Write your exercise instructions in plain language. COPA will guide the student through them naturally in conversation.
              </p>
              <p style={{ fontSize: "0.72rem", color: "#888", margin: "0 0 0.5rem", fontStyle: "italic" }}>
                Example: "I want the student to write 5 sentences using present perfect: 1 affirmative, 2 negative, and 2 interrogative. Use contexts related to their life."
              </p>
              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                rows={4}
                placeholder="Describe what you want the student to do..."
                style={{ ...fs, resize: "vertical", lineHeight: 1.5 }}
              />
              {promptText.trim() && (
                <div style={{ margin: "0.4rem 0", padding: "0.5rem 0.7rem", background: "#fffbf0", border: "1px solid #ffe082", borderRadius: "0.4rem", fontSize: "0.75rem", color: "#7a5c00" }}>
                  <strong>Saved prompt:</strong> {promptText.trim().slice(0, 120)}{promptText.trim().length > 120 ? "…" : ""}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}>
                <button onClick={savePrompt} disabled={savingPrompt} style={{ padding: "0.4rem 0.9rem", background: "#1d9e75", color: "#fff", border: "none", borderRadius: "0.4rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
                  {savingPrompt ? "Saving…" : "Save exercises"}
                </button>
                {promptText && <button onClick={() => setPromptText("")} style={{ padding: "0.4rem 0.7rem", background: "none", border: "1px solid #ddd", borderRadius: "0.4rem", cursor: "pointer", fontSize: "0.78rem", color: "#888" }}>Clear</button>}
                {promptStatus && <span style={{ fontSize: "0.75rem", color: promptStatus.includes("failed") ? "#c62828" : "#2e7d32" }}>{promptStatus}</span>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Teacher Dashboard ──────────────────
function Dashboard() {
  const [data, setData] = useState([]);
  useEffect(() => { api("/dashboard").then(setData).catch(() => {}); }, []);
  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1.5rem" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "1rem" }}>Teacher dashboard</h2>
      {data.length === 0 && <p style={{ color: "#888", fontSize: "0.9rem" }}>No students yet.</p>}
      {data.map(s => (
        <div key={s.id} style={{ padding: "0.75rem 1rem", border: "1px solid #e5e5e0", borderRadius: "0.75rem", marginBottom: "0.6rem", background: s.red_flags.length ? "#fce4ec" : "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{s.name} <span style={{ color: "#888", fontWeight: 400, fontSize: "0.8rem" }}>age {s.age}</span></span>
            <span style={{ fontSize: "0.8rem", color: s.goal_pct >= 100 ? "#2e7d32" : s.goal_pct >= 50 ? "#e65100" : "#c62828" }}>{s.weekly_minutes}m / {s.weekly_goal}m</span>
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", fontSize: "0.8rem", color: "#666" }}>
            <span>{s.sessions_this_week} sessions</span>
            <span>Mastery: {s.avg_mastery}%</span>
            <span>{s.concepts_tracked} concepts</span>
            {!s.onboarded && <span style={{ color: "#e65100" }}>Not onboarded</span>}
          </div>
          {s.red_flags.length > 0 && (
            <div style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: "#c62828", fontWeight: 500 }}>Red flags: {s.red_flags.join("; ")}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Report View ────────────────────────
function ReportView({ student }) {
  const [report, setReport] = useState(null); const [loading, setLoading] = useState(false);
  async function load() { setLoading(true); try { setReport(await api(`/students/${student.id}/report?weeks=1`)); } catch (e) { alert("Failed"); } setLoading(false); }
  const badge = (bg, color) => ({ display: "inline-block", padding: "0.25rem 0.5rem", borderRadius: "0.3rem", fontSize: "0.75rem", background: bg, color, marginRight: "0.3rem", marginBottom: "0.3rem" });
  return (
    <div style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1.5rem" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>Report — {student.name}</h2>
      <button onClick={load} disabled={loading} style={{ padding: "0.5rem 1rem", background: "#6d5cdb", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 500, marginBottom: "1.5rem" }}>{loading ? "Generating..." : "Generate report"}</button>
      {report && (<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
          {[["Time", `${Math.round(report.total_time_minutes)}m`], ["Sessions", report.total_sessions], ["Exercises", `${report.exercises_correct}/${report.exercises_attempted}`]].map(([l, v], i) => (
            <div key={i} style={{ background: "#f5f5f0", borderRadius: "0.5rem", padding: "0.6rem" }}><div style={{ fontSize: "0.7rem", color: "#888" }}>{l}</div><div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{v}</div></div>
          ))}
        </div>
        {report.achievements?.length > 0 && <div><h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.3rem" }}>Achievements</h4>{report.achievements.map((a, i) => <span key={i} style={badge("#e8f5e9", "#2e7d32")}>{a}</span>)}</div>}
        {report.strengths?.length > 0 && <div><h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.3rem" }}>Strengths</h4>{report.strengths.map((s, i) => <span key={i} style={badge("#e3f2fd", "#1565c0")}>{s}</span>)}</div>}
        {report.weaknesses?.length > 0 && <div><h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.3rem" }}>Weaknesses</h4>{report.weaknesses.map((w, i) => <span key={i} style={badge("#fff3e0", "#e65100")}>{w}</span>)}</div>}
        {report.red_flags?.length > 0 && <div style={{ padding: "0.6rem", background: "#fce4ec", borderRadius: "0.5rem" }}><h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c62828", margin: 0 }}>Red flags</h4>{report.red_flags.map((f, i) => <p key={i} style={{ fontSize: "0.8rem", color: "#b71c1c", margin: "0.2rem 0 0" }}>{f}</p>)}</div>}
        {report.recommendations?.length > 0 && <div><h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.3rem" }}>Recommendations</h4>{report.recommendations.map((r, i) => <p key={i} style={{ fontSize: "0.8rem", color: "#555", margin: "0.2rem 0" }}>{r}</p>)}</div>}
      </div>)}
    </div>
  );
}

// ─── Main App ───────────────────────────
export default function App() {
  const [view, setView] = useState("chat");
  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);

  useEffect(() => {
    api("/students").then(s => { setStudents(s); if (s.length > 0) setActiveStudent(s[0]); else setView("setup"); }).catch(() => setView("setup"));
  }, []);

  const nav = v => ({ padding: "0.4rem 0.8rem", background: view === v ? "#6d5cdb" : "transparent", color: view === v ? "#fff" : "#555", border: "none", borderRadius: "0.35rem", cursor: "pointer", fontSize: "0.82rem", fontWeight: 500 });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 1.5rem", borderBottom: "1px solid #e5e5e0", background: "#fafaf8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em" }}>COPA</span>
          <nav style={{ display: "flex", gap: "0.2rem" }}>
            <button style={nav("chat")} onClick={() => setView("chat")}>Chat</button>
            <button style={nav("progress")} onClick={() => setView("progress")}>Progress</button>
            <button style={nav("courses")} onClick={() => setView("courses")}>Courses</button>
            <button style={nav("dashboard")} onClick={() => setView("dashboard")}>Dashboard</button>
            <button style={nav("report")} onClick={() => setView("report")}>Report</button>
            <button style={nav("setup")} onClick={() => setView("setup")}>+ Student</button>
          </nav>
        </div>
        {activeStudent && (
          <select value={activeStudent.id} onChange={e => { const s = students.find(s => s.id === parseInt(e.target.value)); setActiveStudent(s); }}
            style={{ padding: "0.35rem 0.5rem", border: "1px solid #d0d0cc", borderRadius: "0.35rem", fontSize: "0.8rem" }}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </header>
      <main style={{ flex: 1, overflow: "hidden" }}>
        {view === "chat" && activeStudent && <ChatView student={activeStudent} />}
        {view === "progress" && activeStudent && <ProgressTimeline student={activeStudent} />}
        {view === "courses" && <CourseUpload />}
        {view === "dashboard" && <Dashboard />}
        {view === "report" && activeStudent && <ReportView student={activeStudent} />}
        {view === "setup" && <StudentSetup onCreated={s => { setStudents(prev => [...prev, s]); setActiveStudent(s); setView("chat"); }} />}
      </main>
    </div>
  );
}