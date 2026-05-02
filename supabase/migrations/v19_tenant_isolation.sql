-- ══════════════════════════════════════════════════════════════════════
-- v19: Enterprise Identity & Tenant Isolation (Week 2 Blueprint)
-- ══════════════════════════════════════════════════════════════════════

-- 1. Create organization_members table (Source of Truth for Roles)
CREATE TABLE IF NOT EXISTS organization_members (
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL CHECK (member_role IN ('org_owner', 'org_admin', 'school_admin', 'teacher', 'student', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Index for fast reverse lookups (Find all orgs a user belongs to)
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- CRITICAL FIX: RLS on organization_members
-- Without this, any authenticated user can query all org memberships!
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Members can only view other members of organizations they belong to
DROP POLICY IF EXISTS org_members_select ON organization_members;
CREATE POLICY org_members_select ON organization_members
FOR SELECT USING (
  org_id IN (SELECT m.org_id FROM organization_members m WHERE m.user_id = auth.uid())
);

-- Only org admins can manage memberships
DROP POLICY IF EXISTS org_members_manage ON organization_members;
CREATE POLICY org_members_manage ON organization_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members caller
    WHERE caller.user_id = auth.uid()
      AND caller.org_id = organization_members.org_id
      AND caller.member_role IN ('org_owner', 'org_admin')
  )
);

CREATE POLICY org_members_update ON organization_members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM organization_members caller
    WHERE caller.user_id = auth.uid()
      AND caller.org_id = organization_members.org_id
      AND caller.member_role IN ('org_owner', 'org_admin')
  )
);

CREATE POLICY org_members_delete ON organization_members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM organization_members caller
    WHERE caller.user_id = auth.uid()
      AND caller.org_id = organization_members.org_id
      AND caller.member_role IN ('org_owner', 'org_admin')
  )
);

-- 2. Data Migration: Backfill organization_members from profiles
INSERT INTO organization_members (org_id, user_id, member_role)
SELECT 
  org_id, 
  id, 
  -- Safely map old roles to new Enterprise RBAC roles
  CASE 
    WHEN role_in_org = 'admin' THEN 'org_admin'
    WHEN role_in_org = 'teacher' THEN 'teacher'
    ELSE 'student'
  END
FROM profiles
WHERE org_id IS NOT NULL
ON CONFLICT (org_id, user_id) DO NOTHING;

-- 3. Synchronization Trigger (Backward Compatibility for Frontend)
-- Ensures that while the frontend still updates `profiles`, the `organization_members` table stays perfectly in sync.
CREATE OR REPLACE FUNCTION sync_profile_to_org_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Fix: prevent search_path hijacking
AS $$
BEGIN
  IF NEW.org_id IS NOT NULL THEN
    INSERT INTO organization_members (org_id, user_id, member_role)
    VALUES (
      NEW.org_id, 
      NEW.id, 
      CASE 
        WHEN NEW.role_in_org = 'admin' THEN 'org_admin'
        WHEN NEW.role_in_org = 'teacher' THEN 'teacher'
        ELSE 'student'
      END
    )
    ON CONFLICT (org_id, user_id) 
    DO UPDATE SET member_role = EXCLUDED.member_role;
  END IF;
  RETURN NEW;
END;
$$ ;


DROP TRIGGER IF EXISTS sync_profile_org_trigger ON profiles;
CREATE TRIGGER sync_profile_org_trigger
  AFTER INSERT OR UPDATE OF org_id, role_in_org ON profiles
  FOR EACH ROW EXECUTE PROCEDURE sync_profile_to_org_member();

-- 4. Inject Tenant ID (`org_id`) into Lessons for strict RLS
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Backfill org_id for existing lessons based on their teacher's current organization
UPDATE lessons l
SET org_id = p.org_id
FROM profiles p
WHERE l.teacher_id = p.id AND l.org_id IS NULL AND p.org_id IS NOT NULL;

-- 5. Enterprise RLS Blueprint for `lessons`
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Security Definer Helper for fast RLS evaluation
CREATE OR REPLACE FUNCTION current_user_orgs()
RETURNS TABLE (org_id UUID, role TEXT) 
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT org_id, member_role FROM organization_members WHERE user_id = auth.uid();
$$;

-- Drop legacy permissive policies if they exist to prevent leaks
DROP POLICY IF EXISTS "Public lessons are viewable by everyone" ON lessons;
DROP POLICY IF EXISTS "Teachers can view their own lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can insert their own lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can update their own lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can delete their own lessons" ON lessons;

-- POLICY A: SELECT (View isolation)
-- Users can only see lessons that belong to the organization they are a member of.
DROP POLICY IF EXISTS lessons_select_tenant ON lessons;
CREATE POLICY lessons_select_tenant ON lessons
FOR SELECT USING (
  org_id IN (SELECT o.org_id FROM current_user_orgs() o)
);

-- POLICY B: INSERT (Role gating + CRITICAL: teacher_id must match caller)
-- Prevents a trusted teacher from forging a lesson under another teacher's name.
DROP POLICY IF EXISTS lessons_insert_tenant ON lessons;
CREATE POLICY lessons_insert_tenant ON lessons
FOR INSERT WITH CHECK (
  org_id IN (SELECT o.org_id FROM current_user_orgs() o WHERE o.role IN ('teacher', 'school_admin', 'org_admin', 'org_owner'))
  AND teacher_id = auth.uid() -- CRITICAL FIX: cannot spoof teacher_id
);

-- POLICY C: UPDATE (Ownership & Admin Override)
-- You can edit if: it's inside your org AND (you created it OR you are an org admin)
DROP POLICY IF EXISTS lessons_update_tenant ON lessons;
CREATE POLICY lessons_update_tenant ON lessons
FOR UPDATE USING (
  org_id IN (SELECT o.org_id FROM current_user_orgs() o) 
  AND (
    teacher_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM current_user_orgs() o2 WHERE o2.org_id = lessons.org_id AND o2.role IN ('school_admin', 'org_admin', 'org_owner'))
  )
)
WITH CHECK (
  org_id IN (SELECT o.org_id FROM current_user_orgs() o)
);

-- POLICY D: DELETE (Ownership & Admin Override)
DROP POLICY IF EXISTS lessons_delete_tenant ON lessons;
CREATE POLICY lessons_delete_tenant ON lessons
FOR DELETE USING (
  org_id IN (SELECT o.org_id FROM current_user_orgs() o) 
  AND (
    teacher_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM current_user_orgs() o2 WHERE o2.org_id = lessons.org_id AND o2.role IN ('school_admin', 'org_admin', 'org_owner'))
  )
);
