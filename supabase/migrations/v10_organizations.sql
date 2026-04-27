-- ══════════════════════════════════════════════════════════════════════
-- PRIORITY 1 — B2B ENTERPRISE ORGANIZATIONS (v10)
-- Schema for managing school organizations and seats
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1A — Create organizations table
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  total_seats INTEGER NOT NULL DEFAULT 10,
  used_seats INTEGER NOT NULL DEFAULT 0,
  subscription_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled'
  invite_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  auto_approve_domain TEXT, -- e.g., 'school.edu'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Admins can read their own org
DROP POLICY IF EXISTS "org_admin_select" ON organizations;
CREATE POLICY "org_admin_select" ON organizations
  FOR SELECT USING (auth.uid() = admin_id);

-- Members can read their org
DROP POLICY IF EXISTS "org_member_select" ON organizations;
CREATE POLICY "org_member_select" ON organizations
  FOR SELECT USING (id IN (SELECT org_id FROM profiles WHERE profiles.id = auth.uid()));

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1B — Update profiles table
-- ──────────────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS role_in_org TEXT CHECK (role_in_org IN ('student', 'teacher', 'admin'));

-- Index for faster joins
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles (org_id);

-- Update profile policies to allow org members to see each other (optional but good for future)
DROP POLICY IF EXISTS "profiles_org_select" ON profiles;
CREATE POLICY "profiles_org_select" ON profiles
  FOR SELECT USING (org_id IS NOT NULL AND org_id = (SELECT org_id FROM profiles p WHERE p.id = auth.uid()));

-- ──────────────────────────────────────────────────────────────────────
-- SECTION 1C — RPC for joining an organization securely
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION join_organization(p_token TEXT, p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_org_id UUID;
  v_total_seats INTEGER;
  v_used_seats INTEGER;
  v_current_org_id UUID;
BEGIN
  -- 1. Get the target org
  SELECT id, total_seats, used_seats
  INTO v_org_id, v_total_seats, v_used_seats
  FROM organizations
  WHERE invite_token = p_token
  FOR UPDATE; -- Lock row to prevent race conditions

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid invitation token.');
  END IF;

  -- 2. Check if user already has an org
  SELECT org_id INTO v_current_org_id
  FROM profiles
  WHERE id = p_user_id;

  IF v_current_org_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'User is already in an organization.');
  END IF;

  -- 3. Check seat availability
  IF v_used_seats >= v_total_seats THEN
    RETURN json_build_object('success', false, 'error', 'Organization has no available seats.');
  END IF;

  -- 4. Update user profile
  UPDATE profiles
  SET org_id = v_org_id, role_in_org = 'student' -- default role
  WHERE id = p_user_id;

  -- 5. Increment used_seats
  UPDATE organizations
  SET used_seats = used_seats + 1
  WHERE id = v_org_id;

  RETURN json_build_object('success', true, 'org_id', v_org_id);
END;
$$;
