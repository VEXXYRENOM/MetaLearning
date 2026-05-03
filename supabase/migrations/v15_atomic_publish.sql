-- ══════════════════════════════════════════════════════════
-- v15: Atomic lesson publishing + Quiz schema alignment
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION publish_lesson_atomic(
  p_teacher_id UUID,
  p_title      TEXT,
  p_subject    TEXT,
  p_model_key  TEXT,
  p_notes      TEXT,
  p_pin        TEXT,
  p_quiz       JSONB  -- [{question_text, answers:[{answer_text,is_correct}]}]
)
RETURNS TABLE(lesson_id UUID, session_id UUID, pin_code TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_lesson_id  UUID;
  v_session_id UUID;
  v_q          JSONB;
  v_q_id       UUID;
  v_answers    JSONB;
  v_options    TEXT[] := ARRAY['a','b','c','d'];
  v_correct    TEXT   := 'a';
  v_i          INT;
BEGIN
  -- 1. Insert lesson (all-or-nothing)
  INSERT INTO lessons(teacher_id, title, subject, model_key,
                      notes, share_code, model_type)
  VALUES(p_teacher_id, p_title, p_subject,
         p_model_key, p_notes, p_pin, 'preset')
  RETURNING id INTO v_lesson_id;

  -- 2. Insert quiz questions with correct schema mapping
  IF p_quiz IS NOT NULL AND jsonb_array_length(p_quiz) > 0 THEN
    FOR v_q IN SELECT * FROM jsonb_array_elements(p_quiz) LOOP
      v_answers := v_q->'answers';

      -- Find the correct answer index
      v_correct := 'a';
      FOR v_i IN 0..LEAST(jsonb_array_length(v_answers)-1, 3) LOOP
        IF (v_answers->v_i->>'is_correct')::boolean THEN
          v_correct := v_options[v_i + 1];
        END IF;
      END LOOP;

      INSERT INTO quiz_questions(
        lesson_id, teacher_id,
        question,                             -- ← SQL column name
        option_a, option_b, option_c, option_d,
        correct, order_index
      )
      VALUES(
        v_lesson_id, p_teacher_id,
        v_q->>'question_text',                -- ← TS field name
        COALESCE(v_answers->0->>'answer_text', 'Option A'),
        COALESCE(v_answers->1->>'answer_text', 'Option B'),
        NULLIF(v_answers->2->>'answer_text', ''),
        NULLIF(v_answers->3->>'answer_text', ''),
        v_correct,
        COALESCE((v_q->>'order_index')::int, 0)
      )
      RETURNING id INTO v_q_id;
    END LOOP;
  END IF;

  -- 3. Create live session
  INSERT INTO sessions(lesson_id, teacher_id, pin_code,
                       is_active, expires_at)
  VALUES(v_lesson_id, p_teacher_id, p_pin,
         true, NOW() + INTERVAL '24 hours')
  RETURNING id INTO v_session_id;

  RETURN QUERY SELECT v_lesson_id, v_session_id, p_pin;
EXCEPTION WHEN OTHERS THEN
  -- Roll back everything on any error
  RAISE;
END;
$$;

REVOKE ALL ON FUNCTION publish_lesson_atomic FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION publish_lesson_atomic TO authenticated;

-- AI Tutor insights cache (avoid repeated API calls)
CREATE TABLE IF NOT EXISTS ai_insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  session_id   UUID REFERENCES sessions(id) ON DELETE SET NULL,
  weakness     TEXT NOT NULL,
  suggestion   TEXT NOT NULL,
  encouragement TEXT NOT NULL,
  score_percent NUMERIC(5,1),
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, lesson_id, session_id)
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights_own"
  ON ai_insights FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "insights_teacher_read"
  ON ai_insights FOR SELECT
  USING (lesson_id IN (
    SELECT id FROM lessons WHERE teacher_id = auth.uid()
  ));
