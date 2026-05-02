-- ══════════════════════════════════════════════════════════════════════
-- v21: Enterprise SSO — SAML/OIDC Events & Complete Audit Expansion (Week 4)
-- ══════════════════════════════════════════════════════════════════════
-- This migration expands the audit system to cover all SSO lifecycle events,
-- adds billing and role-change tracking, and introduces the platform admin
-- bypass mechanism for cross-tenant monitoring.
-- ══════════════════════════════════════════════════════════════════════

-- 1. Expand audit_events action CHECK to include new events
-- (We drop and recreate the constraint to add new event types)
ALTER TABLE audit_events
  DROP CONSTRAINT IF EXISTS audit_events_action_check;

ALTER TABLE audit_events
  ADD CONSTRAINT audit_events_action_check CHECK (
    action IN (
      -- Lessons
      'lesson.created', 'lesson.updated', 'lesson.deleted',
      -- Sessions
      'session.created', 'session.closed',
      -- Billing
      'billing.upgrade', 'billing.downgrade', 'billing.webhook_received',
      -- Identity
      'user.invited', 'user.role_changed', 'user.removed',
      -- SSO / Auth
      'sso.login_success', 'sso.login_failed', 'sso.domain_registered',
      'sso.jit_provisioned',
      -- Organization
      'org.settings_changed', 'org.created'
    )
  );

-- 2. Platform Admin role on profiles
-- A top-level boolean flag that bypasses org-scoped RLS for platform staff only.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Secure SECURITY DEFINER helper for RLS policies
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_platform_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- CRITICAL FIX: Lock down is_platform_admin column against self-promotion.
-- This ensures no authenticated user can elevate themselves to platform admin.
-- Only service_role (backend migrations/scripts) can set this field.
CREATE OR REPLACE FUNCTION block_is_platform_admin_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_platform_admin IS DISTINCT FROM OLD.is_platform_admin THEN
    RAISE EXCEPTION 'Modifying is_platform_admin is not permitted via client. Use service_role migration only.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS block_platform_admin_escalation ON profiles;
CREATE TRIGGER block_platform_admin_escalation
  BEFORE UPDATE OF is_platform_admin ON profiles
  FOR EACH ROW
  WHEN (auth.uid() IS NOT NULL) -- only fire for user sessions, not service_role migrations
  EXECUTE PROCEDURE block_is_platform_admin_self_update();

-- 3. Platform Admin RLS Override on audit_events
-- Platform admins can read ALL audit events across ALL organizations.
DROP POLICY IF EXISTS audit_select_platform_admin ON audit_events;
CREATE POLICY audit_select_platform_admin ON audit_events
FOR SELECT USING (is_platform_admin());

-- 4. Billing Event Logger (called by Stripe Webhook Edge Function)
-- Because Stripe events come from a server (not a user session),
-- we provide a SECURITY DEFINER RPC so the Edge Function can log them safely.
CREATE OR REPLACE FUNCTION log_billing_event(
  p_org_id UUID,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that action is a billing event
  IF p_action NOT LIKE 'billing.%' THEN
    RAISE EXCEPTION 'log_billing_event only accepts billing.* actions.';
  END IF;

  INSERT INTO audit_events (org_id, actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_org_id,
    NULL, -- Billing events are system-initiated, no user actor
    p_action,
    'organization',
    p_org_id,
    p_metadata
  );
END;
$$;

-- Restrict to service_role (called only from backend, not user browser)
REVOKE ALL ON FUNCTION log_billing_event(UUID, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_billing_event(UUID, TEXT, JSONB) TO service_role;

-- 5. SSO Login event logger (called after successful auth)
CREATE OR REPLACE FUNCTION log_sso_event(
  p_org_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_action NOT LIKE 'sso.%' THEN
    RAISE EXCEPTION 'log_sso_event only accepts sso.* actions.';
  END IF;

  INSERT INTO audit_events (org_id, actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_org_id,
    p_user_id,
    p_action,
    'profiles',
    p_user_id,
    p_metadata
  );
END;
$$;

REVOKE ALL ON FUNCTION log_sso_event(UUID, UUID, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_sso_event(UUID, UUID, TEXT, JSONB) TO service_role;

-- 6. Expand audit_events action for domain registration
-- Wire the register_org_domain RPC to also produce an audit log
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
  SELECT member_role INTO v_caller_role
  FROM organization_members
  WHERE org_id = p_org_id AND user_id = auth.uid();

  IF v_caller_role NOT IN ('org_owner', 'org_admin') THEN
    RAISE EXCEPTION 'Only org_owner or org_admin can register domains.';
  END IF;

  INSERT INTO organization_domains (org_id, domain, default_role)
  VALUES (p_org_id, lower(trim(p_domain)), p_default_role)
  ON CONFLICT (domain) DO NOTHING;

  -- Write audit log for domain registration
  INSERT INTO audit_events (org_id, actor_id, action, entity_type, metadata)
  VALUES (
    p_org_id,
    auth.uid(),
    'sso.domain_registered',
    'organization_domains',
    jsonb_build_object('domain', p_domain, 'default_role', p_default_role)
  );

  RETURN json_build_object('success', true, 'domain', p_domain, 'status', 'pending_verification');
END;
$$;

REVOKE ALL ON FUNCTION register_org_domain(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION register_org_domain(UUID, TEXT, TEXT) TO authenticated;

-- Expand audit events with source tagging for better investigation trails
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_id, occurred_at DESC)
  WHERE actor_id IS NOT NULL;
