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
