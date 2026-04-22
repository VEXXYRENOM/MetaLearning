-- ══════════════════════════════════════════════════════════════════════
-- PRIORITY 1 — SQL MASTER MIGRATION (v9_complete)
-- Complete schema sync for MetaLearning
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1A — profiles table: add ALL missing columns
-- ──────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'max');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT,
  ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS points       INTEGER  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level        INTEGER  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS badges       TEXT[]   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN NOT NULL DEFAULT FALSE;

-- Back-fill: mirror the existing `plan` column into subscription_tier
UPDATE profiles
SET subscription_tier = CASE
  WHEN plan = 'pro'    THEN 'pro'::subscription_tier
  WHEN plan = 'school' THEN 'max'::subscription_tier
  ELSE 'free'::subscription_tier
END
WHERE subscription_tier = 'free' AND plan IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1B — lessons table: add is_public column
-- ──────────────────────────────────────────────────────────────────────
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;

DROP POLICY IF EXISTS "lessons_admin_select" ON lessons;
CREATE POLICY "lessons_admin_select"
  ON lessons FOR SELECT
  USING (is_admin() OR auth.uid() = teacher_id
         OR id IN (SELECT lesson_id FROM sessions WHERE is_active = true));

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1C — xp_transactions table + award_xp RPC
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xp_transactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id   UUID        REFERENCES lessons(id) ON DELETE SET NULL,
  reason      TEXT        NOT NULL,
  xp          INTEGER     NOT NULL CHECK (xp > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_student
  ON xp_transactions (student_id, created_at DESC);

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "xp_student_own_select" ON xp_transactions;
CREATE POLICY "xp_student_own_select"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = student_id OR is_admin());

DROP POLICY IF EXISTS "xp_no_direct_insert" ON xp_transactions;
CREATE POLICY "xp_no_direct_insert"
  ON xp_transactions FOR INSERT
  WITH CHECK (FALSE);

CREATE OR REPLACE FUNCTION award_xp(
  p_student_id UUID,
  p_lesson_id  UUID,
  p_reason     TEXT,
  p_xp         INTEGER
)
RETURNS TABLE (
  new_points  INTEGER,
  new_level   INTEGER,
  leveled_up  BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_points   INTEGER;
  v_new_points   INTEGER;
  v_old_level    INTEGER;
  v_new_level    INTEGER;
  v_leveled_up   BOOLEAN;
BEGIN
  SELECT points, level
  INTO   v_old_points, v_old_level
  FROM   profiles
  WHERE  id = p_student_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'student % not found', p_student_id;
  END IF;

  v_new_points := v_old_points + p_xp;
  v_new_level  := LEAST(50, FLOOR(v_new_points / 100) + 1);
  v_leveled_up := v_new_level > v_old_level;

  INSERT INTO xp_transactions (student_id, lesson_id, reason, xp)
  VALUES (p_student_id, p_lesson_id, p_reason, p_xp);

  UPDATE profiles
  SET    points = v_new_points,
         level  = v_new_level
  WHERE  id     = p_student_id;

  RETURN QUERY
  SELECT v_new_points, v_new_level, v_leveled_up;
END;
$$;

REVOKE ALL ON FUNCTION award_xp(UUID, UUID, TEXT, INTEGER) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION award_xp(UUID, UUID, TEXT, INTEGER) TO authenticated;

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1D — learning_analytics table
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_analytics (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID        REFERENCES sessions(id)  ON DELETE SET NULL,
  lesson_id        UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interaction_type TEXT        NOT NULL,
  metadata         JSONB       NOT NULL DEFAULT '{}',
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_student_lesson
  ON learning_analytics (student_id, lesson_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session
  ON learning_analytics (session_id);

ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_student_insert" ON learning_analytics;
CREATE POLICY "analytics_student_insert"
  ON learning_analytics FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "analytics_teacher_select" ON learning_analytics;
CREATE POLICY "analytics_teacher_select"
  ON learning_analytics FOR SELECT
  USING (
    auth.uid() = student_id
    OR lesson_id IN (SELECT id FROM lessons WHERE teacher_id = auth.uid())
    OR is_admin()
  );

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1E — quiz_questions + quiz_answers tables
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  teacher_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  option_a    TEXT NOT NULL,
  option_b    TEXT NOT NULL,
  option_c    TEXT,
  option_d    TEXT,
  correct     TEXT NOT NULL CHECK (correct IN ('a','b','c','d')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson
  ON quiz_questions (lesson_id, order_index);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_q_teacher_all" ON quiz_questions;
CREATE POLICY "quiz_q_teacher_all"
  ON quiz_questions FOR ALL
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "quiz_q_student_select" ON quiz_questions;
CREATE POLICY "quiz_q_student_select"
  ON quiz_questions FOR SELECT
  USING (lesson_id IN (
    SELECT lesson_id FROM sessions WHERE is_active = true
  ));

CREATE TABLE IF NOT EXISTS quiz_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  session_id  UUID NOT NULL REFERENCES sessions(id)       ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES profiles(id)       ON DELETE CASCADE,
  answer      TEXT NOT NULL CHECK (answer IN ('a','b','c','d')),
  is_correct  BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, session_id, student_id)
);

ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_a_student_insert" ON quiz_answers;
CREATE POLICY "quiz_a_student_insert"
  ON quiz_answers FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "quiz_a_owner_select" ON quiz_answers;
CREATE POLICY "quiz_a_owner_select"
  ON quiz_answers FOR SELECT
  USING (
    auth.uid() = student_id
    OR session_id IN (SELECT id FROM sessions WHERE teacher_id = auth.uid())
    OR is_admin()
  );

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1F — lesson_ratings + lesson_questions tables
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, student_id)
);

ALTER TABLE lesson_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ratings_student_upsert" ON lesson_ratings;
CREATE POLICY "ratings_student_upsert"
  ON lesson_ratings FOR ALL
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "ratings_public_read" ON lesson_ratings;
CREATE POLICY "ratings_public_read"
  ON lesson_ratings FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS lesson_questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    UUID NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  session_id   UUID REFERENCES sessions(id)           ON DELETE SET NULL,
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  question     TEXT NOT NULL,
  is_answered  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_q_lesson
  ON lesson_questions (lesson_id, created_at DESC);

ALTER TABLE lesson_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lq_student_insert" ON lesson_questions;
CREATE POLICY "lq_student_insert"
  ON lesson_questions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "lq_participant_select" ON lesson_questions;
CREATE POLICY "lq_participant_select"
  ON lesson_questions FOR SELECT
  USING (
    auth.uid() = student_id
    OR lesson_id IN (SELECT id FROM lessons WHERE teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "lq_teacher_update" ON lesson_questions;
CREATE POLICY "lq_teacher_update"
  ON lesson_questions FOR UPDATE
  USING (lesson_id IN (SELECT id FROM lessons WHERE teacher_id = auth.uid()));

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1G — Hotspots table
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hotspots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  teacher_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position_x  FLOAT NOT NULL,
  position_y  FLOAT NOT NULL,
  position_z  FLOAT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hotspots_teacher_all" ON hotspots;
CREATE POLICY "hotspots_teacher_all"
  ON hotspots FOR ALL
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "hotspots_student_select" ON hotspots;
CREATE POLICY "hotspots_student_select"
  ON hotspots FOR SELECT
  USING (lesson_id IN (
    SELECT lesson_id FROM sessions WHERE is_active = true
  ));

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1H — Global Leaderboard view
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT
  p.id,
  p.full_name,
  p.points,
  p.level,
  p.badges,
  COALESCE(q.total_quizzes, 0)::INTEGER AS total_quizzes,
  RANK() OVER (ORDER BY p.points DESC) AS rank
FROM profiles p
LEFT JOIN (
  SELECT student_id, COUNT(DISTINCT question_id) AS total_quizzes
  FROM   quiz_answers
  GROUP  BY student_id
) q ON q.student_id = p.id
WHERE p.role = 'student'
  AND p.points > 0;

GRANT SELECT ON global_leaderboard TO authenticated;

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1I — Stripe webhook alignment: update plan + tier together
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_plan_from_tier()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.plan := CASE NEW.subscription_tier
    WHEN 'max'  THEN 'school'
    WHEN 'pro'  THEN 'pro'
    ELSE             'free'
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_plan ON profiles;
CREATE TRIGGER trg_sync_plan
  BEFORE UPDATE OF subscription_tier ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_plan_from_tier();

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1J — Quiz performance + lesson avg rating views
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW quiz_performance AS
SELECT
  qa.session_id,
  qa.student_id,
  p.full_name           AS student_name,
  COUNT(*)              AS total_answers,
  SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) AS correct_answers,
  ROUND(
    100.0 * SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) / COUNT(*),
    1
  )                     AS score_percent
FROM quiz_answers qa
JOIN profiles p ON p.id = qa.student_id
GROUP BY qa.session_id, qa.student_id, p.full_name;

GRANT SELECT ON quiz_performance TO authenticated;

CREATE OR REPLACE VIEW lesson_avg_ratings AS
SELECT
  lesson_id,
  ROUND(AVG(rating)::NUMERIC, 1) AS avg_rating,
  COUNT(*)                       AS total_ratings
FROM lesson_ratings
GROUP BY lesson_id;

GRANT SELECT ON lesson_avg_ratings TO authenticated;
