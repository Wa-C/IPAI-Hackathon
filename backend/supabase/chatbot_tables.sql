-- ============================================================
-- CHATBOT: KNOWLEDGE TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_knowledge (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    concept     TEXT NOT NULL,
    mastery     NUMERIC DEFAULT 0.0 CHECK (mastery >= 0.0 AND mastery <= 1.0),
    attempts    INT DEFAULT 0,
    correct     NUMERIC DEFAULT 0.0,
    struggles   JSONB DEFAULT '[]'::jsonb,
    last_seen   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (student_id, lesson_id, concept)
);

CREATE INDEX IF NOT EXISTS idx_chat_knowledge_student ON chat_knowledge(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_knowledge_lesson  ON chat_knowledge(lesson_id);

-- ============================================================
-- CHATBOT: SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    phase           TEXT DEFAULT 'warmup' CHECK (phase IN ('warmup', 'chat', 'exercise', 'wrapup')),
    messages        JSONB DEFAULT '[]'::jsonb,
    exercises_given INT DEFAULT 0,
    exercises_correct INT DEFAULT 0,
    tasks_state     JSONB DEFAULT NULL,
    started_at      TIMESTAMPTZ DEFAULT now(),
    ended_at        TIMESTAMPTZ,
    duration_minutes INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_student ON chat_sessions(student_id);

-- ============================================================
-- CHATBOT: BADGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_badges (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    badge_type  TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    earned_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (student_id, badge_type)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE chat_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_badges    ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_knowledge_select ON chat_knowledge FOR SELECT USING (TRUE);
CREATE POLICY chat_knowledge_insert ON chat_knowledge FOR INSERT WITH CHECK (TRUE);
CREATE POLICY chat_knowledge_update ON chat_knowledge FOR UPDATE USING (TRUE);

CREATE POLICY chat_sessions_select ON chat_sessions FOR SELECT USING (TRUE);
CREATE POLICY chat_sessions_insert ON chat_sessions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY chat_sessions_update ON chat_sessions FOR UPDATE USING (TRUE);

CREATE POLICY chat_badges_select ON chat_badges FOR SELECT USING (TRUE);
CREATE POLICY chat_badges_insert ON chat_badges FOR INSERT WITH CHECK (TRUE);
