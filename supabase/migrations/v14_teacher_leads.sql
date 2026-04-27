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
