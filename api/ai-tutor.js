import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { persistSession: false } }
);

// Schema to validate LLM output
const InsightSchema = z.object({
  weakness: z.string().max(100),
  suggestion: z.string().max(100),
  encouragement: z.string().max(100),
});

export default async function handler(req, res) {
  const ALLOWED_ORIGINS = [
    'https://metalearning.app',
    'https://www.metalearning.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://metalearning.app');
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { studentId, lessonId, sessionId } = req.body || {};
  if (!studentId || !lessonId) {
    return res.status(400).json({ error: 'studentId and lessonId required' });
  }

  try {
    // 1. Rate Limiting / Cache Check
    const { data: cached, error: fetchErr } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .eq('session_id', sessionId ?? null)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    // If generated less than 2 minutes ago, return cached to save costs
    if (cached) {
      const ageMs = Date.now() - new Date(cached.generated_at).getTime();
      if (ageMs < 120000) {
        return res.status(200).json({ insight: cached, cached: true });
      }
    }

    // 2. Fetch analytics context
    const { data: events } = await supabase
      .from('learning_analytics')
      .select('interaction_type, metadata, occurred_at')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .order('occurred_at', { ascending: false })
      .limit(15);

    // 3. Fetch quiz score
    const { data: quizRows } = await supabase
      .from('quiz_answers')
      .select('is_correct')
      .eq('student_id', studentId)
      .eq('session_id', sessionId ?? '');

    const totalQ  = quizRows?.length ?? 0;
    const correct = quizRows?.filter(q => q.is_correct).length ?? 0;
    const scorePct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : null;

    if (!events || events.length === 0) {
      return res.status(200).json({
        insight: {
          weakness: 'Not enough interaction data yet.',
          suggestion: 'Explore more hotspots in the 3D model.',
          encouragement: 'Every click is a step toward mastery!'
        },
        cached: false
      });
    }

    // 4. Build prompt
    const hotspotClicks = events
      ?.filter(e => e.interaction_type === 'hotspot_click')
      .map(e => e.metadata?.hotspot_title)
      .filter(Boolean)
      .join(', ') || 'none';

    const sessionDuration = events
      ?.find(e => e.interaction_type === 'session_end')
      ?.metadata?.duration_seconds ?? 'unknown';

    const prompt = `You are a precise educational AI tutor.
Analyze this student's data:
- Session: ${sessionDuration}s
- Hotspots: ${hotspotClicks}
- Quiz: ${scorePct !== null ? scorePct + '%' : 'N/A'}

Return ONLY a JSON object:
{
  "weakness": "max 12 words",
  "suggestion": "max 12 words",
  "encouragement": "max 10 words"
}`;

    // 5. Call Fal.ai
    const falKey = process.env.FAL_KEY || process.env.VITE_FAL_KEY;
    let insight = null;

    if (falKey) {
      const falRes = await fetch('https://fal.run/fal-ai/any-llm', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}` 
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct',
          prompt,
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (falRes.ok) {
        const falData = await falRes.json();
        const text = falData.output || falData.response || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            // Robust validation using Zod
            insight = InsightSchema.parse(JSON.parse(match[0]));
          } catch (e) {
            console.error("Zod Validation Failed:", e);
          }
        }
      }
    }

    // Fallback logic
    if (!insight) {
      insight = {
        weakness: scorePct !== null && scorePct < 50
          ? 'Concepts from the quiz need more review.'
          : 'Further exploration of the model is needed.',
        suggestion: scorePct !== null && scorePct < 50
          ? 'Review the model before retrying the quiz.'
          : 'Try clicking all highlighted hotspots.',
        encouragement: 'Great effort! Learning is a journey, not a race.'
      };
    }

    // 6. Final Atomic Save
    const { data: savedData, error: upsertErr } = await supabase.from('ai_insights').upsert({
      student_id:    studentId,
      lesson_id:     lessonId,
      session_id:    sessionId ?? null,
      weakness:      insight.weakness,
      suggestion:    insight.suggestion,
      encouragement: insight.encouragement,
      score_percent: scorePct,
    }).select().single();

    if (upsertErr) throw upsertErr;

    return res.status(200).json({ insight: savedData, cached: false, scorePct });

  } catch (err) {
    console.error('[AI Tutor Error]', err);
    return res.status(500).json({ error: 'Internal server error during analysis.' });
  }
}
