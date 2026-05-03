-- ══════════════════════════════════════════════════════════
-- v16: Atomic lesson publishing WITH Server-side Gating
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
  
  -- Gating variables
  v_tier       subscription_tier;
  v_month_count INT;
BEGIN
  -- 0. Server-side Gating Check
  SELECT subscription_tier INTO v_tier
  FROM profiles
  WHERE id = p_teacher_id;
  
  IF v_tier IS NULL THEN
    RAISE EXCEPTION 'Teacher profile not found.';
  END IF;

  -- If free, check if they exceeded their limit (5 lessons per month)
  IF v_tier = 'free' THEN
    SELECT COUNT(*) INTO v_month_count
    FROM lessons
    WHERE teacher_id = p_teacher_id
      AND created_at >= date_trunc('month', NOW());
      
    IF v_month_count >= 5 THEN
      RAISE EXCEPTION 'Monthly lesson limit reached. Upgrade to Pro.';
    END IF;
  END IF;

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
        question,                             
        option_a, option_b, option_c, option_d,
        correct, order_index
      )
      VALUES(
        v_lesson_id, p_teacher_id,
        v_q->>'question_text',                
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
