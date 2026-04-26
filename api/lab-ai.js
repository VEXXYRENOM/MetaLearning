/**
 * Vercel Serverless Function: /api/lab-ai
 * Context-Aware Lab AI Assistant with Rate Limiting
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const ALLOWED_ORIGINS = [
  'https://metalearning.app',
  'https://www.metalearning.app',
  'https://project-ap4pe.vercel.app',
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

// ── Rate Limiting via Supabase ────────────────────────────────────────────────
const MAX_REQUESTS_PER_HOUR = 20; // 20 AI questions per user per hour

async function checkRateLimit(ipHash) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If Supabase not configured, fail open (don't block users)
  if (!supabaseUrl || !supabaseKey) return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR };

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  try {
    const { data, error } = await supabase.rpc('increment_api_usage', {
      p_ip_hash:    ipHash,
      p_endpoint:   'lab-ai',
      p_window_hours: 1,
      p_limit:      MAX_REQUESTS_PER_HOUR,
    });

    if (error || !data) return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR };

    return {
      allowed:   data.allowed,
      remaining: Math.max(0, MAX_REQUESTS_PER_HOUR - (data.new_count || 0)),
    };
  } catch {
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR }; // fail open
  }
}

// ── pH Estimation (FIXED - no boolean bug) ────────────────────────────────────
const ACID_IDS  = new Set(['HCl', 'H2SO4', 'HNO3', 'H2SO3', 'CH3COOH']);
const BASE_IDS  = new Set(['NaOH', 'KOH', 'Ca(OH)2', 'NH3', 'Mg(OH)2']);

function estimatePH(substances) {
  if (!substances || substances.length === 0) return '';

  // Use elementId directly (always present from labAiService.buildLabContext)
  const hasAcid = substances.some(s => ACID_IDS.has(s.elementId));
  const hasBase = substances.some(s => BASE_IDS.has(s.elementId));

  // Try to estimate more precisely if we have moles data
  let acidMoles = 0;
  let baseMoles = 0;
  substances.forEach(s => {
    if (ACID_IDS.has(s.elementId)) acidMoles += s.moles || 0;
    if (BASE_IDS.has(s.elementId)) baseMoles += s.moles || 0;
  });

  if (hasAcid && !hasBase)  return `Solution is acidic (estimated pH < 7, ~${acidMoles.toFixed(3)} mol acid present).`;
  if (hasBase && !hasAcid)  return `Solution is basic (estimated pH > 7, ~${baseMoles.toFixed(3)} mol base present).`;
  if (hasAcid && hasBase) {
    const balance = acidMoles - baseMoles;
    if (Math.abs(balance) < 0.01)
      return 'Near-neutral solution: acid and base are approximately balanced (pH ≈ 7).';
    return balance > 0
      ? `Slightly acidic: excess ${balance.toFixed(3)} mol acid (pH < 7).`
      : `Slightly basic: excess ${Math.abs(balance).toFixed(3)} mol base (pH > 7).`;
  }
  return 'Solution is neutral or weakly ionic (pH ≈ 7).';
}

// ── Main Handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://metalearning.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Rate limiting
  const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
              || req.socket?.remoteAddress
              || 'unknown';
  const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 32);

  const { allowed, remaining } = await checkRateLimit(ipHash);
  res.setHeader('X-RateLimit-Remaining', remaining);

  if (!allowed) {
    return res.status(429).json({
      answer: "You've asked many questions this hour! Take a moment to observe your experiment, then come back. 🔬",
      rateLimited: true,
    });
  }

  try {
    const { question, labContext } = req.body;
    if (!question || !labContext) {
      return res.status(400).json({ error: 'question and labContext are required' });
    }

    const { substances, temperature, isBoiling, burnerOn, hasStirrer, litmusColor } = labContext;

    // Build descriptive context
    let beakerDesc = 'The beaker is empty.';
    if (substances && substances.length > 0) {
      const substanceList = substances
        .map(s => `${s.name} (${s.moles.toFixed(3)} mol, ${s.mass.toFixed(2)} g)`)
        .join(', ');
      beakerDesc = `The beaker contains: ${substanceList}.`;
    }

    const tempDesc    = `Temperature: ${temperature.toFixed(1)}°C${isBoiling ? ' (BOILING — water evaporating)' : ''}.`;
    const burnerDesc  = burnerOn ? 'Bunsen burner is ON and heating the beaker.' : 'Bunsen burner is OFF.';
    const stirrerDesc = hasStirrer ? 'Glass stirrer is in use — mixing is active.' : '';
    const litmusDesc  = litmusColor
      ? `Litmus paper test: ${litmusColor === '#ef4444' ? 'RED → Acidic solution' : litmusColor === '#3b82f6' ? 'BLUE → Basic solution' : 'PURPLE → Neutral solution'}.`
      : '';
    const phDesc = estimatePH(substances); // ← FIXED: no boolean bug

    const contextBlock = [beakerDesc, tempDesc, burnerDesc, stirrerDesc, litmusDesc, phDesc]
      .filter(Boolean).join(' ');

    // Timeout: 8 seconds (Vercel default limit is 10s)
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 8000);

    let pollinationsRes;
    try {
      pollinationsRes = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Current Lab State:\n${contextBlock}\n\nStudent's Question: ${question}`,
            },
          ],
          model: 'openai',
          private: true,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!pollinationsRes.ok) throw new Error(`Pollinations error: ${pollinationsRes.status}`);

    const answer = await pollinationsRes.text();
    return res.status(200).json({
      answer: answer.trim(),
      contextUsed: { substanceCount: substances?.length || 0, temperature },
    });

  } catch (error) {
    console.error('[LabAI]', error.message);
    return res.status(200).json({
      answer: "I'm having trouble connecting right now. Check the HUD for temperature and substance hints! 🔬",
      fallback: true,
    });
  }
}
