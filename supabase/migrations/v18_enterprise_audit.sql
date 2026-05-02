-- ══════════════════════════════════════════════════════════════════════
-- v18: Enterprise Audit Trail (Week 1 of Enterprise Identity Blueprint)
-- ══════════════════════════════════════════════════════════════════════

-- 1. Create audit_events table (Append-only)
CREATE TABLE IF NOT EXISTS audit_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Using TEXT with CHECK constraint for flexibility (per Cursor's advice)
  action        TEXT NOT NULL CHECK (
    action IN (
      'lesson.created', 
      'lesson.updated', 
      'lesson.deleted', 
      'session.created', 
      'billing.upgrade', 
      'user.role_changed'
    )
  ),
  
  entity_type   TEXT NOT NULL, -- e.g., 'lessons', 'sessions'
  entity_id     UUID,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Optimize queries for org admins tracking recent events
CREATE INDEX IF NOT EXISTS idx_audit_org_time ON audit_events (org_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events (entity_type, entity_id);

-- 2. Security: Append-Only & RLS
-- Prevent clients from modifying or deleting logs
REVOKE UPDATE, DELETE ON audit_events FROM PUBLIC;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Note: We DO NOT create an INSERT policy. 
-- The table can only be written to by SECURITY DEFINER functions (like our trigger below).

-- Org Admins can read audit logs for their specific organization
DROP POLICY IF EXISTS audit_select_org_admin ON audit_events;
CREATE POLICY audit_select_org_admin ON audit_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.org_id = audit_events.org_id
      AND p.role_in_org = 'admin'
  )
);

-- 3. Trigger Function (SECURITY DEFINER Writer)
-- This executes with elevated privileges (bypassing RLS) but is tightly scoped.
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_org_id UUID;
  v_action TEXT;
  v_entity_type TEXT := TG_TABLE_NAME;
  v_entity_id UUID;
  v_metadata JSONB := '{}'::jsonb;
BEGIN
  -- We extract the org_id indirectly from the teacher/actor profile
  -- since the base tables currently reference teacher_id.
  
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'lessons' THEN
      v_action := 'lesson.created';
      v_entity_id := NEW.id;
      -- Only store essential delta data, no massive payloads
      v_metadata := jsonb_build_object('title', NEW.title, 'subject', NEW.subject, 'model_key', NEW.model_key);
      SELECT org_id INTO v_org_id FROM profiles WHERE id = NEW.teacher_id;
      
    ELSIF TG_TABLE_NAME = 'sessions' THEN
      v_action := 'session.created';
      v_entity_id := NEW.id;
      v_metadata := jsonb_build_object('lesson_id', NEW.lesson_id, 'expires_at', NEW.expires_at);
      SELECT org_id INTO v_org_id FROM profiles WHERE id = NEW.teacher_id;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'lessons' THEN
      -- Selective updates: Only log if sensitive fields (title or model) changed
      IF OLD.title IS DISTINCT FROM NEW.title OR OLD.model_key IS DISTINCT FROM NEW.model_key THEN
        v_action := 'lesson.updated';
        v_entity_id := NEW.id;
        v_metadata := jsonb_build_object(
          'old_title', OLD.title, 'new_title', NEW.title,
          'old_model_key', OLD.model_key, 'new_model_key', NEW.model_key
        );
        SELECT org_id INTO v_org_id FROM profiles WHERE id = NEW.teacher_id;
      ELSE
        RETURN NEW; -- Skip audit log if it's just a minor update (e.g., share code)
      END IF;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'lessons' THEN
      v_action := 'lesson.deleted';
      v_entity_id := OLD.id;
      v_metadata := jsonb_build_object('title', OLD.title, 'subject', OLD.subject);
      SELECT org_id INTO v_org_id FROM profiles WHERE id = OLD.teacher_id;
    END IF;
  END IF;

  -- Ensure we have an org_id before inserting (requires users to be part of an org)
  IF v_org_id IS NOT NULL THEN
    INSERT INTO audit_events (org_id, actor_id, action, entity_type, entity_id, metadata)
    VALUES (v_org_id, v_actor_id, v_action, v_entity_type, v_entity_id, v_metadata);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Apply Database Triggers
-- The triggers will intercept client queries and securely append to the audit log.

DROP TRIGGER IF EXISTS audit_lessons_insert ON lessons;
CREATE TRIGGER audit_lessons_insert
  AFTER INSERT ON lessons
  FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

-- We specifically bind the update trigger to the sensitive columns
DROP TRIGGER IF EXISTS audit_lessons_update ON lessons;
CREATE TRIGGER audit_lessons_update
  AFTER UPDATE OF title, model_key ON lessons
  FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

DROP TRIGGER IF EXISTS audit_lessons_delete ON lessons;
CREATE TRIGGER audit_lessons_delete
  -- BEFORE DELETE is used because we need to read OLD.teacher_id to find the org_id
  BEFORE DELETE ON lessons
  FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

DROP TRIGGER IF EXISTS audit_sessions_insert ON sessions;
CREATE TRIGGER audit_sessions_insert
  AFTER INSERT ON sessions
  FOR EACH ROW EXECUTE PROCEDURE log_audit_event();
