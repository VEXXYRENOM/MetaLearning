/**
 * X-3: Spatial Analytics Engine
 * Tracks student behavior: hotspot clicks, time on model, session duration.
 * Writes to the learning_analytics table in Supabase.
 */
import { useRef, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────
export type InteractionType =
  | "hotspot_click"
  | "model_rotate"
  | "model_zoom"
  | "quiz_answer"
  | "session_start"
  | "session_end";

export interface TrackPayload {
  session_id?: string;
  lesson_id: string;
  student_id: string;
  interaction_type: InteractionType;
  metadata?: Record<string, unknown>;
}

// ─── Core tracker utility ─────────────────────────────────────────────────────
export async function trackInteraction(payload: TrackPayload): Promise<void> {
  try {
    await supabase.from("learning_analytics").insert({
      ...payload,
      metadata: payload.metadata ?? {},
      occurred_at: new Date().toISOString(),
    });
  } catch (err) {
    // Non-blocking — analytics should never crash the UI
    console.warn("[Analytics] trackInteraction failed:", err);
  }
}

// ─── Hook: auto-tracks session start/end + time-on-model ──────────────────────
interface UseLearningAnalyticsOptions {
  lessonId: string;
  studentId: string;
  sessionId?: string;
  /** Set to true to enable automatic session tracking */
  enabled?: boolean;
}

export function useLearningAnalytics({
  lessonId,
  studentId,
  sessionId,
  enabled = true,
}: UseLearningAnalyticsOptions) {
  const startTimeRef = useRef<number>(Date.now());

  // Track session start
  useEffect(() => {
    if (!enabled || !studentId) return;
    startTimeRef.current = Date.now();

    trackInteraction({
      lesson_id: lessonId,
      student_id: studentId,
      session_id: sessionId,
      interaction_type: "session_start",
      metadata: { timestamp: new Date().toISOString() },
    });

    // Track session end on unmount
    return () => {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackInteraction({
        lesson_id: lessonId,
        student_id: studentId,
        session_id: sessionId,
        interaction_type: "session_end",
        metadata: { duration_seconds: durationSeconds },
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, studentId]);

  /** Call this when student clicks a hotspot */
  const trackHotspotClick = useCallback(
    (hotspotId: string, hotspotTitle: string) => {
      if (!enabled || !studentId) return;
      trackInteraction({
        lesson_id: lessonId,
        student_id: studentId,
        session_id: sessionId,
        interaction_type: "hotspot_click",
        metadata: { hotspot_id: hotspotId, hotspot_title: hotspotTitle },
      });
    },
    [lessonId, studentId, sessionId, enabled]
  );

  /** Call this when student answers a quiz question */
  const trackQuizAnswer = useCallback(
    (questionId: string, isCorrect: boolean, answer: string) => {
      if (!enabled || !studentId) return;
      trackInteraction({
        lesson_id: lessonId,
        student_id: studentId,
        session_id: sessionId,
        interaction_type: "quiz_answer",
        metadata: { question_id: questionId, is_correct: isCorrect, answer },
      });
    },
    [lessonId, studentId, sessionId, enabled]
  );

  return { trackHotspotClick, trackQuizAnswer };
}
