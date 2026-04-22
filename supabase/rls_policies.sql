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
