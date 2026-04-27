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
-- SECTION 1F — join_organization RPC (Atomic, race-condition safe)
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION join_organization(p_token TEXT, p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_org_id         UUID;
  v_total_seats    INTEGER;
  v_used_seats     INTEGER;
  v_current_org_id UUID;
BEGIN
  -- 1. Find org by token and LOCK the row to prevent race conditions
  SELECT id, total_seats, used_seats
  INTO   v_org_id, v_total_seats, v_used_seats
  FROM   organizations
  WHERE  invite_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid invitation token.');
  END IF;

  -- 2. Check if user already has an org
  SELECT org_id INTO v_current_org_id
  FROM   profiles
  WHERE  id = p_user_id;

  IF v_current_org_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'User is already in an organization.');
  END IF;

  -- 3. Check seat availability
  IF v_used_seats >= v_total_seats THEN
    RETURN json_build_object('success', false, 'error', 'No available seats in this organization.');
  END IF;

  -- 4. Assign user to organization
  UPDATE profiles
  SET    org_id      = v_org_id,
         role_in_org = 'student'
  WHERE  id = p_user_id;

  -- 5. Increment used_seats atomically
  UPDATE organizations
  SET    used_seats = used_seats + 1
  WHERE  id = v_org_id;

  RETURN json_build_object('success', true, 'org_id', v_org_id);
END;
$$;

-- Grant execution to authenticated users only
REVOKE ALL ON FUNCTION join_organization(TEXT, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION join_organization(TEXT, UUID) TO authenticated;

REVOKE ALL ON FUNCTION increment_api_usage(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION increment_api_usage(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

-- Reset check_function_bodies to default
SET check_function_bodies = on;
