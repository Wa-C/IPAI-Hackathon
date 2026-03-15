-- ============================================================
-- EdCopilot Supabase Schema
-- Copy-paste this into the Supabase SQL Editor and run.
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ORGANISATIONS
-- ============================================================
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    code            TEXT UNIQUE NOT NULL,
    webhook_url     TEXT,
    -- settings
    allow_lms_integration           BOOLEAN DEFAULT TRUE,
    allow_third_party_content       BOOLEAN DEFAULT TRUE,
    enable_federated_learning       BOOLEAN DEFAULT TRUE,
    send_anonymised_signals         BOOLEAN DEFAULT TRUE,
    participate_in_model_improvement BOOLEAN DEFAULT TRUE,
    model_version   TEXT DEFAULT 'v1.0.0',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. PROFILES  (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    name        TEXT NOT NULL DEFAULT '',
    role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('teacher', 'student', 'org_admin', 'it_admin')),
    avatar_url  TEXT,
    language    TEXT DEFAULT 'en',
    timezone    TEXT DEFAULT 'Europe/Berlin',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. ORG MEMBERS  (multi-tenancy link)
-- ============================================================
CREATE TABLE org_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('teacher', 'student', 'org_admin', 'it_admin')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, organization_id)
);

CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_org_members_org  ON org_members(organization_id);

-- ============================================================
-- 4. API KEYS (per organisation)
-- ============================================================
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key_hash        TEXT NOT NULL,
    key_prefix      TEXT NOT NULL,
    label           TEXT DEFAULT 'default',
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);

-- ============================================================
-- 5. INTEGRATIONS
-- ============================================================
CREATE TABLE integrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL CHECK (type IN ('lms', 'content', 'analytics')),
    status          TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'pending', 'disconnected')),
    config          JSONB,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. CLASSES
-- ============================================================
CREATE TABLE classes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    teacher_id      UUID REFERENCES auth.users(id),
    name            TEXT NOT NULL,
    grade           TEXT NOT NULL,
    subject         TEXT NOT NULL,
    next_lesson_time TIMESTAMPTZ,
    student_count   INT DEFAULT 0,
    archived        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_classes_org     ON classes(organization_id);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);

-- ============================================================
-- 7. CLASS ENROLMENTS
-- ============================================================
CREATE TABLE class_enrolments (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role     TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (class_id, user_id)
);

-- Keep student_count in sync
CREATE OR REPLACE FUNCTION update_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.role = 'student' THEN
        UPDATE classes SET student_count = student_count + 1 WHERE id = NEW.class_id;
    ELSIF TG_OP = 'DELETE' AND OLD.role = 'student' THEN
        UPDATE classes SET student_count = student_count - 1 WHERE id = OLD.class_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_enrolment_count
    AFTER INSERT OR DELETE ON class_enrolments
    FOR EACH ROW EXECUTE FUNCTION update_student_count();

-- ============================================================
-- 8. STUDENT PROFILES (view/table for student-specific data)
-- ============================================================
CREATE TABLE student_profiles (
    id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id   UUID NOT NULL REFERENCES organizations(id),
    class_id          UUID REFERENCES classes(id),
    name              TEXT NOT NULL DEFAULT '',
    email             TEXT NOT NULL DEFAULT '',
    performance_status TEXT DEFAULT 'on-track' CHECK (performance_status IN ('on-track', 'needs-support', 'advanced')),
    last_activity_date TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. LEARNING PREFERENCES
-- ============================================================
CREATE TABLE learning_preferences (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    recommended TEXT DEFAULT 'mixed' CHECK (recommended IN ('read', 'play', 'watch', 'mixed')),
    manual      TEXT CHECK (manual IN ('read', 'play', 'watch', 'mixed', NULL)),
    scores      JSONB DEFAULT '{"read": 50, "play": 50, "watch": 50}'::jsonb,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. ASSESSMENTS
-- ============================================================
CREATE TABLE assessments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    score           NUMERIC NOT NULL,
    max_score       NUMERIC NOT NULL,
    mode_used       TEXT CHECK (mode_used IN ('read', 'play', 'watch', 'mixed', NULL)),
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_assessments_student ON assessments(student_id);

-- ============================================================
-- 11. LESSONS
-- ============================================================
CREATE TABLE lessons (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id              UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title                 TEXT NOT NULL,
    subject               TEXT NOT NULL,
    topic                 TEXT NOT NULL,
    learning_objective    TEXT NOT NULL,
    base_material         TEXT,
    status                TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    grade_level           INT,
    duration              INT,
    differentiated_content BOOLEAN DEFAULT FALSE,
    content_types         TEXT[],
    bias_scan_status      TEXT CHECK (bias_scan_status IN ('pending', 'clean', 'issues-found', NULL)),
    created_by            UUID REFERENCES auth.users(id),
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lessons_class ON lessons(class_id);

-- ============================================================
-- 12. DIFFERENTIATION LEVELS
-- ============================================================
CREATE TABLE differentiation_levels (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    level       TEXT NOT NULL CHECK (level IN ('struggling', 'on-track', 'advanced')),
    rationale   TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diff_levels_lesson ON differentiation_levels(lesson_id);

-- ============================================================
-- 13. TASKS
-- ============================================================
CREATE TABLE tasks (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    differentiation_level_id  UUID NOT NULL REFERENCES differentiation_levels(id) ON DELETE CASCADE,
    title                     TEXT NOT NULL,
    description               TEXT NOT NULL DEFAULT '',
    mode                      TEXT NOT NULL CHECK (mode IN ('read', 'play', 'watch', 'mixed')),
    duration                  INT NOT NULL DEFAULT 10,
    generated_by_ai           BOOLEAN DEFAULT FALSE,
    created_at                TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 14. MATERIALS
-- ============================================================
CREATE TABLE materials (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    content     TEXT NOT NULL DEFAULT '',
    class_id    UUID REFERENCES classes(id),
    student_id  UUID REFERENCES auth.users(id),
    created_by  UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT now(),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 15. BIAS SCANS
-- ============================================================
CREATE TABLE bias_scans (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id       UUID REFERENCES materials(id),
    scanned_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    total_issues      INT DEFAULT 0,
    issues_by_category JSONB DEFAULT '{}'::jsonb,
    resolved_count    INT DEFAULT 0,
    created_by        UUID REFERENCES auth.users(id),
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 16. BIAS ISSUES
-- ============================================================
CREATE TABLE bias_issues (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id         UUID NOT NULL REFERENCES bias_scans(id) ON DELETE CASCADE,
    category        TEXT NOT NULL CHECK (category IN ('gender', 'culture', 'socioeconomic', 'ableism')),
    severity        TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    original_phrase TEXT NOT NULL,
    explanation     TEXT NOT NULL,
    suggestion      TEXT NOT NULL,
    position_start  INT NOT NULL DEFAULT 0,
    position_end    INT NOT NULL DEFAULT 0,
    resolved        BOOLEAN DEFAULT FALSE,
    applied_suggestion TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bias_issues_scan ON bias_issues(scan_id);

-- ============================================================
-- 17. ML TASKS (background job tracking)
-- ============================================================
CREATE TABLE ml_tasks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_type   TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    input       JSONB,
    result      JSONB,
    error       TEXT,
    created_by  UUID REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- HELPER: increment resolved_count RPC
-- ============================================================
CREATE OR REPLACE FUNCTION increment_resolved_count(scan_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE bias_scans
    SET resolved_count = resolved_count + 1
    WHERE id = scan_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tenant/user tables
ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys            ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrolments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE differentiation_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE bias_scans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bias_issues         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_tasks            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Helper: check if current user is a member of a given org
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE user_id = auth.uid() AND organization_id = org_id
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: check if current user has a specific role in an org
CREATE OR REPLACE FUNCTION has_org_role(org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_members
        WHERE user_id = auth.uid()
          AND organization_id = org_id
          AND role = required_role
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES: users can read/update their own profile
CREATE POLICY profiles_select ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());

-- ORG_MEMBERS: users can see memberships for their own orgs
CREATE POLICY org_members_select ON org_members FOR SELECT
    USING (user_id = auth.uid() OR is_org_member(organization_id));

-- ORGANIZATIONS: members can read their orgs
CREATE POLICY organizations_select ON organizations FOR SELECT
    USING (is_org_member(id));

-- Org admins can update org settings
CREATE POLICY organizations_update ON organizations FOR UPDATE
    USING (has_org_role(id, 'org_admin') OR has_org_role(id, 'it_admin'));

-- API_KEYS: org admins only
CREATE POLICY api_keys_select ON api_keys FOR SELECT
    USING (has_org_role(organization_id, 'org_admin') OR has_org_role(organization_id, 'it_admin'));
CREATE POLICY api_keys_insert ON api_keys FOR INSERT
    WITH CHECK (has_org_role(organization_id, 'org_admin') OR has_org_role(organization_id, 'it_admin'));

-- INTEGRATIONS: org members can read, admins can modify
CREATE POLICY integrations_select ON integrations FOR SELECT
    USING (is_org_member(organization_id));
CREATE POLICY integrations_modify ON integrations FOR ALL
    USING (has_org_role(organization_id, 'org_admin') OR has_org_role(organization_id, 'it_admin'));

-- CLASSES: org members can read classes in their org
CREATE POLICY classes_select ON classes FOR SELECT
    USING (is_org_member(organization_id));
CREATE POLICY classes_insert ON classes FOR INSERT
    WITH CHECK (is_org_member(organization_id));
CREATE POLICY classes_update ON classes FOR UPDATE
    USING (teacher_id = auth.uid() OR has_org_role(organization_id, 'org_admin'));
CREATE POLICY classes_delete ON classes FOR DELETE
    USING (teacher_id = auth.uid() OR has_org_role(organization_id, 'org_admin'));

-- CLASS_ENROLMENTS: visible to org members of the class's org
CREATE POLICY enrolments_select ON class_enrolments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classes c
            WHERE c.id = class_enrolments.class_id
              AND is_org_member(c.organization_id)
        )
    );
CREATE POLICY enrolments_insert ON class_enrolments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM classes c
            WHERE c.id = class_enrolments.class_id
              AND is_org_member(c.organization_id)
        )
    );

-- STUDENT_PROFILES: students see own, teachers see org students
CREATE POLICY student_profiles_select ON student_profiles FOR SELECT
    USING (id = auth.uid() OR is_org_member(organization_id));

-- LEARNING_PREFERENCES: student sees own, teachers in same org can read
CREATE POLICY learning_prefs_select ON learning_preferences FOR SELECT
    USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM student_profiles sp
            WHERE sp.id = learning_preferences.student_id
              AND is_org_member(sp.organization_id)
        )
    );
CREATE POLICY learning_prefs_update ON learning_preferences FOR UPDATE
    USING (student_id = auth.uid());

-- ASSESSMENTS: students see own, teachers in org can read
CREATE POLICY assessments_select ON assessments FOR SELECT
    USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM student_profiles sp
            WHERE sp.id = assessments.student_id
              AND is_org_member(sp.organization_id)
        )
    );
CREATE POLICY assessments_insert ON assessments FOR INSERT
    WITH CHECK (TRUE);  -- controlled at API level

-- LESSONS: visible to org members via class
CREATE POLICY lessons_select ON lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM classes c
            WHERE c.id = lessons.class_id
              AND is_org_member(c.organization_id)
        )
    );
CREATE POLICY lessons_insert ON lessons FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM classes c
            WHERE c.id = lessons.class_id
              AND is_org_member(c.organization_id)
        )
    );
CREATE POLICY lessons_update ON lessons FOR UPDATE
    USING (created_by = auth.uid());

-- DIFFERENTIATION_LEVELS & TASKS: inherit from lesson access
CREATE POLICY diff_levels_select ON differentiation_levels FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN classes c ON c.id = l.class_id
            WHERE l.id = differentiation_levels.lesson_id
              AND is_org_member(c.organization_id)
        )
    );
CREATE POLICY diff_levels_insert ON differentiation_levels FOR INSERT WITH CHECK (TRUE);

CREATE POLICY tasks_select ON tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM differentiation_levels dl
            JOIN lessons l ON l.id = dl.lesson_id
            JOIN classes c ON c.id = l.class_id
            WHERE dl.id = tasks.differentiation_level_id
              AND is_org_member(c.organization_id)
        )
    );
CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (TRUE);

-- MATERIALS: org members can read
CREATE POLICY materials_select ON materials FOR SELECT
    USING (
        created_by = auth.uid()
        OR student_id = auth.uid()
        OR (class_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM classes c WHERE c.id = materials.class_id AND is_org_member(c.organization_id)
        ))
    );
CREATE POLICY materials_insert ON materials FOR INSERT WITH CHECK (TRUE);

-- BIAS SCANS & ISSUES: accessible to creator and org members
CREATE POLICY bias_scans_select ON bias_scans FOR SELECT
    USING (created_by = auth.uid() OR TRUE);  -- refine as needed
CREATE POLICY bias_scans_insert ON bias_scans FOR INSERT WITH CHECK (TRUE);

CREATE POLICY bias_issues_select ON bias_issues FOR SELECT USING (TRUE);
CREATE POLICY bias_issues_update ON bias_issues FOR UPDATE USING (TRUE);
CREATE POLICY bias_issues_insert ON bias_issues FOR INSERT WITH CHECK (TRUE);

-- ML_TASKS
CREATE POLICY ml_tasks_select ON ml_tasks FOR SELECT
    USING (created_by = auth.uid());
CREATE POLICY ml_tasks_insert ON ml_tasks FOR INSERT WITH CHECK (TRUE);
