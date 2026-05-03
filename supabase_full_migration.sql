-- ══════════════════════════════════════════════════════════════════════
-- BASE SCHEMA: Core tables that must exist before v9
-- ══════════════════════════════════════════════════════════════════════

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. LESSONS
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  model_type TEXT NOT NULL,
  model_key TEXT,
  model_url TEXT,
  share_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SESSIONS
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pin_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 4. STUDENT JOINS
CREATE TABLE IF NOT EXISTS public.student_joins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. OTHER BASE TABLES
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT,
  option_d TEXT,
  correct TEXT NOT NULL CHECK (correct IN ('a', 'b', 'c', 'd')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('a', 'b', 'c', 'd')),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lesson_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lesson_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  question TEXT NOT NULL,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  position_z REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- HOW TO USE:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Paste this entire file and click Run
-- 3. Verify in Authentication → Policies

-- ══════════════════════════════════════════
-- Enable RLS on all tables
-- ══════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_joins ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════
-- profiles: users can only read/update their own profile
-- ══════════════════════════════════════════
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ══════════════════════════════════════════
-- lessons: teachers own their lessons, anyone can read by share_code
-- ══════════════════════════════════════════
CREATE POLICY "lessons_insert_teacher"
  ON lessons FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "lessons_select_own"
  ON lessons FOR SELECT
  USING (
    auth.uid() = teacher_id
    OR id IN (
      SELECT lesson_id FROM sessions WHERE is_active = true
    )
  );

CREATE POLICY "lessons_update_own"
  ON lessons FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "lessons_delete_own"
  ON lessons FOR DELETE
  USING (auth.uid() = teacher_id);

-- ══════════════════════════════════════════
-- sessions: teachers own their sessions, students can read active ones
-- ══════════════════════════════════════════
CREATE POLICY "sessions_insert_teacher"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "sessions_select_active"
  ON sessions FOR SELECT
  USING (is_active = true OR auth.uid() = teacher_id);

CREATE POLICY "sessions_update_teacher"
  ON sessions FOR UPDATE
  USING (auth.uid() = teacher_id);

-- ══════════════════════════════════════════
-- student_joins: students insert their own, teachers read their sessions
-- ══════════════════════════════════════════
CREATE POLICY "joins_insert_student"
  ON student_joins FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "joins_select_own"
  ON student_joins FOR SELECT
  USING (
    auth.uid() = student_id
    OR session_id IN (
      SELECT id FROM sessions WHERE teacher_id = auth.uid()
    )
  );

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'school')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- ══════════════════════════════════════════════════════════════
-- api_usage: Persistent rate limiting for AI generation endpoints
-- Replaces the in-memory Map() that was lost on every cold start.
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS api_usage (
  -- Identifies the requester: user UUID if authenticated, hashed IP otherwise
  user_id     TEXT        NOT NULL,
  -- The date bucket (UTC) — one row per user per day
  usage_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  -- How many requests have been made today
  count       INTEGER     NOT NULL DEFAULT 1,
  -- Cached plan at time of request ('free' | 'pro' | 'school')
  plan        TEXT        NOT NULL DEFAULT 'free',
  -- Auto-bookkeeping
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, usage_date)
);

-- Index for fast daily lookups (already covered by PK, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_api_usage_user_date
  ON api_usage (user_id, usage_date);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_api_usage_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_api_usage_updated_at ON api_usage;
CREATE TRIGGER trg_api_usage_updated_at
  BEFORE UPDATE ON api_usage
  FOR EACH ROW EXECUTE FUNCTION update_api_usage_updated_at();

-- ── RLS: enable and lock down ─────────────────────────────────
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users can only read their own usage (for a potential "X generations left" UI)
CREATE POLICY "api_usage_select_own"
  ON api_usage FOR SELECT
  USING (user_id = auth.uid()::TEXT OR user_id = current_setting('request.headers', true)::json->>'x-client-ip');

-- No direct client INSERT/UPDATE — all writes go through the Service Role key
-- in the Vercel serverless function, bypassing RLS.
-- This prevents clients from manipulating their own counters.

-- ══════════════════════════════════════════════════════════════
-- increment_api_usage: Atomic UPSERT for rate limiting
-- Called via supabase.rpc() from the Vercel function using Service Role.
-- Returns:
--   allowed       BOOLEAN  — whether the request should proceed
--   current_count INTEGER  — usage count after this call
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION increment_api_usage(
  p_user_id   TEXT,
  p_date      DATE,
  p_plan      TEXT,
  p_limit     INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- يعمل بصلاحيات صاحب الدالة (تتجاوز RLS)
AS $$
DECLARE
  v_count INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- محاولة إدراج سجل جديد لليوم
  INSERT INTO api_usage (user_id, usage_date, count, plan)
  VALUES (p_user_id, p_date, 1, p_plan)
  ON CONFLICT (user_id, usage_date) DO UPDATE
    SET count   = api_usage.count + 1,
        plan    = p_plan,
        updated_at = NOW()
  RETURNING count INTO v_count;

  -- تحديد إذا كان الطلب مسموحاً
  -- ملاحظة: إذا تجاوز العداد الحد قبل هذه العملية، نرفض الطلب
  -- نستخدم (v_count <= p_limit) بعد الزيادة
  v_allowed := (v_count <= p_limit);

  -- إذا تجاوز، نُعيد تخفيض العداد (لا نحسب الطلبات المرفوضة)
  IF NOT v_allowed THEN
    UPDATE api_usage
    SET count = count - 1, updated_at = NOW()
    WHERE user_id = p_user_id AND usage_date = p_date;
    v_count := v_count - 1;
  END IF;

  RETURN json_build_object(
    'allowed',       v_allowed,
    'current_count', v_count
  );
END;
$$;

-- منح حق الاستدعاء لـ Service Role (وليس للـ anon)
REVOKE ALL ON FUNCTION increment_api_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_api_usage TO service_role;


-- ══════════════════════════════════════════════════════════════
-- ROLE CONSTRAINT: Support all 4 roles (teacher, student, creator, admin)
-- Run this if you added creator/admin roles after initial setup.
-- ══════════════════════════════════════════════════════════════
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('teacher', 'student', 'creator', 'admin'));


-- ══════════════════════════════════════════════════════════════
-- ADMIN RLS: Allow admins to read and update ALL profiles
-- Uses SECURITY DEFINER to avoid infinite RLS recursion.
-- ══════════════════════════════════════════════════════════════

-- Helper function: safely checks if caller is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to all authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Drop old restrictive policies first
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- New SELECT policy: own profile OR admin sees all
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

-- New UPDATE policy: own profile OR admin updates all
CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());


-- ══════════════════════════════════════════════════════════════
-- HOW TO SET YOURSELF AS SUPER ADMIN (run once):
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ══════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════
-- MIGRATION: New columns for MetaLearning v7
-- Run this block ONCE in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- Onboarding tracking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;

-- Full-text search index on lessons
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS title_en TEXT;
CREATE INDEX IF NOT EXISTS idx_lessons_title_en
  ON lessons USING gin(to_tsvector('english', COALESCE(title_en, '')));

-- Monthly lesson count view for free plan enforcement
CREATE OR REPLACE VIEW teacher_monthly_lessons AS
SELECT
  teacher_id,
  COUNT(*) AS lesson_count,
  DATE_TRUNC('month', NOW()) AS month
FROM lessons
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY teacher_id;

-- Grant select on view
GRANT SELECT ON teacher_monthly_lessons TO authenticated;
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
-- ══════════════════════════════════════════════════════════════════════
-- PRIORITY 1 — B2B ENTERPRISE ORGANIZATIONS (v10)
-- Schema for managing school organizations and seats
-- ══════════════════════════════════════════════════════════════════════

-- Prevent PostgreSQL from validating function bodies at compile time
-- (needed for plpgsql functions referencing newly-added columns)
SET check_function_bodies = off;

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1A — Update profiles table FIRST (before organizations)
-- so that the FK from organizations → profiles works cleanly
-- ──────────────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS org_id       UUID,       -- FK added after org table is created
  ADD COLUMN IF NOT EXISTS role_in_org  TEXT CHECK (role_in_org IN ('student', 'teacher', 'admin'));

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1B — Create organizations table
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT         NOT NULL,
  admin_id             UUID         NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  total_seats          INTEGER      NOT NULL DEFAULT 10,
  used_seats           INTEGER      NOT NULL DEFAULT 0,
  subscription_status  TEXT         NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled'
  invite_token         TEXT         NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  auto_approve_domain  TEXT,                                   -- e.g., '@school.edu'
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT used_lte_total CHECK (used_seats <= total_seats)
);

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1C — Now add FK constraint on profiles.org_id → organizations
-- (Must come AFTER organizations table is created)
-- ──────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_org_id
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index for faster joins
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles (org_id);

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1D — RLS Policies
-- ──────────────────────────────────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_admin_select" ON organizations;
CREATE POLICY "org_admin_select" ON organizations
  FOR SELECT USING (auth.uid() = admin_id);

DROP POLICY IF EXISTS "org_member_select" ON organizations;
CREATE POLICY "org_member_select" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.org_id IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "org_admin_update" ON organizations;
CREATE POLICY "org_admin_update" ON organizations
  FOR UPDATE USING (auth.uid() = admin_id);

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1E — Rate limiting table (for /api/lab-ai)
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_usage (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash       TEXT        NOT NULL,
  endpoint      TEXT        NOT NULL DEFAULT 'lab-ai',
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER     NOT NULL DEFAULT 1,
  UNIQUE(ip_hash, endpoint)
);

CREATE OR REPLACE FUNCTION increment_api_usage(
  p_ip_hash     TEXT,
  p_endpoint    TEXT,
  p_window_hours INTEGER,
  p_limit       INTEGER
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_window_start TIMESTAMPTZ := NOW() - (p_window_hours || ' hours')::INTERVAL;
  v_new_count    INTEGER;
BEGIN
  -- Clear old windows
  DELETE FROM api_usage
  WHERE ip_hash = p_ip_hash
    AND endpoint = p_endpoint
    AND window_start < v_window_start;

  -- Upsert request count
  INSERT INTO api_usage (ip_hash, endpoint, window_start, request_count)
  VALUES (p_ip_hash, p_endpoint, NOW(), 1)
  ON CONFLICT (ip_hash, endpoint)
  DO UPDATE SET request_count = api_usage.request_count + 1
  RETURNING request_count INTO v_new_count;

  RETURN json_build_object(
    'allowed',    v_new_count <= p_limit,
    'new_count',  v_new_count
  );
END;
$$;

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1F — join_organization RPC (Secure: uses auth.uid(), no p_user_id)
-- ──────────────────────────────────────────────────────────────────────

-- Drop old insecure version that accepted p_user_id
DROP FUNCTION IF EXISTS join_organization(TEXT, UUID);

CREATE OR REPLACE FUNCTION join_organization(p_token TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_calling_user_id UUID     := auth.uid();
  v_org_id          UUID;
  v_total_seats     INTEGER;
  v_used_seats      INTEGER;
  v_current_org_id  UUID;
  v_org_status      TEXT;
BEGIN
  -- 0. Must be authenticated
  IF v_calling_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- 1. Find org by token and LOCK row to prevent race conditions
  SELECT id, total_seats, used_seats, subscription_status
  INTO   v_org_id, v_total_seats, v_used_seats, v_org_status
  FROM   organizations
  WHERE  invite_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid invitation token.');
  END IF;

  -- 2. Check organization subscription is active
  IF v_org_status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'This organization subscription is not active.');
  END IF;

  -- 3. Check if user already has an org
  SELECT org_id INTO v_current_org_id
  FROM   profiles
  WHERE  id = v_calling_user_id;

  IF v_current_org_id IS NOT NULL THEN
    -- Already in THIS org → idempotent success
    IF v_current_org_id = v_org_id THEN
      RETURN json_build_object('success', true, 'org_id', v_org_id, 'note', 'Already a member.');
    END IF;
    RETURN json_build_object('success', false, 'error', 'User is already in a different organization.');
  END IF;

  -- 4. Check seat availability
  IF v_used_seats >= v_total_seats THEN
    RETURN json_build_object('success', false, 'error', 'No available seats in this organization.');
  END IF;

  -- 5. Assign user to organization
  UPDATE profiles
  SET    org_id      = v_org_id,
         role_in_org = 'student'
  WHERE  id = v_calling_user_id;

  -- 6. Increment used_seats atomically
  UPDATE organizations
  SET    used_seats = used_seats + 1,
         updated_at = NOW()
  WHERE  id = v_org_id;

  RETURN json_build_object('success', true, 'org_id', v_org_id);
END;
$$;

-- Authenticated users only (auth.uid() validated internally)
REVOKE ALL ON FUNCTION join_organization(TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION join_organization(TEXT) TO authenticated;

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1G — increment_api_usage: restrict to service_role ONLY
-- (Task 4 fix: prevents authenticated users from bypassing rate limits)
-- ──────────────────────────────────────────────────────────────────────
REVOKE ALL   ON FUNCTION increment_api_usage(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_api_usage(TEXT, TEXT, INTEGER, INTEGER) FROM authenticated;
GRANT  EXECUTE ON FUNCTION increment_api_usage(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

-- Reset check_function_bodies to default
SET check_function_bodies = on;
-- Migration v10: Add Paddle specific columns to profiles

-- We are adding the new columns for Paddle Billing while preserving the old Stripe ones
-- just in case historical records are needed.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;

-- We don't need any special RLS for these columns as they fall under the existing profiles RLS 
-- which allows users to read their own profiles, and the backend service role to update them.
CREATE TABLE IF NOT EXISTS generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT UNIQUE NOT NULL,
  original_prompt TEXT,
  image_url TEXT,
  glb_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_generated_assets_hash ON generated_assets (prompt_hash);

-- ══════════════════════════════════════════════════════════════════════
-- v12_model_key_and_assets
-- 1. Add model_key to lessons table (links DB lesson to preset ID)
-- 2. Ensure generated_assets table has correct schema + RLS
-- ══════════════════════════════════════════════════════════════════════

-- ── 1. Add model_key to lessons ───────────────────────────────────────
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS model_key TEXT;

CREATE INDEX IF NOT EXISTS idx_lessons_model_key ON lessons (model_key);

-- ── 2. generated_assets table (idempotent) ────────────────────────────
CREATE TABLE IF NOT EXISTS generated_assets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash   TEXT        UNIQUE NOT NULL,
  original_prompt TEXT,
  image_url     TEXT,
  glb_url       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_assets_hash
  ON generated_assets (prompt_hash);

-- ── 3. RLS for generated_assets ───────────────────────────────────────
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;

-- Everyone can read (public CDN cache)
DROP POLICY IF EXISTS "assets_public_read" ON generated_assets;
CREATE POLICY "assets_public_read"
  ON generated_assets FOR SELECT
  USING (true);

-- Only service role can insert / update (backend writes via service key)
DROP POLICY IF EXISTS "assets_service_insert" ON generated_assets;
CREATE POLICY "assets_service_insert"
  ON generated_assets FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "assets_service_update" ON generated_assets;
CREATE POLICY "assets_service_update"
  ON generated_assets FOR UPDATE
  USING (auth.role() = 'service_role');
-- v13: Add streak tracking columns to profiles
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_checkin_date date,
  ADD COLUMN IF NOT EXISTS current_streak    int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak    int  NOT NULL DEFAULT 0;

-- Index for fast streak queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_checkin
  ON profiles (last_checkin_date);
-- ══════════════════════════════════════════════════════════════════════
-- Migration v14: teacher_leads table for Lead Magnet / Marketing
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.teacher_leads (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL UNIQUE,
  full_name    TEXT        NOT NULL,
  school_name  TEXT,
  subject      TEXT,
  country      TEXT,
  source       TEXT        NOT NULL DEFAULT 'lead_magnet',
  status       TEXT        NOT NULL DEFAULT 'new',  -- new | contacted | converted
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by email and status
CREATE INDEX IF NOT EXISTS idx_teacher_leads_email  ON public.teacher_leads (email);
CREATE INDEX IF NOT EXISTS idx_teacher_leads_status ON public.teacher_leads (status);
CREATE INDEX IF NOT EXISTS idx_teacher_leads_created ON public.teacher_leads (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.teacher_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can INSERT their own lead (public landing page)
DROP POLICY IF EXISTS "leads_public_insert" ON public.teacher_leads;
CREATE POLICY "leads_public_insert"
  ON public.teacher_leads FOR INSERT
  WITH CHECK (true);

-- Only admins can SELECT / UPDATE / DELETE leads
DROP POLICY IF EXISTS "leads_admin_select" ON public.teacher_leads;
CREATE POLICY "leads_admin_select"
  ON public.teacher_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "leads_admin_update" ON public.teacher_leads;
CREATE POLICY "leads_admin_update"
  ON public.teacher_leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
