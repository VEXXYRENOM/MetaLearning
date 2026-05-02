-- ══════════════════════════════════════════════════════════════════════
-- v20: Enterprise SSO — Google Workspace + Domain-to-Org Mapping (Week 3)
-- ══════════════════════════════════════════════════════════════════════
-- Enables school admins to link their Google Workspace domain (e.g., @school.edu)
-- to their organization, so that any user logging in with that email domain
-- is automatically provisioned into the correct school (JIT Provisioning).
-- ══════════════════════════════════════════════════════════════════════

-- 1. Table: Organization Domains (maps email domains to organizations)
CREATE TABLE IF NOT EXISTS organization_domains (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- The domain to match (e.g., 'school.edu', 'lycee-victor-hugo.fr')
  domain     TEXT NOT NULL,

  -- Default role for new users from this domain who sign up via SSO
  default_role TEXT NOT NULL DEFAULT 'student'
    CHECK (default_role IN ('org_admin', 'school_admin', 'teacher', 'student')),

  -- Has a school admin confirmed they own this domain? (Prevents domain squatting)
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each domain can only belong to one organization
  UNIQUE(domain)
);

CREATE INDEX IF NOT EXISTS idx_org_domains_org ON organization_domains(org_id);

-- RLS: Only org admins can manage their domains
ALTER TABLE organization_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_domains_select ON organization_domains
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.user_id = auth.uid()
      AND m.org_id = organization_domains.org_id
  )
);

CREATE POLICY org_domains_manage ON organization_domains
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.user_id = auth.uid()
      AND m.org_id = organization_domains.org_id
      AND m.member_role IN ('org_owner', 'org_admin')
  )
);

-- 2. Table: SSO Configuration per Organization (Google SAML/OIDC settings)
CREATE TABLE IF NOT EXISTS organization_sso_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  -- 'google_oauth' | 'saml' | 'oidc'
  provider    TEXT NOT NULL DEFAULT 'google_oauth',

  -- SAML/OIDC metadata URL or raw XML (for enterprise SAML setups)
  metadata_url TEXT,
  metadata_xml TEXT,

  -- SAML entity ID for the IdP
  entity_id   TEXT,

  -- Only org owners can view this
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Only org owners can read SSO config (sensitive credentials)
ALTER TABLE organization_sso_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY sso_config_owner_only ON organization_sso_config
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.user_id = auth.uid()
      AND m.org_id = organization_sso_config.org_id
      AND m.member_role IN ('org_owner', 'org_admin')
  )
);

-- 3. JIT Provisioning Function (SECURITY DEFINER)
-- Called from the handle_new_user trigger after a new sign-up.
-- It looks up the user's email domain in organization_domains and
-- automatically assigns them to the correct org with the right default role.
CREATE OR REPLACE FUNCTION provision_user_from_sso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email       TEXT;
  v_domain      TEXT;
  v_org_id      UUID;
  v_def_role    TEXT;
BEGIN
  -- Extract email from the newly created auth.users row
  v_email  := NEW.email;
  v_domain := split_part(v_email, '@', 2);

  -- Look up if this domain is registered to an organization
  SELECT od.org_id, od.default_role
    INTO v_org_id, v_def_role
  FROM organization_domains od
  WHERE od.domain = v_domain
    AND od.verified_at IS NOT NULL -- Only use verified domains
  LIMIT 1;

  -- If no matching domain found, we do nothing (user signs up individually)
  IF v_org_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- JIT: Assign the user to the organization in organization_members
  INSERT INTO organization_members (org_id, user_id, member_role)
  VALUES (v_org_id, NEW.id, v_def_role)
  ON CONFLICT (org_id, user_id) DO NOTHING;

  -- Also keep profiles in sync
  UPDATE profiles
    SET org_id = v_org_id,
        role_in_org = CASE
          WHEN v_def_role IN ('org_admin', 'school_admin') THEN 'admin'
          WHEN v_def_role = 'teacher' THEN 'teacher'
          ELSE 'student'
        END
  WHERE id = NEW.id;

  -- Log the SSO provisioning event in audit_events
  INSERT INTO audit_events (org_id, actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_org_id,
    NEW.id,
    'sso.jit_provisioned', -- FIXED: use correct action matching v21 CHECK constraint
    'profiles',
    NEW.id,
    jsonb_build_object(
      'source', 'sso_jit_provisioning',
      'domain', v_domain,
      'assigned_role', v_def_role
    )
  );

  RETURN NEW;
END;
$$;

-- 4. Attach the JIT Provisioning to the new user trigger
-- We extend the existing on_auth_user_created trigger flow.
-- Because the trigger fires AFTER the profile is created by handle_new_user,
-- we add a separate trigger to auth.users for the provisioning step.
-- NOTE: In Supabase, triggers on auth.users require service_role.
-- We use the AFTER INSERT event after the profile row is committed.
DROP TRIGGER IF EXISTS on_user_sso_provision ON auth.users;
CREATE TRIGGER on_user_sso_provision
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE provision_user_from_sso();

-- 5. RPC for Org Admin: Register a new domain for their organization
CREATE OR REPLACE FUNCTION register_org_domain(
  p_org_id UUID,
  p_domain TEXT,
  p_default_role TEXT DEFAULT 'student'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  -- Verify the caller is an admin/owner of this org
  SELECT member_role INTO v_caller_role
  FROM organization_members
  WHERE org_id = p_org_id AND user_id = auth.uid();

  IF v_caller_role NOT IN ('org_owner', 'org_admin') THEN
    RAISE EXCEPTION 'Only org_owner or org_admin can register domains.';
  END IF;

  -- FIXED: Detect domain conflicts explicitly instead of silent DO NOTHING
  IF EXISTS (SELECT 1 FROM organization_domains WHERE domain = lower(trim(p_domain)) AND org_id != p_org_id) THEN
    RETURN json_build_object(
      'success', false,
      'status', 'foreign_org_conflict',
      'error', 'This domain is already registered to another organization.'
    );
  END IF;

  INSERT INTO organization_domains (org_id, domain, default_role)
  VALUES (p_org_id, lower(trim(p_domain)), p_default_role)
  ON CONFLICT (domain) DO NOTHING;

  RETURN json_build_object('success', true, 'domain', p_domain, 'status', 'pending_verification');
END;
$$;

-- Restrict the RPC to authenticated users only
REVOKE ALL ON FUNCTION register_org_domain(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION register_org_domain(UUID, TEXT, TEXT) TO authenticated;
