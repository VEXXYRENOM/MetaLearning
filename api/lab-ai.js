/**
 * Vercel Serverless Function: /api/lab-ai
 * Context-Aware Lab AI Assistant
 * Accepts the current beaker state and student question,
 * returns AI guidance using Pollinations (free, no key needed).
 */

const ALLOWED_ORIGINS = [
  'https://metalearning.app',
  'https://www.metalearning.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const SYSTEM_PROMPT = `You are "Lab AI", an expert chemistry and physics assistant for high school and university students.
You are embedded in an interactive 3D lab simulator. You have access to the exact current state of the student's beaker.
Your job is to:
1. Observe the current lab state and give precise, educational guidance.
2. Explain reactions that happened and WHY they happened (stoichiometry, thermodynamics).
3. Suggest the NEXT safe experiment the student should try.
4. If a dangerous combination is in the beaker, warn the student.
5. Keep answers concise (max 3 sentences). Use simple language.
6. Reply in the SAME language the student used (Arabic or French or English).
7. Never say you are an AI — you are the "Lab Assistant". Be encouraging.`;

export default async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────────────────────────
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://metalearning.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { question, labContext } = req.body;

    if (!question || !labContext) {
      return res.status(400).json({ error: 'question and labContext are required' });
    }

    // Build the contextual prompt from beaker state
    const { substances, temperature, isBoiling, burnerOn, hasStirrer, litmusColor } = labContext;

    let beakerDesc = 'The beaker is empty.';
    if (substances && substances.length > 0) {
      const substanceList = substances.map(s =>
        `${s.name} (${s.moles.toFixed(3)} mol, ${s.mass.toFixed(2)} g)`
      ).join(', ');
      beakerDesc = `The beaker contains: ${substanceList}.`;
    }

    const tempDesc = `Temperature: ${temperature.toFixed(1)}°C${isBoiling ? ' (BOILING)' : ''}.`;
    const burnerDesc = burnerOn ? 'Bunsen burner is ON.' : 'Bunsen burner is OFF.';
    const stirrerDesc = hasStirrer ? 'Glass stirrer has been used.' : '';
    const litmusDesc = litmusColor
      ? `Litmus paper test result: ${litmusColor === '#ef4444' ? 'RED (Acidic)' : litmusColor === '#3b82f6' ? 'BLUE (Basic)' : 'PURPLE (Neutral)'}.`
      : '';

    const contextBlock = [beakerDesc, tempDesc, burnerDesc, stirrerDesc, litmusDesc]
      .filter(Boolean).join(' ');

    const fullPrompt = `${SYSTEM_PROMPT}

## Current Lab State:
${contextBlock}

## Student's Question:
${question}

## Your Response (max 3 sentences, same language as student):`;

    // Call Pollinations text API (free, no key needed)
    const pollinationsRes = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Lab State: ${contextBlock}\n\nStudent: ${question}` }
        ],
        model: 'openai',
        private: true,
      }),
    });

    if (!pollinationsRes.ok) {
      throw new Error(`Pollinations API error: ${pollinationsRes.status}`);
    }

    const answer = await pollinationsRes.text();

    return res.status(200).json({
      answer: answer.trim(),
      contextUsed: { substanceCount: substances?.length || 0, temperature },
    });

  } catch (error) {
    console.error('[LabAI] Error:', error.message);
    // Fallback: return a helpful rule-based response
    return res.status(200).json({
      answer: "I'm having trouble connecting right now. Try checking the temperature and substance list on your HUD panel for hints!",
      fallback: true,
    });
  }
}
